<template>
  <div class="series-container">
    <img :src="getSeriesPictureUrl(series.series_picture)" alt="Series">
    <div class="title-block">
      <div class="title-row">
        <div class="series-card-title">{{ displayTitle }}</div>
        <span
          v-if="showMachineTranslatedBadge"
          class="machine-translation-icon"
          aria-label="machine translated title"
          @mouseenter="showTooltip"
          @mouseleave="hideTooltip"
          @focus="showTooltip"
          @blur="hideTooltip"
          tabindex="0"
        >
          <SvgIcon name="translate" :size="14" />
          <Tooltip :show="tooltip.show" :x="tooltip.x" :y="tooltip.y">
            {{ t('machineTranslatedTitleTooltip') }}
          </Tooltip>
        </span>
      </div>
      <div v-if="showEnglishSubtitle" class="card-subtitle">{{ series.english_title }}</div>
    </div>
    <div class="caption-text">{{ shortDescription }}</div>

    <button class="hover-button" @click="handleReviewClick($event)">{{ t('homeReviewButton') }}</button>
    <LoginPromptModal
      :show="loginPromptVisible"
      :x="promptX"
      :y="promptY"
      :message="t('loginRequiredToReview')"
      :confirmText="t('login')"
      :cancelText="t('cancel')"
      @confirm="onLoginConfirm"
      @cancel="onLoginCancel"
    />

    <router-link :to="`/series/${series.id}`">
      <button class="modal-button">{{ t('homeMoreButton') }}</button>
    </router-link>
  </div>
</template>

<script>
import SvgIcon from './SvgIcon.vue';
import Tooltip from './Tooltip.vue';
import LoginPromptModal from './LoginPromptModal.vue';
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  components: { SvgIcon, Tooltip, LoginPromptModal },
  props: {
    series: { type: Object, required: true }
  },
  data() {
    return {
      currentLanguage: 'en',
      tooltip: {
        show: false,
        x: 0,
        y: 0
      },
      loginPromptVisible: false,
      promptX: null,
      promptY: null
    };
  },
  computed: {
    isLatvian() {
      return String(this.currentLanguage || '').toLowerCase().startsWith('lv');
    },
    isTheBoys() {
      // Exclusion for The Boys
      const english = (this.series?.english_title || this.series?.title || '').trim().toLowerCase();
      return english === 'the boys';
    },
    showMachineTranslatedBadge() {
      // Exclude The Boys from machine translation badge
      if (this.isLatvian && this.isTheBoys) return false;
      return this.isLatvian && !!(this.series?.machine_translated_title || this.series?.machine_translated_series_title);
    },
    displayTitle() {
      // Show 'Zēni' for The Boys in Latvian
      if (this.isLatvian && this.isTheBoys) return 'Zēni';
      return this.series?.title || '';
    },
    showEnglishSubtitle() {
      const localized = (this.series?.title || '').trim();
      const english = (this.series?.english_title || '').trim();
      // Exclude The Boys from subtitle logic
      if (this.isLatvian && this.isTheBoys) return false;
      return this.isLatvian && english && localized && english !== localized;
    },
    shortDescription() {
      const raw = (this.series?.description || '').trim();
      if (!raw || /^[.\u2026\-\s]+$/.test(raw)) {
        return getTranslation('noDescriptionAvailable', this.currentLanguage);
      }
      return raw.length > 100 ? `${raw.substring(0, 100)}...` : raw;
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    getSeriesPictureUrl(path) {
      if (!path) return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
      return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
    },
    showTooltip(e) {
      // Position tooltip below or above the icon, depending on space
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 220;
      const tooltipHeight = 60;
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      x = Math.max(8, Math.min(window.innerWidth - tooltipWidth - 8, x));
      let y = rect.bottom + 10;
      if (y + tooltipHeight > window.innerHeight) {
        y = rect.top - tooltipHeight - 10;
      }
      this.tooltip = {
        show: true,
        x,
        y
      };
    },
    hideTooltip() {
      this.tooltip.show = false;
    }
    ,
    handleReviewClick(e) {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (auth && auth.loggedIn && auth.user && auth.user.id) {
          this.$router.push(`/create-review?seriesId=${this.series.id}`);
          return;
        }
      } catch (err) {
        // ignore parse error and treat as not logged in
      }

      // Not logged in - show custom prompt near the button
      const rect = e.currentTarget.getBoundingClientRect();
      this.promptX = rect.left + rect.width / 2;
      this.promptY = rect.bottom + 10;
      this.loginPromptVisible = true;
    },
    onLoginConfirm() {
      this.loginPromptVisible = false;
      const next = encodeURIComponent(`/create-review?seriesId=${this.series.id}`);
      this.$router.push(`/login?next=${next}`);
    },
    onLoginCancel() {
      this.loginPromptVisible = false;
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this._languageChangedHandler = (e) => {
      this.currentLanguage = e.detail.language;
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  }
};
</script>
<style>
.modal-button{
    position: absolute;
    top: 50px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-color);
    background-color: var(--background-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease; 
    z-index: 2;
}
.series-container {
    position: relative;
    display: inline-block;
    width: 100%; 
    margin: 20px;
    overflow: hidden;
    text-align: center;
}

.series-container img {
    display: block;
    transition: filter 0.3s ease; 
    width: 100%;
    object-fit: cover;
    height: 250px;
}

.title-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  width: auto;
}

