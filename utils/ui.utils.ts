/**
 * Utility functions for UI components
 */

import type { LogLevel } from '@/types/log.types';

/**
 * Gets Tailwind CSS classes for a log level badge
 */
export function getLogLevelColor(level: LogLevel | string): string {
  switch (level) {
    case 'ERROR':
      return 'text-red-600 bg-red-50';
    case 'WARNING':
    case 'WARN':
      return 'text-yellow-600 bg-yellow-50';
    case 'INFO':
      return 'text-blue-600 bg-blue-50';
    case 'DEBUG':
      return 'text-purple-600 bg-purple-50';
    case 'CRITICAL':
    case 'FATAL':
      return 'text-red-900 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Formats a packet ID for display
 */
export function formatPacketId(packetId: string): string {
  const parts = packetId.split('_');
  return parts.length >= 2 ? `#${parts[1]}` : packetId;
}

/**
 * Formats packet duration for display
 */
export function formatPacketDurationMs(durationMs: number): string {
  if (durationMs >= 1000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  }
  return `${Math.round(durationMs)}ms`;
}

/**
 * Formats duration in milliseconds to hours, minutes, and seconds
 */
export function formatDurationHMS(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Filters log entries based on criteria
 */
export function filterLogs(
  logs: any[],
  filters: {
    level?: string;
    file?: string;
    packet?: string;
    search?: string;
  }
): any[] {
  return logs.filter(log => {
    // Level filter
    if (filters.level && filters.level !== 'ALL' && log.level !== filters.level) {
      return false;
    }

    // File filter
    if (filters.file && filters.file !== 'ALL' && log.fileName !== filters.file) {
      return false;
    }

    // Packet filter
    if (filters.packet && filters.packet !== 'ALL') {
      if (filters.packet === 'NO_PACKET') {
        if (log.packetId) return false;
      } else if (log.packetId !== filters.packet) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      return (
        log.message.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query) ||
        log.timestamp.toLowerCase().includes(query)
      );
    }

    return true;
  });
}
