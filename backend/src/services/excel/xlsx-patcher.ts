// backend/src/services/excel/xlsx-patcher.ts
//
// Écriture de cellules dans un classeur .xlsx SANS le reconstruire.
//
// Pourquoi: un aller-retour lecture/écriture via ExcelJS (ou SheetJS) ne
// restitue qu'une partie du format Office. Tout ce que la bibliothèque ne sait
// pas reproduire est silencieusement perdu à la réécriture: graphiques, images
// et formes, mises en forme conditionnelles, validations de données, tableaux
// croisés, thèmes, macros, styles avancés. Sur un template DSF réel cela se
// traduit par un fichier qui fond de moitié et qu'Excel signale comme
// endommagé.
//
// Approche: un .xlsx est une archive ZIP de fichiers XML. On ne touche qu'aux
// feuilles à remplir, en modifiant uniquement la valeur des cellules visées;
// toutes les autres entrées de l'archive sont recopiées à l'identique. Le
// format d'origine est donc intégralement préservé.
import JSZip from "jszip";

export type CellValue = string | number | boolean | Date | null | undefined;

export interface CellWrite {
  /** Nom de l'onglet, tel qu'affiché dans Excel (comparaison insensible à la casse). */
  sheetName: string;
  /** Référence de cellule, ex. "B12". */
  ref: string;
  value: CellValue;
}

export interface PatchResult {
  buffer: Buffer;
  written: number;
  /** Onglets demandés mais absents du template. */
  missingSheets: string[];
}

// ─── Utilitaires XML / références ───────────────────────────────────────────

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** "B12" -> { col: "B", colIndex: 2, row: 12 } */
function parseRef(ref: string): { col: string; colIndex: number; row: number } | null {
  const m = /^([A-Za-z]+)(\d+)$/.exec(ref.trim());
  if (!m) return null;
  const col = m[1].toUpperCase();
  let colIndex = 0;
  for (let i = 0; i < col.length; i++) {
    colIndex = colIndex * 26 + (col.charCodeAt(i) - 64);
  }
  return { col, colIndex, row: parseInt(m[2], 10) };
}

/** Date JS -> numéro de série Excel (base 1900, avec le décalage historique). */
function toExcelSerial(date: Date): number {
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
  return utc / 86400000 + 25569;
}

/**
 * Corps XML d'une cellule pour une valeur donnée.
 * Retourne l'attribut `t` (type) et le contenu interne, sans l'attribut `s`
 * (style) qui provient toujours de la cellule d'origine du template.
 */
function cellBody(value: CellValue): { typeAttr: string; inner: string } | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return { typeAttr: "", inner: `<v>${value}</v>` };
  }

  if (typeof value === "boolean") {
    return { typeAttr: ' t="b"', inner: `<v>${value ? 1 : 0}</v>` };
  }

  if (value instanceof Date) {
    return { typeAttr: "", inner: `<v>${toExcelSerial(value)}</v>` };
  }

  const text = String(value);
  if (text === "") return null;

  // Une chaîne numérique reste écrite comme un nombre: sinon Excel affiche
  // l'avertissement "nombre stocké sous forme de texte" sur tout le tableau.
  if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
    return { typeAttr: "", inner: `<v>${text.trim()}</v>` };
  }

  // Chaîne littérale: on utilise une chaîne "inline" plutôt que la table
  // partagée (sharedStrings.xml), ce qui évite d'avoir à réindexer un fichier
  // partagé par toutes les feuilles.
  return {
    typeAttr: ' t="inlineStr"',
    inner: `<is><t xml:space="preserve">${escapeXml(text)}</t></is>`,
  };
}

// ─── Résolution onglet -> fichier XML ───────────────────────────────────────

interface SheetEntry {
  name: string;
  path: string;
}

