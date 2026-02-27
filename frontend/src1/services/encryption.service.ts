// services/encryption.service.ts

/**
 * Encryption Service for secure client-side storage
 * Uses AES-GCM encryption with 256-bit keys (military-grade)
 */
export class EncryptionService {
  private readonly algorithm = "AES-GCM";
  private key: CryptoKey | null = null;
  private readonly storageKey = "app_encryption_key";
  private readonly keyVersion = "v1";

  constructor() {
    this.initializeKey().catch((error) => {
      console.error("Failed to initialize encryption key:", error);
    });
  }

  private async initializeKey(): Promise<void> {
    try {
      this.key = await this.getOrCreateKey();
    } catch (error) {
      console.error("Failed to initialize encryption key:", error);
      throw new Error("Encryption system initialization failed");
    }
  }

  private async getOrCreateKey(): Promise<CryptoKey> {
    const existingKey = sessionStorage.getItem(this.storageKey);

    if (existingKey) {
      try {
        return await this.importKey(existingKey);
      } catch (error) {
        console.warn("Existing key corrupted, generating new one:", error);
        sessionStorage.removeItem(this.storageKey);
        return await this.generateNewKey();
      }
    }

    return await this.generateNewKey();
  }

  private async generateNewKey(): Promise<CryptoKey> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );

      await this.exportAndStoreKey(key);
      return key;
    } catch (error) {
      console.error("Failed to generate encryption key:", error);
      throw new Error("Key generation failed");
    }
  }

  private async importKey(keyBase64: string): Promise<CryptoKey> {
    try {
      const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        "raw",
        keyData,
        this.algorithm,
        false,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      console.error("Failed to import encryption key:", error);
      throw new Error("Key import failed");
    }
  }

  private async exportAndStoreKey(key: CryptoKey): Promise<void> {
    try {
      const exportedKey = await crypto.subtle.exportKey("raw", key);
      const keyData = new Uint8Array(exportedKey);
      const keyBase64 = btoa(String.fromCharCode(...keyData));
      sessionStorage.setItem(this.storageKey, keyBase64);
    } catch (error) {
      console.error("Failed to export and store key:", error);
      throw new Error("Key storage failed");
    }
  }

  /**
   * Enhanced decrypt with better error handling and recovery
   */
  async decrypt<T = any>(encryptedData: string): Promise<T | null> {
    await this.ensureKeyInitialized();

    try {
      // First attempt: Try to decrypt as encrypted data
      const combined = Uint8Array.from(atob(encryptedData), (c) =>
        c.charCodeAt(0)
      );

      // Check if data has minimum length for encrypted format
      if (combined.length < 13) {
        console.warn("Data too short for encrypted format, trying plain text");
        return this.parsePlainTextData(encryptedData);
      }

      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        this.key!,
        data
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);

      return JSON.parse(decryptedText) as T;
    } catch (encryptionError) {
      console.warn(
        "Decryption failed, attempting plain text fallback:",
        encryptionError
      );

      // Second attempt: Try to parse as plain text JSON
      try {
        return this.parsePlainTextData(encryptedData);
      } catch (plainTextError) {
        console.error("Plain text parsing also failed:", plainTextError);
        this.handleDecryptionFailure();
        return null;
      }
    }
  }

  /**
   * Attempt to parse data as plain text JSON
   */
  private parsePlainTextData<T = any>(data: string): T | null {
    try {
      // Remove any potential whitespace or special characters
      const cleanData = data.trim();

      // Check if it's valid JSON
      if (this.isValidJSON(cleanData)) {
        return JSON.parse(cleanData) as T;
      }

      // If it's not JSON but looks like it might be encrypted base64, return null
      if (this.looksLikeEncryptedData(cleanData)) {
        console.warn("Data appears to be encrypted but decryption failed");
        return null;
      }

      // If it's a simple string, try to wrap it as JSON
      if (cleanData.length > 0 && cleanData.length < 1000) {
        console.warn("Data appears to be plain text, not JSON");
        return null;
      }

      throw new Error("Data format unrecognized");
    } catch (error) {
      console.error("Plain text data parsing failed:", error);
      throw error;
    }
  }

  /**
   * Check if string is valid JSON
   */
  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if data looks like encrypted base64
   */
  private looksLikeEncryptedData(data: string): boolean {
    // Encrypted data should be base64 and reasonably long
    if (data.length < 20) return false;

    try {
      // Check if it's valid base64
      const decoded = atob(data);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }
      return bytes.length >= 13; // Minimum length for IV + data
    } catch {
      return false;
    }
  }

  async encrypt(data: any): Promise<string> {
    await this.ensureKeyInitialized();

    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(data));

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        this.key!,
        encodedData
      );

      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Data encryption failed");
    }
  }

  private async ensureKeyInitialized(): Promise<void> {
    if (!this.key) {
      await this.initializeKey();
    }

    if (!this.key) {
      throw new Error("Encryption key not available");
    }
  }

  /**
   * Enhanced decryption failure handling
   */
  private handleDecryptionFailure(): void {
    console.warn(
      "Decryption failure detected - possible data tampering or corruption"
    );

    // Don't automatically clear the key as it might break other tabs
    // Instead, rely on the storage service to handle corrupted data
  }

  /**
   * Health check for encryption service
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.key) {
        await this.initializeKey();
      }

      // Test encryption/decryption with a simple payload
      const testData = { test: true, timestamp: Date.now() };
      const encrypted = await this.encrypt(testData);
      const decrypted = await this.decrypt(encrypted);

      return decrypted !== null && decrypted.test === true;
    } catch (error) {
      console.error("Encryption health check failed:", error);
      return false;
    }
  }

  clearKey(): void {
    this.key = null;
    sessionStorage.removeItem(this.storageKey);
  }

  static isEncryptionSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof sessionStorage !== "undefined"
    );
  }

  getStatus(): { supported: boolean; initialized: boolean; algorithm: string } {
    return {
      supported: EncryptionService.isEncryptionSupported(),
      initialized: this.key !== null,
      algorithm: this.algorithm,
    };
  }

  async rotateKey(): Promise<void> {
    console.log("Rotating encryption key...");
    this.clearKey();
    await this.initializeKey();
  }
}

/**
 * Enhanced Secure Storage Service with robust error recovery
 */
