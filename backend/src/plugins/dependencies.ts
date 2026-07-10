import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { InMemoryDocumentRepository } from '../repository/in-memory-document-repository.js';
import { DocumentService } from '../services/document-service.js';

declare module 'fastify' {
  interface FastifyInstance {
    documentService: DocumentService;
  }
}

const dependenciesPlugin: FastifyPluginAsync = async (app) => {
  const repository = new InMemoryDocumentRepository();
  const service = new DocumentService(repository);

  app.decorate('documentService', service);
};

export default fp(dependenciesPlugin, {
  name: 'dependencies-plugin',
});
