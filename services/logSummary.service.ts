/**
 * Business logic for log summary aggregation
 * Pure functions for data transformation
 */

import type { LogEntry } from '@/types/log.types';
import type {
  LogSummary,
  SummaryCount,
  PacketDurationSummary,
  PacketSummaryStats,
  TimeRangeSummary,
} from '@/types/summary.types';

interface PacketStartState {
  packetId: string;
  startTimestamp: string;
  startTime: Date;
  fileName: string;
}

/**
 * Aggregates log entries into summary metrics
 */
export function buildLogSummary(entries: LogEntry[]): LogSummary {
  const levelCounts = new Map<string, number>();
  const fileCounts = new Map<string, number>();
  const packetIds = new Set<string>();
  const packetDurations: PacketDurationSummary[] = [];
  const packetStartByFile = new Map<string, PacketStartState | null>();

  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const entry of entries) {
    levelCounts.set(entry.level, (levelCounts.get(entry.level) ?? 0) + 1);
    fileCounts.set(entry.fileName, (fileCounts.get(entry.fileName) ?? 0) + 1);

    const entryTime = parseTimestamp(entry.timestamp);
    if (!earliest || entryTime < earliest) {
      earliest = entryTime;
    }
    if (!latest || entryTime > latest) {
      latest = entryTime;
    }

    if (entry.packetId) {
      packetIds.add(entry.packetId);
    }

    if (entry.isPacketStart && entry.packetId) {
      packetStartByFile.set(entry.fileName, {
        packetId: entry.packetId,
        startTimestamp: entry.timestamp,
        startTime: entryTime,
        fileName: entry.fileName,
      });
    }

    if (entry.isPacketEnd && entry.packetId) {
      const currentStart = packetStartByFile.get(entry.fileName) ?? null;
      if (currentStart && currentStart.packetId === entry.packetId) {
        const durationMs = Math.max(0, entryTime.getTime() - currentStart.startTime.getTime());
        packetDurations.push({
          packetId: entry.packetId,
          startTimestamp: currentStart.startTimestamp,
          endTimestamp: entry.timestamp,
          durationMs,
          fileName: currentStart.fileName,
        });
        packetStartByFile.set(entry.fileName, null);
      }
    }
  }

  const timeRange = buildTimeRangeSummary(earliest, latest);
  const levels = mapToCounts(levelCounts);
  const files = mapToCounts(fileCounts);
  const packetStats = buildPacketStats(packetIds.size, packetDurations);

  return {
    totalEntries: entries.length,
    totalFiles: fileCounts.size,
    timeRange,
    levels,
    files,
    packetStats,
    packetDurations,
  };
}

function buildTimeRangeSummary(start: Date | null, end: Date | null): TimeRangeSummary | undefined {
  if (!start || !end) {
    return undefined;
  }

  const durationMs = Math.max(0, end.getTime() - start.getTime());
  return {
    start: formatTimestamp(start),
    end: formatTimestamp(end),
    durationMs,
  };
}

function buildPacketStats(totalPackets: number, durations: PacketDurationSummary[]): PacketSummaryStats {
  if (durations.length === 0) {
    return {
      totalPackets,
      packetsWithDuration: 0,
    };
  }

  const values = durations.map((item) => item.durationMs);
  const minDurationMs = Math.min(...values);
  const maxDurationMs = Math.max(...values);
  const avgDurationMs = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    totalPackets,
    packetsWithDuration: durations.length,
    minDurationMs,
    maxDurationMs,
    avgDurationMs,
  };
}

function mapToCounts(map: Map<string, number>): SummaryCount[] {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp.replace(',', '.'));
}

function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${milliseconds}`;
}
