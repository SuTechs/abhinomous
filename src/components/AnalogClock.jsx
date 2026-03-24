import { useRef, useEffect, useState } from 'react';

export default function AnalogClock({ hour, isAuto, onTimeChange, onReset }) {
  const clockRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const prevAngleRef = useRef(0);
  const continuousHourRef = useRef(hour);

  // Keep continuous tracker in sync if updated from outside (e.g. real-time auto updates)
  useEffect(() => {
    if (!isDragging) {
      continuousHourRef.current = hour;
    }
  }, [hour, isDragging]);

  const getAngle = (clientX, clientY) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    angle = angle + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
    prevAngleRef.current = getAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const currentAngle = getAngle(e.clientX, e.clientY);
      let delta = currentAngle - prevAngleRef.current;
      
      // Handle wrapping around 12 (360 degrees) smoothly
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // 1 full rotation (360 deg) = 12 hours
      const hourDelta = (delta / 360) * 12;
      continuousHourRef.current += hourDelta;

      // Ensure we stay cleanly in 0-24 range visually
      let newSafeHour = continuousHourRef.current % 24;
      if (newSafeHour < 0) newSafeHour += 24;

      onTimeChange(newSafeHour);
      prevAngleRef.current = currentAngle;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  // Calculations for hand angles
  const hourAngle = ((hour % 12) / 12) * 360;
  const minuteAngle = (hour % 1) * 360;

  // Simple AM/PM indicator text
  const isPM = hour >= 12;

  return (
    <div className="adaptive-clock-wrapper">
      {!isAuto && (
        <button onClick={onReset} className="clock-reset-btn" title="Reset to real time">
          ⟲
        </button>
      )}
      <div 
        ref={clockRef}
        className="analog-clock"
        onPointerDown={handlePointerDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        title="Drag around the clock to change time"
      >
        <div className="clock-face">
          {/* 12 Hour Ticks */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`clock-tick ${i % 3 === 0 ? 'major' : 'minor'}`} 
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          {/* Labels for 12, 3, 6, 9 */}
          <span className="clock-label" style={{ top: '8px', left: '50%', transform: 'translateX(-50%)' }}>12</span>
          <span className="clock-label" style={{ bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>6</span>
          <span className="clock-label" style={{ right: '8px', top: '50%', transform: 'translateY(-50%)' }}>3</span>
          <span className="clock-label" style={{ left: '8px', top: '50%', transform: 'translateY(-50%)' }}>9</span>

          {/* AM/PM Indicator */}
          <div className="clock-ampm">{isPM ? 'PM' : 'AM'}</div>

          {/* Hands */}
          <div 
            className="clock-hand-hour"
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          <div 
            className="clock-hand-minute"
            style={{ transform: `rotate(${minuteAngle}deg)` }}
          />
          <div className="clock-center"></div>
        </div>
      </div>
    </div>
  );
}
