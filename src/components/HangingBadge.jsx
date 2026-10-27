import { useRef, useEffect, useCallback } from 'react';
import idBadgeImg from '../assets/Modern Blue Developer ID Badge.png';

export default function HangingBadge({ className = '' }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const animFrameRef = useRef(null);

  // Physics state
  const stateRef = useRef({
    isInteracting: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    // Current animated values
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    transX: 0,
    transY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    // Target values
    targetRotX: 0,
    targetRotY: 0,
    targetRotZ: 0,
    targetTransX: 0,
    targetTransY: 0,
    targetGlareX: 50,
    targetGlareY: 50,
    targetGlareOpacity: 0,
    // Physics release oscillation
    releasing: false,
    releaseTime: 0,
    releaseAmplitude: 0,
  });

  // Animation loop for silky-smooth 60fps spring physics
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;
      const cardEl = cardRef.current;

      if (cardEl) {
        if (s.releasing) {
          s.releaseTime += dt;
          // Damped pendulum decay
          const decay = Math.exp(-s.releaseTime * 2.8);
          const freq = 6.2;
          const osc = Math.sin(s.releaseTime * freq) * decay;

          s.targetRotZ = s.releaseAmplitude * osc;
          s.targetTransX = s.releaseAmplitude * 1.5 * osc;

          if (decay < 0.02) {
            s.releasing = false;
            s.targetRotZ = 0;
            s.targetTransX = 0;
          }
        }

        // Spring interpolation damping
        const springSpeed = s.isDragging ? 0.35 : 0.085;
        s.rotX += (s.targetRotX - s.rotX) * springSpeed;
        s.rotY += (s.targetRotY - s.rotY) * springSpeed;
        s.rotZ += (s.targetRotZ - s.rotZ) * springSpeed;
        s.transX += (s.targetTransX - s.transX) * springSpeed;
        s.transY += (s.targetTransY - s.transY) * springSpeed;
        s.glareX += (s.targetGlareX - s.glareX) * 0.12;
        s.glareY += (s.targetGlareY - s.glareY) * 0.12;
        s.glareOpacity += (s.targetGlareOpacity - s.glareOpacity) * 0.1;

        if (s.isInteracting || s.releasing || Math.abs(s.rotZ) > 0.05 || Math.abs(s.transX) > 0.1) {
          cardEl.style.transform = `
            perspective(1100px)
            translate3d(${s.transX.toFixed(2)}px, ${s.transY.toFixed(2)}px, 0px)
            rotateX(${s.rotX.toFixed(2)}deg)
            rotateY(${s.rotY.toFixed(2)}deg)
            rotateZ(${s.rotZ.toFixed(2)}deg)
          `;
          cardEl.style.animationPlayState = 'paused';
        } else {
          // Return smoothly to idle CSS swing
          cardEl.style.transform = '';
          cardEl.style.animationPlayState = 'running';
        }

        // Update glare overlay
        const glareEl = cardEl.querySelector('.card-holographic-glare');
        if (glareEl) {
          glareEl.style.opacity = s.glareOpacity.toFixed(2);
          glareEl.style.background = `radial-gradient(circle at ${s.glareX.toFixed(1)}% ${s.glareY.toFixed(1)}%, rgba(255,255,255,0.45) 0%, rgba(56,189,248,0.2) 32%, transparent 65%)`;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Mouse Move Handler
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const s = stateRef.current;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / (rect.width / 2); // -1 to 1
    const normY = (y - centerY) / (rect.height / 2); // -1 to 1

    s.isInteracting = true;
    s.releasing = false;

    if (s.isDragging) {
      const deltaX = e.clientX - s.dragStartX;
      const deltaY = e.clientY - s.dragStartY;
      s.targetTransX = deltaX * 0.45;
      s.targetTransY = Math.max(0, deltaY * 0.2);
      s.targetRotZ = (deltaX / rect.width) * 22;
      s.targetRotY = (deltaX / rect.width) * 15;
      s.targetRotX = -(deltaY / rect.height) * 12;
    } else {
      // 3D tilt tracking
      s.targetRotY = normX * 16;
      s.targetRotX = -normY * 14;
      s.targetRotZ = normX * 4;
      s.targetTransX = normX * 8;
      s.targetTransY = Math.abs(normX) * 2;
    }

    s.targetGlareX = (x / rect.width) * 100;
    s.targetGlareY = (y / rect.height) * 100;
    s.targetGlareOpacity = 0.85;
  }, []);

  const handleMouseEnter = useCallback(() => {
    stateRef.current.isInteracting = true;
    stateRef.current.releasing = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const s = stateRef.current;
    if (s.isDragging) {
      handleDragEnd();
    }
    s.isInteracting = false;
    s.targetRotX = 0;
    s.targetRotY = 0;
    s.targetRotZ = 0;
    s.targetTransX = 0;
    s.targetTransY = 0;
    s.targetGlareOpacity = 0;
  }, []);

  // Drag start
  const handleDragStart = (e) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.releasing = false;
    setIsClicking(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    s.dragStartX = clientX - s.transX;
    s.dragStartY = clientY - s.transY;
  };

  // Drag end
  const handleDragEnd = () => {
    setIsClicking(false);
    const s = stateRef.current;
    if (s.isDragging) {
      s.isDragging = false;
      s.releasing = true;
      s.releaseTime = 0;
      s.releaseAmplitude = s.rotZ || 12;
    }
  };

  // Click toggle
  const handleClick = () => {
    setShadowRemoved((prev) => !prev);
  };

  // Touch handlers
  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center select-none outline-none [-webkit-tap-highlight-color:transparent] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      style={{ cursor: stateRef.current.isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Main Hanging Card Container - pivots directly from top of its own vertical lanyard tag */}
      <div
        ref={cardRef}
        className="hanging-badge-card relative z-20 will-change-transform"
        style={{
          transformOrigin: '50% 0%',
        }}
      >
        {/* The Isolated Clean ID Badge with extended hanging lanyard tag - ZERO shadow */}
        <div className="relative group">
          {/* Extended Blue Lanyard Strap — width & position matched to badge PNG */}
          <div
            className="w-[29px] sm:w-[36px] md:w-[41px] lg:w-[45px] ml-[calc(50%+5px)] sm:ml-[calc(50%+7px)] md:ml-[calc(50%+8px)] lg:ml-[calc(50%+8px)] -translate-x-1/2"
            style={{
              height: '80px',
              background: 'linear-gradient(90deg, #1560b8 0%, #1e78d8 15%, #2680eb 50%, #2a85ee 85%, #1e6fd0 100%)',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.15), inset 3px 0 4px rgba(255,255,255,0.06)',
              marginBottom: '-4px',
              position: 'relative',
              zIndex: 1,
            }}
          />
          <img
            src={idBadgeImg}
            alt="Mohd Irfan - Full Stack Developer ID Badge"
            draggable={false}
            className="w-[280px] sm:w-[340px] md:w-[390px] lg:w-[425px] h-auto object-contain outline-none select-none filter-none drop-shadow-none relative z-[2]"
          />

          {/* Dynamic Specular / Holographic Glare overlay on the badge card */}
          <div
            className="card-holographic-glare absolute inset-0 pointer-events-none rounded-[36px] mix-blend-screen transition-opacity duration-300"
            style={{ opacity: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

