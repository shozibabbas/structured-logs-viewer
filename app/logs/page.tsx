'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLogs } from '@/hooks/useData';
import { LogTable } from '@/components/logs/LogTable';
import { LogFilters } from '@/components/logs/LogFilters';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/common';
import { filterLogs } from '@/utils/ui.utils';
import { extractLogLevels } from '@/services/logParser.service';

export default function LogsViewerPage() {
  const { logs, loading, error, availableFiles, availablePackets, packetsEnabled, refetch } = useLogs();

  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterFile, setFilterFile] = useState<string>('ALL');
  const [filterPacket, setFilterPacket] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique levels
  const uniqueLevels = useMemo(() => extractLogLevels(logs), [logs]);

  // Apply filters
  const filteredLogs = useMemo(
    () =>
      filterLogs(logs, {
        level: filterLevel,
        file: filterFile,
        packet: filterPacket,
        search: searchQuery,
      }),
    [logs, filterLevel, filterFile, filterPacket, searchQuery]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">📊 Structured Logs Viewer</h1>
            <div className="flex items-center gap-3">
              <Link
                href="/summary"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                📈 Summary
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                ⚙️ Settings
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Showing {filteredLogs.length} of {logs.length} log entries
            {availableFiles.length > 0 && ` from ${availableFiles.length} file(s)`}
            {packetsEnabled && availablePackets.length > 0 && ` • ${availablePackets.length} packet(s)`}
          </p>
        </div>

        {/* Filters */}
        <LogFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterLevel={filterLevel}
          onLevelChange={setFilterLevel}
          filterFile={filterFile}
          onFileChange={setFilterFile}
          filterPacket={filterPacket}
          onPacketChange={setFilterPacket}
          availableLevels={uniqueLevels}
          availableFiles={availableFiles}
          availablePackets={availablePackets}
          packetsEnabled={packetsEnabled}
          onRefresh={refetch}
          loading={loading}
        />

        {/* Error Display */}
        {error && <ErrorMessage message={error} />}

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading logs..." />}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <EmptyState message="No log files found. Place .log files in the logs/ directory." icon="📂" />
        )}

        {/* Logs Table */}
        {!loading && !error && logs.length > 0 && (
          <LogTable logs={filteredLogs} packetsEnabled={packetsEnabled} />
        )}
      </div>
    </div>
  );
}
