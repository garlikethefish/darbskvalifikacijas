<template>
  <teleport to="body">
    <div v-if="show" class="login-prompt-teleport" @click.self="onCancel">
      <div class="login-prompt" :style="promptStyle" role="dialog" aria-modal="true">
      <div class="prompt-message">{{ messageText }}</div>
        <div class="prompt-actions">
          <button class="btn primary" @click="onConfirm">{{ confirmText || t('login') }}</button>
          <button class="btn" @click="onCancel">{{ cancelText || t('cancel') }}</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  name: 'LoginPromptModal',
  emits: ['confirm', 'cancel'],
  props: {
    show: { type: Boolean, default: false },
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    message: { type: String, default: '' },
    confirmText: { type: String, default: '' },
    cancelText: { type: String, default: '' }
  },
  data() {
    return {
      currentLanguage: getCurrentLanguage()
    };
  },
  methods: {
    onConfirm() {
      this.$emit('confirm');
    },
    onCancel() {
      this.$emit('cancel');
    },
    t(key) {
      return getTranslation(key, this.currentLanguage);
    }
  },
  computed: {
    promptStyle() {
      if (this.x !== null && this.y !== null) {
        return {
          position: 'fixed',
          left: `${this.x}px`,
          top: `${this.y}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 99999
        };
      }
      return {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999
      };
    },
    messageText() {
      return this.message || this.t('loginRequiredToReview');
    }
  },
  mounted() {
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

<style scoped>
.login-prompt-teleport {
  position: fixed;
  inset: 0;
  z-index: 99998;
}
.login-prompt {
  min-width: 220px;
  max-width: 360px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(0,0,0,0.95);
  border: 2px solid var(--accent-color, #70e974);
  color: #fff;
  box-shadow: 0 12px 32px rgba(0,0,0,0.55), 0 0 0 2px var(--accent-color, #70e974);
  text-align: center;
  font-weight: 600;
}
.prompt-message {
  margin-bottom: 10px;
  font-size: 0.95rem;
}
.prompt-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #fff;
  cursor: pointer;
}
.btn.primary {
  background: var(--accent-color, #70e974);
  color: #022;
  font-weight: 700;
}
</style>
