import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    api.getBlogs().then(setBlogs);
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this thought?')) {
      await api.deleteBlog(id);
      const updated = await api.getBlogs();
      setBlogs(updated);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  return (
    <main className="admin-page">
      <Helmet>
        <title>Dashboard | Abhinomous | The Introverted Blog</title>
      </Helmet>

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>Manage Thoughts</h1>
            <p className="admin-subtitle">{blogs.length} posts published</p>
          </div>
          <div className="admin-header-actions">
            <button onClick={() => navigate('/admin/edit/new')} className="btn btn-primary">
              + New Post
            </button>
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          </div>
        </header>

        <div className="admin-list">
          {blogs.map(blog => (
            <div key={blog.id} className="admin-item">
              <div className="admin-item-info">
                <h3>{blog.title}</h3>
                <div className="admin-item-meta">
                  <span className="admin-badge">{blog.category}</span>
                  <span>{blog.date}</span>
                  <span>{blog.readTime}</span>
                </div>
              </div>
              <div className="admin-item-actions">
                <Link to={`/blog/${blog.id}`} className="btn btn-sm btn-ghost">
                  View
                </Link>
                <Link to={`/admin/edit/${blog.id}`} className="btn btn-sm btn-outline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(blog.id)} className="btn btn-sm btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}

          {blogs.length === 0 && (
            <div className="admin-empty">
              <p>No thoughts yet. Create your first one!</p>
              <button onClick={() => navigate('/admin/edit/new')} className="btn btn-primary">
                + New Post
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
