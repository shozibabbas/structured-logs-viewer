/**
 * Custom hooks for data fetching and state management
 */

import { useState, useEffect } from 'react';
import type { LogEntry } from '@/types/log.types';
import type { LogSettings } from '@/types/settings.types';
import type { LogsApiResponse, SettingsApiResponse, SummaryApiResponse } from '@/types/api.types';
import type { LogSummary } from '@/types/summary.types';

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Hook for fetching and managing logs
 */
export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [availablePackets, setAvailablePackets] = useState<string[]>([]);
  const [packetsEnabled, setPacketsEnabled] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logs');
      const data = (await response.json()) as LogsApiResponse | ErrorResponse;

      if ('error' in data) {
        setError(data.error);
      } else {
        setLogs(data.logs || []);
        setAvailableFiles(data.files || []);
        setAvailablePackets(data.packets || []);
        setPacketsEnabled(data.settings?.enablePackets || false);
      }
    } catch (err) {
      setError('Failed to fetch logs: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    availableFiles,
    availablePackets,
    packetsEnabled,
    refetch: fetchLogs,
  };
}

/**
 * Hook for fetching and managing log summary
 */
export function useLogSummary() {
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summary');
      const data = (await response.json()) as SummaryApiResponse | ErrorResponse;

      if ('error' in data) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (err) {
      setError('Failed to fetch summary: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

/**
 * Hook for fetching and managing settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<LogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');
      const data = (await response.json()) as SettingsApiResponse | ErrorResponse;

      if ('error' in data) {
        setError(data.error);
      } else {
        setSettings(data.settings);
      }
    } catch (err) {
      setError('Failed to fetch settings: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<LogSettings>) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = (await response.json()) as SettingsApiResponse | ErrorResponse;

      if ('error' in data) {
        setError(data.error);
        return { success: false, error: data.error };
      } else {
        setSettings(data.settings);
        return { success: true };
      }
    } catch (err) {
      const errorMsg = 'Failed to update settings: ' + (err instanceof Error ? err.message : 'Unknown error');
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
