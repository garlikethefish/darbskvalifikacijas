<template>
  <div class="cosmetics-panel">
    <div class="cosmetics-tabs">
      <button
        :class="{ active: activeTab === 'cursor_trail' }"
        @click="activeTab = 'cursor_trail'"
      >
        {{ t('cursorTrails') }}
      </button>
      <button
        :class="{ active: activeTab === 'background_effect' }"
        @click="activeTab = 'background_effect'"
      >
        {{ t('backgroundEffects') }}
      </button>
    </div>

    <!-- Pašlaik aprīkots -->
    <div v-if="equipped" class="equipped-section">
      <span class="equipped-label">{{ t('activeEffect') }}:</span>
      <span class="equipped-name rarity-badge" :class="equipped.rarity">{{ getCosmeticName(equipped) }}</span>
      <button class="unequip-btn" @click="unequip">{{ t('removeEffect') }}</button>
    </div>

    <div class="cosmetics-grid">
      <div
        v-for="item in filteredCatalog"
        :key="item.id"
        class="cosmetic-card"
        :class="{ owned: isOwned(item.id), equipped: isEquipped(item.id), locked: !isOwned(item.id) }"
      >
        <div class="card-preview">
          <div class="preview-circle" :class="item.rarity">
            <SvgIcon v-if="!item.preview_image" :name="getEffectIcon(item.effect_key)" :size="28" />
            <img v-else :src="`/assets/badges/${item.preview_image}`" :alt="getCosmeticName(item)" class="preview-img" />
          </div>
          <div v-if="!isOwned(item.id)" class="lock-overlay">
            <SvgIcon name="lock" :size="20" class="lock-overlay-icon" />
          </div>
          <div v-if="isEquipped(item.id)" class="equipped-badge"><SvgIcon name="check" :size="14" /></div>
        </div>

        <div class="card-info">
          <span class="cosmetic-name">{{ getCosmeticName(item) }}</span>
          <span class="rarity-tag" :class="item.rarity">{{ getRarityLabel(item.rarity) }}</span>
        </div>

        <p v-if="getCosmeticDescription(item)" class="cosmetic-desc">{{ getCosmeticDescription(item) }}</p>

        <!-- Avota norāde bloķētiem vienumiem -->
        <p v-if="item.sources?.length" class="source-hint">
          <span v-for="src in item.sources" :key="src.id">
            <SvgIcon name="target" :size="13" /> {{ getSourceLabel(src) }}
          </span>
        </p>

        <div class="card-actions" v-if="isOwned(item.id)">
          <button v-if="!isEquipped(item.id)" class="equip-btn" @click="equip(item)">{{ t('useThis') }}</button>
          <button v-else class="unequip-btn" @click="unequip">{{ t('removeEffect') }}</button>
        </div>
      </div>

      <div v-if="filteredCatalog.length === 0" class="empty-state">
        {{ t('noCosmeticsAvailable') }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getTranslation, getCurrentLanguage } from '../services/translations.js';
import SvgIcon from './SvgIcon.vue';

