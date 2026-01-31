/**
 * API response types
 */

import type { LogEntry } from './log.types';
import type { LogSettings } from './settings.types';

export interface LogsApiResponse {
  logs: LogEntry[];
  totalEntries: number;
  files: string[];
  packets: string[];
  settings: {
    enablePackets: boolean;
    packetStartPattern: string;
    packetEndPattern: string;
  };
}

export interface LogsApiError {
  error: string;
  details?: string;
  logs?: LogEntry[];
  message?: string;
}

export interface SettingsApiResponse {
  settings: LogSettings;
  message?: string;
}

export interface SettingsApiError {
  error: string;
  details?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
