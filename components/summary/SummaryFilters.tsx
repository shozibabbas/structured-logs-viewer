/**
 * Summary filters component
 * Provides filtering controls for summary views
 */

'use client';

import React from 'react';
import { formatPacketId } from '@/utils/ui.utils';

interface SummaryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterFile: string;
  onFileChange: (value: string) => void;
  filterPacket: string;
  onPacketChange: (value: string) => void;
  availableFiles: string[];
  availablePackets: string[];
  onRefresh: () => void;
  loading: boolean;
}

export function SummaryFilters({
  searchQuery,
  onSearchChange,
  filterFile,
  onFileChange,
  filterPacket,
  onPacketChange,
  availableFiles,
  availablePackets,
  onRefresh,
  loading,
}: SummaryFiltersProps) {
  const packetsAvailable = availablePackets.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search packets or timestamps..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Filter */}
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source File
          </label>
          <select
            value={filterFile}
            onChange={(e) => onFileChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Files</option>
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>

        {/* Packet Filter */}
        {packetsAvailable && (
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packet
            </label>
            <select
              value={filterPacket}
              onChange={(e) => onPacketChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Packets</option>
              {availablePackets.map((packet) => (
                <option key={packet} value={packet}>
                  Packet {formatPacketId(packet)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex items-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}
