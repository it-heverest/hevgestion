/**
 * Catalogue statique des formules affichées au clic sur une case du rapport
 * DSF ("voir la formule", comme dans Excel). Indépendant de tout dossier —
 * ne dépend que des comptes/sens définis dans account-mapping.data.ts et
 * tft-mapping.data.ts, jamais d'une balance réelle.
 *
 * Niveau 1: noteKey — nom de champ Prisma exact (ex. "note17"), repris de
 * NOTE_KEY_MAP (dsf.controller.ts).
 * Niveau 2: nom du champ tableau dans le JSON de la note (ex. "rows") OU nom
 * du champ scalaire pour une note ancien style.
 * Niveau 3 (si tableau): id de ligne -> texte de formule.
 */
export type FormulaCatalog = Record<
  string,
  Record<string, Record<string, string> | string>
>;