const EFFECT_COPY = {
  particle_sparkle: {
    en: ['Sparkle Trail', 'Soft glowing particles follow the cursor.'],
    lv: ['Dzirksteļu pēda', 'Maigas mirdzošas daļiņas seko kursoram.']
  },
  particle_fire: {
    en: ['Fire Trail', 'Warm flame particles follow the cursor.'],
    lv: ['Uguns pēda', 'Siltas liesmu daļiņas seko kursoram.']
  },
  particle_snow: {
    en: ['Snow Trail', 'Cool snow particles drift behind the cursor.'],
    lv: ['Sniega pēda', 'Vēsas sniega daļiņas slīd aiz kursora.']
  },
  glow_smooth: {
    en: ['Smooth Glow', 'A calm glow effect for the page background.'],
    lv: ['Maigs mirdzums', 'Mierīgs mirdzuma efekts lapas fonam.']
  },
  glow_rainbow: {
    en: ['Rainbow Glow', 'A colorful glow effect for the page background.'],
    lv: ['Varavīksnes mirdzums', 'Krāsains mirdzuma efekts lapas fonam.']
  },
  particle_fairydust: {
    en: ['Fairy Dust', 'Bright dust particles sparkle behind the cursor.'],
    lv: ['Pasaku putekļi', 'Spilgtas putekļu daļiņas mirdz aiz kursora.']
  },
  particle_bubble: {
    en: ['Bubble Trail', 'Light bubbles float behind the cursor.'],
    lv: ['Burbuļu pēda', 'Viegli burbuļi paceļas aiz kursora.']
  },
  smooth_wavy: {
    en: ['Wavy Background', 'Smooth waves move across the profile background.'],
    lv: ['Viļņots fons', 'Maigi viļņi kustas profila fonā.']
  },
  flowing_ribbons: {
    en: ['Flowing Ribbons', 'Layered ribbons move through the profile background.'],
    lv: ['Plūstošas lentes', 'Slāņotas lentes kustas profila fonā.']
  },
  rainbow_cursor: {
    en: ['Rainbow Cursor', 'A colorful cursor trail with shifting tones.'],
    lv: ['Varavīksnes kursors', 'Krāsaina kursora pēda ar mainīgiem toņiem.']
  },
  canvas_cursor: {
    en: ['Canvas Cursor', 'A painted cursor trail with soft motion.'],
    lv: ['Audekla kursors', 'Gleznieciska kursora pēda ar maigu kustību.']
  },
  fluid_cursor: {
    en: ['Fluid Cursor', 'A liquid style cursor trail.'],
    lv: ['Plūstošs kursors', 'Šķidruma stila kursora pēda.']
  },
  particles_stars: {
    en: ['Star Field', 'Stars drift across the profile background.'],
    lv: ['Zvaigžņu lauks', 'Zvaigznes slīd pāri profila fonam.']
  },
  particles_bubbles: {
    en: ['Bubble Field', 'Bubbles float through the profile background.'],
    lv: ['Burbuļu lauks', 'Burbuļi paceļas profila fonā.']
  },
  particles_fireflies: {
    en: ['Fireflies', 'Small lights move across the profile background.'],
    lv: ['Spīdvaboles', 'Mazas gaismas kustas profila fonā.']
  },
  pattern_dots: {
    en: ['Dot Pattern', 'A subtle dotted background pattern.'],
    lv: ['Punktu raksts', 'Smalks punktots fona raksts.']
  },
  pattern_waves: {
    en: ['Wave Pattern', 'A subtle wave pattern for the profile background.'],
    lv: ['Viļņu raksts', 'Smalks viļņu raksts profila fonam.']
  },
  pattern_grid: {
    en: ['Grid Pattern', 'A clean grid pattern for the profile background.'],
    lv: ['Režģa raksts', 'Tīrs režģa raksts profila fonam.']
  }
};

const RARITY_KEYS = {
  common: 'rarityCommon',
  rare: 'rarityRare',
  epic: 'rarityEpic',
  legendary: 'rarityLegendary'
};

