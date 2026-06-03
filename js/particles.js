/* ============================================
   OneKlyx Particle Network — Canvas Animation
   Dark navy background with electric blue nodes
   that react to mouse movement
   ============================================ */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    
    // Configuration
    this.config = {
      particleCount: 80,
      particleSize: { min: 1, max: 2.5 },
      speed: 0.3,
      connectionDistance: 160,
      mouseConnectionDistance: 200,
      colors: {
        particle: 'rgba(0, 102, 255, 0.6)',
        particleGlow: 'rgba(0, 102, 255, 0.8)',
        connection: 'rgba(0, 102, 255, {opacity})',
        mouseConnection: 'rgba(0, 212, 255, {opacity})',
      }
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(
      this.config.particleCount,
      Math.floor((this.canvas.width * this.canvas.height) / 12000)
    );

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2, // For pulsating effect
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Touch support
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((p, i) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      // Bounce off edges
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Keep within bounds
      p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      p.y = Math.max(0, Math.min(this.canvas.height, p.y));

      // Mouse interaction — gentle attraction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius * 0.01;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Speed dampening
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > this.config.speed * 3) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        }
      }

      // Pulsating size
      const pulseSize = p.size + Math.sin(p.pulse) * 0.5;

      // Draw particle with glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.colors.particle;
      this.ctx.fill();

      // Subtle glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulseSize * 2, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 3);
      gradient.addColorStop(0, 'rgba(0, 102, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Draw connections to nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 102, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }

      // Draw connection to mouse
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.mouseConnectionDistance) {
          const opacity = (1 - dist / this.config.mouseConnectionDistance) * 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ParticleNetwork('particle-canvas');
});