.title-block {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 2;
  text-align: left;
  pointer-events: none;
}

.series-card-title {
  color: var(--text-color);
  margin: 0;
  font-size: 30px;
  line-height: 1.08;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
  width:auto;
}

.machine-translation-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgb(255, 255, 255);
  color: var(--accent-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  cursor: help;
  pointer-events: auto;
  position: relative;
  background: rgba(15, 20, 15, 0.72);
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.machine-translation-icon:hover {
  transform: translateY(-1px);
  background: rgba(24, 34, 24, 0.92);
  border-color: var(--accent-color);
}

/* Tooltip is now handled by Tooltip.vue */

.card-subtitle {
  margin-top: 2px;
  margin-bottom: 6px;
  color: var(--subtitle-color);
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.2;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
}

@media (max-width: 500px){
.series-container{
    position: relative;
    display: inline-block;
    width: 100%; 
    margin: 20px;
    overflow: hidden;
    text-align: center;
}
.series-container img {
    display: block;
    transition: filter 0.3s ease; 
    width: 100%;
    object-fit: cover;
    height: 250px;
}
.modal-button{
    position: absolute;
    top: 50px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-color);
    background-color: var(--background-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease; 
    z-index: 2;
}

.modal {
    position: fixed;
    z-index: 100; 
    left: 0;
    top: 0;
    width: 100%;
    overflow: auto; 
    background-color: rgba(0,0,0,0.4); 
  }
  

  .modal-content {
    background-color: var(--background-color);
    color: var(--text-color);
    margin: auto; 
    border: 1px solid #a9b6a8;
    width: 100%; 
    height: auto;
    font-size: 14px;
    font-weight: 500;
  }
  

  .close {
    color: var(--text-color);
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .close:hover,
  .close:focus {
    color: var(--light-bg-color);
    text-decoration: none;
    cursor: pointer;
}
.season-list {
  margin-top: 15px;
}

.season {
  background: var(--dark-bg-color);
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.season-header {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: var(--accent-color);
}

.episode-list {
  list-style: none;
  padding-left: 15px;
}

.episode {
  padding: 3px 0;
  display: flex;
  gap: 6px;
  font-size: 0.95rem;
}

.ep-number {
  font-weight: bold;
  color: var(--text-color);
}

.ep-name {
  flex: 1;
  color: var(--text-color);
}

.ep-date {
  color: var(--subtitle-color);
  font-style: italic;
  font-size: 0.85rem;
}

}
</style>