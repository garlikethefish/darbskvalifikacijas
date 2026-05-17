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
      v-else-if="normalizedVariant === 'profile' || normalizedVariant === 'home'"
      class="profile-wave-wrapper"
      aria-hidden="true"
    >
      <div class="profile-wave profile-wave--back"></div>
      <div class="profile-wave profile-wave--front"></div>
    </div>

    <div
      v-else
      class="site-hero-loop"
      :class="`site-hero-loop--${normalizedVariant}`"
      aria-hidden="true"
    >
      <span v-for="n in loopItemCount" :key="n">
        <span
          v-if="normalizedVariant === 'quizzes'"
          class="quiz-question-mark"
        >?</span>
        <SvgIcon
          v-if="normalizedVariant === 'home'"
          name="tv"
          :size="44"
          class="home-tv-icon"
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
    },
    loopItemCount() {
      if (this.normalizedVariant === 'home') return 9;
      if (this.normalizedVariant === 'quizzes') return 5;
      if (this.normalizedVariant === 'profile') return 6;
      if (this.normalizedVariant === 'reviews') return 6;
      return 8;
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
.profile-wave-wrapper,
.site-hero-loop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.site-hero-wave {
  z-index: 2;
}

.site-hero-chart-line,
.profile-wave-wrapper,
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

.profile-wave-wrapper {
  background-image: linear-gradient(to top, rgba(18, 24, 32, 0.32) 0%, rgba(10, 14, 20, 0.12) 100%);
}

.profile-wave {
  width: max(760px, 72vw);
  height: max(760px, 72vw);
  position: absolute;
  top: 24%;
  left: 50%;
  margin-left: calc(max(760px, 72vw) / -2);
  margin-top: calc(max(760px, 72vw) / -2);
  border-radius: 38%;
  background: rgba(28, 38, 50, 0.48);
  box-shadow:
    inset 0 0 120px rgba(112, 233, 116, 0.1),
    0 0 80px rgba(66, 165, 245, 0.08);
  animation: profileWaveRotate 15s infinite linear;
}

.profile-wave--back {
  top: 58%;
  left: 45%;
  border-radius: 44%;
  background: rgba(52, 92, 74, 0.4);
  animation-duration: 22s;
  animation-direction: reverse;
}

.profile-wave--front {
  left: 58%;
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

.site-hero-loop--home span:nth-child(1),
.site-hero-loop--quizzes span:nth-child(1) { left: 5%; top: 22%; }
.site-hero-loop--home span:nth-child(2),
.site-hero-loop--quizzes span:nth-child(2) { left: 26%; top: 66%; }
.site-hero-loop--home span:nth-child(3),
.site-hero-loop--quizzes span:nth-child(3) { left: 48%; top: 24%; }
.site-hero-loop--home span:nth-child(4),
.site-hero-loop--quizzes span:nth-child(4) { left: 70%; top: 68%; }
.site-hero-loop--home span:nth-child(5),
.site-hero-loop--quizzes span:nth-child(5) { left: 90%; top: 30%; }

.site-hero-loop--home span:nth-child(1) { left: 4%; top: 18%; }
.site-hero-loop--home span:nth-child(2) { left: 15%; top: 64%; }
.site-hero-loop--home span:nth-child(3) { left: 27%; top: 30%; }
.site-hero-loop--home span:nth-child(4) { left: 39%; top: 70%; }
.site-hero-loop--home span:nth-child(5) { left: 51%; top: 20%; }
.site-hero-loop--home span:nth-child(6) { left: 63%; top: 62%; }
.site-hero-loop--home span:nth-child(7) { left: 75%; top: 28%; }
.site-hero-loop--home span:nth-child(8) { left: 86%; top: 68%; }
.site-hero-loop--home span:nth-child(9) { left: 94%; top: 34%; }

.site-hero-loop--profile span:nth-child(1),
.site-hero-loop--reviews span:nth-child(1) { left: 4%; top: 24%; }
.site-hero-loop--profile span:nth-child(2),
.site-hero-loop--reviews span:nth-child(2) { left: 22%; top: 64%; }
.site-hero-loop--profile span:nth-child(3),
.site-hero-loop--reviews span:nth-child(3) { left: 40%; top: 26%; }
.site-hero-loop--profile span:nth-child(4),
.site-hero-loop--reviews span:nth-child(4) { left: 58%; top: 68%; }
.site-hero-loop--profile span:nth-child(5),
.site-hero-loop--reviews span:nth-child(5) { left: 76%; top: 24%; }
.site-hero-loop--profile span:nth-child(6),
.site-hero-loop--reviews span:nth-child(6) { left: 92%; top: 62%; }

.site-hero-loop--home span {
  width: 76px;
  height: 76px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
  display: grid;
  place-items: center;
  animation-name: heroLogoSquaresDrift;
}

.site-hero-loop--home span::before {
  content: none;
}

.home-tv-icon {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.38);
  filter: none;
}

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

.site-hero-loop--review-detail span {
  width: 120px;
  height: 10px;
  border-radius: 999px;
  transform-origin: left center;
  animation-name: heroLinesDrift;
}

.site-hero-loop--reviews span {
  width: 168px;
  height: 38px;
  border: 0;
  background: transparent;
  box-shadow: none;
  transform-origin: center;
  animation-name: heroJaggedLinesDrift;
}

.site-hero-loop--reviews span::before,
.site-hero-loop--reviews span::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 14px;
  background: linear-gradient(90deg, rgba(112, 233, 116, 0.1), rgba(255, 255, 255, 0.22), rgba(40, 160, 255, 0.12));
  clip-path: polygon(0 70%, 8% 20%, 16% 74%, 25% 28%, 34% 72%, 43% 18%, 52% 70%, 62% 26%, 72% 76%, 82% 24%, 91% 70%, 100% 34%, 100% 58%, 91% 94%, 82% 48%, 72% 100%, 62% 50%, 52% 94%, 43% 42%, 34% 96%, 25% 52%, 16% 98%, 8% 44%, 0 94%);
  filter: drop-shadow(0 0 9px rgba(112, 233, 116, 0.18));
}

