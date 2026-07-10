import type {
  CreateDocumentInput,
  DocumentModel,
  UpdateDocumentInput,
  VersionModel,
} from '../types/document';
import { apiRequest } from './apiClient';

export const createDocument = (input: CreateDocumentInput) =>
  apiRequest<DocumentModel>('/documents', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const getDocumentById = (id: string) => apiRequest<DocumentModel>(`/documents/${id}`);

export const updateDocument = (id: string, input: UpdateDocumentInput) =>
  apiRequest<DocumentModel>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

export const getDocumentVersions = (id: string) =>
  apiRequest<{ versions: VersionModel[] }>(`/documents/${id}/versions`);

export const restoreDocumentVersion = (documentId: string, versionId: string) =>
  apiRequest<DocumentModel>(`/documents/${documentId}/restore/${versionId}`, {
    method: 'POST',
    body: '{}',
  });
