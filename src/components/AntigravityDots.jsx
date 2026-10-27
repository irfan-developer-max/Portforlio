import { useEffect, useRef } from 'react';

export default function AntigravityDots({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse state
    const mouse = {
      x: null,
      y: null,
      targetX: null,
      targetY: null,
      radius: 160,
      active: false,
    };

    let idleTimeout = null;

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        mouse.active = false;
      }, 2500);
    };

    const handleMouseLeave = () => {
      mouse.targetX = null;
      mouse.targetY = null;
      mouse.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Antigravity Particle definition
    class AntigravityParticle {
      constructor(isInit = false) {
        this.reset(isInit);
      }

      reset(isInit = false) {
        this.x = Math.random() * width;
        // In antigravity, particles rise upwards.
        // Initially distribute everywhere; when respawning, start near bottom
        this.y = isInit ? Math.random() * height : height + 10 + Math.random() * 40;

        // Buoyant upward floating velocity (negative Y)
        this.baseVy = -(0.3 + Math.random() * 0.65);
        this.baseVx = (Math.random() - 0.5) * 0.4;

        this.vx = this.baseVx;
        this.vy = this.baseVy;

        // Radius
        this.radius = 1.2 + Math.random() * 2.0;
        this.mass = this.radius * 0.9;

        // Curated electric blue & cyan color palette
        const palette = [
          { r: 0, g: 112, b: 255 },   // Electric Royal Blue
          { r: 56, g: 189, b: 248 },  // Sky 400
          { r: 0, g: 210, b: 255 },   // Luminous Cyan
          { r: 96, g: 165, b: 250 },  // Blue 400
          { r: 147, g: 197, b: 253 }, // Soft Light Blue
        ];
        this.color = palette[Math.floor(Math.random() * palette.length)];

        // Breathing glow
        this.baseAlpha = 0.22 + Math.random() * 0.45;
        this.alpha = this.baseAlpha;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.015 + Math.random() * 0.025;
      }

      update() {
        // Natural pulsing glow
        this.pulsePhase += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.14;

        // Antigravity drift
        this.x += this.vx;
        this.y += this.vy;

        // Smooth relaxation toward base antigravity velocity
        this.vx += (this.baseVx - this.vx) * 0.035;
        this.vy += (this.baseVy - this.vy) * 0.035;

        // Cursor Antigravity Interaction
        if (mouse.x !== null && mouse.y !== null && mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            // Antigravity field repulsion (pushing away smoothly with inertia)
            const proximity = (1 - dist / mouse.radius);
            const force = Math.pow(proximity, 1.6) * 5.5;

            const angle = Math.atan2(dy, dx);
            this.vx += (Math.cos(angle) * force) / this.mass;
            this.vy += (Math.sin(angle) * force) / this.mass;

            // Micro-gravity tangential orbital swirl around cursor
            const swirl = proximity * 1.8;
            this.vx += -Math.sin(angle) * swirl;
            this.vy += Math.cos(angle) * swirl;

            // Brighten noticeably near the cursor
            this.alpha = Math.min(0.95, this.alpha + proximity * 0.55);
          }
        }

        // Boundary wrap: float to the top and regenerate from bottom
        if (this.y < -15) {
          this.reset(false);
        }
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0.1, this.alpha)})`;
        ctx.shadowBlur = this.radius > 2 ? 8 : 4;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let particles = [];
    const initParticles = () => {
      // Determine count based on screen size (keeps high FPS on all screens)
      const count = Math.min(130, Math.max(55, Math.floor(width / 16)));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new AntigravityParticle(true));
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor lerp
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.18;
          mouse.y += (mouse.targetY - mouse.y) * 0.18;
        }
      }

      // Draw interactive connections (constellation threads)
      const pLen = particles.length;
      for (let i = 0; i < pLen; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        // Connect nearby dots
        for (let j = i + 1; j < pLen; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = 95 * 95;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / 95) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }

        // Connect dots to cursor when cursor is active and nearby
        if (mouse.x !== null && mouse.y !== null && mouse.active) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const cursorMaxDistSq = 145 * 145;

          if (distSq < cursorMaxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / 145) * 0.32;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Cursor subtle gravity ripple
      if (mouse.x !== null && mouse.y !== null && mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 24, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 180, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (idleTimeout) clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
