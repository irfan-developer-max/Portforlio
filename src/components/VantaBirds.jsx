import { useEffect, useRef } from 'react';

export default function VantaBirds({ className = '' }) {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    let checkInterval = null;
    let isCancelled = false;

    const initVanta = () => {
      if (isCancelled || !vantaRef.current || effectRef.current) return;

      if (typeof window !== 'undefined' && window.VANTA && typeof window.VANTA.BIRDS === 'function') {
        try {
          effectRef.current = window.VANTA.BIRDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor: 0x030712, // Deep black-slate matching portfolio shell
            color1: 0x0070ff,          // Vibrant royal/electric blue
            color2: 0x00d2ff,          // Luminous cyan / sky blue
            colorMode: 'variance',     // Beautiful natural hue variations between blue & cyan
            birdSize: 1.3,
            wingSpan: 28.0,
            speedLimit: 5.0,
            separation: 40.0,
            alignment: 45.0,
            cohesion: 35.0,
            quantity: 3.5,
          });
        } catch (err) {
          console.error('[VantaBirds] Failed to initialize:', err);
        }
      }
    };

    if (typeof window !== 'undefined' && window.VANTA && window.VANTA.BIRDS) {
      initVanta();
    } else {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (typeof window !== 'undefined' && window.VANTA && window.VANTA.BIRDS) {
          clearInterval(checkInterval);
          initVanta();
        } else if (attempts > 60) {
          clearInterval(checkInterval);
          console.warn('[VantaBirds] Scripts took too long to load.');
        }
      }, 50);
    }

    return () => {
      isCancelled = true;
      if (checkInterval) clearInterval(checkInterval);
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch (e) {
          console.error('Error destroying vanta:', e);
        }
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
