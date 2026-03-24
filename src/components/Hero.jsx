import { useEffect, useState } from 'react';
import AnimatedScene from './AnimatedScene';
import AnalogClock from './AnalogClock';

export default function Hero() {
  const getExactHour = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  };

  const [hour, setHour] = useState(getExactHour());
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (isAuto) {
      setHour(getExactHour());
      
      const interval = setInterval(() => {
        setHour(getExactHour());
      }, 1000); // Update every second to keep minute hand smooth
      
      return () => clearInterval(interval);
    }
  }, [isAuto]);

  const handleSliderChange = (e) => {
    setIsAuto(false);
    setHour(parseInt(e.target.value, 10));
  };

  const resetToLocalTime = () => {
    setIsAuto(true);
    setHour(getExactHour());
  };

  return (
    <section className="hero-section">
      {/* Background SVG Animation */}
      <div className="hero-bg">
        <AnimatedScene hour={hour} />
      </div>

      {/* Content overlay */}
      <div className="hero-content">
        <h1 className="hero-title">The Introverted Blog</h1>
        <p className="hero-subtitle">Books, thoughts, and quiet observations.</p>
      </div>

      {/* Creative Analog Clock Widget at the bottom right */}
      <AnalogClock 
        hour={hour} 
        isAuto={isAuto} 
        onTimeChange={(val) => {
          setIsAuto(false);
          setHour(val);
        }} 
        onReset={resetToLocalTime} 
      />
      
      {/* Wave transition to next section */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill="var(--bg-color)" 
            fillOpacity="1" 
            d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
