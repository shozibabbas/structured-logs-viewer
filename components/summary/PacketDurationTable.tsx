/**
 * Packet duration summary table
 */

import React from 'react';
import type { PacketDurationSummary } from '@/types/summary.types';
import { formatPacketDurationMs, formatPacketId } from '@/utils/ui.utils';

interface PacketDurationTableProps {
  items: PacketDurationSummary[];
}

export function PacketDurationTable({ items }: PacketDurationTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Packet Durations
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Packet
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.packetId}>
                <td className="px-4 py-2 text-sm text-gray-700 font-mono">
                  {formatPacketId(item.packetId)}
                </td>
                <td className="px-4 py-2 text-xs text-gray-600 font-mono whitespace-nowrap">
                  {item.startTimestamp}
                </td>
                <td className="px-4 py-2 text-xs text-gray-600 font-mono whitespace-nowrap">
                  {item.endTimestamp}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">
                  {formatPacketDurationMs(item.durationMs)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-500" colSpan={4}>
                  No packet durations available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
