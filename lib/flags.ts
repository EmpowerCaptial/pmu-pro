/**
 * Feature Flags
 * 
 * This file manages feature flags for safe rollouts and A/B testing.
 */

interface FeatureFlags {
  [key: string]: boolean;
}

let flags: FeatureFlags = {};

// Parse feature flags from environment
try {
  const flagsJson = process.env.FEATURE_FLAGS_JSON || '{}';
  flags = JSON.parse(flagsJson);
} catch (error) {
  console.warn('⚠️  Failed to parse FEATURE_FLAGS_JSON, using empty flags');
  flags = {};
}

/**
 * Check if a feature flag is enabled
 * @param name - The feature flag name
 * @param fallback - Default value if flag is not set
 * @returns boolean indicating if the feature is enabled
 */
export function isEnabled(name: string, fallback: boolean = false): boolean {
  return flags[name] ?? fallback;
}

/**
 * Get all feature flags
 * @returns Object containing all feature flags
 */
export function getAllFlags(): FeatureFlags {
  return { ...flags };
}

/**
 * Check if any of the provided flags are enabled
 * @param names - Array of feature flag names
 * @returns boolean indicating if any flag is enabled
 */
export function anyEnabled(names: string[]): boolean {
  return names.some(name => isEnabled(name));
}

/**
 * Check if all of the provided flags are enabled
 * @param names - Array of feature flag names
 * @returns boolean indicating if all flags are enabled
 */
export function allEnabled(names: string[]): boolean {
  return names.every(name => isEnabled(name));
}

/**
 * Get feature flag status for debugging
 * @returns Object with flag status and metadata
 */
export function getFlagsStatus() {
  return {
    flags: getAllFlags(),
    count: Object.keys(flags).length,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
}

// Log feature flags on startup (in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🚩 Feature flags loaded:', getFlagsStatus());
}
