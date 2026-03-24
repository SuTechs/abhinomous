import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services';
import RichTextEditor from '../components/RichTextEditor';

export default function AdminEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Philosophy');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!isNew) {
      api.getBlog(parseInt(id)).then(blog => {
        if (blog) {
          setTitle(blog.title || '');
          setExcerpt(blog.excerpt || '');
          setCategory(blog.category || 'Philosophy');
          setImageUrl(blog.imageUrl || '');
          setContent(blog.content || '');
        }
      });
    }
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    const blogData = { title, excerpt, category, imageUrl, content };

    if (isNew) {
      await api.createBlog(blogData);
    } else {
      await api.updateBlog(parseInt(id), blogData);
    }

    setSaving(false);
    navigate('/admin');
  };

  return (
    <main className="editor-page">
      <Helmet>
        <title>{isNew ? 'New Thought' : 'Edit Thought'} | Admin</title>
      </Helmet>

      <div className="editor-container">
        <header className="editor-header">
          <button onClick={() => navigate('/admin')} className="btn btn-ghost">
            ← Dashboard
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </header>

        <div className="editor-body">
          <input
            type="text"
            placeholder="Title of your thought..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="editor-title-input"
          />

          <input
            type="text"
            placeholder="Brief excerpt for the preview card..."
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            className="editor-excerpt-input"
          />

          <div className="editor-meta-row">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="editor-select"
            >
              <option>Philosophy</option>
              <option>Book Review</option>
              <option>Travel</option>
              <option>Personal</option>
            </select>

            <input
              type="text"
              placeholder="Featured Image URL (optional)"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="editor-image-input"
            />
          </div>

          {imageUrl && (
            <div className="editor-image-preview">
              <img src={imageUrl} alt="Featured preview" />
            </div>
          )}

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your beautiful thoughts here..."
          />
        </div>
      </div>
    </main>
  );
}
