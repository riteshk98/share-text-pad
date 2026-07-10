import type { FastifyPluginAsync } from 'fastify';
import { healthController } from '../controllers/health-controller.js';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', healthController);
};

export default healthRoutes;
