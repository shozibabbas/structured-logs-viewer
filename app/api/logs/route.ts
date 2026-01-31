import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parseLogFiles, LogEntry } from '@/lib/logParser';

export async function GET() {
  try {
    // Path to logs directory
    const logsDir = path.join(process.cwd(), 'logs');

    // Check if logs directory exists
    try {
      await fs.access(logsDir);
    } catch {
      return NextResponse.json(
        { error: 'Logs directory not found', logs: [] },
        { status: 404 }
      );
    }

    // Read all files in the logs directory
    const files = await fs.readdir(logsDir);

    // Filter for .log files
    const logFiles = files.filter(file => file.endsWith('.log'));

    if (logFiles.length === 0) {
      return NextResponse.json({ logs: [], message: 'No log files found' });
    }

    // Read content of each log file
    const filesWithContent = await Promise.all(
      logFiles.map(async (fileName) => {
        const filePath = path.join(logsDir, fileName);
        const content = await fs.readFile(filePath, 'utf-8');
        return { name: fileName, content };
      })
    );

    // Parse all log files
    const logs: LogEntry[] = parseLogFiles(filesWithContent);

    return NextResponse.json({
      logs,
      totalEntries: logs.length,
      files: logFiles,
    });
  } catch (error) {
    console.error('Error reading log files:', error);
    return NextResponse.json(
      { error: 'Failed to read log files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
