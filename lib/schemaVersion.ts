/**
 * Schema Version Management
 * 
 * This file manages the application's schema version to ensure safe migrations.
 * Bump this version when you make "contract" phase changes (removing old columns).
 */

export const APP_SCHEMA_VERSION = 1;

export interface SchemaVersionInfo {
  current: number;
  required: number;
  isCompatible: boolean;
}

export function getSchemaVersionInfo(currentVersion: number): SchemaVersionInfo {
  return {
    current: currentVersion,
    required: APP_SCHEMA_VERSION,
    isCompatible: currentVersion >= APP_SCHEMA_VERSION
  };
}

export function isSchemaCompatible(currentVersion: number): boolean {
  return currentVersion >= APP_SCHEMA_VERSION;
}
