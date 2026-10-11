import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Book } from '../lib/types';
import { formatDate, slugify } from '../lib/format';
import { RichEditor } from './RichEditor';
import { Button, EditorBar, EntryRow, Field, ImageField, ListHeader, Message, Panel, friendlyError, inputClass, useRows, useUnsavedWarning } from './ui';

type Draft = Pick<Book, 'slug' | 'title' | 'author' | 'cover_url' | 'rating' | 'content' | 'finished_on' | 'published'> & { id?: string };

const blank = (): Draft => ({ slug: '', title: '', author: '', cover_url: null, rating: null, content: '', finished_on: null, published: false });

export function BooksAdmin() {
  const { rows, error, reload } = useRows<Book>('book_reviews', 'created_at');
  const [editing, setEditing] = useState<Draft | null>(null);

  if (editing)
    return (
      <BookEditor
        initial={editing}
        onDone={() => {
          setEditing(null);
          reload();
        }}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <ListHeader title="Book reviews" count={rows?.length} action={<Button onClick={() => setEditing(blank())}>New review</Button>} />
      {error && <Message tone="error">{error}</Message>}
      {rows?.length === 0 && <Panel>No reviews yet. Add the first book.</Panel>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rows?.map((book) => (
          <EntryRow
            key={book.id}
            title={book.title}
            meta={[book.author, book.rating && `${book.rating}/5`, book.finished_on && formatDate(book.finished_on)].filter(Boolean).join(' · ')}
            image={book.cover_url}
            published={book.published}
            onClick={() => setEditing(book)}
          />
        ))}
      </ul>
    </div>
  );
}

function BookEditor({ initial, onDone }: { initial: Draft; onDone: () => void }) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string>();
  useUnsavedWarning(dirty);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const save = async (published = draft.published) => {
    const title = draft.title.trim();
    const slug = draft.slug || slugify(title);
    if (!title) return setError('Add the book title first.');
    if (!slug) return setError('Add a URL for this review.');
    setSaving(true);
    setError(undefined);
    const payload = {
      slug,
      title,
      author: draft.author?.trim() || null,
      cover_url: draft.cover_url,
      rating: draft.rating,
      content: draft.content,
      finished_on: draft.finished_on || null,
      published,
    };
    const { data, error } = draft.id
      ? await supabase!.from('book_reviews').update(payload).eq('id', draft.id).select().single()
      : await supabase!.from('book_reviews').insert(payload).select().single();
    setSaving(false);
    if (error) return setError(friendlyError(error.message));
    setDraft(data as Book);
    setSlugTouched(true);
    setDirty(false);
  };

  const remove = async () => {
    if (!draft.id || !window.confirm(`Delete the review of “${draft.title}”? This can’t be undone.`)) return;
    const { error } = await supabase!.from('book_reviews').delete().eq('id', draft.id);
    if (error) return setError(friendlyError(error.message));
    onDone();
  };

  const back = () => {
    if (!dirty || window.confirm('Leave without saving your changes?')) onDone();
  };

  return (
    <div className="flex flex-col gap-4">
      <EditorBar onBack={back} published={draft.published} dirty={dirty} saving={saving} onSave={() => save()} onTogglePublish={() => save(!draft.published)} />
      {error && <Message tone="error">{error}</Message>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="flex flex-col gap-5">
          <Field label="Book title">
            {(id) => (
              <input
                id={id}
                className={`${inputClass} text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl`}
                value={draft.title}
                onChange={(e) => update({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              />
            )}
          </Field>
          <Field label="Author">{(id) => <input id={id} className={inputClass} value={draft.author ?? ''} onChange={(e) => update({ author: e.target.value })} />}</Field>
          <RichEditor label="Review" folder="books" value={draft.content} onChange={(content) => update({ content })} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel className="flex flex-col gap-5">
            <ImageField label="Cover" folder="books" frame="aspect-[2/3] max-w-[200px]" value={draft.cover_url} onChange={(cover_url) => update({ cover_url })} />
            <Field label="Rating">
              {(id) => (
                <select id={id} className={inputClass} value={draft.rating ?? ''} onChange={(e) => update({ rating: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">No rating</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {'★'.repeat(n)} ({n}/5)
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Finished reading on">
              {(id) => <input id={id} type="date" className={inputClass} value={draft.finished_on ?? ''} onChange={(e) => update({ finished_on: e.target.value || null })} />}
            </Field>
            <Field label="URL" hint={`${window.location.host}/books/${draft.slug || 'book-title'}`}>
              {(id) => (
                <input
                  id={id}
                  className={`${inputClass} font-mono text-sm`}
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: slugify(e.target.value) });
                  }}
                />
              )}
            </Field>
          </Panel>
          {draft.id && (
            <Panel className="flex flex-col gap-3">
              {draft.published && (
                <a href={`/books/${draft.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-cobalt">
                  View on site ↗
                </a>
              )}
              <Button variant="danger" onClick={remove}>
                Delete review
              </Button>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
