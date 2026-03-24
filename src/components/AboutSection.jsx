import { Mail, Github, BookOpen } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-avatar-wrapper">
          <div className="about-avatar">
            Hi
          </div>
        </div>
        
        <div className="about-content">
          <h2 className="section-title text-left">About Me</h2>
          
          <div className="about-text">
            <p>
              I am an introvert navigating a loud world. I find my energy in quiet corners, 
              lost in the pages of a good book, or simply observing the passing clouds. 
            </p>
            <p>
              This space is my digital garden—a place where I share my thoughts, book reviews, 
              and small glimpses of my life. No shouting, just quiet expressions.
            </p>
          </div>

          <div className="about-social">
            <a href="#" className="social-link" aria-label="Email">
              <Mail size={20} />
            </a>
            <a href="#" className="social-link" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="#" className="social-link" aria-label="Goodreads">
              <BookOpen size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