async function resolveSheets(zip: JSZip): Promise<SheetEntry[]> {
  const workbookFile = zip.file("xl/workbook.xml");
  if (!workbookFile) {
    throw new Error("Template invalide: xl/workbook.xml introuvable");
  }
  const workbookXml = await workbookFile.async("string");

  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  const relsXml = relsFile ? await relsFile.async("string") : "";

  // rId -> chemin de la feuille
  const relTargets = new Map<string, string>();
  const relRe = /<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"[^>]*\/?>/g;
  for (let m = relRe.exec(relsXml); m; m = relRe.exec(relsXml)) {
    relTargets.set(m[1], m[2]);
  }

  const sheets: SheetEntry[] = [];
  const sheetRe = /<sheet\b[^>]*\/?>/g;
  for (let m = sheetRe.exec(workbookXml); m; m = sheetRe.exec(workbookXml)) {
    const tag = m[0];
    const name = /\bname="([^"]*)"/.exec(tag)?.[1];
    const rid = /\br:id="([^"]+)"/.exec(tag)?.[1];
    if (!name || !rid) continue;

    let target = relTargets.get(rid);
    if (!target) continue;

    // Les cibles sont relatives à xl/, parfois absolues (/xl/worksheets/...).
    target = target.replace(/^\//, "");
    const path = target.startsWith("xl/") ? target : `xl/${target}`;
    sheets.push({ name: decodeXmlEntities(name), path });
  }

  return sheets;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// ─── Écriture des cellules dans une feuille ─────────────────────────────────

/**
 * Applique un lot d'écritures au XML d'une feuille.
 * Les lignes et cellules absentes sont créées à leur position ordonnée, ce
 * qu'Excel exige.
 */
function applyWritesToSheetXml(
  sheetXml: string,
  writes: { ref: string; value: CellValue }[]
): { xml: string; written: number } {
  // Feuille sans <sheetData> (cas théorique): rien à faire.
  const sheetDataMatch = /<sheetData\s*\/>|<sheetData[^>]*>([\s\S]*?)<\/sheetData>/.exec(sheetXml);
  if (!sheetDataMatch) return { xml: sheetXml, written: 0 };

  const isSelfClosing = sheetDataMatch[0].startsWith("<sheetData") && sheetDataMatch[0].endsWith("/>");
  const innerXml = isSelfClosing ? "" : sheetDataMatch[1] ?? "";

  // Découpage en blocs de lignes, indexés par numéro de ligne.
  const rows = new Map<number, string>();
  const rowOrder: number[] = [];
  const rowRe = /<row\b[^>]*\/>|<row\b[^>]*>[\s\S]*?<\/row>/g;
  for (let m = rowRe.exec(innerXml); m; m = rowRe.exec(innerXml)) {
    const block = m[0];
    const rowNum = parseInt(/\br="(\d+)"/.exec(block)?.[1] ?? "0", 10);
    if (!rowNum) continue;
    rows.set(rowNum, block);
    rowOrder.push(rowNum);
  }

  let written = 0;

  for (const { ref, value } of writes) {
    const parsed = parseRef(ref);
    if (!parsed) continue;

    const body = cellBody(value);
    if (!body) continue; // valeur vide: on laisse la cellule du template intacte

    const { col, colIndex, row: rowNum } = parsed;
    let rowBlock = rows.get(rowNum);

    if (!rowBlock) {
      rowBlock = `<row r="${rowNum}"></row>`;
      rows.set(rowNum, rowBlock);
      rowOrder.push(rowNum);
    }

    // Ligne auto-fermante -> on l'ouvre pour pouvoir y insérer une cellule.
    if (/\/>$/.test(rowBlock) && !/<\/row>$/.test(rowBlock)) {
      rowBlock = rowBlock.replace(/\/>$/, "></row>");
    }

    const cellRe = new RegExp(
      `<c\\b[^>]*\\br="${col}${rowNum}"[^>]*(?:\\/>|>[\\s\\S]*?<\\/c>)`,
      ""
    );
    const cellMatch = cellRe.exec(rowBlock);

    if (cellMatch) {
      const oldCell = cellMatch[0];
      // Le style de la cellule du template est conservé: c'est lui qui porte
      // le format (nombre, devise, bordures, police).
      const styleAttr = /\bs="(\d+)"/.exec(oldCell)?.[1];
      const newCell =
        `<c r="${col}${rowNum}"` +
        (styleAttr ? ` s="${styleAttr}"` : "") +
        `${body.typeAttr}>${body.inner}</c>`;
      rowBlock = rowBlock.replace(oldCell, newCell);
    } else {
      // Insertion ordonnée par colonne.
      const newCell = `<c r="${col}${rowNum}"${body.typeAttr}>${body.inner}</c>`;
      const existing: { ref: string; index: number; start: number }[] = [];
      const scanRe = /<c\b[^>]*\br="([A-Za-z]+)(\d+)"[^>]*(?:\/>|>[\s\S]*?<\/c>)/g;
      for (let m = scanRe.exec(rowBlock); m; m = scanRe.exec(rowBlock)) {
        const p = parseRef(`${m[1]}${m[2]}`);
        if (p) existing.push({ ref: m[0], index: p.colIndex, start: m.index });
      }
      const after = existing.find((c) => c.index > colIndex);
      if (after) {
        rowBlock =
          rowBlock.slice(0, after.start) + newCell + rowBlock.slice(after.start);
      } else {
        rowBlock = rowBlock.replace(/<\/row>$/, `${newCell}</row>`);
      }
    }

    rows.set(rowNum, rowBlock);
    written++;
  }

  if (written === 0) return { xml: sheetXml, written: 0 };

  // Reconstruction de <sheetData> avec les lignes triées.
  const sortedRows = Array.from(new Set(rowOrder)).sort((a, b) => a - b);
  const newInner = sortedRows.map((r) => rows.get(r)!).join("");
  const newSheetData = `<sheetData>${newInner}</sheetData>`;
  const xml =
    sheetXml.slice(0, sheetDataMatch.index) +
    newSheetData +
    sheetXml.slice(sheetDataMatch.index + sheetDataMatch[0].length);

  return { xml, written };
}

