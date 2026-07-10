import type { FastifyReply, FastifyRequest } from 'fastify';

export const healthController = async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ status: 'ok' });
};
