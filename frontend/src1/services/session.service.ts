// // frontend/src/services/session.service.ts
// export interface SessionData {
//   userId: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
//   token: string;
//   refreshToken: string;
//   expiresAt: number;
// }

// export class SessionService {
//   private readonly SESSION_KEY = 'user_session';
//   private readonly COOKIE_NAME = 'session_token';

//   // Store session in both localStorage and cookies for redundancy
//   setSession(sessionData: SessionData): void {
//     try {
//       // Store in localStorage
//       localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

//       // Store token in cookie for server-side access
//       this.setCookie(this.COOKIE_NAME, sessionData.token, 7); // 7 days

//       console.log('✅ Session stored successfully');
//     } catch (error) {
//       console.warn('⚠️ Failed to store session:', error);
//     }
//   }

//   getSession(): SessionData | null {
//     try {
//       // Try localStorage first
//       const stored = localStorage.getItem(this.SESSION_KEY);
//       if (stored) {
//         const sessionData: SessionData = JSON.parse(stored);

//         // Check if session is expired
//         if (Date.now() > sessionData.expiresAt) {
//           this.clearSession();
//           return null;
//         }

//         return sessionData;
//       }

//       // Fallback to cookie
//       const cookieToken = this.getCookie(this.COOKIE_NAME);
//       if (cookieToken) {
//         // If we have a token in cookie but no session data,
//         // we'll need to validate it with the server
//         return null; // Let the auth service handle token validation
//       }

//       return null;
//     } catch (error) {
//       console.warn('⚠️ Failed to retrieve session:', error);
//       return null;
//     }
//   }

//   updateSession(updates: Partial<SessionData>): void {
//     try {
//       const currentSession = this.getSession();
//       if (currentSession) {
//         const updatedSession = { ...currentSession, ...updates };
//         this.setSession(updatedSession);
//       }
//     } catch (error) {
//       console.warn('⚠️ Failed to update session:', error);
//     }
//   }

//   clearSession(): void {
//     try {
//       localStorage.removeItem(this.SESSION_KEY);
//       this.deleteCookie(this.COOKIE_NAME);
//       console.log('✅ Session cleared');
//     } catch (error) {
//       console.warn('⚠️ Failed to clear session:', error);
//     }
//   }

//   isAuthenticated(): boolean {
//     const session = this.getSession();
//     return session !== null && Date.now() < session.expiresAt;
//   }

//   getToken(): string | null {
//     const session = this.getSession();
//     return session?.token || null;
//   }

//   getRefreshToken(): string | null {
//     const session = this.getSession();
//     return session?.refreshToken || null;
//   }

//   // Cookie utilities
//   private setCookie(name: string, value: string, days: number): void {
//     try {
//       const expires = new Date();
//       expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//       document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
//     } catch (error) {
//       console.warn('⚠️ Failed to set cookie:', error);
//     }
//   }

//   private getCookie(name: string): string | null {
//     try {
//       const nameEQ = name + "=";
//       const ca = document.cookie.split(';');
//       for (let i = 0; i < ca.length; i++) {
//         let c = ca[i];
//         while (c.charAt(0) === ' ') c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
//       }
//       return null;
//     } catch (error) {
//       console.warn('⚠️ Failed to get cookie:', error);
//       return null;
//     }
//   }

//   private deleteCookie(name: string): void {
//     try {
//       document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
//     } catch (error) {
//       console.warn('⚠️ Failed to delete cookie:', error);
//     }
//   }

//   // Session validation
//   async validateSession(): Promise<boolean> {
//     try {
//       const session = this.getSession();
//       if (!session) return false;

//       // Check if token is close to expiry (within 5 minutes)
//       const fiveMinutes = 5 * 60 * 1000;
//       if (session.expiresAt - Date.now() < fiveMinutes) {
//         // Try to refresh token
//         const refreshed = await this.refreshToken();
//         return refreshed;
//       }

//       return true;
//     } catch (error) {
//       console.warn('⚠️ Session validation failed:', error);
//       return false;
//     }
//   }

//   // Token refresh
//   private async refreshToken(): Promise<boolean> {
//     try {
//       const refreshToken = this.getRefreshToken();
//       if (!refreshToken) return false;

//       const response = await fetch('/api/auth/refresh', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ refreshToken }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const currentSession = this.getSession();
//         if (currentSession) {
//           this.updateSession({
//             token: data.token,
//             refreshToken: data.refreshToken,
//             expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
//           });
//         }
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.warn('⚠️ Token refresh failed:', error);
//       return false;
//     }
//   }
// }

// export const sessionService = new SessionService();