import { createHash, randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';

export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
  authTag?: string;
}

/**
 * Generate a SHA-256 hash of the master key for fingerprinting
 * This is used to validate that the same master key is used for all hospitals
 */
export function generateKeyFingerprint(masterKey: string): string {
  return createHash('sha256').update(masterKey).digest('hex');
}

/**
 * Validate that a provided master key matches the stored fingerprint
 */
export function validateKeyFingerprint(masterKey: string, storedFingerprint: string): boolean {
  const calculatedFingerprint = generateKeyFingerprint(masterKey);
  return calculatedFingerprint === storedFingerprint;
}

/**
 * Derive an encryption key from the master key using PBKDF2
 */
function deriveEncryptionKey(masterKey: string, salt: string): Buffer {
  return pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256'); // AES-256 key
}

/**
 * Encrypt a password using AES-256-GCM
 */
export async function encryptPassword(password: string, masterKey: string): Promise<EncryptedData> {
  // Generate random salt and IV
  const salt = randomBytes(16).toString('hex');
  const iv = randomBytes(12).toString('hex'); // 12 bytes for GCM

  // Derive encryption key from master key
  const encryptionKey = deriveEncryptionKey(masterKey, salt);

  // Create cipher
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, Buffer.from(iv, 'hex'));

  // Encrypt the password
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag for GCM mode
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    salt,
    iv,
    authTag
  };
}

/**
 * Decrypt a password using AES-256-GCM
 */
export async function decryptPassword(encryptedData: EncryptedData, masterKey: string): Promise<string> {
  try {
    // Derive encryption key from master key using stored salt
    const encryptionKey = deriveEncryptionKey(masterKey, encryptedData.salt);

    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(encryptedData.iv, 'hex'));

    // Set authentication tag for GCM mode
    if (encryptedData.authTag) {
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    }

    // Decrypt the password
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid key or corrupted data'}`);
  }
}

/**
 * Test encryption/decryption cycle
 */
export async function testEncryption(password: string, masterKey: string): Promise<boolean> {
  try {
    const encrypted = await encryptPassword(password, masterKey);
    const decrypted = await decryptPassword(encrypted, masterKey);
    return decrypted === password;
  } catch {
    return false;
  }
}