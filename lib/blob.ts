/**
 * Vercel Blob Storage Helper
 * 
 * This file provides utilities for uploading and managing files in Vercel Blob.
 * All user files are stored in Vercel Blob, with only URLs saved in the database.
 */

import { put, del, list } from '@vercel/blob';

export interface UploadOptions {
  contentType?: string;
  access?: 'public';
  addRandomSuffix?: boolean;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload a file to Vercel Blob
 * @param path - The path where the file should be stored
 * @param data - The file data (Buffer or Blob)
 * @param options - Upload options
 * @returns Promise with upload result
 */
export async function uploadImage(
  path: string, 
  data: Buffer | Blob, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { contentType = 'application/octet-stream', access = 'public', addRandomSuffix = true } = options;
  
  try {
    const result = await put(path, data, { 
      contentType, 
      access, 
      addRandomSuffix 
    });
    
    console.log(`📁 File uploaded to Blob: ${result.pathname}`);
    
    return {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      size: 0 // Size not available in current Vercel Blob API
    };
  } catch (error) {
    console.error('❌ Failed to upload file to Blob:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Vercel Blob
 * @param url - The URL of the file to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
    console.log(`🗑️  File deleted from Blob: ${url}`);
  } catch (error) {
    console.error('❌ Failed to delete file from Blob:', error);
    throw new Error(`Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in Vercel Blob
 * @param prefix - Optional prefix to filter files
 * @returns Promise with list of files
 */
export async function listImages(prefix?: string) {
  try {
    const result = await list({ prefix });
    return result.blobs;
  } catch (error) {
    console.error('❌ Failed to list files from Blob:', error);
    throw new Error(`List failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique file path for user uploads
 * @param userId - The user ID
 * @param filename - The original filename
 * @param type - The type of file (e.g., 'profile', 'portfolio', 'license')
 * @returns A unique file path
 */
export function generateFilePath(userId: string, filename: string, type: string): string {
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'bin';
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `users/${userId}/${type}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Validate file type and size
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result
 */
export function validateFile(
  file: File, 
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'], 
  maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size ${file.size} bytes exceeds maximum ${maxSize} bytes` 
    };
  }
  
  return { valid: true };
}

/**
 * Get the base URL for Vercel Blob
 * @returns The base URL
 */
export function getBlobBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BLOB_BASE_URL || 'https://blob.vercel-storage.com';
}
