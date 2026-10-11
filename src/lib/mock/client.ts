// A small in-browser stand-in for Supabase, used by `npm run dev`.
// It implements only the parts of supabase-js this app calls, keeps data in
// IndexedDB, and mimics the real access rules: visitors see published rows,
// writes and uploads need the test admin to be signed in.
import { isoDay } from '../format';
import { loadState, saveState } from './store';
import { SEED_VERSION, seed } from './seed';

/** Shown on the local login screen. Only works in `npm run dev`. */
export const TEST_LOGIN = { email: 'admin@abhinomous.test', password: 'local-test-only' };
export const TEST_USER_ID = '00000000-0000-4000-8000-000000000001';

type Row = Record<string, unknown>;
type State = { version: number; tables: Record<string, Row[]>; media: Record<string, string> };
type Result = { data: unknown; error: { message: string } | null };
type User = { id: string; email: string };
type Session = { access_token: string; token_type: string; user: User };
type AuthListener = (event: string, session: Session | null) => void;
type Order = { column: string; ascending: boolean; nullsFirst: boolean };

const SESSION_KEY = 'abhinomous-local-session';
const DRAFTABLE = new Set(['posts', 'book_reviews', 'life_moments']);
const TOUCHES_UPDATED_AT = new Set(['posts', 'book_reviews', 'site_settings']);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const DEFAULTS: Record<string, () => Row> = {
  posts: () => ({ excerpt: null, cover_url: null, content: '', published: false, published_at: new Date().toISOString() }),
  book_reviews: () => ({ author: null, cover_url: null, rating: null, content: '', finished_on: null, published: false }),
  life_moments: () => ({ caption: null, happened_on: null, published: true }),
  skills: () => ({ kind: 'skill', status: 'learning', link: null, note: null }),
  learning_log: () => ({ logged_on: isoDay(new Date()), minutes: 30, note: null }),
  site_settings: () => ({}),
  admins: () => ({}),
};

const REQUIRED: Record<string, string[]> = {
  posts: ['slug', 'title'],
  book_reviews: ['slug', 'title'],
  life_moments: ['photo_url'],
  skills: ['name'],
};

const fresh = (): State => ({ version: SEED_VERSION, tables: seed() as unknown as Record<string, Row[]>, media: {} });

function readSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Session | null;
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function compare(a: unknown, b: unknown, order: Order) {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;
  if (aNull || bNull) return aNull && bNull ? 0 : (aNull ? -1 : 1) * (order.nullsFirst ? 1 : -1);
  const diff = (a as string) < (b as string) ? -1 : (a as string) > (b as string) ? 1 : 0;
  return order.ascending ? diff : -diff;
}

