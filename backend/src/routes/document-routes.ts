import type { FastifyPluginAsync } from 'fastify';
import {
  createDocumentController,
  getDocumentByIdController,
  listVersionsController,
  restoreVersionController,
  updateDocumentController,
} from '../controllers/document-controller.js';

const contentSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

const documentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/documents', { schema: { body: contentSchema } }, createDocumentController);
  app.get('/documents/:id', getDocumentByIdController);
  app.put('/documents/:id', { schema: { body: contentSchema } }, updateDocumentController);
  app.get('/documents/:id/versions', listVersionsController);
  app.post('/documents/:id/restore/:versionId', restoreVersionController);
};

export default documentRoutes;
