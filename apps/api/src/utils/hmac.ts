import crypto from 'crypto';
import { env } from '@oja/config';

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!env.FLW_SECRET_HASH) return false;
  // Adjust signature logic per gateway docs
  return signature === env.FLW_SECRET_HASH;
}
