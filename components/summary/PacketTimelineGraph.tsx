/**
 * Packet timeline graph - visual representation like Chrome network tab
 * One row per log file with packets displayed horizontally
 */

import React, { useMemo } from 'react';
import type { PacketDurationSummary } from '@/types/summary.types';
import { formatPacketDurationMs, formatPacketId } from '@/utils/ui.utils';

interface PacketTimelineGraphProps {
  items: PacketDurationSummary[];
}

interface FilePackets {
  fileName: string;
  packets: PacketDurationSummary[];
}

export function PacketTimelineGraph({ items }: PacketTimelineGraphProps) {
  const { timelineData, fileGroups } = useMemo(() => {
    const timeline = calculateTimelineData(items);
    const groups = groupPacketsByFile(items);
    return { timelineData: timeline, fileGroups: groups };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
        No packet durations available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Packet Timeline by File
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Duration: {formatPacketDurationMs(timelineData.totalDuration)} • Packets: {items.length} across {fileGroups.length} file(s)
        </p>
      </div>
      <div className="p-4">
        {/* Timeline header with time markers */}
        <div className="mb-2 flex items-center">
          <div className="w-48 shrink-0"></div>
          <div className="flex-1 relative h-6 border-b border-gray-300">
            {timelineData.markers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-0 h-full border-l border-gray-300"
                style={{ left: `${marker.position}%` }}
              >
                <span className="absolute top-0 left-1 text-xs text-gray-500 whitespace-nowrap">
                  {marker.label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-24 shrink-0 text-center">
            <span className="text-xs text-gray-500">Packets</span>
          </div>
        </div>

        {/* Timeline rows - one per file */}
        <div className="space-y-4 max-h-150 overflow-y-auto pb-20 pt-16">
          {fileGroups.map((fileGroup, fileIndex) => (
            <div key={fileGroup.fileName} className="flex items-center group hover:bg-gray-50 py-3 rounded relative">
              <div className="w-48 shrink-0 pr-3">
                <div className="text-sm font-semibold text-gray-800 truncate" title={fileGroup.fileName}>
                  📄 {fileGroup.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {fileGroup.packets.length} packet{fileGroup.packets.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex-1 relative h-12 border border-gray-200 rounded bg-gray-50">
                {/* Render all packets for this file as bars on the same row */}
                {fileGroup.packets.map((packet) => {
                  const startTime = parseTimestamp(packet.startTimestamp);
                  const startOffset = ((startTime.getTime() - timelineData.earliestTime) / timelineData.totalDuration) * 100;
                  const durationPercent = (packet.durationMs / timelineData.totalDuration) * 100;

                  return (
                    <div
                      key={packet.packetId}
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded transition-all cursor-pointer group/bar hover:h-8 hover:z-10"
                      style={{
                        left: `${startOffset}%`,
                        width: `${Math.max(durationPercent, 0.3)}%`,
                        backgroundColor: getBarColor(fileIndex),
                      }}
                      title={`${formatPacketId(packet.packetId)}: ${formatPacketDurationMs(packet.durationMs)}\nStart: ${packet.startTimestamp}\nEnd: ${packet.endTimestamp}`}
                    >
                      <div className="h-full flex items-center justify-center">
                        {durationPercent > 3 && (
                          <span className="text-xs text-white font-semibold px-1 truncate">
                            {formatPacketId(packet.packetId)}
                          </span>
                        )}
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/bar:block z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg pointer-events-none">
                        <div className="font-semibold">{formatPacketId(packet.packetId)}</div>
                        <div className="text-gray-300">Duration: {formatPacketDurationMs(packet.durationMs)}</div>
                        <div className="text-gray-400 text-xs">
                          {new Date(packet.startTimestamp.replace(',', '.')).toLocaleTimeString()} → {new Date(packet.endTimestamp.replace(',', '.')).toLocaleTimeString()}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="w-24 shrink-0 pl-3 text-center">
                <span className="text-sm text-gray-700 font-semibold">
                  {fileGroup.packets.length}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Packet duration (one row per file)</span>
          </div>
          <div className="text-gray-500">
            Hover over bars for details • Bar position = start time • Bar width = duration
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineData {
  earliestTime: number;
  latestTime: number;
  totalDuration: number;
  markers: Array<{ position: number; label: string }>;
}

function groupPacketsByFile(items: PacketDurationSummary[]): FilePackets[] {
  const fileMap = new Map<string, PacketDurationSummary[]>();

  for (const item of items) {
    const fileName = item.fileName || 'Unknown';
    if (!fileMap.has(fileName)) {
      fileMap.set(fileName, []);
    }
    fileMap.get(fileName)!.push(item);
  }

  return Array.from(fileMap.entries())
    .map(([fileName, packets]) => ({
      fileName,
      packets: packets.sort((a, b) =>
        parseTimestamp(a.startTimestamp).getTime() - parseTimestamp(b.startTimestamp).getTime()
      ),
    }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
}

function calculateTimelineData(items: PacketDurationSummary[]): TimelineData {
  if (items.length === 0) {
    return {
      earliestTime: 0,
      latestTime: 0,
      totalDuration: 0,
      markers: [],
    };
  }

  let earliestTime = Infinity;
  let latestTime = -Infinity;

  for (const item of items) {
    const startTime = parseTimestamp(item.startTimestamp).getTime();
    const endTime = parseTimestamp(item.endTimestamp).getTime();

    if (startTime < earliestTime) {
      earliestTime = startTime;
    }
    if (endTime > latestTime) {
      latestTime = endTime;
    }
  }

  const totalDuration = latestTime - earliestTime;

  // Create time markers (0%, 25%, 50%, 75%, 100%)
  const markers = [0, 25, 50, 75, 100].map((position) => {
    const timeAtPosition = earliestTime + (totalDuration * position) / 100;
    const date = new Date(timeAtPosition);
    const label = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return { position, label };
  });

  return {
    earliestTime,
    latestTime,
    totalDuration,
    markers,
  };
}

function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp.replace(',', '.'));
}

function getBarColor(index: number): string {
  const colors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#6366f1', // indigo-500
    '#f97316', // orange-500
  ];

  return colors[index % colors.length];
}
