/**
 * Summary table for counts
 */

import React from 'react';
import type { SummaryCount } from '@/types/summary.types';

interface SummaryTableProps {
  title: string;
  items: SummaryCount[];
}

export function SummaryTable({ title, items }: SummaryTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.label}>
              <td className="px-4 py-2 text-sm text-gray-700 font-mono truncate" title={item.label}>
                {item.label}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">
                {item.count.toLocaleString()}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-sm text-gray-500" colSpan={2}>
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