// ─── Point d'entrée ─────────────────────────────────────────────────────────

/**
 * Écrit les cellules demandées dans le classeur et renvoie le fichier modifié.
 * Toutes les parties non concernées de l'archive sont recopiées telles quelles.
 */
export async function patchXlsx(
  templateBuffer: Buffer,
  writes: CellWrite[]
): Promise<PatchResult> {
  const zip = await JSZip.loadAsync(templateBuffer);
  const sheets = await resolveSheets(zip);

  // Regroupement des écritures par onglet.
  const bySheet = new Map<string, { ref: string; value: CellValue }[]>();
  for (const w of writes) {
    const key = w.sheetName.trim().toLowerCase();
    if (!bySheet.has(key)) bySheet.set(key, []);
    bySheet.get(key)!.push({ ref: w.ref, value: w.value });
  }

  let written = 0;
  const missingSheets: string[] = [];

  for (const [sheetKey, sheetWrites] of bySheet) {
    const sheet = sheets.find((s) => s.name.trim().toLowerCase() === sheetKey);
    if (!sheet) {
      missingSheets.push(sheetKey);
      continue;
    }

    const file = zip.file(sheet.path);
    if (!file) {
      missingSheets.push(sheetKey);
      continue;
    }

    const originalXml = await file.async("string");
    const { xml, written: count } = applyWritesToSheetXml(originalXml, sheetWrites);

    if (count > 0) {
      zip.file(sheet.path, xml);
      written += count;

      // Les valeurs calculées mises en cache par Excel ne correspondent plus
      // aux nouvelles données: on force le recalcul à l'ouverture.
      await forceFullRecalc(zip);
    }
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { buffer, written, missingSheets };
}

/**
 * Demande à Excel de recalculer toutes les formules à l'ouverture.
 * Sans cela, les formules du template continueraient d'afficher les valeurs
 * mises en cache avant le remplissage.
 */
async function forceFullRecalc(zip: JSZip): Promise<void> {
  const file = zip.file("xl/workbook.xml");
  if (!file) return;
  let xml = await file.async("string");
  if (/fullCalcOnLoad="1"/.test(xml)) return;

  if (/<calcPr\b[^>]*\/>/.test(xml)) {
    xml = xml.replace(/<calcPr\b([^>]*)\/>/, '<calcPr$1 fullCalcOnLoad="1"/>');
  } else if (/<calcPr\b[^>]*>/.test(xml)) {
    xml = xml.replace(/<calcPr\b([^>]*)>/, '<calcPr$1 fullCalcOnLoad="1">');
  } else {
    xml = xml.replace(/<\/workbook>/, '<calcPr fullCalcOnLoad="1"/></workbook>');
  }
  zip.file("xl/workbook.xml", xml);
}
