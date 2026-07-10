import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '@tiptap/extension-table';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { useDocument } from '../../hooks/useDocument';
import { EditorToolbar } from './EditorToolbar';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { getPresenceUser } from '../../utils/presenceUser';
import type { PresenceUser } from '../../types/presence';

type CollaborativeEditorProps = {
  noteId: string;
};

const DEFAULT_DOCUMENT = '<p></p>';

const toWebSocketBaseUrl = () => {
  const explicit = import.meta.env.PUBLIC_WS_BASE_URL as string | undefined;
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const apiBaseUrl =
    (import.meta.env.PUBLIC_API_BASE_URL as string | undefined) ?? 'http://localhost:4000';
  return apiBaseUrl.replace(/^http/i, 'ws').replace(/\/$/, '');
};

export const CollaborativeEditor = ({ noteId }: CollaborativeEditorProps) => {
  const { state, setContentHtml, statusText, retryLoad, restoreVersion } = useDocument(noteId);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [presenceMessage, setPresenceMessage] = useState<string | null>(null);
  const [isRealtimeSynced, setIsRealtimeSynced] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PresenceUser>(() => getPresenceUser());

  const websocketBaseUrl = useMemo(() => toWebSocketBaseUrl(), []);
  const yDoc = useMemo(() => new Y.Doc(), [noteId]);
  const previousAwarenessUsersRef = useRef<Map<number, PresenceUser>>(new Map());
  const provider = useMemo(
    () =>
      new WebsocketProvider(`${websocketBaseUrl}/collaboration`, noteId, yDoc, {
        connect: true,
        maxBackoffTime: 3000,
      }),
    [noteId, websocketBaseUrl, yDoc],
  );
  const hasSeededRef = useRef(false);

  // Listen for name changes from NamePromptModal
  useEffect(() => {
    const handleNameSet = () => {
      const newUser = getPresenceUser();
      setCurrentUser(newUser);
    };

    window.addEventListener('nameSet', handleNameSet);
    return () => window.removeEventListener('nameSet', handleNameSet);
  }, []);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Underline,
        Placeholder.configure({
          placeholder: 'Start writing your note...',
        }),
        Collaboration.configure({
          document: yDoc,
          field: 'document',
        }),
        CollaborationCaret.configure({
          provider,
          user: currentUser,
          render: (user) => {
            const cursor = document.createElement('span');
            cursor.classList.add('collaboration-caret');
            cursor.style.borderColor = user.color;

            const label = document.createElement('div');
            label.classList.add('collaboration-caret-label');
            label.style.backgroundColor = user.color;
            label.textContent = user.name;
            cursor.append(label);

            return cursor;
          },
          selectionRender: (user) => ({
            class: 'collaboration-caret-selection',
            style: `background-color: ${user.color}33`,
          }),
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      autofocus: 'end',
      content: DEFAULT_DOCUMENT,
      editorProps: {
        attributes: {
          class:
            'tiptap prose prose-zinc max-w-none min-h-[360px] p-5 text-zinc-900 focus:outline-none dark:prose-invert dark:text-zinc-100',
        },
      },
      onUpdate: ({ editor: next }) => {
        setContentHtml(next.getHTML());
      },
      immediatelyRender: false,
    },
    [noteId, currentUser, provider, yDoc],
  );

  useEffect(() => {
    const onSync = (synced: boolean) => {
      setIsRealtimeSynced(synced);
    };

    provider.on('sync', onSync);

    return () => {
      provider.off('sync', onSync);
    };
  }, [provider]);

  useEffect(() => {
    provider.awareness.setLocalStateField('user', currentUser);

    const messageTimerRef = { current: 0 };

    const handleAwarenessChange = (
      event: { added: number[]; updated: number[]; removed: number[] },
    ) => {
      const currentUsers = new Map<number, PresenceUser>();
      for (const [clientId, awarenessState] of provider.awareness.getStates()) {
        const user = awarenessState.user as PresenceUser | undefined;
        if (user?.name && user.color) {
          currentUsers.set(clientId, user);
        }
      }

      const states = Array.from(currentUsers.values());

      setPresenceUsers(states);

      const previousUsers = previousAwarenessUsersRef.current;

      const joinedName = event.added.map((id) => currentUsers.get(id)?.name).find(Boolean);
      const leftName = event.removed.map((id) => previousUsers.get(id)?.name).find(Boolean);

      if (joinedName) {
        setPresenceMessage(`Joining: ${joinedName}`);
      } else if (leftName) {
        setPresenceMessage(`Leaving: ${leftName}`);
      }

      if (joinedName || leftName) {
        if (messageTimerRef.current) {
          window.clearTimeout(messageTimerRef.current);
        }

        messageTimerRef.current = window.setTimeout(() => {
          setPresenceMessage(null);
        }, 1800);
      }

      previousAwarenessUsersRef.current = currentUsers;
    };

    provider.awareness.on('change', handleAwarenessChange);

    return () => {
      provider.awareness.off('change', handleAwarenessChange);
      provider.awareness.setLocalState(null);
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, [currentUser, provider]);

  useEffect(() => {
    if (!editor || !state.isReady || hasSeededRef.current === true) return;
    if (!isRealtimeSynced) return;

    if (editor.isEmpty && state.contentHtml !== DEFAULT_DOCUMENT) {
      editor.commands.setContent(state.contentHtml, false);
    }

    hasSeededRef.current = true;
  }, [editor, isRealtimeSynced, state.contentHtml, state.isReady]);

  useEffect(() => {
    return () => {
      provider.destroy();
      yDoc.destroy();
    };
  }, [provider, yDoc]);

  const handleRestore = async (versionId: string) => {
    const restoredContent = await restoreVersion(versionId);
    if (editor) {
      editor.commands.setContent(restoredContent, false);
    }
  };

  if (!state.isReady && state.isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
        Loading note...
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
        Initializing editor...
      </div>
    );
  }

  if (state.error && !state.isReady) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
        <p>{state.error}</p>
        <button
          type="button"
          onClick={retryLoad}
          className="inline-flex rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
            Shared Note
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Currently editing:{' '}
            {presenceUsers.length > 0
              ? presenceUsers.map((user) => user.name).join(', ')
              : currentUser.name}
          </p>
          {presenceMessage && (
            <p className="text-xs text-sky-700 dark:text-sky-300">{presenceMessage}</p>
          )}
        </div>
        <div className="space-y-2 text-right">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{statusText}</p>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
            >
              History
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Online users</span>
            {presenceUsers.map((user, index) => (
              <span
                key={`${user.name}-${index}`}
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: user.color }}
                title={user.name}
              />
            ))}
          </div>
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <EditorToolbar editor={editor} />

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white/95 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.55)] dark:border-zinc-800 dark:bg-zinc-900/95">
        <EditorContent editor={editor} />
      </div>

      {isHistoryOpen && (
        <VersionHistoryPanel
          documentId={noteId}
          onRestore={handleRestore}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </section>
  );
};