export default {
  name: 'CosmeticsPanel',
  components: { SvgIcon },
  props: {
    userId: { type: [Number, String], required: true },
    isOwnProfile: { type: Boolean, default: false }
  },
  data() {
    return {
      activeTab: 'cursor_trail',
      catalog: [],
      owned: [],
      activeCosmetics: { cursorTrail: null, backgroundEffect: null },
      loading: false,
      currentLanguage: 'en'
    };
  },
  computed: {
    filteredCatalog() {
      return this.catalog.filter(c => c.type === this.activeTab);
    },
    equipped() {
      if (this.activeTab === 'cursor_trail') return this.activeCosmetics.cursorTrail;
      return this.activeCosmetics.backgroundEffect;
    }
  },
  async mounted() {
    this.currentLanguage = getCurrentLanguage();
    this._languageChangedHandler = (e) => {
      this.currentLanguage = e.detail.language;
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
    await this.loadData();
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  },
  methods: {
    t(key) { return getTranslation(key, this.currentLanguage); },

    async loadData() {
      this.loading = true;
      try {
        const [catalogRes, ownedRes, activeRes] = await Promise.all([
          axios.get('/api/cosmetics/catalog'),
          axios.get(`/api/users/${this.userId}/cosmetics`),
          axios.get(`/api/users/${this.userId}/active-cosmetics`)
        ]);
        this.catalog = catalogRes.data;
        this.owned = ownedRes.data;
        this.activeCosmetics = {
          cursorTrail: activeRes.data.cursorTrail,
          backgroundEffect: activeRes.data.backgroundEffect
        };
      } catch (err) {
        console.error('Failed to load cosmetics:', err);
      }
      this.loading = false;
    },

    isOwned(cosmeticId) {
      return this.owned.some(o => o.id === cosmeticId);
    },

    isEquipped(cosmeticId) {
      const ct = this.activeCosmetics.cursorTrail;
      const bg = this.activeCosmetics.backgroundEffect;
      return (ct && ct.id === cosmeticId) || (bg && bg.id === cosmeticId);
    },

    async equip(item) {
      const auth = JSON.parse(localStorage.getItem('auth') || 'null');
      if (!auth?.user?.id) return;

      try {
        await axios.post(`/api/users/${this.userId}/equip-cosmetic`, {
          cosmeticId: item.id,
          slot: item.type
        }, {
          headers: { Authorization: auth.user.id }
        });

        if (item.type === 'cursor_trail') {
          this.activeCosmetics.cursorTrail = item;
        } else {
          this.activeCosmetics.backgroundEffect = item;
        }

        window.dispatchEvent(new Event('cosmetic-changed'));
      } catch (err) {
        console.error('Failed to equip cosmetic:', err);
      }
    },

    async unequip() {
      const auth = JSON.parse(localStorage.getItem('auth') || 'null');
      if (!auth?.user?.id) return;

      try {
        await axios.post(`/api/users/${this.userId}/unequip-cosmetic`, {
          slot: this.activeTab
        }, {
          headers: { Authorization: auth.user.id }
        });

        if (this.activeTab === 'cursor_trail') {
          this.activeCosmetics.cursorTrail = null;
        } else {
          this.activeCosmetics.backgroundEffect = null;
        }

        window.dispatchEvent(new Event('cosmetic-changed'));
      } catch (err) {
        console.error('Failed to unequip cosmetic:', err);
      }
    },

    getEffectIcon(effectKey) {
      const icons = {
        particle_sparkle: 'sparkle',
        particle_fire: 'bonfire',
        particle_snow: 'snowflake',
        glow_smooth: 'glow',
        glow_rainbow: 'rainbow',
        particle_fairydust: 'magic',
        particle_bubble: 'drops',
        smooth_wavy: 'soundwave',
        flowing_ribbons: 'planet3',
        rainbow_cursor: 'rainbow',
        canvas_cursor: 'magic',
        fluid_cursor: 'drops',
        particles_stars: 'stars',
        particles_bubbles: 'cloud-drops',
        particles_fireflies: 'lightning',
        pattern_dots: 'star-rings',
        pattern_waves: 'water',
        pattern_grid: 'planet3'
      };
      return icons[effectKey] || 'palette';
    },

    getCosmeticName(item) {
      const copy = EFFECT_COPY[item?.effect_key];
      if (!copy) return item?.name || '';
      return copy[this.currentLanguage]?.[0] || copy.en[0] || item?.name || '';
    },

    getCosmeticDescription(item) {
      const copy = EFFECT_COPY[item?.effect_key];
      if (!copy) return item?.description || '';
      return copy[this.currentLanguage]?.[1] || copy.en[1] || item?.description || '';
    },

    getRarityLabel(rarity) {
      return this.t(RARITY_KEYS[rarity] || 'rarityCommon');
    },

    getMilestoneLabel(type, value) {
      const labels = {
        review_count: { en: `Write ${value} reviews`, lv: `Uzraksti ${value} recenzijas` },
        follower_count: { en: `Get ${value} followers`, lv: `Iegūsti ${value} sekotājus` },
        quiz_completions: { en: `Complete ${value} quizzes`, lv: `Izpildi ${value} viktorīnas` }
      };
      const entry = labels[type];
      if (entry) return entry[this.currentLanguage] || entry.en;
      return `${value} ${type}`;
    },

    getSourceLabel(source) {
      if (source.source_type === 'quiz') {
        const title = source.quiz_title || `#${source.quiz_id}`;
        return `${this.t('scoreAtLeast')} ${source.min_score}% ${this.t('inQuiz')} "${title}"`;
      }

      if (source.source_type === 'milestone') {
        return this.getMilestoneLabel(source.milestone_type, source.milestone_value);
      }

      return source.source_type || '';
    }
  }
};
</script>

<style scoped>
.cosmetics-panel {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cosmetics-panel :where(div, span, p) {
  box-sizing: border-box;
  display: revert;
  width: auto;
  table-layout: auto;
}

.cosmetics-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 0;
  width: 100%;
}

.cosmetics-tabs button {
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid rgba(112, 233, 116, 0.28);
  background: rgba(255, 255, 255, 0.045);
  color: var(--text-color);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  white-space: normal;
}

.cosmetics-tabs button.active {
  background: var(--accent-color);
  color: var(--dark-bg-color);
  font-weight: 600;
}

.cosmetics-tabs button:hover:not(.active) {
  background: rgba(112, 233, 116, 0.1);
}

.equipped-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 0;
  padding: 14px 16px;
  background: rgba(112, 233, 116, 0.08);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 12px;
  flex-wrap: wrap;
}

.equipped-label {
  color: var(--subtitle-color);
  font-size: 0.9rem;
}

.equipped-name {
  font-weight: 600;
  margin-right: auto;
}

