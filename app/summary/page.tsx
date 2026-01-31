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

export default function LogSummaryPage() {
  const { summary, loading, error, packetColors, refetch } = useLogSummary();

  const [filterFile, setFilterFile] = useState<string>('ALL');
  const [filterPacket, setFilterPacket] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const availableFiles = useMemo(
    () => summary?.files.map((item) => item.label) ?? [],
    [summary]
  );

  const availablePackets = useMemo(() => {
    const packets = summary?.packetDurations.map((item) => item.packetId) ?? [];
    return Array.from(new Set(packets)).sort();
  }, [summary]);

  const filteredPacketDurations = useMemo(() => {
    if (!summary) {
      return [];
    }

    return filterPacketDurations(summary.packetDurations, {
      file: filterFile,
      packet: filterPacket,
      search: searchQuery,
    });
  }, [summary, filterFile, filterPacket, searchQuery]);

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

        {!loading && !error && summary && (
          <div className="space-y-6 overflow-visible">
            <SummaryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterFile={filterFile}
              onFileChange={setFilterFile}
              filterPacket={filterPacket}
              onPacketChange={setFilterPacket}
              availableFiles={availableFiles}
              availablePackets={availablePackets}
              onRefresh={refetch}
              loading={loading}
            />

            <div className="text-sm text-gray-600">
              Showing {filteredPacketDurations.length} of {summary.packetDurations.length} packet(s)
            </div>

            <LogSummaryCards summary={summary} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryTable title="Log Levels" items={summary.levels} />
              <SummaryTable title="Files" items={summary.files} />
            </div>

            <PacketDurationGraph items={filteredPacketDurations} packetColors={packetColors} />

            <PacketTimelineGraph items={filteredPacketDurations} packetColors={packetColors} />
          </div>
        )}
      </div>
    </div>
  );
}
