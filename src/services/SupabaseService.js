import { createClient } from '@supabase/supabase-js';
import { ApiService } from './ApiService';

/**
 * SupabaseService — Real Supabase implementation of ApiService.
 * 
 * Activated when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.
 * See .env.example for setup instructions.
 */
export class SupabaseService extends ApiService {
  constructor() {
    super();
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  // ─── Auth ───────────────────────────────
  async login(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  }

  async logout() {
    await this.supabase.auth.signOut();
  }

  isAuthenticated() {
    // Synchronous check via cached session
    const session = this.supabase.auth.session?.();
    // Fallback: check localStorage for supabase auth token
    const key = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(key);
    return !!(session || stored);
  }

  // ─── Blogs (CRUD) ──────────────────────
  async getBlogs() {
    const { data, error } = await this.supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('SupabaseService.getBlogs:', error);
      return [];
    }
    // Map DB column names to frontend format
    return data.map(this._mapBlog);
  }

  async getBlog(id) {
    const { data, error } = await this.supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return this._mapBlog(data);
  }

  async createBlog(blogData) {
    const { data, error } = await this.supabase
      .from('blogs')
      .insert([{
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        category: blogData.category,
        image_url: blogData.imageUrl,
        read_time: `${Math.max(1, Math.ceil((blogData.content || '').split(/\s+/).length / 200))} min read`,
      }])
      .select()
      .single();
    if (error) {
      console.error('SupabaseService.createBlog:', error);
      return null;
    }
    return this._mapBlog(data);
  }

  async updateBlog(id, blogData) {
    const updates = {};
    if (blogData.title !== undefined) updates.title = blogData.title;
    if (blogData.excerpt !== undefined) updates.excerpt = blogData.excerpt;
    if (blogData.content !== undefined) updates.content = blogData.content;
    if (blogData.category !== undefined) updates.category = blogData.category;
    if (blogData.imageUrl !== undefined) updates.image_url = blogData.imageUrl;

    const { data, error } = await this.supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('SupabaseService.updateBlog:', error);
      return null;
    }
    return this._mapBlog(data);
  }

  async deleteBlog(id) {
    const { error } = await this.supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    if (error) console.error('SupabaseService.deleteBlog:', error);
  }

  // ─── Private Helpers ───────────────────
  _mapBlog(row) {
    return {
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      imageUrl: row.image_url,
      readTime: row.read_time,
      date: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
    };
  }
}
