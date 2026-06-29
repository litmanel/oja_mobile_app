import { FastifyInstance } from 'fastify';
import { db } from '@oja/db';
import { sql } from 'drizzle-orm';

export default async function healthRouter(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    let dbStatus = 'ok';
    try {
      await db.execute(sql`SELECT 1`);
    } catch (e) {
      fastify.log.error(e);
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      checks: {
        db: dbStatus,
      },
      version: '0.1.0',
    };
  });
}
