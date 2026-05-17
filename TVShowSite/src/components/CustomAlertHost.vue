<template>
  <Tooltip :show="state.visible" modal @backdrop="handleBackdrop">
    <div class="custom-alert-shell" @keydown.esc.prevent="cancel">
      <h2 class="custom-alert-title">
        <SvgIcon
          v-if="state.type === 'alert'"
          name="danger"
          :size="24"
          weight="Bold"
          class="custom-alert-title-icon"
        />
        <span>{{ title }}</span>
      </h2>
      <p class="custom-alert-message">{{ state.message }}</p>

      <input
        v-if="state.type === 'prompt'"
        ref="promptInput"
        v-model="inputValue"
        class="custom-alert-input"
        type="text"
        :placeholder="state.placeholder"
        @keydown.enter.prevent="accept"
      />

      <div class="custom-alert-actions">
        <button
          v-if="state.type !== 'alert'"
          ref="cancelButton"
          type="button"
          class="custom-alert-btn custom-alert-btn-secondary"
          @click="cancel"
        >
          {{ cancelText }}
        </button>
        <button
          ref="confirmButton"
          type="button"
          class="custom-alert-btn custom-alert-btn-primary"
          @click="accept"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </Tooltip>
</template>

<script>
import Tooltip from '@/components/Tooltip.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { alertState, resolveCustomAlert } from '@/services/customAlert.js';
import { getCurrentLanguage, getTranslation } from '@/services/translations.js';

export default {
  name: 'CustomAlertHost',
  components: { Tooltip, SvgIcon },
  data() {
    return {
      state: alertState,
      inputValue: ''
    };
  },
  computed: {
    language() {
      return getCurrentLanguage();
    },
    title() {
      if (this.state.title) return this.state.title;
      if (this.state.type === 'confirm') return this.t('confirmAction');
      if (this.state.type === 'prompt') return this.t('awardToUser');
      return this.t('notice');
    },
    confirmText() {
      return this.state.confirmText || this.t(this.state.type === 'alert' ? 'close' : 'confirmAction');
    },
    cancelText() {
      return this.state.cancelText || this.t('cancel');
    }
  },
  watch: {
    'state.visible'(visible) {
      if (!visible) return;
      this.inputValue = this.state.inputValue;
      this.$nextTick(() => {
        if (this.state.type === 'prompt') {
          this.$refs.promptInput?.focus();
          this.$refs.promptInput?.select();
          return;
        }
        this.$refs.confirmButton?.focus();
      });
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.language);
    },
    accept() {
      if (this.state.type === 'confirm') {
        resolveCustomAlert(true);
        return;
      }
      if (this.state.type === 'prompt') {
        resolveCustomAlert(this.inputValue);
        return;
      }
      resolveCustomAlert(true);
    },
    cancel() {
      resolveCustomAlert(this.state.type === 'prompt' ? null : false);
    },
    handleBackdrop() {
      this.cancel();
    }
  }
};
</script>

<style scoped>
.custom-alert-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-color, #fff);
  outline: none;
  text-align: center;
}

.custom-alert-title {
  margin: 0;
  color: var(--text-color, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: clamp(1.25rem, 3.4vw, 1.65rem);
  font-weight: 800;
  line-height: 1.12;
  overflow-wrap: anywhere;
}

.custom-alert-title-icon {
  color: var(--accent-color, #70e974);
}

.custom-alert-message {
  margin: 0;
  color: var(--tooltip-text, #fff);
  font-size: clamp(0.92rem, 2vw, 1rem);
  font-weight: 650;
  line-height: 1.48;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.custom-alert-input {
  width: 100%;
  min-height: 52px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 2px solid rgba(112, 233, 116, 0.65);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color, #fff);
  font: inherit;
  font-size: 0.95rem;
  text-align: center;
}

.custom-alert-input:focus {
  outline: none;
  border-color: var(--accent-color, #70e974);
  box-shadow: 0 0 0 3px rgba(112, 233, 116, 0.18);
}

.custom-alert-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
  width: 100%;
}

.custom-alert-btn {
  min-width: 104px;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 2px solid var(--accent-color, #70e974);
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.custom-alert-btn:hover,
.custom-alert-btn:focus-visible {
  transform: translateY(-2px);
}

.custom-alert-btn-primary {
  background: var(--accent-color, #70e974);
  color: var(--dark-bg-color, #111);
}

.custom-alert-btn-secondary {
  background: transparent;
  color: var(--text-color, #fff);
}

@media (max-width: 500px) {
  .custom-alert-actions {
    flex-direction: column-reverse;
  }

  .custom-alert-btn {
    width: 100%;
  }
}
</style>
