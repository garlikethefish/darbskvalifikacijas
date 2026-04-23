<template>
  <div class="avatar-maker">
    <!-- Presets -->
    <div class="presets-row">
      <span class="presets-label">Presets:</span>
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="preset-btn"
        @click="applyPreset(preset)"
      >{{ preset.name }}</button>
      <button class="preset-btn preset-clear" @click="clearAll">Clear</button>
    </div>

    <!-- Preview -->
    <div class="avatar-preview-area">
      <div class="avatar-preview-box" ref="previewBox">
        <img
          v-for="layer in layerOrder"
          :key="layer"
          v-show="selectedParts[layer]"
          :src="getPartUrl(layer, selectedParts[layer])"
          class="avatar-layer"
          crossorigin="anonymous"
        />
        <div v-if="!hasAnyPart" class="empty-preview">
          <span>Select parts below</span>
        </div>
      </div>
      <canvas ref="compositeCanvas" width="512" height="512" style="display:none;"></canvas>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="['cat-tab', { active: activeCategory === cat.key }]"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Part Options -->
    <div class="part-options-grid">
      <div
        v-if="optionalCategories.includes(activeCategory)"
        class="part-option none-opt"
        :class="{ selected: !selectedParts[activeCategory] }"
        @click="selectPart(activeCategory, null)"
      >
        <div class="none-x">✕</div>
        <span>None</span>
      </div>
      <div
        v-for="part in availableParts[activeCategory] || []"
        :key="part"
        class="part-option"
        :class="{ selected: selectedParts[activeCategory] === part }"
        @click="selectPart(activeCategory, part)"
      >
        <img :src="getPartUrl(activeCategory, part)" :alt="formatPartName(part)" />
        <span>{{ formatPartName(part) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="avatar-actions">
      <button class="save-avatar-btn" @click="saveAvatar" :disabled="isSaving || !allRequiredSelected">
        <span v-if="!isSaving">Save Avatar</span>
        <span v-else>Saving...</span>
      </button>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: 'AvatarMaker',
  props: {
    userId: { type: [Number, String], required: true }
  },
  emits: ['saved'],
  data() {
    return {
      activeCategory: 'background',
      layerOrder: ['background', 'background_gradient', 'body_color', 'body_outline', 'eyes'],
      categories: [
        { key: 'background', label: 'Background' },
        { key: 'background_gradient', label: 'Gradient' },
        { key: 'body_color', label: 'Body' },
        { key: 'body_outline', label: 'Outline' },
        { key: 'eyes', label: 'Eyes' }
      ],
      selectedParts: {
        background: null,
        background_gradient: null,
        body_color: null,
        body_outline: null,
        eyes: null
      },
      availableParts: {
        background: [],
        background_gradient: [],
        body_color: [],
        body_outline: [],
        eyes: []
      },
      presets: [
        {
          name: 'Cool Blue',
          config: {
            background: 'bg_blue.png',
            background_gradient: 'bg_blue_gradient.png',
            body_color: 'body_green_blue.png',
            body_outline: 'body_outline_green_blue.png',
            eyes: 'eyes_wink_green.png'
          }
        },
        {
          name: 'Pink Dream',
          config: {
            background: 'bg_pink.png',
            background_gradient: 'bg_pink_gradient.png',
            body_color: 'body_pink_red.png',
            body_outline: 'body_outline_pink_red.png',
            eyes: 'eyes_open_pink.png'
          }
        }
      ],
      isSaving: false,
      currentLanguage: 'en',
      requiredCategories: ['background', 'body_color', 'body_outline', 'eyes'],
      optionalCategories: ['background_gradient']
    };
  },
  computed: {
    hasAnyPart() {
      return Object.values(this.selectedParts).some(v => v !== null);
    },
    allRequiredSelected() {
      return this.requiredCategories.every(cat => this.selectedParts[cat] !== null);
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    getPartUrl(category, filename) {
      if (!filename) return '';
      return `/assets/profile_parts/${category}/${filename}`;
    },
    formatPartName(filename) {
      if (!filename) return '';
      return filename
        .replace(/\.\w+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    },
    selectPart(category, filename) {
      if (filename === null && this.requiredCategories.includes(category)) return;
      this.selectedParts[category] = filename;
    },
    applyPreset(preset) {
      for (const key of this.layerOrder) {
        this.selectedParts[key] = preset.config[key] || null;
      }
    },
    clearAll() {
      for (const key of this.optionalCategories) {
        this.selectedParts[key] = null;
      }
    },
    autoSelectDefaults() {
      for (const cat of this.requiredCategories) {
        if (!this.selectedParts[cat] && this.availableParts[cat]?.length) {
          this.selectedParts[cat] = this.availableParts[cat][0];
        }
      }
    },
    async loadAvailableParts() {
      try {
        const res = await fetch('/api/avatar-parts');
        if (res.ok) {
          const data = await res.json();
          this.availableParts = data;
          this.autoSelectDefaults();
        }
      } catch (err) {
        console.error('Failed to load avatar parts:', err);
      }
    },
    async loadAvatarConfig() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.userId}/avatar-config`, {
          headers: { 'Authorization': auth.user.id.toString() }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            for (const key of this.layerOrder) {
              if (data.config[key]) {
                this.selectedParts[key] = data.config[key];
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load avatar config:', err);
      }
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    },
    async saveAvatar() {
      this.isSaving = true;
      try {
        const canvas = this.$refs.compositeCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);

        // Draw each selected layer in order
        for (const layer of this.layerOrder) {
          const filename = this.selectedParts[layer];
          if (filename) {
            const url = this.getPartUrl(layer, filename);
            const img = await this.loadImage(url);
            ctx.drawImage(img, 0, 0, 512, 512);
          }
        }

        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        // Upload via existing profile picture endpoint
        const auth = JSON.parse(localStorage.getItem('auth'));
        const formData = new FormData();
        formData.append('profilePicture', blob, 'avatar.png');

        const uploadRes = await fetch(`/api/users/${this.userId}/profile-picture`, {
          method: 'POST',
          headers: { 'Authorization': auth.user.id.toString() },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload avatar');
        const uploadData = await uploadRes.json();

        // Save avatar config for future editing
        await fetch(`/api/users/${this.userId}/avatar-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ config: this.selectedParts })
        });

        this.$emit('saved', uploadData.profilePicture);
      } catch (err) {
        console.error('Failed to save avatar:', err);
        alert(this.t('avatarSaveError'));
      } finally {
        this.isSaving = false;
      }
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.loadAvailableParts();
    this.loadAvatarConfig();
  }
};
</script>

