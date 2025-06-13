import crypto from 'crypto';

export default class EncryptionUtils {
  private static KEYSIZE = 256;

  static encrypt(phrase: string, salt: string): string {
    const saltBytes = Buffer.from(salt, 'utf8');
    // Derive a 32-byte key using PBKDF2 with SHA256
    const hash = crypto.pbkdf2Sync(phrase, saltBytes, 91000, 32, 'sha256');
    // Combine the salt and hash into a single buffer
    const hashBytes = Buffer.alloc(48);
    saltBytes.copy(hashBytes, 0, 0, 16); // First 16 bytes are the salt
    hash.copy(hashBytes, 16); // Next 32 bytes are the hash
    return hashBytes.toString('base64');
  }

  static createSalt(): string {
    const salt = crypto.randomBytes(this.KEYSIZE);
    return salt.toString('base64');
  }
}
