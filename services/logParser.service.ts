/**
 * Business logic for log parsing
 * Pure functions with no side effects
 */

import type { LogEntry, ParsedFile, PacketTrackingOptions } from '@/types/log.types';

/**
 * Parses a single log line into a LogEntry object
 */
export function parseLogLine(
  line: string,
  fileName: string,
  lineNumber: number
): LogEntry | null {
  // Pattern: timestamp | level | module | message
  const logPattern = /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s*\|\s*(\w+)\s*\|\s*([^|]+?)\s*\|\s*(.+)$/;

  const match = line.match(logPattern);

  if (match) {
    return {
      timestamp: match[1].trim(),
      level: match[2].trim() as 'INFO' | 'WARNING' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL' | 'FATAL',
      module: match[3].trim(),
      message: match[4].trim(),
      fileName,
      rawLine: line,
      lineNumber,
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

  // Apply packet tracking if enabled
  if (options?.enablePackets && options.packetStartPattern && options.packetEndPattern) {
    applyPacketTracking(sortedEntries, options.packetStartPattern, options.packetEndPattern);
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
 * Applies packet tracking to log entries based on patterns
 */
function applyPacketTracking(
  entries: LogEntry[],
  startPattern: string,
  endPattern: string
): void {
  const currentPacketIdByFile = new Map<string, string | null>();
  const packetCounterByFile = new Map<string, number>();
  const packetStartTimeByFile = new Map<string, Date | null>();

  try {
    const startRegex = new RegExp(startPattern);
    const endRegex = new RegExp(endPattern);

    for (const entry of entries) {
      const fileKey = entry.fileName;
      const currentPacketId = currentPacketIdByFile.get(fileKey) ?? null;
      const packetCounter = packetCounterByFile.get(fileKey) ?? 0;

      if (startRegex.test(entry.message)) {
        const nextCounter = packetCounter + 1;
        const nextPacketId = generatePacketId(nextCounter, entry.timestamp);
        entry.packetId = nextPacketId;
        entry.isPacketStart = true;
        currentPacketIdByFile.set(fileKey, nextPacketId);
        packetCounterByFile.set(fileKey, nextCounter);
        packetStartTimeByFile.set(fileKey, parseTimestamp(entry.timestamp));
        continue;
      }

      if (currentPacketId) {
        entry.packetId = currentPacketId;

        if (endRegex.test(entry.message)) {
          entry.isPacketEnd = true;
          const startTime = packetStartTimeByFile.get(fileKey) ?? null;
          if (startTime) {
            const endTime = parseTimestamp(entry.timestamp);
            entry.packetDurationMs = Math.max(0, endTime.getTime() - startTime.getTime());
          }
          currentPacketIdByFile.set(fileKey, null);
          packetStartTimeByFile.set(fileKey, null);
        }
      }
    }
  } catch (error) {
    console.error('Error applying packet tracking:', error);
  }
}

/**
 * Generates a unique packet ID
 */
function generatePacketId(counter: number, timestamp: string): string {
  return `packet_${counter}_${timestamp}`;
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

  return Array.from(packetIds);
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