export class SecureStorageService {
  private encryption: EncryptionService;
  private readonly storagePrefix = "secure_";
  private readonly migrationFlag = "secure_storage_migrated";

  constructor() {
    this.encryption = new EncryptionService();
  }

  /**
   * Enhanced setItem with versioning
   */
  async setItem(key: string, data: any): Promise<void> {
    if (!EncryptionService.isEncryptionSupported()) {
      console.warn("Encryption not supported, using plain storage");
      this.setPlainItem(key, data);
      return;
    }

    try {
      const encrypted = await this.encryption.encrypt({
        data,
        version: "2.0", // Version for future migrations
        timestamp: Date.now(),
      });
      sessionStorage.setItem(`${this.storagePrefix}${key}`, encrypted);
    } catch (error) {
      console.error(
        `Failed to encrypt and store data for key "${key}":`,
        error
      );
      // Fallback to plain storage if encryption fails
      this.setPlainItem(key, data);
    }
  }

  /**
   * Enhanced getItem with comprehensive error recovery
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    const fullKey = `${this.storagePrefix}${key}`;
    const storedValue = sessionStorage.getItem(fullKey);

    if (!storedValue) {
      return null;
    }

    // First, check if it's our new encrypted format
    if (this.isLikelyEncrypted(storedValue)) {
      if (!EncryptionService.isEncryptionSupported()) {
        console.warn("Encrypted data found but encryption not supported");
        this.removeItem(key); // Clear unusable encrypted data
        return null;
      }

      try {
        const decrypted = await this.encryption.decrypt<{
          data: T;
          version: string;
          timestamp: number;
        }>(storedValue);

        if (decrypted && decrypted.data !== undefined) {
          return decrypted.data;
        }
      } catch (error) {
        console.error(`Failed to decrypt data for key "${key}":`, error);
        this.handleCorruptedData(key, storedValue);
        return null;
      }
    }

    // If not encrypted or decryption failed, try plain text
    try {
      return this.parsePlainItem<T>(storedValue);
    } catch (error) {
      console.error(`Failed to parse data for key "${key}":`, error);
      this.handleCorruptedData(key, storedValue);
      return null;
    }
  }

  /**
   * Handle corrupted data by clearing it and optionally migrating
   */
  private handleCorruptedData(key: string, value: string): void {
    console.warn(`Clearing corrupted data for key: ${key}`);
    this.removeItem(key);

    // If this is session data, trigger a re-initialization
    if (key === "app_session") {
      console.log("Session data corrupted, will initialize fresh session");
    }
  }

  /**
   * Store data as plain JSON (fallback)
   */
  private setPlainItem(key: string, data: any): void {
    try {
      sessionStorage.setItem(
        `${this.storagePrefix}${key}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(`Failed to store plain data for key "${key}":`, error);
    }
  }

  /**
   * Parse plain text data
   */
  private parsePlainItem<T = any>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      // If it's not JSON, check if it's a simple string
      if (value && typeof value === "string" && value.length > 0) {
        console.warn(
          `Data for key appears to be plain text, not JSON: ${value.substring(
            0,
            50
          )}...`
        );
      }
      throw new Error("Invalid data format");
    }
  }

  /**
   * Check if data is likely encrypted
   */
  private isLikelyEncrypted(data: string): boolean {
    try {
      // Encrypted data should be base64 and reasonably long
      if (data.length < 20) return false;

      const decoded = atob(data);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      // Our encrypted format should be at least 13 bytes (12 IV + 1 data)
      return bytes.length >= 13;
    } catch {
      return false;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(`${this.storagePrefix}${key}`);
  }

  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    this.encryption.clearKey();

    // Clear migration flag
    sessionStorage.removeItem(this.migrationFlag);
  }

  /**
   * Health check for storage service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test basic storage operations
      const testKey = "health_check_test";
      const testData = { health: "check", timestamp: Date.now() };

      await this.setItem(testKey, testData);
      const retrieved = await this.getItem<typeof testData>(testKey);
      this.removeItem(testKey);

      return retrieved !== null && retrieved.health === "check";
    } catch (error) {
      console.error("Storage health check failed:", error);
      return false;
    }
  }

  /**
   * Get all secure storage keys (for debugging)
   */
  getAllKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        keys.push(key.replace(this.storagePrefix, ""));
      }
    }

    return keys;
  }

  /**
   * Clean up corrupted or unreadable data
   */
  async cleanupCorruptedData(): Promise<void> {
    console.log("🧹 Cleaning up potentially corrupted data...");
    const keys = this.getAllKeys();
    let cleanedCount = 0;

    for (const key of keys) {
      try {
        const value = sessionStorage.getItem(`${this.storagePrefix}${key}`);
        if (value) {
          // Try to read the data to see if it's corrupted
          await this.getItem(key);
          // If we get here without error, data is fine
        }
      } catch (error) {
        // Data is corrupted, remove it
        console.warn(`Removing corrupted data for key: ${key}`);
        this.removeItem(key);
        cleanedCount++;
      }
    }

    console.log(`✅ Cleaned up ${cleanedCount} corrupted items`);
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const secureStorageService = new SecureStorageService();

export default EncryptionService;
