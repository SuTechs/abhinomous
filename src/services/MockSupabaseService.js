import { ApiService } from './ApiService';
import { blogs as seedBlogs } from '../data/dummy';

const STORAGE_KEY = 'introvert_blogs';
const AUTH_KEY = 'isAuthenticated';

/**
 * MockSupabaseService — localStorage-backed implementation of ApiService.
 * 
 * Drop-in replacement target: create SupabaseService extending ApiService
 * to use real Supabase auth + database queries.
 */
export class MockSupabaseService extends ApiService {
  constructor() {
    super();
    // Seed localStorage with dummy data if empty or missing new posts
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedBlogs));
    } else {
      // Check if we need to add new seed data without destroying user-added posts
      const parsed = JSON.parse(stored);
      const originalSeedIds = seedBlogs.map(b => b.id);
      
      const missingSeeds = seedBlogs.filter(seed => !parsed.some(p => p.id === seed.id));
      if (missingSeeds.length > 0) {
        // Only append missing items
        const combined = [...parsed, ...missingSeeds].sort((a,b) => b.id - a.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      }
    }
  }

  // ─── Auth ───────────────────────────────
  async login(email, password) {
    // Mock credentials — will be replaced by Supabase auth
    if (email === 'admin' && password === 'admin') {
      localStorage.setItem(AUTH_KEY, 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials.' };
  }

  async logout() {
    localStorage.removeItem(AUTH_KEY);
  }

  isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  // ─── Blogs (CRUD) ──────────────────────
  async getBlogs() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getBlog(id) {
    const blogs = await this.getBlogs();
    return blogs.find(b => b.id === id) || null;
  }

  async createBlog(blogData) {
    const blogs = await this.getBlogs();
    const newBlog = {
      id: Date.now(),
      ...blogData,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      readTime: `${Math.max(1, Math.ceil((blogData.content || '').split(/\s+/).length / 200))} min read`,
    };
    blogs.unshift(newBlog);
    this._save(blogs);
    return newBlog;
  }

  async updateBlog(id, blogData) {
    let blogs = await this.getBlogs();
    blogs = blogs.map(b => (b.id === id ? { ...b, ...blogData } : b));
    this._save(blogs);
    return blogs.find(b => b.id === id);
  }

  async deleteBlog(id) {
    let blogs = await this.getBlogs();
    blogs = blogs.filter(b => b.id !== id);
    this._save(blogs);
  }

  // ─── Private ───────────────────────────
  _save(blogs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  }
}
