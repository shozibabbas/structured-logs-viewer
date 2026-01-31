/**
 * Log table component
 * Displays logs in a structured table format
 */

'use client';

import React from 'react';
import type { LogEntry } from '@/types/log.types';
import { getLogLevelColor, formatPacketId } from '@/utils/ui.utils';

interface LogTableProps {
  logs: LogEntry[];
  packetsEnabled: boolean;
}

export function LogTable({ logs, packetsEnabled }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
        No logs found matching your filters.
      </div>
    );
  }

  return (
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
              {packetsEnabled && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Packet
                </th>
              )}
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
            {logs.map((log, index) => (
              <LogTableRow
                key={`${log.fileName}-${log.lineNumber}-${index}`}
                log={log}
                packetsEnabled={packetsEnabled}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface LogTableRowProps {
  log: LogEntry;
  packetsEnabled: boolean;
}

function LogTableRow({ log, packetsEnabled }: LogTableRowProps) {
  return (
    <tr
      className={`hover:bg-gray-50 ${
        log.isPacketStart ? 'border-t-2 border-t-green-400' : ''
      } ${log.isPacketEnd ? 'border-b-2 border-b-red-400' : ''}`}
    >
      <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">
        {log.timestamp}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLogLevelColor(log.level)}`}>
          {log.level}
        </span>
      </td>
      {packetsEnabled && (
        <td className="px-4 py-3 text-sm whitespace-nowrap">
          {log.packetId ? (
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                {formatPacketId(log.packetId)}
              </span>
              {log.isPacketStart && (
                <span className="text-green-600 text-xs" title="Packet Start">
                  ▶
                </span>
              )}
              {log.isPacketEnd && (
                <span className="text-red-600 text-xs" title="Packet End">
                  ⏹
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </td>
      )}
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
  );
}
