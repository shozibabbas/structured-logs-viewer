/**
 * Log table component
 * Displays logs in a structured table format
 */

'use client';

import React from 'react';
import type { LogEntry } from '@/types/log.types';
import { getLogLevelColor, formatPacketId } from '@/utils/ui.utils';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';

interface LogTableProps {
  logs: LogEntry[];
  packetsEnabled: boolean;
  packetColors?: Record<string, string>;
}

const VIRTUALIZATION_THRESHOLD = 500;
const VIRTUAL_ROW_HEIGHT_PX = 120;
const VIRTUAL_LIST_HEIGHT_PX = 600;
const VIRTUAL_MIN_WIDTH_WITH_PACKETS_PX = 1150;
const VIRTUAL_MIN_WIDTH_NO_PACKETS_PX = 1000;

export function LogTable({ logs, packetsEnabled, packetColors = {} }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
        No logs found matching your filters.
      </div>
    );
  }

  const gridTemplateClass = packetsEnabled
    ? 'grid-cols-[160px_90px_140px_180px_1fr_160px]'
    : 'grid-cols-[160px_90px_180px_1fr_160px]';

  const virtualMinWidthPx = packetsEnabled
    ? VIRTUAL_MIN_WIDTH_WITH_PACKETS_PX
    : VIRTUAL_MIN_WIDTH_NO_PACKETS_PX;

  if (logs.length >= VIRTUALIZATION_THRESHOLD) {
    const itemData: VirtualRowData = {
      logs,
      packetsEnabled,
      gridTemplateClass,
      packetColors,
    };

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: virtualMinWidthPx }} role="table">
            <div className="bg-gray-50 border-b border-gray-200" role="rowgroup">
              <div
                className={`grid ${gridTemplateClass} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                role="row"
              >
                <div role="columnheader">Timestamp</div>
                <div role="columnheader">Level</div>
                {packetsEnabled && <div role="columnheader">Packet</div>}
                <div role="columnheader">Module</div>
                <div role="columnheader">Message</div>
                <div role="columnheader">File</div>
              </div>
            </div>
            <List
              height={VIRTUAL_LIST_HEIGHT_PX}
              itemCount={logs.length}
              itemData={itemData}
              itemKey={getLogRowKey}
              itemSize={VIRTUAL_ROW_HEIGHT_PX}
              width="100%"
              className="divide-y divide-gray-200"
              style={{ overflowX: 'hidden' }}
            >
              {VirtualLogRow}
            </List>
          </div>
        </div>
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
                packetColors={packetColors}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface VirtualRowData {
  logs: LogEntry[];
  packetsEnabled: boolean;
  gridTemplateClass: string;
  packetColors: Record<string, string>;
}

function getLogRowKey(index: number, data: VirtualRowData) {
  const log = data.logs[index];
  return `${log.fileName}-${log.lineNumber}-${index}`;
}

function VirtualLogRow({ index, style, data }: ListChildComponentProps<VirtualRowData>) {
  const log = data.logs[index];

  return (
    <div
      style={style}
      role="row"
      className={`grid ${data.gridTemplateClass} px-4 py-3 text-sm bg-white items-start hover:bg-gray-50 ${
        log.isPacketStart ? 'border-t-2 border-t-green-400' : ''
      } ${log.isPacketEnd ? 'border-b-2 border-b-red-400' : ''}`}
    >
      <div role="cell" className="text-gray-900 font-mono whitespace-nowrap">
        {log.timestamp}
      </div>
      <div role="cell" className="whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLogLevelColor(log.level)}`}>
          {log.level}
        </span>
      </div>
      {data.packetsEnabled && (
        <div role="cell" className="whitespace-nowrap">
          {log.packetId ? (
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-xs font-mono text-white"
                style={{ backgroundColor: data.packetColors[log.packetId] || '#7c3aed' }}
              >
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
        </div>
      )}
      <div
        role="cell"
        className="text-gray-700 font-mono max-w-xs truncate"
        title={log.module}
      >
        {log.module}
      </div>
      <div role="cell" className="text-gray-900">
        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
          {log.message}
        </pre>
      </div>
      <div role="cell" className="text-xs text-gray-600 whitespace-nowrap font-mono">
        {log.fileName}:{log.lineNumber}
      </div>
    </div>
  );
}

interface LogTableRowProps {
  log: LogEntry;
  packetsEnabled: boolean;
  packetColors: Record<string, string>;
}

function LogTableRow({ log, packetsEnabled, packetColors }: LogTableRowProps) {
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
              <span
                className="px-2 py-1 rounded text-xs font-mono text-white"
                style={{ backgroundColor: packetColors[log.packetId] || '#7c3aed' }}
              >
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
