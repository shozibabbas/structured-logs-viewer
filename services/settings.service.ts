/**
 * Business logic for settings management
 * Pure functions for data transformation
 */

import type { LogSettings, UpdateSettingsInput } from '@/types/settings.types';

/**
 * Converts database settings to API response format
 */
export function normalizeSettings(settings: LogSettings): LogSettings {
  return {
    ...settings,
    enablePackets: Boolean(settings.enablePackets),
  };
}

/**
 * Validates settings input
 */
export function validateSettings(input: UpdateSettingsInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (input.packetStartPattern !== undefined) {
    if (!input.packetStartPattern.trim()) {
      errors.push('Packet start pattern cannot be empty');
    } else {
      try {
        new RegExp(input.packetStartPattern);
      } catch {
        errors.push('Invalid regex pattern for packet start');
      }
    }
  }

  if (input.packetEndPattern !== undefined) {
    if (!input.packetEndPattern.trim()) {
      errors.push('Packet end pattern cannot be empty');
    } else {
      try {
        new RegExp(input.packetEndPattern);
      } catch {
        errors.push('Invalid regex pattern for packet end');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates default settings
 */
export function createDefaultSettings(): Omit<LogSettings, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    enablePackets: true,
    packetStartPattern: 'Received message on',
    packetEndPattern: 'Processed OK',
  };
}
