<template>
  <div class="profile-background-effect" ref="container">
    <canvas ref="canvas" class="bg-canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'ProfileBackground',
  props: {
    effectKey: { type: String, required: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      animFrameId: null,
      particles: [],
      mouse: { x: -1000, y: -1000 },
      time: 0,
      dots: [],
      dpr: 1
    };
  },
  mounted() {
    this.dpr = window.devicePixelRatio || 1;
    this.$nextTick(() => {
      this.initCanvas();
      this._onMove = (e) => {
        const rect = this.$refs.container?.getBoundingClientRect();
        if (rect) {
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        }
      };
      this._onResize = () => this.resizeCanvas();
      document.addEventListener('mousemove', this._onMove);
      window.addEventListener('resize', this._onResize);
      this.animate();
    });
  },
  beforeUnmount() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this._onMove) document.removeEventListener('mousemove', this._onMove);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  },
  methods: {
    initCanvas() {
      this.resizeCanvas();
      if (this.effectKey === 'pattern_dots') this.initDots();
      if (['particles_stars', 'particles_bubbles', 'particles_fireflies'].includes(this.effectKey)) {
        this.initParticles();
      }
    },

    resizeCanvas() {
      const c = this.$refs.canvas;
      const container = this.$refs.container;
      if (!c || !container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      c.width = w * this.dpr;
      c.height = h * this.dpr;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      if (this.effectKey === 'pattern_dots') this.initDots();
    },

    initDots() {
      const c = this.$refs.canvas;
      if (!c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      const spacing = this.config.gridSpacing || 30;
      this.dots = [];
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          this.dots.push({ x, y, originalX: x, originalY: y, phase: Math.random() * Math.PI * 2 });
        }
      }
    },

    initParticles() {
      const c = this.$refs.canvas;
      if (!c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      const count = this.config.count || 60;
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createBgParticle(w, h));
      }
    },

    createBgParticle(w, h) {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * 0.02 + 0.01
      };
    },

    animate() {
      const c = this.$refs.canvas;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const w = c.clientWidth;
      const h = c.clientHeight;

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      this.time += 0.016;

      const key = this.effectKey;
      if (key === 'particles_stars') this.renderStars(ctx, w, h);
      else if (key === 'particles_bubbles') this.renderBubbles(ctx, w, h);
      else if (key === 'particles_fireflies') this.renderFireflies(ctx, w, h);
      else if (key === 'pattern_dots') this.renderDots(ctx, w, h);
      else if (key === 'pattern_waves') this.renderWaves(ctx, w, h);
      else if (key === 'pattern_grid') this.renderGrid(ctx, w, h);
      else if (key === 'smooth_wavy') this.renderSmoothWavy(ctx, w, h);
      else if (key === 'flowing_ribbons') this.renderFlowingRibbons(ctx, w, h);

      this.animFrameId = requestAnimationFrame(() => this.animate());
    },

    // --- STARS ---
    renderStars(ctx, w, h) {
      const color = this.config.color || '255, 255, 200';
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.twinkle;
        const twinkle = 0.5 + Math.sin(p.phase) * 0.5;

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity * twinkle})`;
        ctx.fill();
      }
    },

    // --- BUBBLES ---
    renderBubbles(ctx, w, h) {
      const color = this.config.color || '150, 220, 255';
      for (const p of this.particles) {
        p.x += Math.sin(this.time + p.phase) * 0.3;
        p.y += p.vy;
        p.phase += 0.01;

        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color}, ${p.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = `rgba(${color}, ${p.opacity * 0.15})`;
        ctx.fill();
      }
    },

    // --- FIREFLIES ---
    renderFireflies(ctx, w, h) {
      const color = this.config.color || '200, 255, 100';
      for (const p of this.particles) {
        p.phase += 0.02;
        p.x += Math.sin(this.time * 0.5 + p.phase) * 0.8;
        p.y += Math.cos(this.time * 0.3 + p.phase * 1.3) * 0.6;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const glow = 0.4 + Math.sin(p.phase * 3) * 0.4;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `rgba(${color}, ${glow})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    },

    // --- INTERACTIVE DOTS ---
    renderDots(ctx, w, h) {
      const dotColor = this.config.dotColor || '#70e974';
      const animSpeed = this.config.animationSpeed || 0.005;

      const r = parseInt(dotColor.slice(1, 3), 16) || 112;
      const g = parseInt(dotColor.slice(3, 5), 16) || 233;
      const b = parseInt(dotColor.slice(5, 7), 16) || 116;

      for (const dot of this.dots) {
        const dx = dot.originalX - this.mouse.x;
        const dy = dot.originalY - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        const influence = Math.max(0, 1 - dist / maxDist);

        const baseDotSize = 1.5;
        const dotSize = baseDotSize + influence * 5 + Math.sin(this.time / animSpeed * 0.001 + dot.phase) * 0.4;
        const opacity = Math.max(0.25, 0.4 + influence * 0.5);

        ctx.beginPath();
        ctx.arc(dot.originalX, dot.originalY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      }

      this.time += animSpeed;
    },

    // --- WAVES ---
    renderWaves(ctx, w, h) {
      const color = this.config.color || '112, 233, 116';
      const waves = this.config.waveCount || 4;

      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        const yOff = (h / (waves + 1)) * (i + 1);
        for (let x = 0; x <= w; x += 4) {
          const y = yOff + Math.sin(x * 0.01 + this.time * (0.8 + i * 0.3) + i * 1.5) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${color}, ${0.1 + i * 0.03})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },

    // --- GRID ---
    renderGrid(ctx, w, h) {
      const color = this.config.color || '80, 200, 200';
      const spacing = this.config.gridSpacing || 40;

      ctx.strokeStyle = `rgba(${color}, 0.08)`;
      ctx.lineWidth = 0.5;

      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Glow at intersections near mouse
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          const dx = x - this.mouse.x;
          const dy = y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const intensity = 1 - dist / 150;
            ctx.beginPath();
            ctx.arc(x, y, 3 + intensity * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${intensity * 0.5})`;
            ctx.fill();
          }
        }
      }
    },

    // --- SMOOTH WAVY CANVAS ---
    getMouseInfluence(x, y) {
      const dx = x - this.mouse.x;
      const dy = y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0, 1 - distance / 200);
    },

    renderSmoothWavy(ctx, w, h) {
      const cfg = this.config;
      const primaryColor = cfg.primaryColor || '112, 233, 116';
      const secondaryColor = cfg.secondaryColor || '80, 200, 200';
      const accentColor = cfg.accentColor || '120, 80, 255';
      const lineOpacity = cfg.lineOpacity || 0.8;
      const t = this.time * 0.25;

      // Primary horizontal lines (reduced from 30 to 16, step 6 instead of 3)
      const numPrimary = 16;
      for (let i = 0; i < numPrimary; i++) {
        const yPos = (i / numPrimary) * h;
        const mouseInfl = this.getMouseInfluence(w / 2, yPos);
        const amplitude = 40 + 20 * Math.sin(t * 0.25 + i * 0.15) + mouseInfl * 25;
        const frequency = 0.006 + 0.002 * Math.sin(t * 0.12 + i * 0.08);
        const speed = t * (0.6 + 0.3 * Math.sin(i * 0.12));
        const thickness = 0.6 + 0.4 * Math.sin(t * 4 + i * 0.25) + mouseInfl * 0.8;
        const opacity = (0.1 + 0.06 * Math.abs(Math.sin(t * 0.3 + i * 0.18)) + mouseInfl * 0.12) * lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = `rgba(${primaryColor}, ${opacity})`;

        for (let x = 0; x < w; x += 6) {
          const y = yPos + amplitude * Math.sin(x * frequency + speed);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Secondary vertical lines (reduced from 20 to 10, step 6)
      const numSecondary = 10;
      for (let i = 0; i < numSecondary; i++) {
        const xPos = (i / numSecondary) * w;
        const mouseInfl = this.getMouseInfluence(xPos, h / 2);
        const amplitude = 35 + 18 * Math.sin(t * 0.18 + i * 0.14) + mouseInfl * 20;
        const frequency = 0.007 + 0.003 * Math.cos(t * 0.14 + i * 0.09);
        const speed = t * (0.5 + 0.25 * Math.cos(i * 0.16));
        const thickness = 0.5 + 0.3 * Math.sin(t * 4 + i * 0.35) + mouseInfl * 0.7;
        const opacity = (0.08 + 0.05 * Math.abs(Math.sin(t * 0.28 + i * 0.2)) + mouseInfl * 0.1) * lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = `rgba(${secondaryColor}, ${opacity})`;

        for (let y = 0; y < h; y += 6) {
          const x = xPos + amplitude * Math.sin(y * frequency + speed);
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Accent diagonal lines (reduced from 12 to 6, steps from 80 to 40)
      const numAccent = 6;
      for (let i = 0; i < numAccent; i++) {
        const offset = (i / numAccent) * w * 1.5 - w * 0.25;
        const amplitude = 25 + 12 * Math.cos(t * 0.22 + i * 0.12);
        const phase = t * (0.4 + 0.2 * Math.sin(i * 0.13));
        const thickness = 0.4 + 0.25 * Math.sin(t * 4 + i * 0.28);
        const opacity = (0.05 + 0.03 * Math.abs(Math.sin(t * 0.24 + i * 0.15))) * lineOpacity;

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = `rgba(${accentColor}, ${opacity})`;

        const steps = 40;
        for (let j = 0; j <= steps; j++) {
          const progress = j / steps;
          const baseX = offset + progress * w;
          const baseY = progress * h + amplitude * Math.sin(progress * 6 + phase);
          if (j === 0) ctx.moveTo(baseX, baseY);
          else ctx.lineTo(baseX, baseY);
        }
        ctx.stroke();
      }
    },

    // --- FLOWING RIBBONS ---
    ribbonDeform(x, y, t, progress) {
      const mouseInfl = this.getMouseInfluence(x, y);
      const wave1 = Math.sin(progress * Math.PI * 4 + t * 0.01) * 30;
      const wave2 = Math.sin(progress * Math.PI * 7 - t * 0.008) * 15;
      const harmonic = Math.sin(x * 0.02 + y * 0.015 + t * 0.005) * 10;
      const mouseWave = mouseInfl * Math.sin(t * 0.02 + progress * Math.PI * 2) * 20;
      return {
        offsetX: wave1 + harmonic + mouseWave,
        offsetY: wave2 + mouseWave * 0.5
      };
    },

    renderFlowingRibbons(ctx, w, h) {
      const cfg = this.config;
      const lineColor = cfg.lineColor || 'rgba(112, 233, 116, 0.35)';
      const t = this.time * 18;
      const gridDensity = 30;
      const ribbonWidth = w * 0.9;
      const ribbonOffset = (w - ribbonWidth) / 2;

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let i = 0; i < gridDensity; i++) {
        const x = ribbonOffset + (i / gridDensity) * ribbonWidth;
        ctx.beginPath();
        for (let j = 0; j <= gridDensity; j++) {
          const progress = (j / gridDensity) * 1.2 - 0.1;
          const y = progress * h;
          const { offsetX, offsetY } = this.ribbonDeform(x, y, t, progress);
          if (j === 0) ctx.moveTo(x + offsetX, y + offsetY);
          else ctx.lineTo(x + offsetX, y + offsetY);
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let j = 0; j < gridDensity; j++) {
        const progress = (j / gridDensity) * 1.2 - 0.1;
        const y = progress * h;
        ctx.beginPath();
        for (let i = 0; i <= gridDensity; i++) {
          const x = ribbonOffset + (i / gridDensity) * ribbonWidth;
          const { offsetX, offsetY } = this.ribbonDeform(x, y, t, progress);
          if (i === 0) ctx.moveTo(x + offsetX, y + offsetY);
          else ctx.lineTo(x + offsetX, y + offsetY);
        }
        ctx.stroke();
      }
    }
  }
};
</script>

<style scoped>
.profile-background-effect {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}

.bg-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
