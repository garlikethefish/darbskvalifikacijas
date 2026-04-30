<template>
  <section
    class="site-hero"
    :class="`site-hero--${normalizedVariant}`"
  >
    <div class="hero-wave site-hero-wave" aria-hidden="true"></div>

    <div
      v-if="normalizedVariant === 'statistics'"
      class="hero-chart-line site-hero-chart-line"
      aria-hidden="true"
    >
      <svg class="site-hero-chart-svg" viewBox="0 0 2400 170" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="rgba(255,255,255,0.012)" d="
          M0,88
          L62,88 L70,110 L80,24 L90,152 L98,84 L130,84
          L175,84 L180,92 L188,58 L194,140 L200,80 L240,80
          L310,80 L318,98 L326,12 L338,158 L348,76 L390,76
          L430,76 L436,86 L445,68 L452,104 L460,78 L500,78
          L558,78 L564,116 L574,18 L586,148 L596,82 L640,82
          L685,82 L692,94 L700,44 L710,136 L718,88 L745,88
          L800,88 L808,72 L818,8 L830,162 L840,84 L880,84
          L920,84 L926,108 L934,50 L944,130 L952,80 L990,80
          L1045,80 L1052,90 L1062,26 L1074,154 L1084,78 L1120,78
          L1160,78 L1165,96 L1174,62 L1182,120 L1190,82 L1200,82
          L1200,170 L0,170 Z"/>
        <path fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="square" d="
          M0,88
          L62,88 L70,110 L80,24 L90,152 L98,84 L130,84
          L175,84 L180,92 L188,58 L194,140 L200,80 L240,80
          L310,80 L318,98 L326,12 L338,158 L348,76 L390,76
          L430,76 L436,86 L445,68 L452,104 L460,78 L500,78
          L558,78 L564,116 L574,18 L586,148 L596,82 L640,82
          L685,82 L692,94 L700,44 L710,136 L718,88 L745,88
          L800,88 L808,72 L818,8 L830,162 L840,84 L880,84
          L920,84 L926,108 L934,50 L944,130 L952,80 L990,80
          L1045,80 L1052,90 L1062,26 L1074,154 L1084,78 L1120,78
          L1160,78 L1165,96 L1174,62 L1182,120 L1190,82 L1200,82"/>
        <path fill="rgba(255,255,255,0.012)" d="
          M1200,82
          L1255,82 L1262,106 L1272,30 L1282,150 L1290,86 L1325,86
          L1370,86 L1376,78 L1386,16 L1398,160 L1408,80 L1450,80
          L1495,80 L1502,100 L1512,54 L1522,138 L1530,82 L1565,82
          L1605,82 L1612,90 L1622,42 L1632,128 L1640,84 L1680,84
          L1730,84 L1736,112 L1746,22 L1758,156 L1768,78 L1810,78
          L1855,78 L1860,88 L1870,60 L1878,116 L1886,80 L1920,80
          L1965,80 L1972,70 L1982,10 L1994,164 L2004,82 L2045,82
          L2090,82 L2097,96 L2106,36 L2118,146 L2128,76 L2165,76
          L2210,76 L2216,102 L2226,48 L2236,132 L2244,84 L2280,84
          L2340,84 L2346,90 L2358,32 L2370,154 L2380,88 L2400,88
          L2400,170 L1200,170 Z"/>
        <path fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="square" d="
          M1200,82
          L1255,82 L1262,106 L1272,30 L1282,150 L1290,86 L1325,86
          L1370,86 L1376,78 L1386,16 L1398,160 L1408,80 L1450,80
          L1495,80 L1502,100 L1512,54 L1522,138 L1530,82 L1565,82
          L1605,82 L1612,90 L1622,42 L1632,128 L1640,84 L1680,84
          L1730,84 L1736,112 L1746,22 L1758,156 L1768,78 L1810,78
          L1855,78 L1860,88 L1870,60 L1878,116 L1886,80 L1920,80
          L1965,80 L1972,70 L1982,10 L1994,164 L2004,82 L2045,82
          L2090,82 L2097,96 L2106,36 L2118,146 L2128,76 L2165,76
          L2210,76 L2216,102 L2226,48 L2236,132 L2244,84 L2280,84
          L2340,84 L2346,90 L2358,32 L2370,154 L2380,88 L2400,88"/>
      </svg>
    </div>

    <div
      v-else
      class="site-hero-loop"
      :class="`site-hero-loop--${normalizedVariant}`"
      aria-hidden="true"
    >
      <span v-for="n in 8" :key="n">
        <SvgIcon
          v-if="normalizedVariant === 'quizzes'"
          name="question"
          :size="22"
        />
      </span>
    </div>

    <div class="site-hero-inner">
      <slot />
    </div>
  </section>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue';

