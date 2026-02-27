// // services/company.service.ts
// import axios from "axios";

// export interface Country {
//   code: string;
//   name: string;
//   currency: string;
//   timezone: string;
// }

// export interface Company {
//   id: string;
//   name: string;
//   country: string;
//   legalForm: string;
//   taxNumber: string;
//   address: string;
//   city: string;
//   phone?: string;
//   email?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CreateCompanyData {
//   name: string;
//   country: string;
//   legalForm: string;
//   taxNumber: string;
//   address: string;
//   city: string;
//   phone?: string;
//   email?: string;
// }

// export interface Exercise {
//   id: string;
//   year: number;
//   status: "open" | "closed";
//   startDate: string;
//   endDate: string;
//   companyId: string;
//   country: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// // Configuration Axios avec timeout augmenté
// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   timeout: 30000, // 30 secondes au lieu de 10
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use(
//   (config) => {
//     // Token is now managed by AuthContext, no need to get from localStorage
//     // Auth headers will be added by AuthContext when making requests
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Intercepteur pour gérer les erreurs globales
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token cleanup is handled by AuthContext
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// class CompanyService {
//   private abortControllers: Map<string, AbortController> = new Map();

//   private getAbortController(key: string): AbortController {
//     // Annuler la requête précédente si elle existe
//     if (this.abortControllers.has(key)) {
//       this.abortControllers.get(key)?.abort();
//     }

//     const controller = new AbortController();
//     this.abortControllers.set(key, controller);
//     return controller;
//   }

//   private cleanupAbortController(key: string): void {
//     this.abortControllers.delete(key);
//   }

//   // Countries API
//   async getCountries(): Promise<Country[]> {
//     const controller = this.getAbortController("getCountries");

//     try {
//       const response = await api.get<Country[]>("/countries", {
//         signal: controller.signal,
//       });
//       this.cleanupAbortController("getCountries");
//       return response.data;
//     } catch (error: any) {
//       this.cleanupAbortController("getCountries");

//       if (error.code === "ECONNABORTED") {
//         console.warn("Requête pays annulée");
//         return []; // Retourner un tableau vide au lieu de throw
//       }

//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }

//       console.error("Error fetching countries:", error);
//       return []; // Retourner un tableau vide en cas d'erreur
//     }
//   }

//   // Companies API
//   async getCompanies(): Promise<Company[]> {
//     const controller = this.getAbortController("getCompanies");

//     try {
//       const response = await api.get<Company[]>("/companies", {
//         signal: controller.signal,
//       });
//       this.cleanupAbortController("getCompanies");
//       return response.data;
//     } catch (error: any) {
//       this.cleanupAbortController("getCompanies");

//       if (error.code === "ECONNABORTED") {
//         console.warn("Requête entreprises annulée");
//         return [];
//       }

//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }

//       console.error("Error fetching companies:", error);
//       return [];
//     }
//   }

//   async createCompany(companyData: CreateCompanyData): Promise<Company> {
//     try {
//       const response = await api.post<Company>("/companies", companyData);
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }
//       throw new Error("Erreur lors de la création de l'entreprise");
//     }
//   }

//   async getCompaniesByCountry(countryCode: string): Promise<Company[]> {
//     const controller = this.getAbortController(
//       `getCompaniesByCountry-${countryCode}`
//     );

//     try {
//       const response = await api.get<Company[]>(
//         `/companies/country/${countryCode}`,
//         {
//           signal: controller.signal,
//         }
//       );
//       this.cleanupAbortController(`getCompaniesByCountry-${countryCode}`);
//       return response.data;
//     } catch (error: any) {
//       this.cleanupAbortController(`getCompaniesByCountry-${countryCode}`);

//       if (error.code === "ECONNABORTED") {
//         return [];
//       }

//       throw new Error("Erreur lors du filtrage par pays");
//     }
//   }

//   async searchCompanies(
//     query: string,
//     countryCode?: string
//   ): Promise<Company[]> {
//     const controller = this.getAbortController(
//       `searchCompanies-${query}-${countryCode}`
//     );

//     try {
//       const params: any = { q: query };
//       if (countryCode) {
//         params.country = countryCode;
//       }

//       const response = await api.get<Company[]>("/companies/search", {
//         params,
//         signal: controller.signal,
//       });
//       this.cleanupAbortController(`searchCompanies-${query}-${countryCode}`);
//       return response.data;
//     } catch (error: any) {
//       this.cleanupAbortController(`searchCompanies-${query}-${countryCode}`);

//       if (error.code === "ECONNABORTED") {
//         return [];
//       }

//       throw new Error("Erreur lors de la recherche");
//     }
//   }

//   async getCompanyById(companyId: string): Promise<Company> {
//     try {
//       const response = await api.get<Company>(`/companies/${companyId}`);
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.status === 404) {
//         throw new Error("Entreprise non trouvée");
//       }
//       throw new Error("Erreur lors du chargement de l'entreprise");
//     }
//   }

//   async updateCompany(
//     companyId: string,
//     companyData: Partial<Company>
//   ): Promise<Company> {
//     try {
//       const response = await api.put<Company>(
//         `/companies/${companyId}`,
//         companyData
//       );
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }
//       throw new Error("Erreur lors de la modification de l'entreprise");
//     }
//   }

//   async deleteCompany(companyId: string): Promise<void> {
//     try {
//       await api.delete(`/companies/${companyId}`);
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }
//       throw new Error("Erreur lors de la suppression de l'entreprise");
//     }
//   }

//   // Exercises API
//   async getExercises(): Promise<Exercise[]> {
//     const controller = this.getAbortController("getExercises");

//     try {
//       const response = await api.get<Exercise[]>("/exercises", {
//         signal: controller.signal,
//       });
//       this.cleanupAbortController("getExercises");
//       return response.data;
//     } catch (error: any) {
//       this.cleanupAbortController("getExercises");

//       if (error.code === "ECONNABORTED") {
//         console.warn("Requête exercices annulée");
//         return [];
//       }

//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }

//       console.error("Error fetching exercises:", error);
//       return [];
//     }
//   }

//   async createExercise(exerciseData: Omit<Exercise, "id">): Promise<Exercise> {
//     try {
//       const response = await api.post<Exercise>("/exercises", exerciseData);
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }
//       throw new Error("Erreur lors de la création de l'exercice");
//     }
//   }

//   async closeExercise(exerciseId: string): Promise<Exercise> {
//     try {
//       const response = await api.patch<Exercise>(
//         `/exercises/${exerciseId}/close`
//       );
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         throw new Error(error.response.data.message);
//       }
//       throw new Error("Erreur lors de la clôture de l'exercice");
//     }
//   }

//   async getExercisesByCompany(companyId: string): Promise<Exercise[]> {
//     try {
//       const response = await api.get<Exercise[]>(
//         `/exercises/company/${companyId}`
//       );
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         "Erreur lors du chargement des exercices de l'entreprise"
//       );
//     }
//   }

//   async getExerciseById(exerciseId: string): Promise<Exercise> {
//     try {
//       const response = await api.get<Exercise>(`/exercises/${exerciseId}`);
//       return response.data;
//     } catch (error: any) {
//       if (error.response?.status === 404) {
//         throw new Error("Exercice non trouvé");
//       }
//       throw new Error("Erreur lors du chargement de l'exercice");
//     }
//   }

//   // Annuler toutes les requêtes en cours
//   cancelAllRequests(): void {
//     this.abortControllers.forEach((controller) => controller.abort());
//     this.abortControllers.clear();
//   }
// }

// export const companyService = new CompanyService();
