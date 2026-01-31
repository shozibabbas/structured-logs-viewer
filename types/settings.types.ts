/**
 * Database and settings types
 */

export interface LogSettings {
  id: number;
  enablePackets: boolean;
  packetStartPattern: string;
  packetEndPattern: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingsInput {
  enablePackets: boolean;
  packetStartPattern: string;
  packetEndPattern: string;
}

export interface UpdateSettingsInput {
  enablePackets?: boolean;
  packetStartPattern?: string;
  packetEndPattern?: string;
}
