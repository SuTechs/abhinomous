import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services';
import './BlogDetail.css';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);

        api.getBlogs().then(blogs => {
            const current = blogs.find(b => b.id === parseInt(id));
            setPost(current || null);
            setRelatedPosts(blogs.filter(b => b.id !== parseInt(id)).slice(0, 3));
            setLoading(false);
        });
    }, [id]);

    if (loading) return null;

    if (!post) {
        return (
            <div className="blog-detail-page" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2>Thought not found</h2>
                <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginTop: '20px' }}>
                    ← Back to Home
                </button>
            </div>
        );
    }

    return (
        <article className="blog-detail-page">
            <Helmet>
                <title>{post.title} | Abhinomous | The Introverted Blog</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
            </Helmet>

            <button onClick={() => navigate(-1)} className="blog-back-btn">
                ← Back
            </button>

            <div className="hero-image" style={{ backgroundImage: post.imageUrl ? `url(${post.imageUrl})` : 'linear-gradient(135deg, #1f1430 0%, var(--bg-color) 100%)' }}>
                <div className="overlay"></div>
                <div className="title-container">
                    <span className="category-badge">{post.category}</span>
                    <h1>{post.title}</h1>
                    <div className="blog-detail-meta">
                        <time>{post.date}</time>
                        <span className="separator">•</span>
                        <span>{post.readTime}</span>
                    </div>
                </div>
            </div>

            <div className="content-container">
                <p className="lead">{post.excerpt}</p>
                <hr className="content-divider" />

                {post.content ? (
                    <div className="rich-text" dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                    <div className="rich-text">
                        <p>This is a placeholder for the thought's full content. Log into the admin dashboard at <code>/login</code> and edit this post to add your writing!</p>
                        <blockquote>"{post.excerpt}"</blockquote>
                    </div>
                )}
            </div>

            {relatedPosts.length > 0 && (
                <section className="related-posts-section">
                    <div className="related-container">
                        <h2>More Thoughts</h2>
                        <div className="related-blogs-grid">
                            {relatedPosts.map(related => (
                                <Link to={`/blog/${related.id}`} key={related.id} className="related-blog-card">
                                    {related.imageUrl && (
                                        <div className="related-image-wrapper">
                                            <img src={related.imageUrl} alt={related.title} loading="lazy" />
                                        </div>
                                    )}
                                    <div className="related-content">
                                        <span className="blog-category-tag">{related.category}</span>
                                        <h3>{related.title}</h3>
                                        <p>{related.excerpt}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
};

export default BlogDetail;
