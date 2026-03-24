export default function PhotosSection() {
  const photos = [
    { id: 1, url: '/assets/glimpses/coffee.png', alt: 'Coffee and rain' },
    { id: 2, url: '/assets/glimpses/bookshelf.png', alt: 'The reading nook' },
    { id: 3, url: '/assets/glimpses/mountains.png', alt: 'Mountain solitude' },
    { id: 4, url: '/assets/glimpses/rain.png', alt: 'City rain' },
    { id: 5, url: '/assets/glimpses/sunset.png', alt: 'Ocean sunset' },
    { id: 6, url: 'https://picsum.photos/id/40/600/800', alt: 'A quiet afternoon' },
    { id: 7, url: 'https://picsum.photos/id/20/600/900', alt: 'The study desk' },
  ];

  return (
    <section className="photos-section" id="photos">
      <div className="photos-container">
        <h2 className="section-title">Glimpses</h2>
        <div className="photos-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-card" style={{ display: 'inline-block', width: '100%' }}>
              <img
                src={photo.url}
                alt={photo.alt}
                loading="lazy"
                style={{ borderRadius: '1rem', display: 'block', width: '100%' }}
              />
              <div className="photo-overlay">
                <span className="photo-caption">{photo.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
