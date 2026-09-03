// services/formula-catalog.service.ts
import api from "./api";

export type FormulaCatalog = Record<
  string,
  Record<string, Record<string, string> | string>
>;

class FormulaCatalogService {
  async getCatalog(): Promise<FormulaCatalog> {
    const response = await api.get("/dsf/formulas");
    return response.data?.formulas ?? {};
  }
}

export const formulaCatalogService = new FormulaCatalogService();
