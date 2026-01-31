import Database from 'better-sqlite3';
import path from 'path';

export interface LogSettings {
  id: number;
  enablePackets: boolean;
  packetStartPattern: string;
  packetEndPattern: string;
  createdAt: string;
  updatedAt: string;
}

const dbPath = path.join(process.cwd(), 'data', 'settings.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Create settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enablePackets INTEGER NOT NULL DEFAULT 1,
      packetStartPattern TEXT NOT NULL,
      packetEndPattern TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings if table is empty
  const count = database.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };

  if (count.count === 0) {
    database.prepare(`
      INSERT INTO settings (enablePackets, packetStartPattern, packetEndPattern)
      VALUES (?, ?, ?)
    `).run(
      1,
      'Received message on',
      'Processed OK'
    );
  }
}

export function getSettings(): LogSettings {
  const db = getDatabase();
  return db.prepare('SELECT * FROM settings ORDER BY id DESC LIMIT 1').get() as LogSettings;
}

export function updateSettings(settings: Partial<LogSettings>): LogSettings {
  const db = getDatabase();

  const updates: string[] = [];
  const values: any[] = [];

  if (settings.enablePackets !== undefined) {
    updates.push('enablePackets = ?');
    values.push(settings.enablePackets ? 1 : 0);
  }

  if (settings.packetStartPattern !== undefined) {
    updates.push('packetStartPattern = ?');
    values.push(settings.packetStartPattern);
  }

  if (settings.packetEndPattern !== undefined) {
    updates.push('packetEndPattern = ?');
    values.push(settings.packetEndPattern);
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP');

  const query = `UPDATE settings SET ${updates.join(', ')} WHERE id = (SELECT MAX(id) FROM settings)`;
  db.prepare(query).run(...values);

  return getSettings();
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
