import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

interface EncryptedData {
  encrypted: string;  // Base64 encoded encrypted data
  iv: string;        // Base64 encoded initialization vector
  tag: string;       // Base64 encoded authentication tag
  salt: string;      // Base64 encoded salt
}

export class Encryption {
  private key: Buffer | null = null;
  
  constructor(private readonly masterKey?: string) {
    if (masterKey) {
      this.initializeKey(masterKey);
    }
  }
  
  private initializeKey(masterKey: string): void {
    // Generate a key derivation salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive the encryption key using PBKDF2
    this.key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
  }
  
  /**
   * Encrypts a sensitive value
   */
  encrypt(value: string): string {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    
    try {
      // Generate a random IV
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
      
      // Encrypt the value
      let encrypted = cipher.update(value, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get the auth tag
      const tag = cipher.getAuthTag();
      
      // Create the encrypted data object
      const encryptedData: EncryptedData = {
        encrypted,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt: crypto.randomBytes(SALT_LENGTH).toString('base64'),
      };
      
      // Return the encrypted data as a single string
      return `enc:${Buffer.from(JSON.stringify(encryptedData)).toString('base64')}`;
      
    } catch (error) {
      throw new Error('Failed to encrypt value');
    }
  }
  
  /**
   * Decrypts a sensitive value
   */
  decrypt(encryptedValue: string): string {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    
    if (!encryptedValue.startsWith('enc:')) {
      return encryptedValue;
    }
    
    try {
      // Extract the encrypted data
      const encryptedData: EncryptedData = JSON.parse(
        Buffer.from(encryptedValue.slice(4), 'base64').toString('utf8')
      );
      
      // Convert base64 strings back to buffers
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const tag = Buffer.from(encryptedData.tag, 'base64');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt the value
      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
      
    } catch (error) {
      throw new Error('Failed to decrypt value');
    }
  }
  
  /**
   * Checks if a value is encrypted
   */
  isEncrypted(value: string): boolean {
    return value.startsWith('enc:');
  }
  
  /**
   * Generates a new encryption key
   */
  static generateKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString('base64');
  }
}

// Create a singleton instance
const encryption = new Encryption(process.env.ENCRYPTION_KEY);

export default encryption; 