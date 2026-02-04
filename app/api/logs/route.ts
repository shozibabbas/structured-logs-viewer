/**
 * API Route: GET /api/logs
 * Returns parsed log entries with packet tracking
 */

import { NextResponse } from 'next/server';
import type { LogsApiResponse, LogsApiError } from '@/types/api.types';
import { getLogFileRepository } from '@/data/repositories/logFile.repository';
import { getSettingsRepository } from '@/data/repositories/settings.repository';
import { parseLogFiles, extractPacketIds } from '@/services/logParser.service';
import { normalizeSettings } from '@/services/settings.service';
import { getPacketColorMap } from '@/services/packetColor.service';

export async function GET() {
  try {
    const logFileRepo = getLogFileRepository();
    const settingsRepo = getSettingsRepository();

    // Check if logs directory exists
    const dirExists = await logFileRepo.directoryExists();
    if (!dirExists) {
      return NextResponse.json<LogsApiError>(
        { error: 'Logs directory not found', logs: [] },
        { status: 404 }
      );
    }

    // Get log files
    const logFiles = await logFileRepo.readLogFiles();

    if (logFiles.length === 0) {
      return NextResponse.json<LogsApiError>({
        error: 'No log files found',
        message: 'No log files found'
      });
    }

    // Get settings for packet tracking
    const rawSettings = settingsRepo.getSettings();
    const settings = normalizeSettings(rawSettings);

    // Parse logs (packet IDs are extracted from job_id and propagated across the packet)
    const logs = parseLogFiles(logFiles, {
      enablePackets: settings.enablePackets,
      packetStartPattern: settings.packetStartPattern,
      packetEndPattern: settings.packetEndPattern,
      packetIdPattern: settings.packetIdPattern,
    });

    // Extract unique packet IDs
    const packetIds = extractPacketIds(logs);
    const packetColors = getPacketColorMap(packetIds);

    const response: LogsApiResponse = {
      logs,
      totalEntries: logs.length,
      files: logFiles.map(f => f.name),
      packets: packetIds,
      packetColors,
      settings: {
        enablePackets: settings.enablePackets,
        packetStartPattern: settings.packetStartPattern,
        packetEndPattern: settings.packetEndPattern,
        packetIdPattern: settings.packetIdPattern,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading log files:', error);
    return NextResponse.json<LogsApiError>(
      {
        error: 'Failed to read log files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
