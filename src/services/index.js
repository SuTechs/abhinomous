import { MockSupabaseService } from './MockSupabaseService';

/**
 * Singleton service instance used throughout the app.
 * 
 * Auto-detects: if VITE_SUPABASE_URL is set, uses real Supabase.
 * Otherwise, falls back to localStorage mock.
 */
let api;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  // Dynamic import to avoid bundling supabase client when not needed
  const { SupabaseService } = await import('./SupabaseService');
  api = new SupabaseService();
  console.log('🔌 Using Supabase backend');
} else {
  api = new MockSupabaseService();
  console.log('📦 Using mock backend (localStorage)');
}

export { api };
