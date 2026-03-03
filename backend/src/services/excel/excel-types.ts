// backend/src/services/excel/excel-types.ts

export interface MappingCellule {
    [key: string]: string; // e.g., grossAmount: "C10"
}

export interface ConfigurationMapping {
    entete: MappingCellule;
    sections: {
        [sectionName: string]: {
            libelles: string[];
            lignes: MappingCellule[];
        };
    };
}
