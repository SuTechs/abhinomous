import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LogEntry, Skill, SkillKind, SkillStatus } from '../lib/types';
import { formatDate, isoDay } from '../lib/format';
import { Button, Field, ListHeader, Message, Panel, friendlyError, inputClass, useRows } from './ui';

const PRESETS = [15, 30, 60, 120];

export function LearningAdmin() {
  return (
    <div className="flex flex-col gap-4">
      <ListHeader title="Upskilling" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <LogPanel />
        <SkillsPanel />
      </div>
    </div>
  );
}

function LogPanel() {
  const { rows, error, reload } = useRows<LogEntry>('learning_log', 'logged_on');
  const [day, setDay] = useState(isoDay(new Date()));
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string }>();

  const log = async () => {
    const { error } = await supabase!.from('learning_log').upsert({ logged_on: day, minutes, note: note.trim() || null }, { onConflict: 'logged_on' });
    if (error) return setMessage({ tone: 'error', text: friendlyError(error.message) });
    setMessage({ tone: 'ok', text: `Logged ${minutes} min for ${formatDate(day)}.` });
    setNote('');
    reload();
  };

  const remove = async (entry: LogEntry) => {
    const { error } = await supabase!.from('learning_log').delete().eq('id', entry.id);
    if (error) setMessage({ tone: 'error', text: friendlyError(error.message) });
    else reload();
  };

  return (
    <Panel className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Learning log</h2>
        <p className="m-0 mt-1 text-sm text-muted">Each day you log lights up one square on the site. Logging the same day again replaces it.</p>
      </div>
      <Field label="Day">{(id) => <input id={id} type="date" className={inputClass} value={day} max={isoDay(new Date())} onChange={(e) => setDay(e.target.value)} />}</Field>
      <Field label="Minutes">
        {(id) => (
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={minutes === m}
                onClick={() => setMinutes(m)}
                className={`min-h-11 rounded-full px-4 font-semibold ${minutes === m ? 'bg-ink text-white' : 'border border-line bg-white'}`}
              >
                {m < 60 ? `${m} min` : `${m / 60} h`}
              </button>
            ))}
            <input id={id} type="number" min={1} max={1440} className={`${inputClass} w-28`} value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))} />
          </div>
        )}
      </Field>
      <Field label="What did you learn? (optional)">{(id) => <input id={id} className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
      <Button onClick={log}>Log it</Button>
      {(message || error) && <Message tone={message?.tone ?? 'error'}>{message?.text ?? error}</Message>}

      {!!rows?.length && (
        <ul className="m-0 flex list-none flex-col p-0">
          {rows.slice(0, 14).map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 border-t border-line py-2">
              <span className="w-28 shrink-0 font-mono text-xs text-muted">{formatDate(entry.logged_on)}</span>
              <span className="min-w-0 flex-1 truncate text-sm">
                <b>{entry.minutes} min</b>
                {entry.note && ` · ${entry.note}`}
              </span>
              <button type="button" onClick={() => remove(entry)} className="min-h-10 rounded-full px-3 text-sm text-muted hover:bg-paper hover:text-ink" aria-label={`Remove ${formatDate(entry.logged_on)}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

type SkillDraft = Pick<Skill, 'name' | 'kind' | 'status' | 'link' | 'note'> & { id?: string };

const blankSkill = (): SkillDraft => ({ name: '', kind: 'skill', status: 'learning', link: '', note: '' });

function SkillsPanel() {
  const { rows, error, reload } = useRows<Skill>('skills', 'created_at');
  const [editing, setEditing] = useState<SkillDraft | null>(null);

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">Skills & courses</h2>
          <p className="m-0 mt-1 text-sm text-muted">“Learning” ones show as chips on the homepage.</p>
        </div>
        {!editing && <Button onClick={() => setEditing(blankSkill())}>Add</Button>}
      </div>
      {error && <Message tone="error">{error}</Message>}
      {editing && (
        <SkillForm
          initial={editing}
          onDone={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      <ul className="m-0 flex list-none flex-col p-0">
        {rows?.map((s) => (
          <li key={s.id} className="flex items-center gap-3 border-t border-line py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{s.name}</span>
              <span className="font-mono text-xs text-muted capitalize">
                {s.kind} · {s.status}
              </span>
            </span>
            <Button variant="ghost" onClick={() => setEditing(s)}>
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function SkillForm({ initial, onDone }: { initial: SkillDraft; onDone: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string>();
  const update = (patch: Partial<SkillDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    if (!draft.name.trim()) return setError('Give it a name.');
    const payload = { name: draft.name.trim(), kind: draft.kind, status: draft.status, link: draft.link?.trim() || null, note: draft.note?.trim() || null };
    const { error } = draft.id ? await supabase!.from('skills').update(payload).eq('id', draft.id) : await supabase!.from('skills').insert(payload);
    if (error) return setError(friendlyError(error.message));
    onDone();
  };

  const remove = async () => {
    if (!draft.id || !window.confirm(`Delete “${draft.name}”?`)) return;
    const { error } = await supabase!.from('skills').delete().eq('id', draft.id);
    if (error) return setError(friendlyError(error.message));
    onDone();
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-paper p-4">
      <Field label="Name">{(id) => <input id={id} className={inputClass} value={draft.name} onChange={(e) => update({ name: e.target.value })} />}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          {(id) => (
            <select id={id} className={inputClass} value={draft.kind} onChange={(e) => update({ kind: e.target.value as SkillKind })}>
              <option value="skill">Skill</option>
              <option value="course">Course</option>
              <option value="certificate">Certificate</option>
            </select>
          )}
        </Field>
        <Field label="Status">
          {(id) => (
            <select id={id} className={inputClass} value={draft.status} onChange={(e) => update({ status: e.target.value as SkillStatus })}>
              <option value="learning">Learning</option>
              <option value="done">Done</option>
            </select>
          )}
        </Field>
      </div>
      <Field label="Link (optional)">{(id) => <input id={id} type="url" className={inputClass} placeholder="https://" value={draft.link ?? ''} onChange={(e) => update({ link: e.target.value })} />}</Field>
      <Field label="Notes (optional)">{(id) => <textarea id={id} rows={2} className={inputClass} value={draft.note ?? ''} onChange={(e) => update({ note: e.target.value })} />}</Field>
      {error && <Message tone="error">{error}</Message>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>Save</Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        {draft.id && (
          <Button variant="danger" onClick={remove} className="ml-auto">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
