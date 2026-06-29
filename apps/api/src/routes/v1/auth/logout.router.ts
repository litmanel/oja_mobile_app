import { FastifyInstance } from 'fastify';
import { db } from '@oja/db';
import { tokenBlacklist } from '@oja/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export default async function logoutRouter(fastify: FastifyInstance) {
  fastify.post('/', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const body = request.body as { refresh_token?: string };

    if (!body.refresh_token) {
      return reply.status(400).send({
        success: false,
        error: 'refresh_token is required.',
      });
    }

    // ── Remove the refresh token from the active list (blacklist it) ──
    const tokenHash = crypto
      .createHash('sha256')
      .update(body.refresh_token)
      .digest('hex');

    await db
      .delete(tokenBlacklist)
      .where(eq(tokenBlacklist.token, tokenHash));

    return reply.status(200).send({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  });
}
