/**
 * File system operations for log files
 * Handles reading log files from disk
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { ParsedFile } from '@/types/log.types';

export class LogFileRepository {
  private readonly logsDir: string;

  constructor(logsDir?: string) {
    this.logsDir = logsDir || path.join(process.cwd(), 'logs');
  }

  /**
   * Checks if logs directory exists
   */
  public async directoryExists(): Promise<boolean> {
    try {
      await fs.access(this.logsDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets all .log files in the directory
   */
  public async getLogFileNames(): Promise<string[]> {
    const files = await fs.readdir(this.logsDir);
    return files.filter(file => file.endsWith('.log'));
  }

  /**
   * Reads all log files with their content
   */
  public async readLogFiles(): Promise<ParsedFile[]> {
    const fileNames = await this.getLogFileNames();

    const filesWithContent = await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = path.join(this.logsDir, fileName);
        const content = await fs.readFile(filePath, 'utf-8');
        return { name: fileName, content };
      })
    );

    return filesWithContent;
  }

  /**
   * Reads a single log file
   */
  public async readLogFile(fileName: string): Promise<ParsedFile> {
    const filePath = path.join(this.logsDir, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return { name: fileName, content };
  }
}

/**
 * Singleton instance
 */
let logFileRepositoryInstance: LogFileRepository | null = null;

export function getLogFileRepository(): LogFileRepository {
  if (!logFileRepositoryInstance) {
    logFileRepositoryInstance = new LogFileRepository();
  }
  return logFileRepositoryInstance;
}
