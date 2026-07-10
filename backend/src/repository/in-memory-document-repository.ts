import type { DocumentRepository } from './document-repository.js';
import type {
  CreateDocumentInput,
  DocumentModel,
  UpdateDocumentInput,
} from '../types/document.js';
import type { VersionModel } from '../types/version.js';
import { generateId } from '../utils/generateId.js';

const MAX_VERSIONS = 50;

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly store = new Map<string, DocumentModel>();
  private readonly versions = new Map<string, VersionModel[]>();

  async create(input: CreateDocumentInput): Promise<DocumentModel> {
    const now = new Date().toISOString();
    const id = generateId();

    const document: DocumentModel = {
      id,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(id, document);
    return document;
  }

  async getById(id: string): Promise<DocumentModel | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, input: UpdateDocumentInput): Promise<DocumentModel | null> {
    const existing = this.store.get(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();

    const updated: DocumentModel = {
      ...existing,
      content: input.content,
      updatedAt: now,
    };

    this.store.set(id, updated);
    this.pushVersion(id, input.content, now);

    return updated;
  }

  async listVersionsByDocumentId(documentId: string): Promise<VersionModel[]> {
    const list = this.versions.get(documentId) ?? [];
    return [...list].reverse();
  }

  async restoreVersion(documentId: string, versionId: string): Promise<DocumentModel | null> {
    const list = this.versions.get(documentId);
    const target = list?.find((v) => v.id === versionId);
    if (!target) return null;

    return this.update(documentId, { content: target.content });
  }

  private pushVersion(documentId: string, content: string, savedAt: string): void {
    const list = this.versions.get(documentId) ?? [];
    const versionNumber = list.length + 1;

    list.push({
      id: generateId(),
      documentId,
      content,
      savedAt,
      versionNumber,
    });

    if (list.length > MAX_VERSIONS) {
      list.splice(0, list.length - MAX_VERSIONS);
    }

    this.versions.set(documentId, list);
  }
}
