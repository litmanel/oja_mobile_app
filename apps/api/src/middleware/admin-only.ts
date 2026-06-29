import { FastifyReply, FastifyRequest } from 'fastify';

export async function adminOnly(request: FastifyRequest, reply: FastifyReply) {
  // Verify admin role — to be implemented in auth plugin
  // For now, placeholder that allows request to continue
}
