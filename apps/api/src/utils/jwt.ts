import jwt from 'jsonwebtoken';
import { env } from '@oja/config';

export interface TokenPayload {
  userId: string;
  vendorId?: string;
  role: string;
}

/**
 * Sign an RS256 JWT access token (24h expiry).
 */
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '24h',
  });
}

/**
 * Sign an RS256 JWT refresh token (30d expiry).
 */
export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '30d',
  });
}

/**
 * Verify an RS256 JWT token using the public key.
 * Returns the decoded payload or throws on invalid/expired tokens.
 */
export function verifyToken(token: string): TokenPayload & { type?: string; iat: number; exp: number } {
  return jwt.verify(token, env.JWT_PUBLIC_KEY, {
    algorithms: ['RS256'],
  }) as TokenPayload & { type?: string; iat: number; exp: number };
}
