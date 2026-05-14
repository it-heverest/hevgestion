// src/utils/encryption.ts
import crypto from 'crypto';
import { config } from '../config';

export class EncryptionUtil {
  private algorithm = config.encryption.algorithm;
  private key: Buffer;

  constructor() {
    const raw = config.encryption.key;
    // Support hex-encoded keys (64 chars) or raw 32-byte ASCII keys
    const buf = raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)
      ? Buffer.from(raw, 'hex')
      : Buffer.from(raw, 'utf8');

    if (buf.length !== 32) {
      throw new Error(
        `ENCRYPTION_KEY must be exactly 32 bytes for AES-256-GCM. ` +
        `Got ${buf.length} bytes. Use a 32-char ASCII string or a 64-char hex string.`
      );
    }
    this.key = buf;
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = (cipher as any).getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    });
  }

  decrypt(encryptedText: string): string {
    const { iv, encryptedData, authTag } = JSON.parse(encryptedText);
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    (decipher as any).setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}