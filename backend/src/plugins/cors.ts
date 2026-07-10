import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';

const corsPlugin: FastifyPluginAsync = async (app) => {
  const configuredOrigin = process.env.CORS_ORIGIN;

  await app.register(cors, {
    origin: configuredOrigin ?? true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
};

export default fp(corsPlugin, {
  name: 'cors-plugin',
});