<style scoped>
.avatar-maker {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Presets */
.presets-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.presets-label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.preset-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 2px solid var(--accent-color);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.25s ease;
}

.preset-btn:hover {
  background: var(--accent-color);
  color: var(--dark-bg-color);
}

.preset-clear {
  border-color: #c44;
}

.preset-clear:hover {
  background: #c44;
  color: #fff;
}

/* Preview */
.avatar-preview-area {
  display: flex;
  justify-content: center;
}

.avatar-preview-box {
  width: 180px;
  height: 180px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--accent-color);
  background: var(--medium-bg-color);
}

.avatar-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--subtitle-color);
  font-size: 0.95rem;
  text-align: center;
  padding: 10px;
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cat-tab {
  padding: 8px 18px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.cat-tab:hover {
  border-color: var(--accent-color);
}

.cat-tab.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: var(--dark-bg-color);
}

/* Part Options */
.part-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
}

.part-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: var(--dark-bg-color);
  cursor: pointer;
  transition: all 0.25s ease;
}

.part-option:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.part-option.selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.25);
  background: rgba(112, 233, 116, 0.08);
}

.part-option img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 6px;
  background: var(--medium-bg-color);
}

.part-option span {
  font-size: 0.75rem;
  color: var(--subtitle-color);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.none-opt {
  justify-content: center;
}

.none-x {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--subtitle-color);
  background: var(--medium-bg-color);
  border-radius: 6px;
}

/* Actions */
.avatar-actions {
  display: flex;
  justify-content: center;
}

.save-avatar-btn {
  padding: 12px 36px;
  border-radius: 8px;
  border: none;
  background: var(--accent-color);
  color: var(--dark-bg-color);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-avatar-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(112, 233, 116, 0.3);
}

.save-avatar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .avatar-preview-box {
    width: 140px;
    height: 140px;
  }

  .part-options-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .part-option img {
    width: 60px;
    height: 60px;
  }

  .none-x {
    width: 60px;
    height: 60px;
  }
}
</style>
