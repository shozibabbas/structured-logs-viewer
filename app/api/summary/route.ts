/**
 * API Route: GET /api/summary
 * Returns aggregated log summary metrics
 */

import { NextResponse } from 'next/server';
import type { SummaryApiResponse, SummaryApiError } from '@/types/api.types';
import { getLogFileRepository } from '@/data/repositories/logFile.repository';
import { getSettingsRepository } from '@/data/repositories/settings.repository';
import { parseLogFiles } from '@/services/logParser.service';
import { normalizeSettings } from '@/services/settings.service';
import { buildLogSummary } from '@/services/logSummary.service';
import { getPacketColorMap } from '@/services/packetColor.service';
import { extractPacketIds } from '@/services/logParser.service';

export async function GET() {
  try {
    const logFileRepo = getLogFileRepository();
    const settingsRepo = getSettingsRepository();

    const dirExists = await logFileRepo.directoryExists();
    if (!dirExists) {
      return NextResponse.json<SummaryApiError>(
        { error: 'Logs directory not found' },
        { status: 404 }
      );
    }

    const logFiles = await logFileRepo.readLogFiles();
    if (logFiles.length === 0) {
      return NextResponse.json<SummaryApiError>({
        error: 'No log files found',
        details: 'Place .log files in the logs/ directory.',
      });
    }

    const rawSettings = settingsRepo.getSettings();
    const settings = normalizeSettings(rawSettings);

    const logs = parseLogFiles(logFiles, {
      enablePackets: settings.enablePackets,
      packetStartPattern: settings.packetStartPattern,
      packetEndPattern: settings.packetEndPattern,
    });

    const summary = buildLogSummary(logs);
    const packetIds = extractPacketIds(logs);
    const packetColors = getPacketColorMap(packetIds);

    const response: SummaryApiResponse = {
      summary,
      packetColors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error building log summary:', error);
    return NextResponse.json<SummaryApiError>(
      {
        error: 'Failed to build log summary',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
