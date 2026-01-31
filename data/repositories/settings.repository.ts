/**
 * Data access layer for SQLite database
 * Handles all database operations
 */

import Database from 'better-sqlite3';
import path from 'path';
import type { LogSettings, UpdateSettingsInput } from '@/types/settings.types';

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'settings.db');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Gets or creates the database connection
   */
  public getDatabase(): Database.Database {
    if (!this.db) {
      this.db = this.createConnection();
      this.initializeSchema();
      this.seedDefaultData();
    }
    return this.db;
  }

  /**
   * Creates a new database connection
   */
  private createConnection(): Database.Database {
    const fs = require('fs');
    const dataDir = path.dirname(this.dbPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Database(this.dbPath);
  }

  /**
   * Initializes the database schema
   */
  private initializeSchema(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enablePackets INTEGER NOT NULL DEFAULT 1,
        packetStartPattern TEXT NOT NULL,
        packetEndPattern TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Seeds default data if database is empty
   */
  private seedDefaultData(): void {
    if (!this.db) return;

    const count = this.db
      .prepare('SELECT COUNT(*) as count FROM settings')
      .get() as { count: number };

    if (count.count === 0) {
      this.db
        .prepare(`
          INSERT INTO settings (enablePackets, packetStartPattern, packetEndPattern)
          VALUES (?, ?, ?)
        `)
        .run(1, 'Received message on', 'Processed OK');
    }
  }

  /**
   * Closes the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Repository class for settings operations
export class SettingsRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
  }

  /**
   * Retrieves the current settings
   */
  public getSettings(): LogSettings {
    const settings = this.db
      .prepare('SELECT * FROM settings ORDER BY id DESC LIMIT 1')
      .get() as LogSettings;

    return settings;
  }

  /**
   * Updates settings with partial data
   */
  public updateSettings(input: UpdateSettingsInput): LogSettings {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.enablePackets !== undefined) {
      updates.push('enablePackets = ?');
      values.push(input.enablePackets ? 1 : 0);
    }

    if (input.packetStartPattern !== undefined) {
      updates.push('packetStartPattern = ?');
      values.push(input.packetStartPattern);
    }

    if (input.packetEndPattern !== undefined) {
      updates.push('packetEndPattern = ?');
      values.push(input.packetEndPattern);
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');

    const query = `
      UPDATE settings 
      SET ${updates.join(', ')} 
      WHERE id = (SELECT MAX(id) FROM settings)
    `;

    this.db.prepare(query).run(...values);

    return this.getSettings();
  }
}

/**
 * Singleton instance for settings repository
 */
let settingsRepositoryInstance: SettingsRepository | null = null;

export function getSettingsRepository(): SettingsRepository {
  if (!settingsRepositoryInstance) {
    settingsRepositoryInstance = new SettingsRepository();
  }
  return settingsRepositoryInstance;
}

/**
 * Closes all database connections
 */
export function closeDatabaseConnections(): void {
  DatabaseManager.getInstance().close();
  settingsRepositoryInstance = null;
}
