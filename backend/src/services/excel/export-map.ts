// backend/src/services/excel/export-map.ts
import * as noteConfigs from "./note-configs";

/**
 * `dsfField` est le nom exact du champ JSON sur le modèle Prisma `DSF`
 * (schema.prisma). Explicite plutôt que dérivé de l'identifiant de note: ça
 * permet d'ajouter des sections qui ne suivent pas la convention
 * "note<numéro>" (Bilan, Compte de résultat, Fiche R2/R3, CF1/CF2…) sans
 * complexifier `getFieldName` avec toujours plus de cas spéciaux.
 */
export const NOTE_EXPORT_MAP: Record<
    string,
    { config: any; sheetName: string; dsfField: string }
> = {
    "1": { config: noteConfigs.CONFIG_NOTE1, sheetName: "Note 1 ", dsfField: "note1" },
    "2": { config: noteConfigs.CONFIG_NOTE2, sheetName: "NOTE 2", dsfField: "note2" },
    "3A": { config: noteConfigs.CONFIG_NOTE3A, sheetName: "NOTE 3A", dsfField: "note3a" },
    "3B": { config: noteConfigs.CONFIG_NOTE3B, sheetName: "NOTE 3B", dsfField: "note3b" },
    // Noms d'onglet alignés caractère pour caractère sur le vrai template
    // (dsf_complet.xlsx): "NOTE  3C" a un double espace, et l'onglet C01 est
    // en réalité orthographié "CO1" (lettre O, pas chiffre 0) — ces deux notes
    // ne s'exportaient jamais avant cette correction, la comparaison de noms
    // d'onglet échouant silencieusement.
    "3C": { config: noteConfigs.CONFIG_NOTE3C, sheetName: "NOTE  3C", dsfField: "note3c" },
    "3C_C01": { config: noteConfigs.CONFIG_C01_NOTE3C, sheetName: "CO1-NOTE 3C", dsfField: "note3c_co1" },
    "3D": { config: noteConfigs.CONFIG_NOTE3D, sheetName: "NOTE 3D", dsfField: "note3d" },
    "3E": { config: noteConfigs.CONFIG_NOTE3E, sheetName: "NOTE 3E", dsfField: "note3e" },
    "3F": { config: noteConfigs.CONFIG_NOTE3F, sheetName: "NOTE 3F", dsfField: "note3f" },
    "4": { config: noteConfigs.CONFIG_NOTE4, sheetName: "NOTE 4", dsfField: "note4" },
    "5": { config: noteConfigs.CONFIG_NOTE5, sheetName: "NOTE 5 ", dsfField: "note5" },
    "6": { config: noteConfigs.CONFIG_NOTE6, sheetName: "NOTE 6 ", dsfField: "note6" },
    "7": { config: noteConfigs.CONFIG_NOTE7, sheetName: "NOTE 7 ", dsfField: "note7" },
    "8": { config: noteConfigs.CONFIG_NOTE8, sheetName: "NOTE 8 ", dsfField: "note8" },
    "9": { config: noteConfigs.CONFIG_NOTE9, sheetName: "NOTE 9", dsfField: "note9" },
    "10": { config: noteConfigs.CONFIG_NOTE10, sheetName: "NOTE 10", dsfField: "note10" },
    "11": { config: noteConfigs.CONFIG_NOTE11, sheetName: "NOTE 11", dsfField: "note11" },
    "12": { config: noteConfigs.CONFIG_NOTE12, sheetName: "NOTE 12", dsfField: "note12" },
    "13": { config: noteConfigs.CONFIG_NOTE13, sheetName: "NOTE 13", dsfField: "note13" },
    "14": { config: noteConfigs.CONFIG_NOTE14, sheetName: "NOTE 14", dsfField: "note14" },
    "15A": { config: noteConfigs.CONFIG_NOTE15A, sheetName: "NOTE 15A", dsfField: "note15a" },
    "15B": { config: noteConfigs.CONFIG_NOTE15B, sheetName: "NOTE 15B", dsfField: "note15b" },
    "16A": { config: noteConfigs.CONFIG_NOTE16A, sheetName: "NOTE 16A ", dsfField: "note16a" },
    "16B": { config: noteConfigs.CONFIG_NOTE16B, sheetName: "NOTE 16B", dsfField: "note16b" },
    "16B bis": { config: noteConfigs.CONFIG_NOTE16B_BIS, sheetName: "NOTE 16B BIS", dsfField: "note16b_bis" },
    "16C": { config: noteConfigs.CONFIG_NOTE16C, sheetName: "NOTE 16C", dsfField: "note16c" },
    "17": { config: noteConfigs.CONFIG_NOTE17, sheetName: "NOTE 17", dsfField: "note17" },
    "C1/17": { config: noteConfigs.CONFIG_NOTE17_C1, sheetName: "C1-NOTE 17", dsfField: "note17_c1" },
    "18": { config: noteConfigs.CONFIG_NOTE18, sheetName: "NOTE 18", dsfField: "note18" },
    "19": { config: noteConfigs.CONFIG_NOTE19, sheetName: "NOTE 19", dsfField: "note19" },
    "20": { config: noteConfigs.CONFIG_NOTE20, sheetName: "NOTE 20", dsfField: "note20" },
    "21": { config: noteConfigs.CONFIG_NOTE21, sheetName: "NOTE 21", dsfField: "note21" },
    "22": { config: noteConfigs.CONFIG_NOTE22, sheetName: "NOTE 22", dsfField: "note22" },
    "23": { config: noteConfigs.CONFIG_NOTE23, sheetName: "NOTE 23", dsfField: "note23" },
    "24": { config: noteConfigs.CONFIG_NOTE24, sheetName: "NOTE 24", dsfField: "note24" },
    "25": { config: noteConfigs.CONFIG_NOTE25, sheetName: "NOTE 25", dsfField: "note25" },
    "C1/25": { config: noteConfigs.CONFIG_NOTE25_C1, sheetName: "C1-NOTE 25", dsfField: "note25_c1" },
    "C2/25": { config: noteConfigs.CONFIG_NOTE25_C2, sheetName: "C2-NOTE 25", dsfField: "note25_c2" },
    "26": { config: noteConfigs.CONFIG_NOTE26, sheetName: "NOTE 26", dsfField: "note26" },
    "28": { config: noteConfigs.CONFIG_NOTE28, sheetName: "NOTE 28", dsfField: "note28" },
    "C1/28": { config: noteConfigs.CONFIG_NOTE28_C1, sheetName: "C1-NOTE 28", dsfField: "note28_c1" },
    "C2/28": { config: noteConfigs.CONFIG_NOTE28_C2, sheetName: "C2-NOTE 28", dsfField: "note28_c2" },
    "29": { config: noteConfigs.CONFIG_NOTE29, sheetName: "NOTE 29", dsfField: "note29" },
    "30": { config: noteConfigs.CONFIG_NOTE30, sheetName: "NOTE 30", dsfField: "note30" },
    "31": { config: noteConfigs.CONFIG_NOTE31, sheetName: "NOTE 31", dsfField: "note31" },
    "32": { config: noteConfigs.CONFIG_NOTE32, sheetName: "NOTE 32", dsfField: "note32" },
    "33": { config: noteConfigs.CONFIG_NOTE33, sheetName: "NOTE 33", dsfField: "note33" },
    "34": { config: noteConfigs.CONFIG_NOTE34, sheetName: "NOTE 34", dsfField: "note34" },

    // Fiches d'identification (au-delà des 34 notes numérotées)
    "FICHE_R2": { config: noteConfigs.CONFIG_FICHE_R2, sheetName: "Fiche R2", dsfField: "fiche2" },
    "FICHE_R3": { config: noteConfigs.CONFIG_FICHE_R3, sheetName: "Fiche R3", dsfField: "fiche3" },

    // États financiers principaux
    "BILAN_PAYSAGE": { config: noteConfigs.CONFIG_BILAN_PAYSAGE, sheetName: "BILAN PAYSAGE", dsfField: "bilan_paysage" },
};
