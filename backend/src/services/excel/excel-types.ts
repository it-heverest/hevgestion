// backend/src/services/excel/excel-types.ts

export interface MappingCellule {
    [key: string]: string; // e.g., grossAmount: "C10"
}

/**
 * Correspondance "chemin JSON pointé" -> cellule, pour les sections dont les
 * données ne sont pas un tableau de lignes homogènes (ex: Fiche R2/R3, dont
 * les champs sont des scalaires imbriqués comme `renseignements.ZK.value`
 * ou `controleEntite.ZQ.checked`). Résolu par `getByPath` dans
 * `dsf-filler.service.ts`.
 */
export interface FlatMapping {
    [dotPath: string]: string; // e.g., "renseignements.ZK.value": "E9"
}

export interface ConfigurationMapping {
    entete?: MappingCellule;
    sections?: {
        [sectionName: string]: {
            libelles: string[];
            lignes: MappingCellule[];
        };
    };
    /** Champs scalaires imbriqués, en plus ou à la place de `sections`. */
    flat?: FlatMapping;
    /**
     * Sections dont les lignes sont retrouvées par une clé métier (code
     * SYSCOHADA, référence…) plutôt que par position dans le tableau — plus
     * sûr que `sections.lignes[]` quand l'ordre du tableau côté données
     * n'est pas garanti identique à celui du template (Bilan, Compte de
     * résultat, TFT: `actifRows`/`passifRows`/`rows` indexés par `id`/`ref`).
     */
    byKey?: {
        [sectionName: string]: {
            /** Chemin (point) vers le tableau dans les données de la note. */
            arrayField: string;
            /** Nom du champ qui sert de clé dans chaque élément du tableau. */
            keyField: string;
            /** clé (normalisée en minuscules) -> cellules de cette ligne. */
            rows: { [key: string]: MappingCellule };
        };
    };
    /**
     * Cellules de sous-total / total du template, calculées à l'export en
     * sommant un ou plusieurs champs de section(s) — ces totaux n'existent
     * nulle part dans les données de la note (seulement calculés à
     * l'affichage, côté composant React). Voir `collectWrites` dans
     * `dsf-filler.service.ts`.
     */
    totals?: Array<{
        /** Cellule où écrire le total. */
        cell: string;
        /** Champs à sommer, un ou plusieurs (ex: total croisé de 3 sections). */
        sumOf: Array<{ section: string; field: string; onlyIds?: string[] }>;
        /**
         * Champs à soustraire du total ci-dessus (ex: "TOTAL NET DE
         * DEPRECIATION" = somme(brut) - somme(dépréciations)).
         */
        subtractOf?: Array<{ section: string; field: string; onlyIds?: string[] }>;
    }>;
}
