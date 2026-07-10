import type { Editor } from '@tiptap/react';

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

const ToolbarButton = ({ label, active = false, onClick }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-200',
      active
        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
        : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100',
    ].join(' ')}
  >
    {label}
  </button>
);

type EditorToolbarProps = {
  editor: Editor | null;
};

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 p-3 dark:border-zinc-800 dark:bg-zinc-900/90">
      <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />

      <ToolbarButton label="H1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />

      <ToolbarButton label="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="Number List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="Code" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />

      <div className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />

      <ToolbarButton
        label="Table"
        onClick={() => {
          if (editor.isActive('table')) {
            editor.chain().focus().deleteTable().run();
            return;
          }
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }}
      />
    </div>
  );
};
