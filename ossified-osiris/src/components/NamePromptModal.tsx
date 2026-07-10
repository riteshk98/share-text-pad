import { useEffect, useState } from 'react';
import { saveUserName, getSavedUserName } from '../utils/presenceUser';

type NamePromptModalProps = {
  onNameSet?: (name: string) => void;
};

export const NamePromptModal = ({ onNameSet }: NamePromptModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show modal if no name is saved
    const savedName = getSavedUserName();
    setIsOpen(!savedName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const trimmed = input.trim();
      if (trimmed) {
        saveUserName(trimmed);
      }
      setIsOpen(false);
      onNameSet?.(trimmed);
      // Notify CollaborativeEditor to refresh presence user
      window.dispatchEvent(new CustomEvent('nameSet'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    // User will get a random name automatically
    onNameSet?.('');
    // Notify CollaborativeEditor to refresh presence user
    window.dispatchEvent(new CustomEvent('nameSet'));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
          Welcome to Share Text Pad
        </h2>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          What's your name? (Optional - we'll use a random name if you skip)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
            disabled={isSubmitting}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !input.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {isSubmitting ? 'Setting...' : 'Set Name'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