const variants = new Set([
  'admin',
  'auth',
  'discover',
  'home',
  'profile',
  'quizzes',
  'review-detail',
  'reviews',
  'series',
  'statistics'
]);

export default {
  name: 'HeroBand',
  components: { SvgIcon },
  props: {
    variant: {
      type: String,
      default: 'home'
    }
  },
  computed: {
    normalizedVariant() {
      return variants.has(this.variant) ? this.variant : 'home';
    }
  }
};
</script>

<style scoped>
.site-hero {
  background: var(--hero-gradient);
  padding: 20px 1.5rem;
  position: relative;
  top: auto;
  z-index: 0;
  overflow: hidden;
  margin-bottom: 0;
  box-shadow: var(--hero-shadow), 0 40px 50px -10px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  isolation: isolate;
}

.site-hero :where(div) {
  display: block;
  width: auto;
  table-layout: auto;
}

.site-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 120% at 10% 50%, rgba(56, 230, 120, 0.12) 0%, transparent 65%),
    radial-gradient(ellipse 50% 120% at 85% 40%, rgba(40, 160, 255, 0.1) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.site-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.04) 30%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.04) 70%,
    transparent 100%
  );
  animation: heroShimmer 5.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 3;
}

.site-hero-wave,
.site-hero-chart-line,
.site-hero-loop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.site-hero-wave {
  z-index: 2;
}

.site-hero-chart-line,
.site-hero-loop {
  z-index: 1;
  overflow: hidden;
}

.site-hero-chart-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  animation: heroChartScroll 36s linear infinite;
  filter: drop-shadow(0 0 4px rgba(200, 255, 210, 0.15));
}

.site-hero-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 4;
  text-align: center;
}

.site-hero--statistics .site-hero-inner {
  max-width: 480px;
}

:deep(.hero-text) {
  display: flex;
  flex-direction: column;
}

:deep(h1) {
  margin: 0 0 12px;
  padding-top: 0;
  font-size: clamp(1.2rem, 2.8vw, 1.9rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0;
  color: var(--text-color);
  text-align: center;
  text-shadow: 0 6px 18px var(--text-shadow-color, rgba(0, 0, 0, 0.45));
  animation: heroTextFloat 5.8s ease-in-out infinite;
}

:deep(p),
:deep(.subtitle),
:deep(.english-subtitle) {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(0.95rem, 1.6vw, 1.125rem);
  line-height: 1.45;
  opacity: 0.9;
  text-align: center;
  animation: heroTextFloat 6.2s ease-in-out infinite;
  animation-delay: -1.8s;
}

:deep(.english-subtitle) {
  margin-bottom: 6px;
  opacity: 0.72;
}

.site-hero-loop span {
  position: absolute;
  display: block;
  border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.13));
  background: var(--glass-bg-soft, rgba(255, 255, 255, 0.018));
  box-shadow: 0 0 18px rgba(112, 233, 116, 0.08);
  animation-duration: 10s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.site-hero-loop span:nth-child(1) { left: 4%; top: 18%; animation-delay: -1s; }
.site-hero-loop span:nth-child(2) { left: 14%; top: 62%; animation-delay: -7s; }
.site-hero-loop span:nth-child(3) { left: 28%; top: 28%; animation-delay: -12s; }
.site-hero-loop span:nth-child(4) { left: 42%; top: 70%; animation-delay: -4s; }
.site-hero-loop span:nth-child(5) { left: 58%; top: 20%; animation-delay: -9s; }
.site-hero-loop span:nth-child(6) { left: 70%; top: 58%; animation-delay: -15s; }
.site-hero-loop span:nth-child(7) { left: 82%; top: 32%; animation-delay: -6s; }
.site-hero-loop span:nth-child(8) { left: 92%; top: 66%; animation-delay: -11s; }

.site-hero-loop--home span,
.site-hero-loop--series span {
  width: 76px;
  height: 42px;
  border-radius: 6px;
  animation-name: heroCardsDrift;
}

.site-hero-loop--series span {
  height: 34px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0 8px, transparent 8px 18px),
    rgba(255, 255, 255, 0.018);
  background-size: 18px 100%;
}

