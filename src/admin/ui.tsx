import { useCallback, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImage } from './upload';

export const inputClass =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ash focus:border-cobalt focus:ring-2 focus:ring-cobalt/20';

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children(id)}
      {hint && <p className="m-0 text-xs text-muted">{hint}</p>}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'dark' };

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  const styles = {
    primary: 'bg-cobalt text-white hover:bg-[#2443C9]',
    dark: 'bg-ink text-white hover:bg-black',
    ghost: 'bg-white text-ink border border-line hover:bg-paper',
    danger: 'bg-white text-[#B42318] border border-[#F3C5C0] hover:bg-[#FEF3F2]',
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...rest}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 select-none">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-mist transition-colors peer-checked:bg-cobalt peer-focus-visible:ring-2 peer-focus-visible:ring-cobalt peer-focus-visible:ring-offset-2 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
      <span className="font-semibold">{label}</span>
    </label>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] bg-white p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function StatusPill({ published }: { published: boolean }) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs ${published ? 'bg-[#E3F4EA] text-[#146C3A]' : 'bg-paper text-muted'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function Message({ tone, children }: { tone: 'error' | 'ok'; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`m-0 rounded-2xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-[#FEF3F2] text-[#B42318]' : 'bg-[#E3F4EA] text-[#146C3A]'}`}>
      {children}
    </p>
  );
}

export function ImageField({ label, value, onChange, folder, frame = 'aspect-[16/9] max-w-md', contain = false }: { label: string; value: string | null; onChange: (url: string | null) => void; folder: string; frame?: string; contain?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(undefined);
    try {
      onChange(await uploadImage(file, folder));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {value ? (
        <img src={value} alt="" className={`w-full rounded-2xl ${contain ? 'bg-cobalt object-contain object-bottom p-3' : 'bg-paper object-cover'} ${frame}`} />
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper font-semibold text-muted hover:border-cobalt hover:text-cobalt ${frame}`}
        >
          {busy ? 'Uploading…' : 'Choose an image'}
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {value && (
          <>
            <Button variant="ghost" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Uploading…' : 'Replace'}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => onChange(null)}>
              Remove
            </Button>
          </>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => pick(e.target.files?.[0])} />
      {error && <Message tone="error">Upload failed: {error}</Message>}
    </div>
  );
}

/** Loads every row of a table for the admin (drafts included). */
export function useRows<T>(table: string, orderBy: string, ascending = false) {
  const [rows, setRows] = useState<T[]>();
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    const { data, error } = await supabase!.from(table).select('*').order(orderBy, { ascending });
    if (error) setError(error.message);
    else {
      setError(undefined);
      setRows(data as T[]);
    }
  }, [table, orderBy, ascending]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, error, reload };
}

/** Warns before closing the tab with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}

/** Turns Postgres errors into something readable. */
export function friendlyError(message: string) {
  if (message.includes('duplicate key') && message.includes('slug')) return 'That URL is already used by another entry — change the slug.';
  if (message.includes('slug_check')) return 'The URL can only use lowercase letters, numbers and dashes.';
  if (message.includes('avatar_url')) return 'The database is missing the avatar column. Run the latest supabase/schema.sql in the Supabase SQL Editor (it is safe to re-run).';
  if (message.includes('row-level security')) return 'You don’t have permission to do that. Is this account listed as an admin?';
  return message;
}

export function ListHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <h1 className="m-0 text-[40px] leading-none font-extrabold tracking-[-0.04em]">
        {title}
        {count !== undefined && <span className="ml-3 align-middle font-mono text-base font-normal tracking-normal text-muted">{count}</span>}
      </h1>
      {action}
    </div>
  );
}

export function EntryRow({ title, meta, image, published, onClick }: { title: string; meta: string; image: string | null; published: boolean; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-4 rounded-3xl bg-white p-3 pr-5 text-left transition-colors hover:bg-white/70">
        {image ? <img src={image} alt="" className="size-16 shrink-0 rounded-2xl object-cover" /> : <span aria-hidden="true" className="size-16 shrink-0 rounded-2xl bg-mist" />}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-lg font-semibold tracking-[-0.01em]">{title || 'Untitled'}</span>
          <span className="font-mono text-xs text-muted">{meta}</span>
        </span>
        <StatusPill published={published} />
      </button>
    </li>
  );
}

/** The sticky bar above an editor: back, status and save actions. */
export function EditorBar({ onBack, published, dirty, saving, onSave, onTogglePublish }: { onBack: () => void; published: boolean; dirty: boolean; saving: boolean; onSave: () => void; onTogglePublish: () => void }) {
  return (
    <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-[28px] bg-white/95 p-2 shadow-[0_6px_20px_rgba(22,23,28,0.08)] backdrop-blur">
      <Button variant="ghost" onClick={onBack}>
        ← Back
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <span className="hidden font-mono text-xs text-muted sm:inline">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        <StatusPill published={published} />
        <Button variant="ghost" disabled={saving} onClick={onSave}>
          Save
        </Button>
        <Button variant={published ? 'dark' : 'primary'} disabled={saving} onClick={onTogglePublish}>
          {published ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
