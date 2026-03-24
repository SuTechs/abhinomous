import { MockSupabaseService } from './MockSupabaseService';

/**
 * Singleton service instance used throughout the app.
 * 
 * To switch to Supabase:
 *   import { SupabaseService } from './SupabaseService';
 *   export const api = new SupabaseService();
 */
export const api = new MockSupabaseService();
