import { FastifyReply, FastifyRequest } from 'fastify';

export async function buyerOnly(request: FastifyRequest, reply: FastifyReply) {
  // verify buyer role
}
