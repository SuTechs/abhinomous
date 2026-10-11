import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Settings } from '../lib/types';
import { Button, Field, ImageField, ListHeader, Message, Panel, friendlyError, inputClass } from './ui';
import { site } from '../site.config';

const EMPTY: Settings = { intro: '', quote: '', quote_author: '', email: '', instagram: '', x: '', linkedin: '', goodreads: '', avatar_url: '' };

const SOCIALS: { key: keyof Settings; label: string; placeholder: string }[] = [
  { key: 'email', label: 'Email (for “Say hi”)', placeholder: 'you@example.com' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/…' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'goodreads', label: 'Goodreads', placeholder: 'https://goodreads.com/…' },
];

export function SettingsAdmin() {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string }>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase!
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMessage({ tone: 'error', text: error.message });
        else if (data) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) });
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]));
    const { intro, quote, quote_author, email, instagram, x, linkedin, goodreads, avatar_url } = clean as Settings;
    const { error } = await supabase!.from('site_settings').upsert({ id: 1, intro, quote, quote_author, email, instagram, x, linkedin, goodreads, avatar_url });
    setSaving(false);
    setMessage(error ? { tone: 'error', text: friendlyError(error.message) } : { tone: 'ok', text: 'Saved — the homepage is updated.' });
  };

  const set = (key: keyof Settings, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <ListHeader title="Homepage" action={<Button disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>} />
      {message && <Message tone={message.tone}>{message.text}</Message>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-5 lg:col-span-2">
          <div>
            <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Avatar</h2>
            <p className="m-0 mt-1 text-sm text-muted">
              The big character in the homepage hero. A tall cut-out with a transparent background (PNG or WebP) looks best. Remove it to go back to the default, then press Save.
            </p>
          </div>
          <ImageField label="Avatar image" folder="avatar" frame="aspect-[10/16] max-w-[220px]" contain value={form.avatar_url || null} onChange={(url) => set('avatar_url', url ?? '')} />
        </Panel>
        <Panel className="flex flex-col gap-5">
          <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Intro & quote</h2>
          <Field label="Intro line" hint={`Under “Hi! I am ${site.firstName}.”`}>
            {(id) => <textarea id={id} rows={3} className={inputClass} value={form.intro ?? ''} onChange={(e) => set('intro', e.target.value)} />}
          </Field>
          <Field label="Quote" hint="Leave empty to hide the orange quote card.">
            {(id) => <textarea id={id} rows={3} className={inputClass} value={form.quote ?? ''} onChange={(e) => set('quote', e.target.value)} />}
          </Field>
          <Field label="Quote by">{(id) => <input id={id} className={inputClass} value={form.quote_author ?? ''} onChange={(e) => set('quote_author', e.target.value)} />}</Field>
        </Panel>
        <Panel className="flex flex-col gap-5">
          <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Links</h2>
          <p className="m-0 -mt-3 text-sm text-muted">Empty ones are hidden on the site.</p>
          {SOCIALS.map((s) => (
            <Field key={s.key} label={s.label}>
              {(id) => <input id={id} type={s.key === 'email' ? 'email' : 'url'} className={inputClass} placeholder={s.placeholder} value={form[s.key] ?? ''} onChange={(e) => set(s.key, e.target.value)} />}
            </Field>
          ))}
        </Panel>
      </div>
    </div>
  );
}
