'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLogSummary } from '@/hooks/useData';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/common';
import { LogSummaryCards } from '@/components/summary/LogSummaryCards';
import { SummaryTable } from '@/components/summary/SummaryTable';
import { PacketTimelineGraph } from '@/components/summary/PacketTimelineGraph';
import { PacketDurationGraph } from '@/components/summary/PacketDurationGraph';
import { SummaryFilters } from '@/components/summary/SummaryFilters';
import { filterPacketDurations } from '@/utils/ui.utils';
import type { LogSummary, SummaryCount, TimeRangeSummary } from '@/types/summary.types';

export default function LogSummaryPage() {
  const { summary, loading, error, packetColors, refetch } = useLogSummary();

  const [filterFile, setFilterFile] = useState<string>('ALL');
  const [filterPacket, setFilterPacket] = useState<string>('ALL');
  const [filterExtractMode, setFilterExtractMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const availableFiles = useMemo(
    () => summary?.files.map((item) => item.label) ?? [],
    [summary]
  );

  const availablePackets = useMemo(() => {
    const packets = summary?.packetDurations.map((item) => item.packetId) ?? [];
    return Array.from(new Set(packets)).sort();
  }, [summary]);

  const availableExtractModes = useMemo(() => {
    const modes = new Set<string>();
    for (const packet of summary?.packetDurations ?? []) {
      for (const tag of packet.tags ?? []) {
        modes.add(tag);
      }
    }
    return Array.from(modes).sort();
  }, [summary]);

  const filteredPacketDurations = useMemo(() => {
    if (!summary) {
      return [];
    }

    return filterPacketDurations(summary.packetDurations, {
      file: filterFile,
      packet: filterPacket,
      extractMode: filterExtractMode,
      search: searchQuery,
    });
  }, [summary, filterFile, filterPacket, filterExtractMode, searchQuery]);

  const isFiltered =
    filterFile !== 'ALL' ||
    filterPacket !== 'ALL' ||
    filterExtractMode !== 'ALL' ||
    searchQuery.trim().length > 0;

  const summaryForDisplay = useMemo(() => {
    if (!summary) {
      return null;
    }

    if (!isFiltered) {
      return summary;
    }

    const fileCounts = buildCounts(
      filteredPacketDurations.map((item) => item.fileName || 'Unknown')
    );
    const extractModeCounts = buildCounts(flattenTags(filteredPacketDurations));
    const timeRange = buildTimeRange(filteredPacketDurations);
    const packetStats = buildPacketStats(filteredPacketDurations);

    return {
      ...summary,
      totalEntries: filteredPacketDurations.length,
      totalFiles: fileCounts.length,
      timeRange,
      files: fileCounts,
      packetStats,
      levels: extractModeCounts,
    };
  }, [summary, filteredPacketDurations, isFiltered]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6 overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📈 Log Summary</h1>
            <p className="text-gray-600">
              Review log totals, distributions, and packet timing before diving into details.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
            <Link
              href="/logs"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Logs
            </Link>
            <Link
              href="/settings"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading && <LoadingSpinner message="Loading summary..." />}

        {!loading && !error && !summary && (
          <EmptyState message="No summary available. Place .log files in the logs/ directory." />
        )}

        {!loading && !error && summary && summaryForDisplay && (
          <div className="space-y-6 overflow-visible">
            <SummaryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterFile={filterFile}
              onFileChange={setFilterFile}
              filterPacket={filterPacket}
              onPacketChange={setFilterPacket}
              filterExtractMode={filterExtractMode}
              onExtractModeChange={setFilterExtractMode}
              availableFiles={availableFiles}
              availablePackets={availablePackets}
              availableExtractModes={availableExtractModes}
              onRefresh={refetch}
              loading={loading}
            />

            <div className="text-sm text-gray-600">
              Showing {filteredPacketDurations.length} of {summary.packetDurations.length} packet(s)
            </div>

            <LogSummaryCards summary={summaryForDisplay} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryTable title={isFiltered ? 'Extract Modes' : 'Log Levels'} items={summaryForDisplay.levels} />
              <SummaryTable title="Files" items={summaryForDisplay.files} />
            </div>

            <PacketDurationGraph items={filteredPacketDurations} packetColors={packetColors} />

            <PacketTimelineGraph items={filteredPacketDurations} packetColors={packetColors} />
          </div>
        )}
      </div>
    </div>
  );
}

function buildCounts(values: string[]): SummaryCount[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function flattenTags(packetDurations: LogSummary['packetDurations']): string[] {
  const tags: string[] = [];
  for (const packet of packetDurations) {
    for (const tag of packet.tags ?? []) {
      tags.push(tag);
    }
  }
  return tags;
}

function buildTimeRange(packetDurations: LogSummary['packetDurations']): TimeRangeSummary | undefined {
  if (packetDurations.length === 0) {
    return undefined;
  }

  let earliest = Infinity;
  let latest = -Infinity;

  for (const packet of packetDurations) {
    const start = Date.parse(packet.startTimestamp.replace(',', '.'));
    const end = Date.parse(packet.endTimestamp.replace(',', '.'));
    if (!Number.isNaN(start) && start < earliest) {
      earliest = start;
    }
    if (!Number.isNaN(end) && end > latest) {
      latest = end;
    }
  }

  if (earliest === Infinity || latest === -Infinity) {
    return undefined;
  }

  return {
    start: new Date(earliest).toISOString().replace('T', ' ').replace('Z', ''),
    end: new Date(latest).toISOString().replace('T', ' ').replace('Z', ''),
    durationMs: Math.max(0, latest - earliest),
  };
}

function buildPacketStats(packetDurations: LogSummary['packetDurations']) {
  if (packetDurations.length === 0) {
    return {
      totalPackets: 0,
      packetsWithDuration: 0,
    };
  }

  const durations = packetDurations.map((packet) => packet.durationMs);
  const minDurationMs = Math.min(...durations);
  const maxDurationMs = Math.max(...durations);
  const avgDurationMs = durations.reduce((sum, value) => sum + value, 0) / durations.length;

  return {
    totalPackets: packetDurations.length,
    packetsWithDuration: packetDurations.length,
    minDurationMs,
    maxDurationMs,
    avgDurationMs,
  };
}
