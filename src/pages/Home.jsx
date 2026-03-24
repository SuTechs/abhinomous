import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import BlogsSection from '../components/BlogsSection';
import PhotosSection from '../components/PhotosSection';
import AboutSection from '../components/AboutSection';

export default function Home() {
  return (
    <main>
      <Helmet>
        <title>The Introverted Blog</title>
        <meta name="description" content="Books, thoughts, and quiet observations by an introvert." />
        <meta property="og:title" content="The Introverted Blog" />
      </Helmet>

      <Hero />
      <BlogsSection />
      <PhotosSection />
      <AboutSection />

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} The Introverted Blog. Built with quiet intention.</p>
      </footer>
    </main>
  );
}
