/**
 * Business logic for log parsing
 * Pure functions with no side effects
 */

import type { LogEntry, ParsedFile, PacketTrackingOptions } from '@/types/log.types';

/**
 * Extracts extract mode from log message
 */
export function extractExtractMode(message: string): string | undefined {
  const match = message.match(/routed to extract mode:\s*([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : undefined;
}

/**
 * Extracts job_id from log message
 */
export function extractJobId(message: string, packetIdPattern?: string): string | undefined {
  const pattern = packetIdPattern?.trim() || 'job_id=([a-zA-Z0-9_-]+)';
  const match = message.match(new RegExp(pattern, 'i'));
  return match ? match[1] : undefined;
}

/**
 * Parses a single log line into a LogEntry object
 */
export function parseLogLine(
  line: string,
  fileName: string,
  lineNumber: number
): LogEntry | null {
  // Pattern: timestamp | level | module | message
  const logPattern = /^([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*\|\s*(\w+)\s*\|\s*([^|]+?)\s*\|\s*(.+)$/;

  const match = line.match(logPattern);

  if (match) {
    const message = match[4].trim();

    return {
      timestamp: match[1].trim(),
      level: match[2].trim() as 'INFO' | 'WARNING' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL' | 'FATAL',
      module: match[3].trim(),
      message,
      fileName,
      rawLine: line,
      lineNumber,
      extractMode: extractExtractMode(message),
    };
  }

  return null;
}

/**
 * Parses multiple log files and combines their entries
 */
export function parseLogFiles(
  files: ParsedFile[],
  options?: PacketTrackingOptions
): LogEntry[] {
  const allEntries: LogEntry[] = [];

  for (const file of files) {
    const entries = parseLogFile(file);
    allEntries.push(...entries);
  }

  // Sort by timestamp
  const sortedEntries = sortLogsByTimestamp(allEntries);

  if (options?.enablePackets) {
    applyPacketIdPropagation(
      sortedEntries,
      options.packetStartPattern,
      options.packetEndPattern,
      options.packetIdPattern
    );
  }

  return sortedEntries;
}

/**
 * Parses a single log file
 */
function parseLogFile(file: ParsedFile): LogEntry[] {
  const entries: LogEntry[] = [];
  const lines = file.content.split('\n');
  let currentEntry: LogEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      continue;
    }

    const parsed = parseLogLine(line, file.name, i + 1);

    if (parsed) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = parsed;
    } else if (currentEntry) {
      // Continuation line (stack traces, etc.)
      currentEntry.message += '\n' + line;
      currentEntry.rawLine += '\n' + line;
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

/**
 * Sorts log entries by timestamp
 */
function sortLogsByTimestamp(entries: LogEntry[]): LogEntry[] {
  return entries.sort((a, b) => {
    const dateA = parseTimestamp(a.timestamp);
    const dateB = parseTimestamp(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Parses a timestamp string into a Date object
 */
function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp.replace(',', '.'));
}

function applyPacketIdPropagation(
  entries: LogEntry[],
  startPattern?: string,
  endPattern?: string,
  packetIdPattern?: string
): void {
  const currentPacketIdByFile = new Map<string, string | null>();
  const startRegex = startPattern ? new RegExp(startPattern) : null;
  const endRegex = endPattern ? new RegExp(endPattern) : null;

  for (const entry of entries) {
    const fileKey = entry.fileName;
    const jobId = extractJobId(entry.message, packetIdPattern);

    if (jobId) {
      currentPacketIdByFile.set(fileKey, jobId);
      entry.packetId = jobId;

      if (startRegex?.test(entry.message)) {
        entry.isPacketStart = true;
      }
    } else {
      const currentPacketId = currentPacketIdByFile.get(fileKey) ?? null;
      if (currentPacketId) {
        entry.packetId = currentPacketId;
      }
    }

    if (entry.packetId && endRegex?.test(entry.message)) {
      entry.isPacketEnd = true;
      currentPacketIdByFile.set(fileKey, null);
    }
  }
}

/**
 * Extracts unique packet IDs from log entries
 */
export function extractPacketIds(entries: LogEntry[]): string[] {
  const packetIds = new Set<string>();

  for (const entry of entries) {
    if (entry.packetId) {
      packetIds.add(entry.packetId);
    }
  }

  return Array.from(packetIds).sort();
}

/**
 * Extracts unique log levels from entries
 */
export function extractLogLevels(entries: LogEntry[]): string[] {
  const levels = new Set<string>();

  for (const entry of entries) {
    levels.add(entry.level);
  }

  return Array.from(levels).sort();
}
