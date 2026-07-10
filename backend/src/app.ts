import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import collaborationPlugin from './plugins/collaboration.js';
import dependenciesPlugin from './plugins/dependencies.js';
import healthRoutes from './routes/health-routes.js';
import documentRoutes from './routes/document-routes.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(corsPlugin);
  app.register(collaborationPlugin);
  app.register(dependenciesPlugin);
  app.register(healthRoutes);
  app.register(documentRoutes);

  return app;
};
