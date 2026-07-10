import { useEffect, useMemo, useState } from 'react';
import { toDataURL } from 'qrcode';

type DocumentShareModalProps = {
  noteId: string;
};

export const DocumentShareModal = ({ noteId }: DocumentShareModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [qrError, setQrError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  const canUseNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const showToast = (message: string, tone: 'success' | 'error') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDocumentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!isOpen || !documentUrl) return;

    let isMounted = true;
    setQrError(null);

    void toDataURL(documentUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    })
      .then((url) => {
        if (!isMounted) return;
        setQrDataUrl(url);
      })
      .catch(() => {
        if (!isMounted) return;
        setQrError('Failed to generate QR code.');
      });

    return () => {
      isMounted = false;
    };
  }, [documentUrl, isOpen]);

  const fileName = useMemo(() => `share-text-pad-${noteId}-qr.png`, [noteId]);

  const copyLink = async () => {
    if (!documentUrl) return;

    try {
      await navigator.clipboard.writeText(documentUrl);
      setCopyStatus('copied');
      showToast('Link copied', 'success');
    } catch {
      setCopyStatus('error');
      showToast('Failed to copy link', 'error');
    }

    window.setTimeout(() => setCopyStatus('idle'), 1800);
  };

  const shareNatively = async () => {
    if (!documentUrl || !canUseNativeShare) return;

    try {
      await navigator.share({
        title: 'Share Text Pad Document',
        text: 'Join this collaborative document:',
        url: documentUrl,
      });
      showToast('Share sheet opened', 'success');
    } catch {
      showToast('Native share cancelled', 'error');
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;

    const anchor = document.createElement('a');
    anchor.href = qrDataUrl;
    anchor.download = fileName;
    anchor.click();
    showToast('QR downloaded', 'success');
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcutPressed = event.ctrlKey || event.metaKey;

      if (shortcutPressed && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setIsOpen(true);
      }

      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (shortcutPressed && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        void copyLink();
      }

      if (shortcutPressed && event.shiftKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        downloadQr();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, qrDataUrl, documentUrl]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100 dark:focus-visible:ring-offset-zinc-950"
      >
        Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                Share Document
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-600 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                aria-label="Close share dialog"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="share-link">
                  Document Link
                </label>
                <input
                  id="share-link"
                  value={documentUrl}
                  readOnly
                  className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    void copyLink();
                  }}
                  className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100 dark:focus-visible:ring-offset-zinc-950"
                >
                  Copy Link
                </button>
                {canUseNativeShare && (
                  <button
                    type="button"
                    onClick={() => {
                      void shareNatively();
                    }}
                    className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Native Share
                  </button>
                )}
                {copyStatus === 'copied' && <p className="text-sm text-emerald-600 dark:text-emerald-400">Link copied.</p>}
                {copyStatus === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Failed to copy link.</p>}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Shortcuts: Ctrl/Cmd+Shift+S open, Ctrl/Cmd+Shift+C copy, Ctrl/Cmd+Shift+Q download QR, Esc close.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">QR Code</p>
                <div className="flex min-h-52 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR code for this document URL" className="h-48 w-48 rounded-md" width={192} height={192} />
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating QR...</p>
                  )}
                </div>
                {qrError && <p className="text-sm text-red-600 dark:text-red-400">{qrError}</p>}
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={downloadQr}
                    className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                  >
                    Download QR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={[
            'fixed bottom-4 right-4 z-[60] rounded-lg border px-4 py-2 text-sm shadow-lg',
            toast.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/70 dark:text-red-300',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </>
  );
};
