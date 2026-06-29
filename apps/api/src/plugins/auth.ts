import fp from 'fastify-plugin';
import { verifyToken } from '../utils/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      vendorId?: string;
      role: string;
    };
  }
}

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = verifyToken(token);
      request.user = {
        userId: payload.userId,
        vendorId: payload.vendorId,
        role: payload.role,
      };
    } catch {
      return reply.status(401).send({ success: false, error: 'Invalid or expired token' });
    }
  });
});
