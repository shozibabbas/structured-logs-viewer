/**
 * API Routes: Settings Management
 * GET /api/settings - Retrieve settings
 * PUT /api/settings - Update settings
 */

import { NextResponse } from 'next/server';
import type { SettingsApiResponse, SettingsApiError } from '@/types/api.types';
import type { UpdateSettingsInput } from '@/types/settings.types';
import { getSettingsRepository } from '@/data/repositories/settings.repository';
import { normalizeSettings, validateSettings } from '@/services/settings.service';

/**
 * GET /api/settings
 */
export async function GET() {
  try {
    const settingsRepo = getSettingsRepository();
    const rawSettings = settingsRepo.getSettings();
    const settings = normalizeSettings(rawSettings);

    return NextResponse.json<SettingsApiResponse>({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json<SettingsApiError>(
      {
        error: 'Failed to get settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json() as UpdateSettingsInput;

    // Validate input
    const validation = validateSettings(body);
    if (!validation.valid) {
      return NextResponse.json<SettingsApiError>(
        {
          error: 'Validation failed',
          details: validation.errors.join(', ')
        },
        { status: 400 }
      );
    }

    // Update settings
    const settingsRepo = getSettingsRepository();
    const rawSettings = settingsRepo.updateSettings(body);
    const settings = normalizeSettings(rawSettings);

    return NextResponse.json<SettingsApiResponse>({
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json<SettingsApiError>(
      {
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
