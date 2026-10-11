import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** `npm run dev` runs on a local stand-in with dummy data; `npm run prod` and builds use the real project. */
export const isLocal = import.meta.env.MODE === 'mock';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Loaded only in mock mode, so production bundles never contain the stand-in or its test login.
export const localDb = import.meta.env.MODE === 'mock' ? new (await import('./mock/client')).LocalSupabase() : null;

/** null only when a real build is missing its .env values. */
export const supabase: SupabaseClient | null = localDb ? (localDb as unknown as SupabaseClient) : url && key ? createClient(url, key) : null;

export const MEDIA_BUCKET = 'media';
