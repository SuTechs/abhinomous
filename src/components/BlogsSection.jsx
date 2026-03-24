import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';

const CATEGORIES = ['All', 'Philosophy', 'Book Review', 'Travel', 'Personal'];

export default function BlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.getBlogs().then(setBlogs);
  }, []);

  const filteredBlogs = blogs.filter(
    blog => selectedCategory === 'All' || blog.category === selectedCategory
  );

  return (
    <section className="blogs-section" id="blogs">
      <h2 className="section-title">My Thoughts</h2>
      
      <div className="categories-filter">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="blogs-grid">
        {filteredBlogs.map(blog => (
          <article
            key={blog.id}
            className="blog-card flex-col"
            onClick={() => navigate(`/blog/${blog.id}`)}
          >
            {blog.imageUrl && (
              <div className="blog-image-wrapper">
                <img src={blog.imageUrl} alt={blog.title} className="blog-image" loading="lazy" />
              </div>
            )}
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category-tag">{blog.category}</span>
                <span className="separator">•</span>
                <time dateTime={blog.date}>{blog.date}</time>
                <span className="separator">•</span>
                <span>{blog.readTime}</span>
              </div>
              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-read-more">
                Read More <span className="arrow">→</span>
              </div>
            </div>
          </article>
        ))}
        {filteredBlogs.length === 0 && (
          <div className="no-blogs-message">
            No thoughts shared in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
