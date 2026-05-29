<template>
  <SolarProvider :weight="solarWeight" color="currentColor">
  <header :class="{ scrolled: isScrolled }">
    <div class="header-top">
      <Title @language-change="onLanguageChange" />
    </div>
    <HamburgerMenu :isOpen="isMenuOpen" @toggle="toggleMenu" />
    <NavBar :isMenuOpen="isMenuOpen" @close="closeMenu" />
  </header>

  <main class="layout-wrapper" @click="closeMenu">
    <router-view class="page-content" :key="language" />
  </main>

  <footer>
    <Footer />
  </footer>
  <CustomAlertHost />
  <CursorTrail v-if="activeCursorTrail" :effectKey="activeCursorTrail.effect_key" :config="parsedTrailConfig" />
  </SolarProvider>
</template>

<script>
import NavBar from './components/NavBar.vue'
import HamburgerMenu from './components/HamburgerMenu.vue'
import Title from './components/Title.vue'
import Footer from './components/Footer.vue'
import CursorTrail from './components/CursorTrail.vue'
import LanguageToggle from './components/LanguageToggle.vue'
import CustomAlertHost from './components/CustomAlertHost.vue'
import { getCurrentLanguage } from './services/translations.js'
import axios from 'axios'
import { SolarProvider } from '@solar-icons/vue/lib'
import { solarConfig } from './services/solarConfig.js'

export default {
  components: {
    Title,
    NavBar,
    HamburgerMenu,
    Footer,
    CursorTrail,
    LanguageToggle,
    CustomAlertHost,
    SolarProvider
  },
  computed: {
    solarWeight() {
      return solarConfig.weight;
    },
    parsedTrailConfig() {
      return this.parseCosmeticConfig(this.activeCursorTrail);
    }
  },
  data() {
    return {
      isMenuOpen: false,
      language: 'en',
      isScrolled: false,
      activeCursorTrail: null,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
      }
    },
    onLanguageChange(lang) {
      this.language = lang;
      this.$forceUpdate();
    },
    parseCosmeticConfig(cosmetic) {
      if (!cosmetic) return {};
      const cfg = cosmetic.config;
      if (!cfg) return {};
      if (typeof cfg === 'string') {
        try { return JSON.parse(cfg); } catch { return {}; }
      }
      return cfg;
    },
    async loadActiveCosmetics() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || 'null');
        if (!auth?.loggedIn || !auth?.user?.id) {
          this.activeCursorTrail = null;
          return;
        }
        const { data } = await axios.get(`/api/users/${auth.user.id}/active-cosmetics`);
        this.activeCursorTrail = data.cursorTrail || null;
      } catch {
        this.activeCursorTrail = null;
      }
    },
    initHeaderSpotlight() {
      const header = document.querySelector('header');
      if (!header) return;
      this._headerMoveHandler = (e) => {
        const rect = header.getBoundingClientRect();
        header.style.setProperty('--hx', `${e.clientX - rect.left}px`);
        header.style.setProperty('--hy', `${e.clientY - rect.top}px`);
      };
      this._headerLeaveHandler = () => {
        header.style.setProperty('--hx', '-600px');
        header.style.setProperty('--hy', '-600px');
      };
      header.addEventListener('mousemove', this._headerMoveHandler);
      header.addEventListener('mouseleave', this._headerLeaveHandler);
    },
    initScroll() {
      const doc = document.documentElement;
      const COMPACT_ON = 96;
      const COMPACT_OFF = 12;

      const applyScrollState = () => {
        this._scrollRafPending = false;

        const scrollY = window.scrollY;
        const shouldCompact = this.isScrolled
          ? scrollY > COMPACT_OFF
          : scrollY > COMPACT_ON;

        if (shouldCompact === this.isScrolled) return;

        this.isScrolled = shouldCompact;
        doc.classList.toggle('header-compact', shouldCompact);
      };

      this._scrollHandler = () => {
        if (this._scrollRafPending) return;
        this._scrollRafPending = true;
        requestAnimationFrame(applyScrollState);
      };

      window.addEventListener('scroll', this._scrollHandler, { passive: true });
    },
    initLayoutStabilityWatcher() {
      const doc = document.documentElement;
      let settleTimer = null;
      let lastBodyHeight = 0;

      const markLayoutShifting = () => {
        const nextHeight = document.body.offsetHeight;
        // Ignorē nelielas izmaiņas (piem. kompakta galvene), lai saglabātu gludu ritināšanu
        if (lastBodyHeight > 0 && Math.abs(nextHeight - lastBodyHeight) < 64) {
          return;
        }
        lastBodyHeight = nextHeight;

        doc.classList.add('page-layout-shifting');
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          doc.classList.remove('page-layout-shifting');
          lastBodyHeight = document.body.offsetHeight;
        }, 280);
      };

      lastBodyHeight = document.body.offsetHeight;
      this._layoutSettleTimer = settleTimer;
      this._layoutObserver = new ResizeObserver(markLayoutShifting);
      this._layoutObserver.observe(document.body);
    },
  },
  mounted() {
    this.language = getCurrentLanguage();
    this.$nextTick(() => {
      this.initHeaderSpotlight();
      this.initScroll();
      this.initLayoutStabilityWatcher();
    });
    this.loadActiveCosmetics();
    this._cosmeticHandler = () => this.loadActiveCosmetics();
    window.addEventListener('cosmetic-changed', this._cosmeticHandler);
  },
  beforeUnmount() {
    const header = document.querySelector('header');
    if (header) {
      header.removeEventListener('mousemove', this._headerMoveHandler);
      header.removeEventListener('mouseleave', this._headerLeaveHandler);
    }
    if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler);
    if (this._layoutObserver) this._layoutObserver.disconnect();
    if (this._layoutSettleTimer) clearTimeout(this._layoutSettleTimer);
    if (this._cosmeticHandler) window.removeEventListener('cosmetic-changed', this._cosmeticHandler);
  }
};
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 1000;
  overflow: hidden;
  background:
    linear-gradient(to bottom, transparent 0%, var(--dark-bg-color) 75%),
    linear-gradient(to right, var(--dark-bg-color) 0%, var(--dark-bg-color) 45%, transparent 65%),
    rgba(0, 0, 255, 0.05);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: padding 0.3s cubic-bezier(0.16,0.84,0.24,1);
}

/* Gradienta laukumi — redzami tikai labajā pusē (kreiso pusi sedz vienkrāsains fons) */
header::before {
  content: '';
  position: absolute;
  inset: 0;
  left: 40%;
  bottom: 40%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 80% at 75% 10%, rgba(40, 160, 255, 0.35) 0%, transparent 70%),
    radial-gradient(ellipse 60% 70% at 55% 20%, rgba(56, 230, 120, 0.25) 0%, transparent 65%),
    radial-gradient(ellipse 50% 60% at 45% 5%, rgba(80, 200, 200, 0.18) 0%, transparent 60%);
  filter: blur(28px);
}

header.scrolled {
  padding-top: 0;
  padding-bottom: 0;
}

/* Peles prožektors */
header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle 200px at var(--hx, -600px) var(--hy, -600px), rgba(255,255,255,0.07), transparent 65%);
  pointer-events: none;
  z-index: 0;
}

header > * {
  position: relative;
  z-index: 1;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.page-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
}

@media (max-width: 500px) {
  header {
    overflow: visible;
    padding: 8px 0;
  }

  .header-top {
    padding: 0 8px 0 58px;
  }
}

@media (max-width: 768px) {
  header {
    overflow: visible;
  }
}

:global([data-theme="light"]) header {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
