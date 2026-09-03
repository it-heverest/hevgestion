// Audit tool: extract, for every note wired into NOTE_EXPORT_MAP, the row
// range each section's `lignes` array targets (plus `totals` cells), so it
// can be cross-checked against the real template's actual row layout.
import { NOTE_EXPORT_MAP } from "../src/services/excel/export-map";

interface SectionReport {
  section: string;
  libelles: string[];
  rows: number[]; // one row number per lignes[] entry, in order
  columns: string[]; // distinct columns referenced
}

const colRow = (ref: string): { col: string; row: number } | null => {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return null;
  return { col: m[1], row: parseInt(m[2], 10) };
};

const report: Record<
  string,
  { sheetName: string; dsfField: string; sections: SectionReport[]; totals: { cell: string }[] }
> = {};

for (const [code, entry] of Object.entries(NOTE_EXPORT_MAP)) {
  const { config, sheetName, dsfField } = entry as any;
  const sections: SectionReport[] = [];

  if (config.sections) {
    for (const [sectionName, sectionConfig] of Object.entries(config.sections as any)) {
      const lignes = (sectionConfig as any).lignes as Array<Record<string, string>> | undefined;
      const libelles = (sectionConfig as any).libelles as string[] | undefined;
      if (!lignes) continue;
      const rows: number[] = [];
      const columns = new Set<string>();
      for (const ligne of lignes) {
        let rowNum: number | null = null;
        for (const [field, ref] of Object.entries(ligne)) {
          if (typeof ref !== "string") continue;
          const parsed = colRow(ref);
          if (!parsed) continue;
          columns.add(parsed.col);
          if (rowNum === null) rowNum = parsed.row;
        }
        if (rowNum !== null) rows.push(rowNum);
      }
      sections.push({
        section: sectionName,
        libelles: libelles || [],
        rows,
        columns: Array.from(columns).sort(),
      });
    }
  }

  const totals: { cell: string }[] = [];
  if ((config as any).totals) {
    for (const t of (config as any).totals) totals.push({ cell: t.cell });
  }

  report[code] = { sheetName, dsfField, sections, totals };
}

console.log(JSON.stringify(report, null, 2));
