import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateDocumentInput, UpdateDocumentInput } from '../types/document.js';

type DocumentIdParams = {
  id: string;
};

type VersionParams = {
  id: string;
  versionId: string;
};

export const createDocumentController = async (
  request: FastifyRequest<{ Body: CreateDocumentInput }>,
  reply: FastifyReply,
) => {
  const document = await request.server.documentService.createDocument(request.body);
  return reply.code(201).send(document);
};

export const getDocumentByIdController = async (
  request: FastifyRequest<{ Params: DocumentIdParams }>,
  reply: FastifyReply,
) => {
  const document = await request.server.documentService.getDocumentById(request.params.id);

  if (!document) {
    return reply.code(404).send({ message: 'Document not found' });
  }

  return reply.send(document);
};

export const updateDocumentController = async (
  request: FastifyRequest<{ Params: DocumentIdParams; Body: UpdateDocumentInput }>,
  reply: FastifyReply,
) => {
  const document = await request.server.documentService.updateDocument(request.params.id, request.body);

  if (!document) {
    return reply.code(404).send({ message: 'Document not found' });
  }

  return reply.send(document);
};

export const listVersionsController = async (
  request: FastifyRequest<{ Params: DocumentIdParams }>,
  reply: FastifyReply,
) => {
  const existing = await request.server.documentService.getDocumentById(request.params.id);
  if (!existing) {
    return reply.code(404).send({ message: 'Document not found' });
  }

  const versions = await request.server.documentService.listVersions(request.params.id);
  return reply.send({ versions });
};

export const restoreVersionController = async (
  request: FastifyRequest<{ Params: VersionParams }>,
  reply: FastifyReply,
) => {
  const document = await request.server.documentService.restoreVersion(
    request.params.id,
    request.params.versionId,
  );

  if (!document) {
    return reply.code(404).send({ message: 'Version not found' });
  }

  return reply.send(document);
};
