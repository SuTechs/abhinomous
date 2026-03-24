export default function PhotosSection() {
  const photos = [
    // Using picsum to ensure guaranteed load with various dramatic aspect ratios
    { id: 1, url: 'https://picsum.photos/id/40/600/800', alt: 'A quiet afternoon' },       // tall
    { id: 2, url: 'https://picsum.photos/id/11/800/500', alt: 'Landscape panorama' },      // wide
    { id: 3, url: 'https://picsum.photos/id/20/600/900', alt: 'The study desk' },          // very tall
    { id: 4, url: 'https://picsum.photos/id/29/600/600', alt: 'Morning mountain' },        // square
    { id: 5, url: 'https://picsum.photos/id/36/600/400', alt: 'Evening light' },           // very wide
    { id: 6, url: 'https://picsum.photos/id/42/600/700', alt: 'Coffee break' },            // slightly tall
    { id: 7, url: 'https://picsum.photos/id/56/600/1000', alt: 'City night' },             // extra tall
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
                className="photo-img block w-full rounded-xl"
                loading="lazy"
                style={{ borderRadius: '1rem', display: 'block' }}
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
