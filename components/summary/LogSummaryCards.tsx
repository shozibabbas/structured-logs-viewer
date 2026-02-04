/**
 * Summary cards for key metrics
 */

import React from 'react';
import type { LogSummary } from '@/types/summary.types';
import { formatPacketDurationMs, formatDurationHMS } from '@/utils/ui.utils';

interface LogSummaryCardsProps {
  summary: LogSummary;
}

export function LogSummaryCards({ summary }: LogSummaryCardsProps) {
  const timeRange = summary.timeRange;
  const avgDuration = summary.packetStats.avgDurationMs;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Packets" value={summary.totalEntries.toLocaleString()} />
      <SummaryCard label="Files" value={summary.totalFiles.toLocaleString()} />
      <SummaryCard
        label="Time Range"
        value={timeRange ? formatDurationHMS(timeRange.durationMs) : 'N/A'}
        subValue={timeRange ? `${timeRange.start} → ${timeRange.end}` : undefined}
      />
      <SummaryCard
        label="Avg Packet Duration"
        value={avgDuration !== undefined ? formatPacketDurationMs(avgDuration) : 'N/A'}
        subValue={
          summary.packetStats.packetsWithDuration > 0
            ? `${summary.packetStats.packetsWithDuration} packet(s)`
            : undefined
        }
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  subValue?: string;
}

function SummaryCard({ label, value, subValue }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-2">{subValue}</p>}
    </div>
  );
}
