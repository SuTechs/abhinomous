export default function AnimatedScene({ hour }) {
  // Determine if it's day or night based on hours 0-24
  // Night: 19 (7 PM) to 5 (5 AM)
  const isNight = hour >= 19 || hour <= 5;
  const isSunrise = hour > 5 && hour < 8;
  const isSunset = hour > 16 && hour < 19;
  
  // Calculate sun/moon X position based on time
  const celestialX = 1500 - ((hour % 24) / 24) * 1000;
  let celestialY = 200;
  if (isSunrise || isSunset) {
    celestialY = 400; // lower it slightly
  }

  let skyTopColor = '#4fa5e3';
  let skyBottomColor = '#87CEEB';
  let sunMoonColor = '#FFD700';

  if (isNight) {
    skyTopColor = '#0b162c';
    skyBottomColor = '#1e3860';
    sunMoonColor = '#EAEAEA';
  } else if (isSunrise) {
    skyTopColor = '#f5b57f';
    skyBottomColor = '#ffe3b3';
    sunMoonColor = '#ffb03a';
  } else if (isSunset) {
    skyTopColor = '#5c4b8a';
    skyBottomColor = '#f18867';
    sunMoonColor = '#ff7b54';
  }

  return (
    <svg 
      className="w-full h-full object-cover" 
      preserveAspectRatio="xMidYMid slice" 
      viewBox="0 0 1920 1080" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={skyTopColor} style={{ transition: 'stop-color 1s ease' }} />
          <stop offset="100%" stopColor={skyBottomColor} style={{ transition: 'stop-color 1s ease' }} />
        </linearGradient>

        <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isNight ? '#1b4020' : '#4caf50'} style={{ transition: 'stop-color 1s ease' }} />
          <stop offset="100%" stopColor={isNight ? '#0c200c' : '#2e7d32'} style={{ transition: 'stop-color 1s ease' }} />
        </linearGradient>
        
        <g id="cloud">
          <path d="M 50 50 A 20 20 0 0 1 90 50 A 30 30 0 0 1 140 60 A 20 20 0 0 1 130 90 L 40 90 A 20 20 0 0 1 50 50 Z" 
                fill={isNight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)'} 
                style={{ transition: 'fill 1s ease' }}/>
        </g>

        <style>
          {`
            @keyframes floatCloud {
              0% { transform: translateX(1920px); }
              100% { transform: translateX(-300px); }
            }
            .cloud1 { animation: floatCloud 60s linear infinite; }
            .cloud2 { animation: floatCloud 85s linear infinite; animation-delay: -25s; }
            .cloud3 { animation: floatCloud 110s linear infinite; animation-delay: -60s; }
            
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; }
            }
            .star { animation: twinkle 3s ease-in-out infinite; fill: white; }
            .star:nth-child(even) { animation-duration: 4s; animation-delay: 1s; }
            .star:nth-child(3n) { animation-duration: 5s; animation-delay: 2s; }

            /* Smoothly swaying grass elements */
            @keyframes swayGrass {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(10deg); }
            }
            .wind-grass { 
              animation: swayGrass 4s ease-in-out infinite; 
              transform-origin: bottom center;
            }
            .wind-grass:nth-child(2n) { animation-duration: 5s; animation-delay: -1s; }
            .wind-grass:nth-child(3n) { animation-duration: 3.5s; animation-delay: -2s; }

            /* Beautiful text styling for SVG */
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
          `}
        </style>
      </defs>

      {/* Sky Background */}
      <rect width="1920" height="1080" fill="url(#skyGrad)" />

      {/* Stars (Only visible at night) */}
      <g style={{ opacity: isNight ? 1 : 0, transition: 'opacity 1s ease' }}>
        {[...Array(100)].map((_, i) => (
          <circle 
            key={`star-${i}`} 
            cx={Math.random() * 1920} 
            cy={Math.random() * 600} 
            r={Math.random() * 1.5 + 0.5} 
            className="star" 
          />
        ))}
      </g>

      {/* Dynamic Sun or Moon based on slider */}
      <g style={{ transition: 'all 0.5s ease-out', transform: `translate(${celestialX - 1500}px, ${celestialY - 200}px)` }}>
        <circle 
          cx="1500" 
          cy="200" 
          r="80" 
          fill={sunMoonColor} 
          style={{ 
            transition: 'all 1s ease',
            boxShadow: isNight ? '0 0 50px rgba(255,255,255,0.5)' : '0 0 100px rgba(255,215,0,0.8)'
          }} 
        />
        {isNight && (
          <circle cx="1530" cy="180" r="70" fill="url(#skyGrad)" />
        )}
      </g>

      {/* Clouds */}
      <use href="#cloud" x="0" y="80" className="cloud1" transform="scale(2)" />
      <use href="#cloud" x="0" y="250" className="cloud2" transform="scale(1.5)" />
      <use href="#cloud" x="0" y="150" className="cloud3" transform="scale(1.2) scale(-1, 1)" />
      <use href="#cloud" x="0" y="350" className="cloud1" transform="scale(0.8) scale(-1, 1)" style={{animationDelay: '-15s'}}/>

      {/* Hills / Grass Area */}
      <path d="M0 600 Q 480 500 960 650 T 1920 600 L 1920 1080 L 0 1080 Z" fill="url(#grassGrad)" />
      <path d="M0 700 Q 600 800 1200 650 T 1920 750 L 1920 1080 L 0 1080 Z" fill={isNight ? '#122b15' : '#388e3c'} style={{ transition: 'fill 1s ease' }} />

      {/* Boy sleeping on grass (Silhouette) */}
      <g transform="translate(800, 680)">
        {/* Head/Hair */}
        <circle cx="50" cy="50" r="25" fill={isNight ? '#0a1220' : '#111'} />
        <path d="M 30 50 Q 50 20 70 50" stroke={isNight ? '#0a1220' : '#111'} strokeWidth="10" fill="none" strokeLinecap="round" />
        
        {/* Body lying down */}
        <path d="M 70 60 Q 150 70 200 60 Q 210 58 220 65 L 220 75 L 60 75 Z" fill={isNight ? '#11223b' : '#3949ab'} />
        
        {/* Arm as pillow */}
        <path d="M 70 65 Q 40 80 50 50" stroke={isNight ? '#0f1f33' : '#d18b76'} strokeWidth="12" fill="none" strokeLinecap="round" />
        
        {/* Legs */}
        <path d="M 210 60 Q 260 50 350 70 L 350 80 L 210 75 Z" fill={isNight ? '#0c1524' : '#222'} />
        <path d="M 230 65 Q 260 40 280 65" stroke={isNight ? '#0c1524' : '#222'} strokeWidth="15" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
