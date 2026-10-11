// Read-only queries for the public site. Drafts are filtered out explicitly so a
// signed-in admin browsing the site sees exactly what visitors see.
import { supabase } from './supabase';
import type { Book, LogEntry, Moment, Post, Settings, Skill } from './types';
import { daysAgo, isoDay } from './format';

type Result<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit as Promise<T>;
  const promise = load().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, promise);
  return promise;
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured — add the values from .env.example to .env.');
  return supabase;
}

async function run<T>(query: Result<T>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as T;
}

export const DEFAULT_INTRO = 'I write about the books I read, the things I’m learning, and the life in between.';

export function listPosts(limit?: number): Promise<Post[]> {
  return cached(`posts:${limit ?? 'all'}`, async () => {
    let query = db().from('posts').select('*').eq('published', true).order('published_at', { ascending: false });
    if (limit) query = query.limit(limit);
    return run<Post[]>(query);
  });
}

export function getPost(slug: string): Promise<Post | null> {
  return cached(`post:${slug}`, async () => {
    return run<Post | null>(db().from('posts').select('*').eq('slug', slug).eq('published', true).maybeSingle());
  });
}

export function listBooks(limit?: number): Promise<Book[]> {
  return cached(`books:${limit ?? 'all'}`, async () => {
    let query = db()
      .from('book_reviews')
      .select('*')
      .eq('published', true)
      .order('finished_on', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    return run<Book[]>(query);
  });
}

export function getBook(slug: string): Promise<Book | null> {
  return cached(`book:${slug}`, async () => {
    return run<Book | null>(db().from('book_reviews').select('*').eq('slug', slug).eq('published', true).maybeSingle());
  });
}

export function listMoments(limit?: number): Promise<Moment[]> {
  return cached(`moments:${limit ?? 'all'}`, async () => {
    let query = db()
      .from('life_moments')
      .select('*')
      .eq('published', true)
      .order('happened_on', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    return run<Moment[]>(query);
  });
}

export function listSkills(): Promise<Skill[]> {
  return cached('skills', async () => {
    return run<Skill[]>(db().from('skills').select('*').order('created_at', { ascending: false }));
  });
}

/** Entries from the last `days` days, oldest first. */
export function listLearningLog(days: number): Promise<LogEntry[]> {
  return cached(`log:${days}`, async () => {
    const since = isoDay(daysAgo(days - 1));
    return run<LogEntry[]>(db().from('learning_log').select('*').gte('logged_on', since).order('logged_on'));
  });
}

export function getSettings(): Promise<Settings> {
  return cached('settings', async () => {
    const row = await run<Settings | null>(db().from('site_settings').select('*').eq('id', 1).maybeSingle());
    return {
      quote: null,
      quote_author: null,
      email: null,
      instagram: null,
      x: null,
      linkedin: null,
      goodreads: null,
      avatar_url: null,
      ...row,
      intro: row?.intro || DEFAULT_INTRO,
    };
  });
}
