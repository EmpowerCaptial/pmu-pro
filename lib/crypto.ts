// lib/crypto.ts
import crypto from 'crypto';

// ENCRYPTION_KEY: 32-byte base64 (e.g., `openssl rand -base64 32`)
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32-byte base64');

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64'); // iv(12) + tag(16) + ciphertext
}

export function decryptSecret(blob: string): string {
  const buf = Buffer.from(blob, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