class LocalQuery implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: Row | Row[] = {};
  private conflictKey = 'id';
  private returning = false;
  private filters: ((row: Row) => boolean)[] = [];
  private orders: Order[] = [];
  private max?: number;
  private one?: 'single' | 'maybe';

  constructor(
    private client: LocalSupabase,
    private table: string,
  ) {}

  select() {
    if (this.op !== 'select') this.returning = true;
    return this;
  }
  insert(values: Row | Row[]) {
    this.op = 'insert';
    this.payload = values;
    return this;
  }
  update(values: Row) {
    this.op = 'update';
    this.payload = values;
    return this;
  }
  upsert(values: Row | Row[], options?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = values;
    this.conflictKey = options?.onConflict ?? 'id';
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }
  gte(column: string, value: string | number) {
    this.filters.push((row) => row[column] !== null && row[column] !== undefined && (row[column] as string | number) >= value);
    return this;
  }
  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    const ascending = options.ascending ?? true;
    this.orders.push({ column, ascending, nullsFirst: options.nullsFirst ?? !ascending });
    return this;
  }
  limit(count: number) {
    this.max = count;
    return this;
  }
  single() {
    this.one = 'single';
    return this;
  }
  maybeSingle() {
    this.one = 'maybe';
    return this;
  }

  then<A = Result, B = never>(onFulfilled?: ((value: Result) => A | PromiseLike<A>) | null, onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null) {
    return this.run().then(onFulfilled, onRejected);
  }

  private validate(row: Row, rows: Row[], self?: Row): string | undefined {
    const t = this.table;
    for (const column of REQUIRED[t] ?? []) {
      if (row[column] === null || row[column] === undefined || row[column] === '') return `null value in column "${column}" of relation "${t}" violates not-null constraint`;
    }
    if ('slug' in row && (t === 'posts' || t === 'book_reviews')) {
      if (!SLUG_RE.test(String(row.slug))) return `new row for relation "${t}" violates check constraint "${t}_slug_check"`;
      if (rows.some((r) => r !== self && r.slug === row.slug)) return `duplicate key value violates unique constraint "${t}_slug_key"`;
    }
    if (t === 'learning_log' && rows.some((r) => r !== self && r.logged_on === row.logged_on)) return 'duplicate key value violates unique constraint "learning_log_logged_on_key"';
    return undefined;
  }

  private async run(): Promise<Result> {
    await this.client.ready;
    const { state, session } = this.client;
    const t = this.table;
    const fail = (message: string): Result => ({ data: null, error: { message } });
    if (!(t in DEFAULTS)) return fail(`Could not find the table 'public.${t}' in the schema cache`);

    const rows = (state.tables[t] ??= []);
    if (this.op !== 'select' && !session) return fail(`new row violates row-level security policy for table "${t}"`);

    const visible = (row: Row) =>
      t === 'admins' ? row.user_id === session?.user.id : Boolean(session) || !DRAFTABLE.has(t) || row.published === true;
    const matches = (row: Row) => visible(row) && this.filters.every((f) => f(row));
    const now = new Date().toISOString();
    const touched = TOUCHES_UPDATED_AT.has(t) ? { updated_at: now } : {};
    let affected: Row[] = [];

    if (this.op === 'select') {
      affected = rows.filter(matches);
    } else if (this.op === 'delete') {
      affected = rows.filter(matches);
      state.tables[t] = rows.filter((r) => !affected.includes(r));
    } else if (this.op === 'update') {
      for (const row of rows.filter(matches)) {
        const next = { ...row, ...(this.payload as Row), ...touched };
        const error = this.validate(next, rows, row);
        if (error) return fail(error);
        Object.assign(row, next);
        affected.push(row);
      }
    } else {
      for (const values of Array.isArray(this.payload) ? this.payload : [this.payload]) {
        const existing = this.op === 'upsert' && values[this.conflictKey] !== undefined ? rows.find((r) => r[this.conflictKey] === values[this.conflictKey]) : undefined;
        if (existing) {
          const next = { ...existing, ...values, ...touched };
          const error = this.validate(next, rows, existing);
          if (error) return fail(error);
          Object.assign(existing, next);
          affected.push(existing);
        } else {
          const row: Row = { id: crypto.randomUUID(), created_at: now, ...touched, ...DEFAULTS[t](), ...values };
          const error = this.validate(row, rows);
          if (error) return fail(error);
          rows.push(row);
          affected.push(row);
        }
      }
    }

    if (this.op !== 'select') await this.client.persist();
    if (this.op !== 'select' && !this.returning) return { data: null, error: null };

    let data = affected.map((row) => ({ ...row }));
    if (this.orders.length) data.sort((a, b) => this.orders.reduce((diff, o) => diff || compare(a[o.column], b[o.column], o), 0));
    if (this.max !== undefined) data = data.slice(0, this.max);

    if (this.one) {
      if (data.length === 1) return { data: data[0], error: null };
      if (this.one === 'maybe' && data.length === 0) return { data: null, error: null };
      return fail('JSON object requested, multiple (or no) rows returned');
    }
    return { data, error: null };
  }
}

export class LocalSupabase {
  readonly testLogin = TEST_LOGIN;
  state: State = fresh();
  session: Session | null = readSession();
  ready: Promise<void>;
  private listeners = new Set<AuthListener>();
  private channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('abhinomous-local');

  constructor() {
    this.ready = this.load();
    // Another tab (e.g. the admin) changed the data: pick it up.
    this.channel?.addEventListener('message', () => {
      this.ready = this.load();
    });
  }

  private async load() {
    const saved = await loadState<State>();
    if (saved?.version === SEED_VERSION) this.state = saved;
    else {
      this.state = fresh();
      await saveState(this.state);
    }
  }

  async persist() {
    await saveState(this.state);
    this.channel?.postMessage('changed');
  }

  /** Throws away local edits and restores the dummy data. */
  async reset() {
    this.state = fresh();
    await this.persist();
  }

  from(table: string) {
    return new LocalQuery(this, table);
  }

  private setSession(session: Session | null, event: string) {
    this.session = session;
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
    this.listeners.forEach((listener) => listener(event, session));
  }

  auth = {
    getSession: async () => ({ data: { session: this.session }, error: null }),
    onAuthStateChange: (listener: AuthListener) => {
      this.listeners.add(listener);
      return { data: { subscription: { unsubscribe: () => this.listeners.delete(listener) } } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email.toLowerCase() !== TEST_LOGIN.email || password !== TEST_LOGIN.password) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }
      const session: Session = { access_token: 'local', token_type: 'bearer', user: { id: TEST_USER_ID, email: TEST_LOGIN.email } };
      this.setSession(session, 'SIGNED_IN');
      return { data: { user: session.user, session }, error: null };
    },
    signOut: async () => {
      this.setSession(null, 'SIGNED_OUT');
      return { error: null };
    },
  };

  storage = {
    from: () => ({
      upload: async (path: string, file: Blob) => {
        if (!this.session) return { data: null, error: { message: 'new row violates row-level security policy' } };
        await this.ready;
        this.state.media[path] = await blobToDataUrl(file);
        await this.persist();
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => ({ data: { publicUrl: this.state.media[path] ?? '' } }),
    }),
  };
}
