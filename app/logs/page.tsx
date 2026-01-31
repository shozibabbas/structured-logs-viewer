'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  fileName: string;
  rawLine: string;
  lineNumber: number;
}

interface LogsResponse {
  logs: LogEntry[];
  totalEntries: number;
  files: string[];
  error?: string;
  message?: string;
}

export default function LogsViewerPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterFile, setFilterFile] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logs');
      const data: LogsResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setLogs(data.logs || []);
        setAvailableFiles(data.files || []);
      }
    } catch (err) {
      setError('Failed to fetch logs: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filterLevel !== 'ALL' && log.level !== filterLevel) {
      return false;
    }

    // Filter by file
    if (filterFile !== 'ALL' && log.fileName !== filterFile) {
      return false;
    }

    // Search in message, module, or timestamp
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query) ||
        log.timestamp.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'INFO':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const uniqueLevels = Array.from(new Set(logs.map(log => log.level))).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Structured Logs Viewer</h1>
          <p className="text-gray-600">
            Showing {filteredLogs.length} of {logs.length} log entries
            {availableFiles.length > 0 && ` from ${availableFiles.length} file(s)`}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in messages, modules, or timestamps..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Level Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Log Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Levels</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* File Filter */}
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source File
              </label>
              <select
                value={filterFile}
                onChange={(e) => setFilterFile(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Files</option>
                {availableFiles.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading logs...</p>
          </div>
        )}

        {/* Logs Display */}
        {!loading && !error && filteredLogs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            No logs found matching your filters.
          </div>
        )}

        {!loading && !error && filteredLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log, index) => (
                    <tr key={`${log.fileName}-${log.lineNumber}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono max-w-xs truncate" title={log.module}>
                        {log.module}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded max-h-96 overflow-y-auto">
                          {log.message}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-mono">
                        {log.fileName}:{log.lineNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
