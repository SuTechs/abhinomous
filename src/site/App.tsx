import { getSettings, DEFAULT_INTRO } from '../lib/api';
import type { Settings } from '../lib/types';
import { RouterProvider, useRouter } from './router';
import { SettingsContext, useAsync } from './hooks';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { LocalBanner } from './components/Bits';
import { Home } from './pages/Home';
import { Blogs, BlogPost } from './pages/Blogs';
import { Books, BookReview } from './pages/Books';
import { Life } from './pages/Life';
import { Upskilling } from './pages/Upskilling';
import { NotFound } from './pages/NotFound';

const FALLBACK: Settings = { intro: DEFAULT_INTRO, quote: null, quote_author: null, email: null, instagram: null, x: null, linkedin: null, goodreads: null, avatar_url: null };

function Page() {
  const { path } = useRouter();
  const [section, slug, extra] = path.split('/').filter(Boolean);
  if (extra) return <NotFound />;
  if (!section) return <Home />;
  if (section === 'blogs') return slug ? <BlogPost key={slug} slug={decodeURIComponent(slug)} /> : <Blogs />;
  if (section === 'books') return slug ? <BookReview key={slug} slug={decodeURIComponent(slug)} /> : <Books />;
  if (section === 'life' && !slug) return <Life />;
  if (section === 'upskilling' && !slug) return <Upskilling />;
  return <NotFound />;
}

export function App() {
  const { data, error } = useAsync(getSettings, []);
  return (
    <SettingsContext.Provider value={data ?? (error ? FALLBACK : undefined)}>
      <RouterProvider>
        <div className="min-h-screen px-4 pt-3 pb-12 sm:px-8 sm:pt-6 lg:px-12">
          <div className="mx-auto max-w-[1344px]">
            <Nav />
            <main>
              <Page />
            </main>
            <Footer />
          </div>
        </div>
        <LocalBanner />
      </RouterProvider>
    </SettingsContext.Provider>
  );
}
