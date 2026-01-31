/**
 * Summary domain types for log aggregation
 */

export interface SummaryCount {
  label: string;
  count: number;
}

export interface TimeRangeSummary {
  start: string;
  end: string;
  durationMs: number;
}

export interface PacketDurationSummary {
  packetId: string;
  startTimestamp: string;
  endTimestamp: string;
  durationMs: number;
  fileName?: string;
}

export interface PacketSummaryStats {
  totalPackets: number;
  packetsWithDuration: number;
  minDurationMs?: number;
  maxDurationMs?: number;
  avgDurationMs?: number;
}

export interface LogSummary {
  totalEntries: number;
  totalFiles: number;
  timeRange?: TimeRangeSummary;
  levels: SummaryCount[];
  files: SummaryCount[];
  packetStats: PacketSummaryStats;
  packetDurations: PacketDurationSummary[];
}
