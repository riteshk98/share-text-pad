import { useEffect, useRef, useState } from 'react';
import { getDocumentVersions } from '../../services/documentApi';
import type { VersionModel } from '../../types/document';

type Props = {
  documentId: string;
  onRestore: (versionId: string) => Promise<void>;
  onClose: () => void;
};

const formatRelativeTime = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (diffMs < 30_000) return 'just now';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
};

const formatAbsoluteTime = (isoString: string): string =>
  new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const VersionHistoryPanel = ({ documentId, onRestore, onClose }: Props) => {
  const [versions, setVersions] = useState<VersionModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await getDocumentVersions(documentId);
        if (mounted) setVersions(result.versions);
      } catch (err) {
        if (mounted)
          setLoadError(err instanceof Error ? err.message : 'Failed to load history.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleRestore = async (version: VersionModel) => {
    setRestoringId(version.id);
    setRestoreError(null);
    try {
      await onRestore(version.id);
      setRestoredId(version.id);
      // reload versions list — the restore created a new snapshot
      const result = await getDocumentVersions(documentId);
      setVersions(result.versions);
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : 'Restore failed.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Version history"
        className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Version History
            </h2>
            {!isLoading && !loadError && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {versions.length} snapshot{versions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close version history"
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="flex items-center gap-2 py-8 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="animate-spin">↻</span> Loading history…
            </div>
          )}

          {loadError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {loadError}
            </p>
          )}

          {restoreError && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {restoreError}
            </p>
          )}

          {!isLoading && !loadError && versions.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <p>No snapshots yet.</p>
              <p className="mt-1">Snapshots are created automatically when you save.</p>
            </div>
          )}

          {/* Timeline */}
          {versions.length > 0 && (
            <ol className="space-y-0">
              {versions.map((version, index) => {
                const isCurrent = index === 0;
                const isRestoring = restoringId === version.id;
                const justRestored = restoredId === version.id && !isRestoring;

                return (
                  <li key={version.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* Timeline spine */}
                    {index < versions.length - 1 && (
                      <div
                        className="absolute left-[11px] top-6 h-full w-px bg-zinc-200 dark:bg-zinc-800"
                        aria-hidden="true"
                      />
                    )}

                    {/* Dot */}
                    <div
                      className={[
                        'relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center',
                        isCurrent
                          ? 'border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40'
                          : justRestored
                            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40'
                            : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {isCurrent && (
                        <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'text-xs font-semibold',
                            isCurrent
                              ? 'text-sky-700 dark:text-sky-300'
                              : 'text-zinc-700 dark:text-zinc-300',
                          ].join(' ')}
                        >
                          v{version.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                            Current
                          </span>
                        )}
                        {justRestored && !isCurrent && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Restored
                          </span>
                        )}
                      </div>

                      <time
                        dateTime={version.savedAt}
                        title={formatAbsoluteTime(version.savedAt)}
                        className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400 cursor-default"
                      >
                        {formatRelativeTime(version.savedAt)}
                        <span className="mx-1">·</span>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          {formatAbsoluteTime(version.savedAt)}
                        </span>
                      </time>

                      {!isCurrent && (
                        <button
                          type="button"
                          disabled={isRestoring || restoringId !== null}
                          onClick={() => void handleRestore(version)}
                          className={[
                            'mt-1.5 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors',
                            isRestoring
                              ? 'cursor-wait border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500'
                              : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100',
                          ].join(' ')}
                        >
                          {isRestoring ? 'Restoring…' : 'Restore'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Up to 50 snapshots stored · Press Esc to close
          </p>
        </div>
      </div>
    </>
  );
};
