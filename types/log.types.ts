/**
 * Core domain types for log entries and parsing
 */

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  fileName: string;
  rawLine: string;
  lineNumber: number;
  packetId?: string;
  isPacketStart?: boolean;
  isPacketEnd?: boolean;
}

export type LogLevel = 'INFO' | 'WARNING' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL' | 'FATAL';

export interface ParsedFile {
  name: string;
  content: string;
}

export interface PacketTrackingOptions {
  enablePackets?: boolean;
  packetStartPattern?: string;
  packetEndPattern?: string;
}
