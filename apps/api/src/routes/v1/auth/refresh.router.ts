import { FastifyInstance } from 'fastify';
import { db } from '@oja/db';
import { tokenBlacklist } from '@oja/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { verifyToken, signAccessToken, signRefreshToken } from '../../../utils/jwt';

export default async function refreshRouter(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const body = request.body as { refresh_token?: string };

    if (!body.refresh_token) {
      return reply.status(400).send({
        success: false,
        error: 'refresh_token is required.',
      });
    }

    // ── Verify the refresh token ──
    let payload;
    try {
      payload = verifyToken(body.refresh_token);
    } catch {
      return reply.status(401).send({
        success: false,
        error: 'Invalid or expired refresh token.',
      });
    }

    if (payload.type !== 'refresh') {
      return reply.status(401).send({
        success: false,
        error: 'Token is not a refresh token.',
      });
    }

    // ── Check if refresh token is blacklisted (revoked) ──
    const oldHash = crypto
      .createHash('sha256')
      .update(body.refresh_token)
      .digest('hex');

    const [blacklisted] = await db
      .select()
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.token, oldHash))
      .limit(1);

    // If the token hash is NOT in the blacklist, it was never registered → invalid
    // If it IS in the blacklist, check if it's been revoked (we'll use a convention:
    // tokens are stored on creation, and deleted on revocation for rotation)
    // Actually, per the spec: "Store refresh token hash in token_blacklist table (for revocation tracking)"
    // This means we store hashes on issue, and for logout/refresh we remove the old one and mark it invalid.
    // Simpler approach: we store active refresh tokens. If not found → revoked.
    if (!blacklisted) {
      return reply.status(401).send({
        success: false,
        error: 'Refresh token has been revoked.',
      });
    }

    // ── Delete the old refresh token entry (rotation) ──
    await db
      .delete(tokenBlacklist)
      .where(eq(tokenBlacklist.token, oldHash));

    // ── Issue new tokens ──
    const tokenPayload = {
      userId: payload.userId,
      vendorId: payload.vendorId,
      role: payload.role,
    };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    // ── Store new refresh token hash ──
    const newHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    await db.insert(tokenBlacklist).values({
      token: newHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return reply.status(200).send({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  });
}
