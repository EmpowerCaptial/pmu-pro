/**
 * Application Bootstrap
 * 
 * This file handles application startup checks and schema verification.
 */

import { PrismaClient } from '@prisma/client';
import { APP_SCHEMA_VERSION, isSchemaCompatible } from './schemaVersion';

const prisma = new PrismaClient();

export interface BootstrapResult {
  success: boolean;
  schemaVersion: number;
  warnings: string[];
  errors: string[];
}

export async function verifySchema(): Promise<BootstrapResult> {
  const result: BootstrapResult = {
    success: true,
    schemaVersion: 0,
    warnings: [],
    errors: []
  };

  try {
    // Check if Meta table exists and get schema version
    const metaRow = await (prisma as any).meta.findUnique({ 
      where: { key: 'schemaVersion' } 
    });

    if (!metaRow) {
      // First time setup - create meta table with current version
      await (prisma as any).meta.create({
        data: {
          key: 'schemaVersion',
          value: APP_SCHEMA_VERSION.toString()
        }
      });
      result.schemaVersion = APP_SCHEMA_VERSION;
      result.warnings.push('Initial schema version set');
    } else {
      result.schemaVersion = Number(metaRow.value);
      
      if (!isSchemaCompatible(result.schemaVersion)) {
        result.success = false;
        result.errors.push(
          `Database schema (v${result.schemaVersion}) is older than required (v${APP_SCHEMA_VERSION}). ` +
          'Some features may be disabled until migration is complete.'
        );
      }
    }

    // Log schema information
    console.log(`📊 Schema Version: ${result.schemaVersion} (Required: ${APP_SCHEMA_VERSION})`);
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Bootstrap warnings:', result.warnings);
    }
    
    if (result.errors.length > 0) {
      console.error('❌ Bootstrap errors:', result.errors);
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Schema verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('❌ Schema verification error:', error);
  }

  return result;
}

export async function updateSchemaVersion(newVersion: number): Promise<void> {
  await (prisma as any).meta.upsert({
    where: { key: 'schemaVersion' },
    update: { value: newVersion.toString() },
    create: { key: 'schemaVersion', value: newVersion.toString() }
  });
  
  console.log(`✅ Schema version updated to ${newVersion}`);
}

export async function bootstrap(): Promise<BootstrapResult> {
  console.log('🚀 Starting application bootstrap...');
  
  const result = await verifySchema();
  
  if (result.success) {
    console.log('✅ Bootstrap completed successfully');
  } else {
    console.log('⚠️  Bootstrap completed with errors');
  }
  
  return result;
}
