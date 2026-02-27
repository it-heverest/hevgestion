// // frontend/src/services/cache.service.ts
// export interface CachedUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   company?: {
//     id: string;
//     name: string;
//     legalForm: string;
//     currency: string;
//   };
//   clients: CachedClient[];
//   permissions: string[];
//   lastAccessed: Date;
// }

// export interface CachedClient {
//   id: string;
//   name: string;
//   country: string;
//   legalForm?: string;
//   taxNumber?: string;
//   folders: CachedFolder[];
// }

// export interface CachedFolder {
//   id: string;
//   name: string;
//   fiscalYear: number;
//   status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
//   isActive: boolean;
//   startDate: string;
//   endDate: string;
//   clientId: string;
// }

// export interface CacheStats {
//   totalSessions: number;
//   totalUsers: number;
//   totalClients: number;
//   totalFolders: number;
//   memoryUsage: string;
// }

// export class FrontendSessionCacheService {
//   private readonly SESSION_TTL = 24 * 60 * 60 * 1000; // 24 heures en ms
//   private readonly USER_DATA_TTL = 2 * 60 * 60 * 1000; // 2 heures en ms
//   private readonly CLIENT_DATA_TTL = 4 * 60 * 60 * 1000; // 4 heures en ms
//   private readonly FOLDER_DATA_TTL = 4 * 60 * 60 * 1000; // 4 heures en ms

//   private getStorageKey(key: string): string {
//     return `cache_${key}`;
//   }

//   private setWithExpiry(key: string, value: any, ttl: number): void {
//     try {
//       const item = {
//         value: JSON.stringify(value),
//         expiry: Date.now() + ttl,
//       };
//       sessionStorage.setItem(this.getStorageKey(key), JSON.stringify(item));
//     } catch (error) {
//       console.warn("Failed to cache data in sessionStorage:", error);
//     }
//   }

//   private getWithExpiry<T>(key: string): T | null {
//     try {
//       const itemStr = sessionStorage.getItem(this.getStorageKey(key));
//       if (!itemStr) return null;

//       const item = JSON.parse(itemStr);
//       if (Date.now() > item.expiry) {
//         sessionStorage.removeItem(this.getStorageKey(key));
//         return null;
//       }

//       return JSON.parse(item.value);
//     } catch (error) {
//       console.warn("Failed to retrieve cached data:", error);
//       return null;
//     }
//   }

//   private remove(key: string): void {
//     try {
//       sessionStorage.removeItem(this.getStorageKey(key));
//     } catch (error) {
//       console.warn("Failed to remove cached data:", error);
//     }
//   }

//   private keys(pattern: string): string[] {
//     try {
//       const keys: string[] = [];
//       const prefix = this.getStorageKey(pattern.replace("*", ""));

//       for (let i = 0; i < sessionStorage.length; i++) {
//         const key = sessionStorage.key(i);
//         if (key && key.startsWith(prefix)) {
//           keys.push(key.replace("cache_", ""));
//         }
//       }

//       return keys;
//     } catch (error) {
//       console.warn("Failed to get keys from sessionStorage:", error);
//       return [];
//     }
//   }

//   // Session Management
//   cacheUserSession(sessionId: string, userData: CachedUser): void {
//     try {
//       const cacheKey = `session:${sessionId}`;
//       const userWithTimestamp = {
//         ...userData,
//         lastAccessed: new Date(),
//         sessionId,
//       };

//       this.setWithExpiry(cacheKey, userWithTimestamp, this.SESSION_TTL);
//       console.log(`✅ Session cached for user: ${userData.email}`);
//     } catch (error) {
//       console.warn("⚠️ Failed to cache session");
//     }
//   }

//   getCachedUserSession(sessionId: string): CachedUser | null {
//     try {
//       const cacheKey = `session:${sessionId}`;
//       const userData = this.getWithExpiry<CachedUser>(cacheKey);

//       // Refresh TTL on access
//       if (userData) {
//         this.setWithExpiry(cacheKey, userData, this.SESSION_TTL);
//       }

//       return userData;
//     } catch (error) {
//       return null;
//     }
//   }

//   invalidateUserSession(sessionId: string): void {
//     try {
//       const cacheKey = `session:${sessionId}`;
//       this.remove(cacheKey);
//       console.log(`✅ Session invalidated: ${sessionId}`);
//     } catch (error) {
//       console.warn("⚠️ Failed to invalidate session");
//     }
//   }

//   // User Data Caching
//   cacheUserData(userId: string, userData: CachedUser): void {
//     try {
//       const cacheKey = `user:${userId}`;
//       this.setWithExpiry(cacheKey, userData, this.USER_DATA_TTL);
//     } catch (error) {
//       console.warn("⚠️ Failed to cache user data");
//     }
//   }

//   getCachedUserData(userId: string): CachedUser | null {
//     try {
//       return this.getWithExpiry<CachedUser>(`user:${userId}`);
//     } catch (error) {
//       return null;
//     }
//   }

//   invalidateUserData(userId: string): void {
//     try {
//       this.remove(`user:${userId}`);
//       this.invalidateUserClients(userId);
//       console.log(`✅ User data invalidated: ${userId}`);
//     } catch (error) {
//       console.warn("⚠️ Failed to invalidate user data");
//     }
//   }

//   // Client Data Caching
//   cacheUserClients(userId: string, clients: CachedClient[]): void {
//     try {
//       const cacheKey = `clients:user:${userId}`;
//       this.setWithExpiry(cacheKey, clients, this.CLIENT_DATA_TTL);
//     } catch (error) {
//       console.warn("⚠️ Failed to cache user clients");
//     }
//   }

