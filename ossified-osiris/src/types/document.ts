export interface DocumentModel {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  content: string;
}

export interface UpdateDocumentInput {
  content: string;
}

export interface VersionModel {
  id: string;
  documentId: string;
  content: string;
  savedAt: string;
  versionNumber: number;
}

export interface DocumentState {
  contentHtml: string;
  isReady: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updatedAt: string | null;
}
