import Database from 'better-sqlite3';
import { EncryptedData } from './encryption.js';

export interface HospitalProfile {
  id?: number;
  name: string;
  serverUrl: string;
  email: string;
  encryptedPassword: string;
  encryptionSalt: string;
  encryptionIV: string;
  encryptionAuthTag?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KeyFingerprint {
  id?: number;
  keyFingerprint: string;
  createdAt?: Date;
}

class Storage {
  private db: Database.Database | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize database on first use
  }

  /**
   * Initialize the database connection
   */
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Use SQLite for development
      this.db = new Database('nice-paw.db');
      this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create necessary tables if they don't exist
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Create hospital_profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hospital_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        serverUrl TEXT NOT NULL,
        email TEXT NOT NULL,
        encryptedPassword TEXT NOT NULL,
        encryptionSalt TEXT NOT NULL,
        encryptionIV TEXT NOT NULL,
        encryptionAuthTag TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, serverUrl)
      )
    `);

    // Create key_fingerprint table (single row)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS key_fingerprint (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        keyFingerprint TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_hospital_profiles_email ON hospital_profiles(email)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_hospital_profiles_serverUrl ON hospital_profiles(serverUrl)');
  }

  /**
   * Get database instance (initializes if needed)
   */
  private getDb(): Database.Database {
    if (!this.db || !this.isInitialized) {
      this.initialize();
    }
    return this.db!;
  }

  /**
   * Store a hospital profile
   */
  async storeHospitalProfile(profile: Omit<HospitalProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const db = this.getDb();

    const stmt = db.prepare(`
      INSERT INTO hospital_profiles
      (name, serverUrl, email, encryptedPassword, encryptionSalt, encryptionIV, encryptionAuthTag, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(email, serverUrl) DO UPDATE SET
        name = excluded.name,
        encryptedPassword = excluded.encryptedPassword,
        encryptionSalt = excluded.encryptionSalt,
        encryptionIV = excluded.encryptionIV,
        encryptionAuthTag = excluded.encryptionAuthTag,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const result = stmt.run(
      profile.name,
      profile.serverUrl,
      profile.email,
      profile.encryptedPassword,
      profile.encryptionSalt,
      profile.encryptionIV,
      profile.encryptionAuthTag || null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get a hospital profile by ID
   */
  async getHospitalProfile(id: number): Promise<HospitalProfile | null> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM hospital_profiles WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      serverUrl: row.serverUrl,
      email: row.email,
      encryptedPassword: row.encryptedPassword,
      encryptionSalt: row.encryptionSalt,
      encryptionIV: row.encryptionIV,
      encryptionAuthTag: row.encryptionAuthTag,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  /**
   * Get a hospital profile by email and server URL
   */
  async getHospitalProfileByEmail(email: string, serverUrl: string): Promise<HospitalProfile | null> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM hospital_profiles WHERE email = ? AND serverUrl = ?
    `);

    const row = stmt.get(email, serverUrl) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      serverUrl: row.serverUrl,
      email: row.email,
      encryptedPassword: row.encryptedPassword,
      encryptionSalt: row.encryptionSalt,
      encryptionIV: row.encryptionIV,
      encryptionAuthTag: row.encryptionAuthTag,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  /**
   * List all hospital profiles
   */
  async listHospitalProfiles(): Promise<HospitalProfile[]> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM hospital_profiles ORDER BY name, createdAt
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      serverUrl: row.serverUrl,
      email: row.email,
      encryptedPassword: row.encryptedPassword,
      encryptionSalt: row.encryptionSalt,
      encryptionIV: row.encryptionIV,
      encryptionAuthTag: row.encryptionAuthTag,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  /**
   * Delete a hospital profile
   */
  async deleteHospitalProfile(id: number): Promise<boolean> {
    const db = this.getDb();

    const stmt = db.prepare(`
      DELETE FROM hospital_profiles WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get the stored key fingerprint
   */
  async getKeyFingerprint(): Promise<string | null> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT keyFingerprint FROM key_fingerprint WHERE id = 1
    `);

    const row = stmt.get() as any;
    return row ? row.keyFingerprint : null;
  }

  /**
   * Set the key fingerprint (only if not already set)
   */
  async setKeyFingerprint(fingerprint: string): Promise<boolean> {
    const db = this.getDb();

    // Check if fingerprint already exists
    const existing = await this.getKeyFingerprint();
    if (existing) {
      return false; // Fingerprint already set
    }

    const stmt = db.prepare(`
      INSERT INTO key_fingerprint (id, keyFingerprint) VALUES (1, ?)
    `);

    const result = stmt.run(fingerprint);
    return result.changes > 0;
  }

  /**
   * Update the key fingerprint (overwrites existing)
   */
  async updateKeyFingerprint(fingerprint: string): Promise<boolean> {
    const db = this.getDb();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO key_fingerprint (id, keyFingerprint) VALUES (1, ?)
    `);

    const result = stmt.run(fingerprint);
    return result.changes > 0;
  }

  /**
   * Clear all stored data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    const db = this.getDb();

    db.exec('DELETE FROM hospital_profiles');
    db.exec('DELETE FROM key_fingerprint');
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export a singleton instance
export const storage = new Storage();