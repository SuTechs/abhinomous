/**
 * ApiService — Abstract base class for all backend services.
 * 
 * When integrating Supabase, create `SupabaseService extends ApiService`
 * and implement each method. Then swap it in `src/services/index.js`.
 */
export class ApiService {
  // ─── Auth ───────────────────────────────
  async login(email, password) {
    throw new Error('login() not implemented');
  }

  async logout() {
    throw new Error('logout() not implemented');
  }

  isAuthenticated() {
    throw new Error('isAuthenticated() not implemented');
  }

  // ─── Blogs (CRUD) ──────────────────────
  async getBlogs() {
    throw new Error('getBlogs() not implemented');
  }

  async getBlog(id) {
    throw new Error('getBlog() not implemented');
  }

  async createBlog(blogData) {
    throw new Error('createBlog() not implemented');
  }

  async updateBlog(id, blogData) {
    throw new Error('updateBlog() not implemented');
  }

  async deleteBlog(id) {
    throw new Error('deleteBlog() not implemented');
  }
}
