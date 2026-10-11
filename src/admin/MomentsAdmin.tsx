import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Moment } from '../lib/types';
import { isoDay } from '../lib/format';
import { uploadImage } from './upload';
import { Button, Field, ListHeader, Message, Panel, Toggle, friendlyError, inputClass, useRows } from './ui';

export function MomentsAdmin() {
  const { rows, error, reload } = useRows<Moment>('life_moments', 'created_at');
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string>();
  const [uploadError, setUploadError] = useState<string>();

  // Pick several photos at once; each becomes a moment dated from the file.
  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(undefined);
    const list = Array.from(files);
    try {
      for (const [i, file] of list.entries()) {
        setProgress(`Uploading ${i + 1} of ${list.length}…`);
        const photo_url = await uploadImage(file, 'life');
        const { error } = await supabase!.from('life_moments').insert({ photo_url, happened_on: isoDay(new Date(file.lastModified)), published: true });
        if (error) throw new Error(friendlyError(error.message));
      }
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setProgress(undefined);
      if (input.current) input.current.value = '';
      reload();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ListHeader
        title="Life, lately"
        count={rows?.length}
        action={
          <Button disabled={Boolean(progress)} onClick={() => input.current?.click()}>
            {progress ?? 'Add photos'}
          </Button>
        }
      />
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-label="Photos to add" onChange={(e) => addPhotos(e.target.files)} />
      <p className="m-0 px-1 text-sm text-muted">Pick one or more photos — they go live straight away. Add a caption to each below.</p>
      {(error || uploadError) && <Message tone="error">{uploadError ?? error}</Message>}
      {rows?.length === 0 && <Panel>No photos yet.</Panel>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows?.map((m) => (
          <MomentCard key={m.id} moment={m} onChange={reload} />
        ))}
      </div>
    </div>
  );
}

function MomentCard({ moment, onChange }: { moment: Moment; onChange: () => void }) {
  const [caption, setCaption] = useState(moment.caption ?? '');
  const [date, setDate] = useState(moment.happened_on ?? '');
  const [published, setPublished] = useState(moment.published);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string>();
  const dirty = caption !== (moment.caption ?? '') || date !== (moment.happened_on ?? '') || published !== moment.published;

  const save = async () => {
    setState('saving');
    const { error } = await supabase!.from('life_moments').update({ caption: caption.trim() || null, happened_on: date || null, published }).eq('id', moment.id);
    if (error) {
      setError(friendlyError(error.message));
      setState('idle');
    } else {
      setError(undefined);
      setState('saved');
      onChange();
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this photo from Life, lately?')) return;
    const { error } = await supabase!.from('life_moments').delete().eq('id', moment.id);
    if (error) setError(friendlyError(error.message));
    else onChange();
  };

  return (
    <Panel className="flex flex-col gap-4 !p-4">
      <img src={moment.photo_url} alt={caption} className="aspect-[4/3] w-full rounded-2xl bg-paper object-cover" />
      <Field label="Caption">{(id) => <input id={id} className={inputClass} value={caption} placeholder="What was this?" onChange={(e) => setCaption(e.target.value)} />}</Field>
      <Field label="Date">{(id) => <input id={id} type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
      <Toggle checked={published} onChange={setPublished} label="Show on site" />
      {error && <Message tone="error">{error}</Message>}
      <div className="flex flex-wrap gap-2">
        <Button disabled={!dirty || state === 'saving'} onClick={save}>
          {state === 'saving' ? 'Saving…' : state === 'saved' && !dirty ? 'Saved' : 'Save'}
        </Button>
        <Button variant="danger" onClick={remove}>
          Delete
        </Button>
      </div>
    </Panel>
  );
}