//   getCachedUserClients(userId: string): CachedClient[] | null {
//     try {
//       return this.getWithExpiry<CachedClient[]>(`clients:user:${userId}`);
//     } catch (error) {
//       return null;
//     }
//   }

//   invalidateUserClients(userId: string): void {
//     try {
//       this.remove(`clients:user:${userId}`);
//     } catch (error) {
//       console.warn("⚠️ Failed to invalidate user clients");
//     }
//   }

//   // Folder Data Caching
//   cacheClientFolders(clientId: string, folders: CachedFolder[]): void {
//     try {
//       const cacheKey = `folders:client:${clientId}`;
//       this.setWithExpiry(cacheKey, folders, this.FOLDER_DATA_TTL);
//     } catch (error) {
//       console.warn("⚠️ Failed to cache client folders");
//     }
//   }

//   getCachedClientFolders(clientId: string): CachedFolder[] | null {
//     try {
//       return this.getWithExpiry<CachedFolder[]>(`folders:client:${clientId}`);
//     } catch (error) {
//       return null;
//     }
//   }

//   invalidateClientFolders(clientId: string): void {
//     try {
//       this.remove(`folders:client:${clientId}`);
//     } catch (error) {
//       console.warn("⚠️ Failed to invalidate client folders");
//     }
//   }

//   // App Data Caching (pour useAppData)
//   cacheAppData(
//     userId: string,
//     data: {
//       countries: any[];
//       clients: any[];
//       folders: any[];
//     }
//   ): void {
//     try {
//       const cacheKey = `app:data:${userId}`;
//       this.setWithExpiry(cacheKey, data, this.USER_DATA_TTL);
//     } catch (error) {
//       console.warn("⚠️ Failed to cache app data");
//     }
//   }

//   getCachedAppData(userId: string): {
//     countries: any[];
//     clients: any[];
//     folders: any[];
//   } | null {
//     try {
//       return this.getWithExpiry<{
//         countries: any[];
//         clients: any[];
//         folders: any[];
//       }>(`app:data:${userId}`);
//     } catch (error) {
//       return null;
//     }
//   }

//   // User Selections Caching (pour AppContext)
//   cacheUserSelections(
//     userId: string,
//     selections: {
//       selectedCountry?: string | null;
//       selectedClientId?: string | null;
//       selectedFolderId?: string | null;
//     }
//   ): void {
//     try {
//       const cacheKey = `selections:user:${userId}`;
//       this.setWithExpiry(
//         cacheKey,
//         {
//           ...selections,
//           lastUpdated: new Date().toISOString(),
//         },
//         this.SESSION_TTL
//       );
//     } catch (error) {
//       console.warn("⚠️ Failed to cache user selections");
//     }
//   }

//   getCachedUserSelections(userId: string): {
//     selectedCountry: string | null;
//     selectedClientId: string | null;
//     selectedFolderId: string | null;
//   } | null {
//     try {
//       const cached = this.getWithExpiry<{
//         selectedCountry: string | null;
//         selectedClientId: string | null;
//         selectedFolderId: string | null;
//       }>(`selections:user:${userId}`);

//       return (
//         cached || {
//           selectedCountry: null,
//           selectedClientId: null,
//           selectedFolderId: null,
//         }
//       );
//     } catch (error) {
//       return {
//         selectedCountry: null,
//         selectedClientId: null,
//         selectedFolderId: null,
//       };
//     }
//   }

//   // Cache Statistics
//   getCacheStats(): CacheStats {
//     try {
//       const sessionKeys = this.keys("session:*");
//       const userKeys = this.keys("user:*");
//       const clientKeys = this.keys("clients:user:*");
//       const folderKeys = this.keys("folders:client:*");

//       return {
//         totalSessions: sessionKeys.length,
//         totalUsers: userKeys.length,
//         totalClients: clientKeys.length,
//         totalFolders: folderKeys.length,
//         memoryUsage: "N/A", // localStorage ne fournit pas cette info directement
//       };
//     } catch (error) {
//       console.error("Error getting cache stats:", error);
//       return {
//         totalSessions: 0,
//         totalUsers: 0,
//         totalClients: 0,
//         totalFolders: 0,
//         memoryUsage: "Error",
//       };
//     }
//   }

//   // Bulk Invalidation
//   invalidateAllUserData(): void {
//     try {
//       const patterns = [
//         "session:*",
//         "user:*",
//         "clients:user:*",
//         "folders:client:*",
//         "app:data:*",
//         "selections:user:*",
//       ];

//       for (const pattern of patterns) {
//         const keys = this.keys(pattern);
//         for (const key of keys) {
//           this.remove(key);
//         }
//       }

//       console.log("✅ All user data invalidated from cache");
//     } catch (error) {
//       console.warn("⚠️ Failed to invalidate all user data");
//     }
//   }

//   // Health Check
//   healthCheck(): boolean {
//     try {
//       const testKey = "health:check";
//       const testData = { status: "ok", timestamp: Date.now() };

//       this.setWithExpiry(testKey, testData, 10000); // 10 secondes
//       const result = this.getWithExpiry(testKey);

//       return result !== null;
//     } catch (error) {
//       console.warn("⚠️ Frontend cache health check failed");
//       return false;
//     }
//   }

//   // Clear all cache
//   clearAll(): void {
//     try {
//       const keysToRemove: string[] = [];

//       for (let i = 0; i < sessionStorage.length; i++) {
//         const key = sessionStorage.key(i);
//         if (key && key.startsWith("cache_")) {
//           keysToRemove.push(key);
//         }
//       }

//       keysToRemove.forEach((key) => sessionStorage.removeItem(key));
//       console.log("✅ All cache cleared");
//     } catch (error) {
//       console.warn("⚠️ Failed to clear all cache");
//     }
//   }
// }

// export const frontendCacheService = new FrontendSessionCacheService();
