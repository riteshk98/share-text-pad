import type {
  CreateDocumentInput,
  DocumentModel,
  UpdateDocumentInput,
} from '../types/document.js';
import type { VersionModel } from '../types/version.js';

export interface DocumentRepository {
  create(input: CreateDocumentInput): Promise<DocumentModel>;
  getById(id: string): Promise<DocumentModel | null>;
  update(id: string, input: UpdateDocumentInput): Promise<DocumentModel | null>;
  listVersionsByDocumentId(documentId: string): Promise<VersionModel[]>;
  restoreVersion(documentId: string, versionId: string): Promise<DocumentModel | null>;
}
