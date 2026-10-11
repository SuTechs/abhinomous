import { useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadImage } from './upload';
import { Message } from './ui';

export function RichEditor({ value, onChange, label, folder }: { value: string; onChange: (html: string) => void; label: string; folder: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: { class: 'prose-ab min-h-[360px] px-5 py-5 outline-none sm:px-8 sm:py-7', 'aria-label': label, 'aria-multiline': 'true' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
      quote: editor.isActive('blockquote'),
      link: editor.isActive('link'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link address (leave empty to remove the link)', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '' || url === 'https://') chain().extendMarkRange('link').unsetLink().run();
    else chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(undefined);
    try {
      const src = await uploadImage(file, folder);
      chain().setImage({ src, alt: '' }).run();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="overflow-hidden rounded-3xl border border-line bg-white focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/20">
        <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-white/95 p-2 backdrop-blur">
          <Tool label="Bold" pressed={active.bold} onClick={() => chain().toggleBold().run()}>
            <b>B</b>
          </Tool>
          <Tool label="Italic" pressed={active.italic} onClick={() => chain().toggleItalic().run()}>
            <i className="font-serif">I</i>
          </Tool>
          <Divider />
          <Tool label="Heading" pressed={active.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
            H2
          </Tool>
          <Tool label="Subheading" pressed={active.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
            H3
          </Tool>
          <Divider />
          <Tool label="Bulleted list" pressed={active.bullet} onClick={() => chain().toggleBulletList().run()}>
            • List
          </Tool>
          <Tool label="Numbered list" pressed={active.ordered} onClick={() => chain().toggleOrderedList().run()}>
            1. List
          </Tool>
          <Tool label="Quote" pressed={active.quote} onClick={() => chain().toggleBlockquote().run()}>
            “ ”
          </Tool>
          <Divider />
          <Tool label="Link" pressed={active.link} onClick={setLink}>
            Link
          </Tool>
          <Tool label="Insert image" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Image'}
          </Tool>
          <Divider />
          <Tool label="Undo" onClick={() => chain().undo().run()} disabled={!active.canUndo}>
            ↶
          </Tool>
          <Tool label="Redo" onClick={() => chain().redo().run()} disabled={!active.canRedo}>
            ↷
          </Tool>
        </div>
        <EditorContent editor={editor} />
      </div>
      <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label="Image to insert" onChange={(e) => insertImage(e.target.files?.[0])} />
      {error && <Message tone="error">Image upload failed: {error}</Message>}
    </div>
  );
}

function Tool({ label, pressed, onClick, disabled, children }: { label: string; pressed?: boolean; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-h-10 min-w-10 rounded-xl px-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${pressed ? 'bg-ink text-white' : 'text-ink hover:bg-paper'}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-0.5 my-1.5 w-px bg-line" />;
