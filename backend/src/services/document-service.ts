import type {
  CreateDocumentInput,
  DocumentModel,
  UpdateDocumentInput,
} from '../types/document.js';
import type { VersionModel } from '../types/version.js';
import type { DocumentRepository } from '../repository/document-repository.js';

export class DocumentService {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async createDocument(input: CreateDocumentInput): Promise<DocumentModel> {
    return this.documentRepository.create(input);
  }

  async getDocumentById(id: string): Promise<DocumentModel | null> {
    return this.documentRepository.getById(id);
  }

  async updateDocument(id: string, input: UpdateDocumentInput): Promise<DocumentModel | null> {
    return this.documentRepository.update(id, input);
  }

  async listVersions(documentId: string): Promise<VersionModel[]> {
    return this.documentRepository.listVersionsByDocumentId(documentId);
  }

  async restoreVersion(documentId: string, versionId: string): Promise<DocumentModel | null> {
    return this.documentRepository.restoreVersion(documentId, versionId);
  }
}