.cosmetics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
  gap: 18px;
  width: 100%;
  max-width: 100%;
  padding: 8px 2px 2px;
  box-sizing: border-box;
  align-items: stretch;
  overflow: visible;
}
.cosmetic-card {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025)),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.25s;
  position: relative;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  min-height: 250px;
  justify-content: flex-start;
}

.cosmetic-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

:global([data-theme="light"]) .cosmetic-card {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 249, 0.9)),
    linear-gradient(180deg, rgb(255, 255, 255), rgb(248, 252, 251)) !important;
  border: 1px solid rgba(82, 97, 111, 0.36) !important;
  box-shadow:
    0 8px 20px rgba(31, 41, 51, 0.09),
    0 0 0 1px rgba(82, 97, 111, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.75) inset,
    0 1px 0 rgba(255, 255, 255, 0.9) inset !important;
}

:global([data-theme="light"]) .cosmetic-card:hover {
  border-color: rgba(28, 166, 102, 0.42) !important;
  box-shadow:
    0 14px 30px rgba(31, 41, 51, 0.13),
    0 0 0 1px rgba(28, 166, 102, 0.13) inset,
    0 1px 0 rgba(255, 255, 255, 0.86) inset !important;
}

.cosmetic-card.equipped {
  border-color: var(--accent-color);
  box-shadow: 0 0 20px rgba(112, 233, 116, 0.15);
}

:global([data-theme="light"]) .cosmetic-card.equipped {
  border-color: rgba(28, 166, 102, 0.72) !important;
  box-shadow:
    0 14px 30px rgba(31, 41, 51, 0.12),
    0 0 0 1px rgba(28, 166, 102, 0.18) inset,
    0 0 0 3px rgba(28, 166, 102, 0.08) !important;
}

.cosmetic-card.locked {
  opacity: 1;
}

.cosmetic-card.locked .preview-circle,
.cosmetic-card.locked .card-info,
.cosmetic-card.locked .cosmetic-desc,
.cosmetic-card.locked .source-hint {
  opacity: 0.55;
}

.card-preview {
  position: relative;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
}

.preview-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.preview-circle.common { border-color: #9e9e9e; background: rgba(158, 158, 158, 0.1); }
.preview-circle.rare { border-color: #42a5f5; background: rgba(66, 165, 245, 0.1); }
.preview-circle.epic { border-color: #ab47bc; background: rgba(171, 71, 188, 0.1); }
.preview-circle.legendary { border-color: #ffd54f; background: rgba(255, 213, 79, 0.15); box-shadow: 0 0 12px rgba(255, 213, 79, 0.2); }

.preview-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 50%;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  color: rgb(255, 255, 255);
}

.lock-overlay :deep(.svg-icon) {
  color: currentColor;
  overflow: visible;
}

.lock-overlay :deep(svg) {
  overflow: visible;
}

.lock-icon {
  font-size: 1.3rem;
}

:global([data-theme="light"]) .lock-overlay :deep(.lock-overlay-icon),
:global([data-theme="light"]) .lock-overlay :deep(.lock-overlay-icon svg) {
  color: rgb(10, 15, 20) !important;
  filter: none !important;
}


:global([data-theme="light"]) .lock-overlay {
  background: rgba(145, 154, 164, 0.72) !important;
  color: rgb(8, 13, 18) !important;
}

.equipped-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 54px;
  width: 100%;
}

.cosmetic-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
  text-align: center;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.rarity-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.rarity-tag.common, .rarity-badge.common { color: #bdbdbd; }
.rarity-tag.rare, .rarity-badge.rare { color: #42a5f5; }
.rarity-tag.epic, .rarity-badge.epic { color: #ce93d8; }
.rarity-tag.legendary, .rarity-badge.legendary { color: #ffd54f; }

.cosmetic-desc {
  font-size: 0.76rem;
  color: var(--subtitle-color);
  text-align: center;
  margin: 0;
  line-height: 1.35;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.source-hint {
  font-size: 0.72rem;
  color: var(--subtitle-color);
  text-align: center;
  font-style: italic;
  margin: 0;
  line-height: 1.35;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
  overflow-wrap: anywhere;
}

.card-actions {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
}

.equip-btn, .unequip-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 34px;
  width: 100%;
  max-width: 140px;
}

.equip-btn {
  background: var(--accent-color);
  color: var(--dark-bg-color);
}

.equip-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.03);
}

.unequip-btn {
  background: rgba(255, 100, 100, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.unequip-btn:hover {
  background: rgba(255, 100, 100, 0.25);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--subtitle-color);
}
@media (max-width: 600px) {
  .cosmetics-tabs {
    grid-template-columns: 1fr;
  }

  .cosmetics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