.site-hero-loop--reviews span::before {
  top: 2px;
}

.site-hero-loop--reviews span::after {
  bottom: 2px;
  opacity: 0.46;
  transform: translateX(18px) scaleX(0.76);
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

.site-hero-loop--profile span::after {
  content: '✦';
  width: auto;
  height: auto;
  right: -12px;
  top: -12px;
  border-radius: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 18px;
  line-height: 1;
  animation: heroStarPulse 2.8s ease-in-out infinite;
}

.site-hero-loop--quizzes span {
  width: 72px;
  height: 72px;
  animation-name: heroQuestionDrift;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.quiz-question-mark {
  display: block;
  color: rgba(255, 255, 255, 0.28);
  font-size: 4.2rem;
  line-height: 1;
  font-weight: 900;
  text-shadow: 0 0 22px rgba(112, 233, 116, 0.12);
}

.site-hero-loop--profile span {
  width: 132px;
  height: 36px;
  border: 0;
  background: transparent;
  box-shadow: none;
  animation-name: heroProfileWaveDrift;
}

.site-hero-loop--profile span::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='132' height='36' viewBox='0 0 132 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 20 C14 4 24 4 36 20 S58 36 70 20 S92 4 104 20 S122 36 130 20' fill='none' stroke='%2370e974' stroke-width='3' stroke-linecap='round' opacity='.46'/%3E%3Cpath d='M2 25 C14 9 24 9 36 25 S58 41 70 25 S92 9 104 25 S122 41 130 25' fill='none' stroke='%2342a5f5' stroke-width='2' stroke-linecap='round' opacity='.28'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
  opacity: 0.92;
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

@keyframes profileWaveRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes heroTextFloat {
  0%, 100% { transform: translateY(0) scale(1); filter: saturate(1); }
  50% { transform: translateY(-6px) scale(1.012); filter: saturate(1.08); }
}

@keyframes heroCardsDrift {
  0%, 100% { transform: translate3d(-28px, 10px, 0) rotate(-7deg) scale(0.94); opacity: 0.52; }
  50% { transform: translate3d(30px, -16px, 0) rotate(7deg) scale(1.08); opacity: 0.92; }
}

@keyframes heroLogoSquaresDrift {
  0%, 100% { transform: translate3d(-32px, 12px, 0) rotate(-8deg) scale(0.92); opacity: 0.5; }
  50% { transform: translate3d(34px, -18px, 0) rotate(8deg) scale(1.08); opacity: 0.9; }
}

@keyframes heroRadarDrift {
  0%, 100% { transform: translate3d(-24px, 8px, 0) scale(0.78); opacity: 0.28; }
  50% { transform: translate3d(26px, -18px, 0) scale(1.38); opacity: 0.86; }
}

@keyframes heroLinesDrift {
  0%, 100% { transform: translate3d(-32px, 10px, 0) rotate(-14deg) scaleX(0.88); opacity: 0.48; }
  50% { transform: translate3d(34px, -12px, 0) rotate(14deg) scaleX(1.14); opacity: 0.92; }
}

@keyframes heroJaggedLinesDrift {
  0%, 100% { transform: translate3d(-34px, 12px, 0) rotate(-10deg) scaleX(0.88); opacity: 0.42; }
  50% { transform: translate3d(36px, -14px, 0) rotate(10deg) scaleX(1.08); opacity: 0.88; }
}

@keyframes heroTilesDrift {
  0%, 100% { transform: translate3d(-26px, 12px, 0) rotate(-22deg) scale(0.88); opacity: 0.52; }
  50% { transform: translate3d(28px, -20px, 0) rotate(130deg) scale(1.16); opacity: 0.94; }
}

@keyframes heroQuestionDrift {
  0%, 100% { transform: translate3d(-30px, 14px, 0) rotate(-12deg) scale(0.9); opacity: 0.38; }
  50% { transform: translate3d(34px, -20px, 0) rotate(10deg) scale(1.14); opacity: 0.82; }
}

@keyframes heroOrbitDrift {
  0%, 100% { transform: translate3d(-24px, 12px, 0) scale(0.84); opacity: 0.5; }
  50% { transform: translate3d(26px, -24px, 0) scale(1.18); opacity: 0.94; }
}

@keyframes heroProfileWaveDrift {
  0%, 100% { transform: translate3d(-30px, 10px, 0) rotate(-6deg) scale(0.92); opacity: 0.5; }
  50% { transform: translate3d(32px, -18px, 0) rotate(6deg) scale(1.08); opacity: 0.9; }
}

@keyframes heroStarPulse {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.82); opacity: 0.48; }
  50% { transform: translate3d(4px, -5px, 0) rotate(18deg) scale(1.18); opacity: 0.9; }
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

  .profile-wave-wrapper {
    background-image: linear-gradient(to top, rgba(18, 24, 32, 0.42) 0%, rgba(10, 14, 20, 0.08) 100%);
  }

  .profile-wave {
    width: 280px;
    height: 280px;
    top: 48%;
    left: 55%;
    margin-left: -140px;
    margin-top: -140px;
    background: rgba(36, 58, 70, 0.62);
    box-shadow:
      inset 0 0 54px rgba(112, 233, 116, 0.18),
      0 0 38px rgba(66, 165, 245, 0.18);
  }

  .profile-wave--back {
    width: 320px;
    height: 320px;
    top: 66%;
    left: 42%;
    margin-left: -160px;
    margin-top: -160px;
    background: rgba(72, 124, 92, 0.54);
  }

  .profile-wave--front {
    left: 66%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-hero::after,
  .site-hero-chart-svg,
  .profile-wave,
  .site-hero-loop span,
  :deep(h1),
  :deep(p),
  :deep(.subtitle),
  :deep(.english-subtitle) {
    animation: none;
  }
}
</style>
