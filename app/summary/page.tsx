'use client';

import Link from 'next/link';
import { useLogSummary } from '@/hooks/useData';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/common';
import { LogSummaryCards } from '@/components/summary/LogSummaryCards';
import { SummaryTable } from '@/components/summary/SummaryTable';
import { PacketTimelineGraph } from '@/components/summary/PacketTimelineGraph';

export default function LogSummaryPage() {
  const { summary, loading, error, refetch } = useLogSummary();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-400 mx-auto space-y-6">
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
          <div className="space-y-6">
            <LogSummaryCards summary={summary} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryTable title="Log Levels" items={summary.levels} />
              <SummaryTable title="Files" items={summary.files} />
            </div>

            <PacketTimelineGraph items={summary.packetDurations} />
          </div>
        )}
      </div>
    </div>
  );
}
