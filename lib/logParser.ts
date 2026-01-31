export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  fileName: string;
  rawLine: string;
  lineNumber: number;
  packetId?: string;  // Unique identifier for the message packet
  isPacketStart?: boolean;
  isPacketEnd?: boolean;
}

/**
 * Parses a log line in the format:
 * YYYY-MM-DD HH:MM:SS,mmm | LEVEL | module | message
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
      level: match[2].trim(),
      module: match[3].trim(),
      message: match[4].trim(),
      fileName,
      rawLine: line,
      lineNumber,
    };
  }

  // Return null for lines that don't match (could be stack traces, continuation lines, etc.)
  return null;
}

/**
 * Parses multiple log files and combines their entries
 */
export function parseLogFiles(
  files: { name: string; content: string }[],
  options?: {
    enablePackets?: boolean;
    packetStartPattern?: string;
    packetEndPattern?: string;
  }
): LogEntry[] {
  const allEntries: LogEntry[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    let currentEntry: LogEntry | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line.trim()) {
        continue; // Skip empty lines
      }

      const parsed = parseLogLine(line, file.name, i + 1);

      if (parsed) {
        // If we had a previous entry, push it
        if (currentEntry) {
          allEntries.push(currentEntry);
        }
        currentEntry = parsed;
      } else if (currentEntry) {
        // This is a continuation line (like stack traces)
        currentEntry.message += '\n' + line;
        currentEntry.rawLine += '\n' + line;
      }
    }

    // Push the last entry
    if (currentEntry) {
      allEntries.push(currentEntry);
    }
  }

  // Apply packet tracking if enabled
  if (options?.enablePackets && options.packetStartPattern && options.packetEndPattern) {
    applyPacketTracking(allEntries, options.packetStartPattern, options.packetEndPattern);
  }

  // Sort by timestamp
  allEntries.sort((a, b) => {
    const dateA = new Date(a.timestamp.replace(',', '.'));
    const dateB = new Date(b.timestamp.replace(',', '.'));
    return dateA.getTime() - dateB.getTime();
  });

  return allEntries;
}

/**
 * Applies packet tracking to log entries based on start and end patterns
 */
function applyPacketTracking(
  entries: LogEntry[],
  startPattern: string,
  endPattern: string
): void {
  let currentPacketId: string | null = null;
  let packetCounter = 0;

  try {
    // Create regex patterns from the strings
    const startRegex = new RegExp(startPattern);
    const endRegex = new RegExp(endPattern);

    for (const entry of entries) {
      // Check if this is a packet start
      if (startRegex.test(entry.message)) {
        packetCounter++;
        currentPacketId = `packet_${packetCounter}_${entry.timestamp}`;
        entry.packetId = currentPacketId;
        entry.isPacketStart = true;
      } else if (currentPacketId) {
        // Assign current packet ID to this entry
        entry.packetId = currentPacketId;

        // Check if this is a packet end
        if (endRegex.test(entry.message)) {
          entry.isPacketEnd = true;
          currentPacketId = null; // Reset for next packet
        }
      }
    }
  } catch (error) {
    console.error('Error applying packet tracking:', error);
    // If regex is invalid, skip packet tracking
  }
}

