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