.site-hero-loop--discover span {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.03), 0 0 24px rgba(112, 233, 116, 0.16);
  animation-name: heroRadarDrift;
}

.site-hero-loop--reviews span,
.site-hero-loop--review-detail span {
  width: 120px;
  height: 10px;
  border-radius: 999px;
  transform-origin: left center;
  animation-name: heroLinesDrift;
}

.site-hero-loop--review-detail span {
  width: 90px;
}

.site-hero-loop--review-detail span::after,
.site-hero-loop--profile span::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  right: -14px;
  top: 0;
  background: rgba(112, 233, 116, 0.35);
}

.site-hero-loop--quizzes span {
  width: 38px;
  height: 38px;
  animation-name: heroTilesDrift;
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--text-color) 30%, transparent);
  border: 0;
  background: transparent;
  box-shadow: none;
}

.site-hero-loop--quizzes .svg-icon {
  color: currentColor;
}

.site-hero-loop--profile span {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  animation-name: heroOrbitDrift;
}

.site-hero-loop--auth span {
  width: 92px;
  height: 16px;
  border-radius: 999px;
  animation-name: heroAccessDrift;
}

.site-hero-loop--admin span {
  width: 54px;
  height: 34px;
  border-radius: 4px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    rgba(255, 255, 255, 0.014);
  background-size: 18px 17px;
  animation-name: heroGridDrift;
}

@keyframes heroShimmer {
  0%, 100% { transform: translateX(-34%) skewX(-8deg); opacity: 0.46; }
  50% { transform: translateX(34%) skewX(-8deg); opacity: 0.98; }
}

@keyframes heroChartScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes heroTextFloat {
  0%, 100% { transform: translateY(0) scale(1); filter: saturate(1); }
  50% { transform: translateY(-6px) scale(1.012); filter: saturate(1.08); }
}

@keyframes heroCardsDrift {
  0%, 100% { transform: translate3d(-28px, 10px, 0) rotate(-7deg) scale(0.94); opacity: 0.52; }
  50% { transform: translate3d(30px, -16px, 0) rotate(7deg) scale(1.08); opacity: 0.92; }
}

@keyframes heroRadarDrift {
  0%, 100% { transform: translate3d(-24px, 8px, 0) scale(0.78); opacity: 0.28; }
  50% { transform: translate3d(26px, -18px, 0) scale(1.38); opacity: 0.86; }
}

@keyframes heroLinesDrift {
  0%, 100% { transform: translate3d(-32px, 10px, 0) rotate(-14deg) scaleX(0.88); opacity: 0.48; }
  50% { transform: translate3d(34px, -12px, 0) rotate(14deg) scaleX(1.14); opacity: 0.92; }
}

@keyframes heroTilesDrift {
  0%, 100% { transform: translate3d(-26px, 12px, 0) rotate(-22deg) scale(0.88); opacity: 0.52; }
  50% { transform: translate3d(28px, -20px, 0) rotate(130deg) scale(1.16); opacity: 0.94; }
}

@keyframes heroOrbitDrift {
  0%, 100% { transform: translate3d(-24px, 12px, 0) scale(0.84); opacity: 0.5; }
  50% { transform: translate3d(26px, -24px, 0) scale(1.18); opacity: 0.94; }
}

@keyframes heroAccessDrift {
  0%, 100% { transform: translate3d(-32px, 8px, 0) scaleX(0.68); opacity: 0.28; }
  50% { transform: translate3d(34px, -12px, 0) scaleX(1.34); opacity: 0.86; }
}

@keyframes heroGridDrift {
  0%, 100% { transform: translate3d(-28px, -14px, 0) rotate(-3deg); opacity: 0.5; }
  50% { transform: translate3d(30px, 16px, 0) rotate(3deg); opacity: 0.9; }
}

@media (max-width: 700px) {
  .site-hero {
    padding: 28px 1rem;
    min-height: 130px;
  }

  .site-hero-inner {
    padding: 0 0.75rem;
  }

  :deep(h1) {
    font-size: clamp(1.05rem, 5.2vw, 1.45rem);
  }

  :deep(p),
  :deep(.subtitle),
  :deep(.english-subtitle) {
    font-size: 0.95rem;
  }

  .site-hero-loop span {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-hero::after,
  .site-hero-chart-svg,
  .site-hero-loop span,
  :deep(h1),
  :deep(p),
  :deep(.subtitle),
  :deep(.english-subtitle) {
    animation: none;
  }
}
</style>
