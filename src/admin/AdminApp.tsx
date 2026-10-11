import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isLocal, localDb, supabase } from '../lib/supabase';
import { PostsAdmin } from './PostsAdmin';
import { BooksAdmin } from './BooksAdmin';
import { MomentsAdmin } from './MomentsAdmin';
import { LearningAdmin } from './LearningAdmin';
import { SettingsAdmin } from './SettingsAdmin';
import { Button, Field, Message, inputClass } from './ui';
import { site } from '../site.config';

const TABS = [
  { id: 'posts', label: 'Blogs', View: PostsAdmin },
  { id: 'books', label: 'Book reviews', View: BooksAdmin },
  { id: 'life', label: 'Life, lately', View: MomentsAdmin },
  { id: 'learning', label: 'Upskilling', View: LearningAdmin },
  { id: 'home', label: 'Homepage', View: SettingsAdmin },
] as const;

type TabId = (typeof TABS)[number]['id'];

const tabFromHash = (): TabId => {
  const id = window.location.hash.slice(1);
  return TABS.some((t) => t.id === id) ? (id as TabId) : 'posts';
};

export function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) return setIsAdmin(undefined);
    // Signed-in users can read only their own row in admins, so a row means "admin".
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => setIsAdmin(!error && Boolean(data)));
  }, [userId]);

  if (!supabase)
    return (
      <Shell>
        <Card>
          <h1 className="m-0 text-3xl font-extrabold tracking-[-0.03em]">Supabase isn’t connected</h1>
          <p className="m-0 text-muted">
            Add <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code className="font-mono">.env</code> and restart. To try the admin with dummy data instead, run <code className="font-mono">npm run dev</code>.
          </p>
        </Card>
      </Shell>
    );

  if (session === undefined || (session && isAdmin === undefined)) return <Shell>{null}</Shell>;
  if (!session) return <Login />;

  if (!isAdmin)
    return (
      <Shell>
        <Card>
          <h1 className="m-0 text-3xl font-extrabold tracking-[-0.03em]">Not an admin</h1>
          <p className="m-0 text-muted">{session.user.email} is signed in but isn’t on the admin list.</p>
          <Button variant="dark" onClick={() => supabase!.auth.signOut()}>
            Sign out
          </Button>
        </Card>
      </Shell>
    );

  return <Dashboard email={session.user.email ?? ''} />;
}

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<TabId>(tabFromHash);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const View = TABS.find((t) => t.id === tab)!.View;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] bg-white py-2.5 pr-2.5 pl-6">
        <span className="text-2xl font-extrabold tracking-[-0.04em]">
          {site.wordmark}
          <span className="text-cobalt">.</span> <span className="font-mono text-sm font-normal tracking-normal text-muted">admin</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {isLocal ? <ResetLocalData /> : <span className="hidden font-mono text-xs text-muted sm:inline">{email}</span>}
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 font-semibold hover:bg-paper">
            View site ↗
          </a>
          <Button variant="dark" onClick={() => supabase!.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <nav aria-label="Sections" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-5 font-semibold transition-colors ${tab === t.id ? 'bg-ink text-white' : 'bg-white hover:bg-white/70'}`}
          >
            {t.label}
          </a>
        ))}
      </nav>

      <main className="mt-6">
        <View key={tab} />
      </main>
    </Shell>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const signIn = async (credentials: { email: string; password: string }) => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase!.auth.signInWithPassword(credentials);
    setBusy(false);
    if (error) setError(error.message === 'Invalid login credentials' ? 'That email and password don’t match.' : error.message);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    signIn({ email: email.trim(), password });
  };

  return (
    <Shell>
      <form onSubmit={submit} className="mx-auto mt-[12vh] flex w-full max-w-md flex-col gap-5 rounded-[36px] bg-white p-7 sm:p-10">
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-extrabold tracking-[-0.04em]">
            {site.wordmark}
            <span className="text-cobalt">.</span>
          </span>
          <h1 className="m-0 text-lg font-semibold text-muted">Sign in to write</h1>
        </div>
        <Field label="Email">{(id) => <input id={id} type="email" autoComplete="username" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Password">
          {(id) => <input id={id} type="password" autoComplete="current-password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        {error && <Message tone="error">{error}</Message>}
        {localDb && (
          <div className="flex flex-col gap-3 rounded-3xl bg-paper p-4 text-sm">
            <p className="m-0">
              <b>Local test mode.</b> Nothing here touches the real site. Test login: <span className="font-mono">{localDb.testLogin.email}</span> / <span className="font-mono">{localDb.testLogin.password}</span>
            </p>
            <Button variant="dark" disabled={busy} onClick={() => signIn(localDb!.testLogin)}>
              Sign in as test admin
            </Button>
          </div>
        )}
        <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-cobalt px-6 font-semibold text-white transition-colors hover:bg-[#2443C9] disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="mx-auto mt-[12vh] flex max-w-md flex-col gap-4 rounded-[36px] bg-white p-8">{children}</div>;
}

function ResetLocalData() {
  const reset = async () => {
    if (!window.confirm('Throw away your local changes and restore the dummy data?')) return;
    await localDb!.reset();
    window.location.reload();
  };
  return (
    <>
      <span className="rounded-full bg-tangerine px-3 py-1 font-mono text-xs text-ink">Local test mode</span>
      <Button variant="ghost" onClick={reset}>
        Reset test data
      </Button>
    </>
  );
}
