import { useEffect, useRef, useState } from 'react';
import { createDocument } from '../services/documentApi';
import { getSavedUserName, saveUserName } from '../utils/presenceUser';

type Props = {
  /** When true, renders only the button (no name input). Used in the Navbar. */
  compact?: boolean;
};

export const CreateNoteButton = ({ compact = false }: Props) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill with any previously saved name
  useEffect(() => {
    if (!compact) setName(getSavedUserName());
  }, [compact]);

  const onCreate = async () => {
    setIsCreating(true);
    setError(null);
    if (!compact) saveUserName(name);

    try {
      const document = await createDocument({ content: '<p></p>' });
      window.location.assign(`/notes/${document.id}`);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Failed to create document.';
      setError(message);
      setIsCreating(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void onCreate()}
        disabled={isCreating}
        aria-label="Create a new collaborative note"
        className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-zinc-950"
      >
        {isCreating ? 'Creating...' : 'New Note'}
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !isCreating) void onCreate(); }}
          placeholder="Your name (optional)"
          aria-label="Your display name for the note (optional)"
          aria-describedby="name-hint"
          maxLength={40}
          className="h-12 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 sm:w-48"
        />
        <button
          type="button"
          onClick={() => void onCreate()}
          disabled={isCreating}
          aria-label={isCreating ? 'Creating note...' : 'Create and open a new collaborative note'}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 px-6 text-base font-semibold text-white transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-zinc-950"
        >
          {isCreating ? 'Creating...' : 'Create Note'}
        </button>
      </div>
      <p className="pl-1 text-xs text-zinc-500 dark:text-zinc-400" id="name-hint">
        Leave blank for a random name — remembered next time
      </p>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
