<template>
  <canvas ref="canvas" class="cursor-trail-canvas"></canvas>
</template>

<script>
export default {
  name: 'CursorTrail',
  props: {
    effectKey: { type: String, required: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      particles: [],
      mouse: { x: -1000, y: -1000 },
      smoothMouse: { x: -1000, y: -1000 },
      animFrameId: null,
      dpr: 1,
      hue: 0,
      pool: [],
      lastMouse: { x: -1000, y: -1000 },
      // Rainbow cursor
      rainbowParticles: [],
      rainbowInitted: false,
      rainbowTime: 0,
      // Canvas cursor (springy lines)
      canvasLines: [],
      canvasPos: { x: 0, y: 0 },
      canvasInitted: false,
      canvasHue: 0,
      // Fluid cursor
      fluidX: -1000,
      fluidY: -1000
    };
  },
  computed: {
    isTouchOnly() {
      return 'ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches;
    }
  },
  mounted() {
    if (this.isTouchOnly) return;
    this.dpr = window.devicePixelRatio || 1;
    this.resizeCanvas();
    this._onMove = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    this._onResize = () => this.resizeCanvas();
    document.addEventListener('mousemove', this._onMove);
    window.addEventListener('resize', this._onResize);
    this.animate();
  },
  beforeUnmount() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    document.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('resize', this._onResize);
  },
  watch: {
    effectKey() {
      this.particles = [];
      this.pool = [];
    }
  },
  methods: {
    resizeCanvas() {
      const c = this.$refs.canvas;
      if (!c) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w * this.dpr;
      c.height = h * this.dpr;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
    },

    getParticle(x, y, vx, vy, life, size, color, opacity) {
      let p = this.pool.pop();
      if (!p) p = {};
      p.x = x; p.y = y; p.vx = vx; p.vy = vy;
      p.life = life; p.maxLife = life;
      p.size = size; p.color = color; p.opacity = opacity;
      return p;
    },

    recycleParticle(p) {
      if (this.pool.length < 300) this.pool.push(p);
    },

    animate() {
      const c = this.$refs.canvas;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      const w = c.width / this.dpr;
      const h = c.height / this.dpr;

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const key = this.effectKey;
      if (key === 'particle_sparkle') this.renderSparkle(ctx);
      else if (key === 'particle_fire') this.renderFire(ctx);
      else if (key === 'particle_snow') this.renderSnow(ctx);
      else if (key === 'glow_smooth') this.renderGlowSmooth(ctx);
      else if (key === 'glow_rainbow') this.renderGlowRainbow(ctx);
      else if (key === 'particle_fairydust') this.renderFairyDust(ctx);
      else if (key === 'particle_bubble') this.renderBubbleCursor(ctx);
      else if (key === 'rainbow_cursor') this.renderRainbowCursor(ctx);
      else if (key === 'canvas_cursor') this.renderCanvasCursor(ctx);
      else if (key === 'fluid_cursor') this.renderFluidCursor(ctx);

      this.animFrameId = requestAnimationFrame(() => this.animate());
    },

    // --- PARTICLE SPARKLE ---
    renderSparkle(ctx) {
      const cfg = this.config;
      const color = cfg.color || '170, 255, 200';
      const spawnRate = cfg.spawnRate || 3;
      const maxSize = cfg.maxSize || 4;

      for (let i = 0; i < spawnRate; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.particles.push(this.getParticle(
          this.mouse.x, this.mouse.y,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          30 + Math.random() * 30,
          Math.random() * maxSize + 1,
          color,
          1
        ));
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.opacity = p.life / p.maxLife;
        p.size *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- PARTICLE FIRE ---
    renderFire(ctx) {
      const cfg = this.config;
      const spawnRate = cfg.spawnRate || 4;

      for (let i = 0; i < spawnRate; i++) {
        const hue = 15 + Math.random() * 30;
        this.particles.push(this.getParticle(
          this.mouse.x + (Math.random() - 0.5) * 10,
          this.mouse.y,
          (Math.random() - 0.5) * 1.2,
          -(Math.random() * 2 + 1),
          25 + Math.random() * 20,
          Math.random() * 5 + 2,
          `${hue}`,
          1
        ));
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.98;
        p.life--;
        p.opacity = p.life / p.maxLife;
        p.size *= 0.96;

        const sat = 100;
        const light = 40 + (1 - p.opacity) * 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, ${sat}%, ${light}%, ${p.opacity})`;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- PARTICLE SNOW ---
    renderSnow(ctx) {
      const cfg = this.config;
      const spawnRate = cfg.spawnRate || 2;

      for (let i = 0; i < spawnRate; i++) {
        this.particles.push(this.getParticle(
          this.mouse.x + (Math.random() - 0.5) * 20,
          this.mouse.y,
          (Math.random() - 0.5) * 0.8,
          Math.random() * 1.5 + 0.5,
          50 + Math.random() * 40,
          Math.random() * 3 + 1,
          '255, 255, 255',
          0.8
        ));
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(p.life * 0.1) * 0.3;
        p.y += p.vy;
        p.life--;
        p.opacity = (p.life / p.maxLife) * 0.8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- GLOW SMOOTH (fluid cursor) ---
    renderGlowSmooth(ctx) {
      const cfg = this.config;
      const color = cfg.color || '112, 233, 116';
      const size = cfg.size || 30;
      const lerp = cfg.lerp || 0.15;

      this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * lerp;
      this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * lerp;

      const gradient = ctx.createRadialGradient(
        this.smoothMouse.x, this.smoothMouse.y, 0,
        this.smoothMouse.x, this.smoothMouse.y, size
      );
      gradient.addColorStop(0, `rgba(${color}, 0.6)`);
      gradient.addColorStop(0.4, `rgba(${color}, 0.2)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);

      ctx.beginPath();
      ctx.arc(this.smoothMouse.x, this.smoothMouse.y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Leave a short trail of fading dots
      for (let i = 0; i < 2; i++) {
        this.particles.push(this.getParticle(
          this.smoothMouse.x, this.smoothMouse.y,
          0, 0,
          20,
          size * 0.6,
          color,
          0.3
        ));
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life--;
        p.opacity = (p.life / p.maxLife) * 0.3;
        p.size *= 0.97;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(${p.color}, ${p.opacity})`);
        g.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- GLOW RAINBOW ---
    renderGlowRainbow(ctx) {
      const cfg = this.config;
      const size = cfg.size || 35;
      const speed = cfg.speed || 2;
      const lerp = cfg.lerp || 0.12;

      this.hue = (this.hue + speed) % 360;
      this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * lerp;
      this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * lerp;

      const gradient = ctx.createRadialGradient(
        this.smoothMouse.x, this.smoothMouse.y, 0,
        this.smoothMouse.x, this.smoothMouse.y, size
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 65%, 0.6)`);
      gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 65%, 0.15)`);
      gradient.addColorStop(1, `hsla(${this.hue}, 100%, 65%, 0)`);

      ctx.beginPath();
      ctx.arc(this.smoothMouse.x, this.smoothMouse.y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Rainbow trail particles
      this.particles.push(this.getParticle(
        this.smoothMouse.x, this.smoothMouse.y,
        0, 0,
        25,
        size * 0.5,
        `${this.hue}`,
        0.4
      ));

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life--;
        p.opacity = (p.life / p.maxLife) * 0.4;
        p.size *= 0.96;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, 100%, 65%, ${p.opacity})`;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- FAIRY DUST ---
    renderFairyDust(ctx) {
      const cfg = this.config;
      const colors = cfg.colors || ['#D61C59', '#E7D84B', '#1B8798', '#70e974'];
      const chars = cfg.characters || ['✨', '⭐', '🌟', '★', '·'];
      const particleSize = cfg.size || 18;
      const gravity = cfg.gravity || 0.02;

      const dx = this.mouse.x - this.lastMouse.x;
      const dy = this.mouse.y - this.lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;

      if (dist > 2) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const vx = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1.5 + 0.5);
        const vy = -(Math.random() * 1.5);
        const p = this.getParticle(
          this.mouse.x, this.mouse.y,
          vx, vy,
          100, particleSize, color, 1
        );
        p.char = char;
        p.gravity = gravity;
        this.particles.push(p);
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += (p.gravity || gravity);
        p.life--;
        const scale = Math.max(p.life / p.maxLife, 0);

        ctx.save();
        ctx.font = `${p.size * scale}px serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = scale;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char || '✨', p.x, p.y);
        ctx.restore();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- BUBBLE CURSOR ---
    renderBubbleCursor(ctx) {
      const cfg = this.config;
      const fillColor = cfg.fillColor || '#e6f1f7';
      const strokeColor = cfg.strokeColor || '#3a92c5';

      const dx = this.mouse.x - this.lastMouse.x;
      const dy = this.mouse.y - this.lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;

      if (dist > 4) {
        const lifeSpan = Math.floor(Math.random() * 60 + 60);
        const p = this.getParticle(
          this.mouse.x, this.mouse.y,
          (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
          -0.4 + Math.random() * -1,
          lifeSpan, 4, fillColor, 1
        );
        p.strokeColor = strokeColor;
        this.particles.push(p);
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
        p.vy -= Math.random() / 600;
        p.life--;

        const scale = 0.2 + (p.maxLife - p.life) / p.maxLife;
        const radius = p.size * scale;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.strokeColor || strokeColor;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    },

    // --- RAINBOW CURSOR ---
    interpolateColors(c1, c2, factor) {
      const r1 = parseInt(c1.substr(1, 2), 16);
      const g1 = parseInt(c1.substr(3, 2), 16);
      const b1 = parseInt(c1.substr(5, 2), 16);
      const r2 = parseInt(c2.substr(1, 2), 16);
      const g2 = parseInt(c2.substr(3, 2), 16);
      const b2 = parseInt(c2.substr(5, 2), 16);
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    },

    renderRainbowCursor(ctx) {
      const cfg = this.config;
      const length = cfg.length || 20;
      const colors = cfg.colors || ['#FE0000', '#FD8C00', '#FFE500', '#119F0B', '#0644B3', '#C22EDC'];
      const size = cfg.size || 3;
      const trailSpeed = cfg.trailSpeed || 0.4;
      const colorCycleSpeed = cfg.colorCycleSpeed || 0.002;
      const pulseSpeed = cfg.pulseSpeed || 0.01;
      const pulseMin = cfg.pulseMin || 0.8;
      const pulseMax = cfg.pulseMax || 1.2;

      if (!this.rainbowInitted && this.mouse.x > -999) {
        this.rainbowInitted = true;
        this.rainbowParticles = [];
        for (let i = 0; i < length; i++) {
          this.rainbowParticles.push({ x: this.mouse.x, y: this.mouse.y });
        }
      }
      if (!this.rainbowInitted) return;

      const particleSets = [];
      let x = this.mouse.x;
      let y = this.mouse.y;

      for (let i = 0; i < this.rainbowParticles.length; i++) {
        const p = this.rainbowParticles[i];
        const next = this.rainbowParticles[i + 1] || this.rainbowParticles[0];
        p.x = x;
        p.y = y;
        particleSets.push({ x, y });
        x += (next.x - p.x) * trailSpeed;
        y += (next.y - p.y) * trailSpeed;
      }

      this.rainbowTime += colorCycleSpeed;
      const colorOffset = this.rainbowTime % 1;
      const pulse = Math.sin(this.rainbowTime * pulseSpeed);
      const currentSize = size * (pulseMin + ((pulse + 1) * (pulseMax - pulseMin)) / 2);

      for (let ci = 0; ci < colors.length; ci++) {
        const nextColor = colors[(ci + 1) % colors.length];
        ctx.beginPath();
        ctx.strokeStyle = this.interpolateColors(colors[ci], nextColor, (ci + colorOffset) / colors.length);

        if (particleSets.length) {
          ctx.moveTo(particleSets[0].x, particleSets[0].y + ci * (currentSize - 1));
        }
        for (let pi = 1; pi < particleSets.length; pi++) {
          ctx.lineTo(particleSets[pi].x, particleSets[pi].y + ci * currentSize);
        }
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    },

    // --- CANVAS CURSOR (springy trailing lines) ---
    renderCanvasCursor(ctx) {
      const cfg = this.config;
      const trails = cfg.trails || 20;
      const nodeCount = cfg.size || 50;
      const friction = cfg.friction || 0.5;
      const dampening = cfg.dampening || 0.25;
      const tension = cfg.tension || 0.98;

      if (!this.canvasInitted && this.mouse.x > -999) {
        this.canvasInitted = true;
        this.canvasPos = { x: this.mouse.x, y: this.mouse.y };
        this.canvasLines = [];
        for (let i = 0; i < trails; i++) {
          const spring = 0.4 + (i / trails) * 0.025 + 0.1 * Math.random() - 0.02;
          const fric = friction + 0.01 * Math.random() - 0.002;
          const nodes = [];
          for (let n = 0; n < nodeCount; n++) {
            nodes.push({ x: this.mouse.x, y: this.mouse.y, vx: 0, vy: 0 });
          }
          this.canvasLines.push({ spring, friction: fric, nodes });
        }
      }
      if (!this.canvasInitted) return;

      this.canvasPos.x = this.mouse.x;
      this.canvasPos.y = this.mouse.y;

      this.canvasHue = (this.canvasHue + 0.5) % 360;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `hsla(${Math.round(this.canvasHue)}, 50%, 50%, 0.2)`;
      ctx.lineWidth = 1;

      for (const line of this.canvasLines) {
        const nodes = line.nodes;
        let e = line.spring;

        // First node follows cursor
        nodes[0].vx += (this.canvasPos.x - nodes[0].x) * e;
        nodes[0].vy += (this.canvasPos.y - nodes[0].y) * e;

        for (let i = 0; i < nodes.length; i++) {
          const t = nodes[i];
          if (i > 0) {
            const prev = nodes[i - 1];
            t.vx += (prev.x - t.x) * e;
            t.vy += (prev.y - t.y) * e;
            t.vx += prev.vx * dampening;
            t.vy += prev.vy * dampening;
          }
          t.vx *= line.friction;
          t.vy *= line.friction;
          t.x += t.vx;
          t.y += t.vy;
          e *= tension;
        }

        // Draw curved line
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        for (let i = 1; i < nodes.length - 2; i++) {
          const nx = 0.5 * (nodes[i].x + nodes[i + 1].x);
          const ny = 0.5 * (nodes[i].y + nodes[i + 1].y);
          ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, nx, ny);
        }
        const last = nodes[nodes.length - 2];
        const end = nodes[nodes.length - 1];
        ctx.quadraticCurveTo(last.x, last.y, end.x, end.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
    },

    // --- FLUID CURSOR ---
    renderFluidCursor(ctx) {
      const cfg = this.config;
      const color = cfg.color || '112, 233, 116';
      const size = cfg.size || 24;
      const lerp = cfg.lerp || 0.1;
      const trailLength = cfg.trailLength || 12;

      this.fluidX += (this.mouse.x - this.fluidX) * lerp;
      this.fluidY += (this.mouse.y - this.fluidY) * lerp;

      // Spawn trail blobs
      const dx = this.mouse.x - this.fluidX;
      const dy = this.mouse.y - this.fluidY;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      const stretch = Math.min(velocity * 0.3, size * 0.8);

      // Main blob
      const angle = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(this.fluidX, this.fluidY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, size + stretch, Math.max(size - stretch * 0.3, size * 0.5), 0, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size + stretch);
      grad.addColorStop(0, `rgba(${color}, 0.5)`);
      grad.addColorStop(0.6, `rgba(${color}, 0.2)`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Trail particles
      if (velocity > 1) {
        for (let i = 0; i < 2; i++) {
          this.particles.push(this.getParticle(
            this.fluidX + (Math.random() - 0.5) * size,
            this.fluidY + (Math.random() - 0.5) * size,
            -dx * 0.02 + (Math.random() - 0.5) * 0.5,
            -dy * 0.02 + (Math.random() - 0.5) * 0.5,
            trailLength + Math.random() * 10,
            size * 0.4 + Math.random() * size * 0.3,
            color,
            0.3
          ));
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life--;
        p.opacity = (p.life / p.maxLife) * 0.3;
        p.size *= 0.97;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(${p.color}, ${p.opacity})`);
        g.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        if (p.life <= 0) {
          this.recycleParticle(p);
          this.particles.splice(i, 1);
        }
      }
    }
  }
};
</script>

<style scoped>
.cursor-trail-canvas {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>
