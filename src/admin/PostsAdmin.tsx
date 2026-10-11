import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/types';
import { formatDate, isoDay, slugify } from '../lib/format';
import { RichEditor } from './RichEditor';
import { Button, EditorBar, EntryRow, Field, ImageField, ListHeader, Message, Panel, friendlyError, inputClass, useRows, useUnsavedWarning } from './ui';

type Draft = Pick<Post, 'slug' | 'title' | 'excerpt' | 'cover_url' | 'content' | 'published' | 'published_at'> & { id?: string };

const blank = (): Draft => ({ slug: '', title: '', excerpt: '', cover_url: null, content: '', published: false, published_at: new Date().toISOString() });

export function PostsAdmin() {
  const { rows, error, reload } = useRows<Post>('posts', 'published_at');
  const [editing, setEditing] = useState<Draft | null>(null);

  if (editing)
    return (
      <PostEditor
        initial={editing}
        onDone={() => {
          setEditing(null);
          reload();
        }}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <ListHeader title="Blogs" count={rows?.length} action={<Button onClick={() => setEditing(blank())}>New post</Button>} />
      {error && <Message tone="error">{error}</Message>}
      {rows?.length === 0 && <Panel>No posts yet. Write the first one.</Panel>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rows?.map((post) => (
          <EntryRow key={post.id} title={post.title} meta={formatDate(post.published_at)} image={post.cover_url} published={post.published} onClick={() => setEditing(post)} />
        ))}
      </ul>
    </div>
  );
}

function PostEditor({ initial, onDone }: { initial: Draft; onDone: () => void }) {
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
    if (!title) return setError('Add a title first.');
    if (!slug) return setError('Add a URL for this post.');
    setSaving(true);
    setError(undefined);
    const payload = { slug, title, excerpt: draft.excerpt?.trim() || null, cover_url: draft.cover_url, content: draft.content, published, published_at: draft.published_at };
    const { data, error } = draft.id
      ? await supabase!.from('posts').update(payload).eq('id', draft.id).select().single()
      : await supabase!.from('posts').insert(payload).select().single();
    setSaving(false);
    if (error) return setError(friendlyError(error.message));
    setDraft(data as Post);
    setSlugTouched(true);
    setDirty(false);
  };

  const remove = async () => {
    if (!draft.id || !window.confirm(`Delete “${draft.title}”? This can’t be undone.`)) return;
    const { error } = await supabase!.from('posts').delete().eq('id', draft.id);
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
          <Field label="Title">
            {(id) => (
              <input
                id={id}
                className={`${inputClass} text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl`}
                value={draft.title}
                placeholder="What’s this post called?"
                onChange={(e) => update({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              />
            )}
          </Field>
          <Field label="Short summary" hint="Shown on the blog list and in link previews.">
            {(id) => <textarea id={id} rows={2} className={inputClass} value={draft.excerpt ?? ''} onChange={(e) => update({ excerpt: e.target.value })} />}
          </Field>
          <RichEditor label="Post" folder="posts" value={draft.content} onChange={(content) => update({ content })} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel className="flex flex-col gap-5">
            <ImageField label="Banner image" folder="posts" value={draft.cover_url} onChange={(cover_url) => update({ cover_url })} />
            <Field label="URL" hint={`${window.location.host}/blogs/${draft.slug || 'your-post'}`}>
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
            <Field label="Date">
              {(id) => (
                <input
                  id={id}
                  type="date"
                  className={inputClass}
                  value={isoDay(new Date(draft.published_at))}
                  onChange={(e) => e.target.value && update({ published_at: new Date(`${e.target.value}T12:00:00`).toISOString() })}
                />
              )}
            </Field>
          </Panel>
          {draft.id && (
            <Panel className="flex flex-col gap-3">
              {draft.published && (
                <a href={`/blogs/${draft.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-cobalt">
                  View on site ↗
                </a>
              )}
              <Button variant="danger" onClick={remove}>
                Delete post
              </Button>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
