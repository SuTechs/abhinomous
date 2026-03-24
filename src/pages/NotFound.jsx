import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <Helmet>
        <title>404 | The Introverted Blog</title>
      </Helmet>

      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1>Lost in thought</h1>
        <p>The page you're looking for doesn't exist — or maybe it was just a fleeting idea.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          ← Back to Home
        </button>
      </div>
    </main>
  );
}
