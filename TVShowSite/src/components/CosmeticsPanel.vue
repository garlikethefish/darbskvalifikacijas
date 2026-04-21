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

    <!-- Currently equipped -->
    <div v-if="equipped" class="equipped-section">
      <span class="equipped-label">{{ t('activeEffect') }}:</span>
      <span class="equipped-name rarity-badge" :class="equipped.rarity">{{ equipped.name }}</span>
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
            <img v-else :src="`/assets/badges/${item.preview_image}`" :alt="item.name" class="preview-img" />
          </div>
          <div v-if="!isOwned(item.id)" class="lock-overlay">
            <SvgIcon name="lock" :size="20" />
          </div>
          <div v-if="isEquipped(item.id)" class="equipped-badge"><SvgIcon name="check" :size="14" /></div>
        </div>

        <div class="card-info">
          <span class="cosmetic-name">{{ item.name }}</span>
          <span class="rarity-tag" :class="item.rarity">{{ item.rarity }}</span>
        </div>

        <p v-if="item.description" class="cosmetic-desc">{{ item.description }}</p>

        <!-- Source hint for locked items -->
        <p v-if="!isOwned(item.id) && item.sources?.length" class="source-hint">
          <span v-for="src in item.sources" :key="src.id">
            <template v-if="src.source_type === 'quiz'">
              🎯 {{ t('scoreAtLeast') }} {{ src.min_score }}% {{ t('inQuiz') }} "{{ src.quiz_title }}"
            </template>
            <template v-else-if="src.source_type === 'milestone'">
              {{ getMilestoneLabel(src.milestone_type, src.milestone_value) }}
            </template>
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
import { getTranslation } from '../services/translations.js';
import SvgIcon from './SvgIcon.vue';

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
      loading: false
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
    await this.loadData();
  },
  methods: {
    t(key) { return getTranslation(key); },

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

    getMilestoneLabel(type, value) {
      const labels = {
        review_count: { en: `Write ${value} reviews`, lv: `Uzraksti ${value} recenzijas` },
        follower_count: { en: `Get ${value} followers`, lv: `Iegūsti ${value} sekotājus` },
        quiz_completions: { en: `Complete ${value} quizzes`, lv: `Izpildi ${value} viktorīnas` }
      };
      const lang = localStorage.getItem('language') || 'en';
      const entry = labels[type];
      if (entry) return entry[lang] || entry.en;
      return `${value} ${type}`;
    }
  }
};
</script>

<style scoped>
.cosmetics-panel {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.cosmetics-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  width:auto;
}

.cosmetics-tabs button {
  padding: 10px 20px;
  border: 1px solid var(--accent-color);
  background: transparent;
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
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
  gap: 10px;
  margin-bottom: 18px;
  padding: 12px 16px;
  background: rgba(112, 233, 116, 0.08);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 10px;
}

.equipped-label {
  color: var(--subtitle-color);
  font-size: 0.9rem;
}

.equipped-name {
  font-weight: 600;
}

.cosmetics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 35px;
  width: 100%;
  box-sizing: border-box;
}
.cosmetic-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
  position: relative;
  min-width: 0;
}

.cosmetic-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.cosmetic-card.equipped {
  border-color: var(--accent-color);
  box-shadow: 0 0 20px rgba(112, 233, 116, 0.15);
}

.cosmetic-card.locked {
  opacity: 0.55;
}

.card-preview {
  position: relative;
  width: 54px;
  height: 54px;
}

.preview-circle {
  width: 54px;
  height: 54px;
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
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 50%;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
}

.lock-icon {
  font-size: 1.3rem;
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
  gap: 4px;
}

.cosmetic-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-color);
  text-align: center;
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
  font-size: 0.7rem;
  color: var(--subtitle-color);
  text-align: center;
  margin: 0;
}

.source-hint {
  font-size: 0.68rem;
  color: var(--subtitle-color);
  text-align: center;
  font-style: italic;
  margin: 0;
}

.card-actions {
  margin-top: 4px;
}

.equip-btn, .unequip-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
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
  .cosmetics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
