import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDocumentById, restoreDocumentVersion, updateDocument } from '../services/documentApi';
import type { DocumentState } from '../types/document';

const SAVE_DELAY_MS = 1000;

export const useDocument = (id: string) => {
  const [state, setState] = useState<DocumentState>({
    contentHtml: '<p></p>',
    isReady: false,
    isLoading: true,
    isSaving: false,
    error: null,
    updatedAt: null,
  });

  const [reloadToken, setReloadToken] = useState(0);
  const lastSyncedContentRef = useRef('<p></p>');

  useEffect(() => {
    let isMounted = true;

    const loadDocument = async () => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isReady: false,
        error: null,
      }));

      try {
        const document = await getDocumentById(id);

        if (!isMounted) return;

        lastSyncedContentRef.current = document.content;
        setState((prev) => ({
          ...prev,
          contentHtml: document.content,
          isReady: true,
          isLoading: false,
          updatedAt: document.updatedAt,
          error: null,
        }));
      } catch (error) {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : 'Failed to load document.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isReady: false,
          error: message,
        }));
      }
    };

    void loadDocument();

    return () => {
      isMounted = false;
    };
  }, [id, reloadToken]);

  useEffect(() => {
    if (!state.isReady) return;
    if (state.contentHtml === lastSyncedContentRef.current) return;

    const timeout = window.setTimeout(async () => {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        const updated = await updateDocument(id, { content: state.contentHtml });
        lastSyncedContentRef.current = updated.content;
        setState((prev) => ({
          ...prev,
          isSaving: false,
          updatedAt: updated.updatedAt,
          error: null,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save document.';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: message,
        }));
      }
    }, SAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [id, state.contentHtml, state.isReady]);

  const statusText = useMemo(() => {
    if (state.isLoading) return 'Loading...';
    if (state.isSaving) return 'Saving...';
    if (state.error) return 'Error';
    return 'Saved';
  }, [state.error, state.isLoading, state.isSaving, state.updatedAt]);

  const restoreVersion = useCallback(
    async (versionId: string): Promise<string> => {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));
      const document = await restoreDocumentVersion(id, versionId);
      lastSyncedContentRef.current = document.content;
      setState((prev) => ({
        ...prev,
        contentHtml: document.content,
        isSaving: false,
        updatedAt: document.updatedAt,
        error: null,
      }));
      return document.content;
    },
    [id],
  );

  return {
    state,
    setContentHtml: (contentHtml: string) =>
      setState((prev) => ({
        ...prev,
        contentHtml,
      })),
    retryLoad: () => setReloadToken((prev) => prev + 1),
    statusText,
    restoreVersion,
  };
};
