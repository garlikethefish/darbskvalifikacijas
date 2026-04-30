<template>
  <div class="auth-page">
    <!-- Galvenes sadaļa -->
    <HeroBand variant="auth">
      <h1 v-if="currentForm === 'login'">{{ t('loginTitle') }}</h1>
      <h1 v-else>{{ t('registerTitle') }}</h1>

      <p class="subtitle" v-if="currentForm === 'login'">
        {{ t('loginSubtitle') }}
      </p>
      <p class="subtitle" v-else>
        {{ t('registerSubtitle') }}
      </p>
    </HeroBand>

    <!-- Autentifikācijas formas -->
    <div class="form-wrapper">
      <!-- Kreisā puse -->
      <div class="left-panel">
        <div
          class="auth-ring"
          :class="{ 'auth-ring-register': currentForm === 'register' }"
        >
          <i class="auth-ring-line ring-one"></i>
          <i class="auth-ring-line ring-two"></i>
          <i class="auth-ring-line ring-three"></i>

          <div class="form-container">
            <transition name="auth-switch" mode="out-in">
              <!-- Pieteikšanās forma -->
              <div v-if="currentForm === 'login'" key="login" class="form-card">
                <form @submit.prevent="login" class="form">
                  <div class="form-group">
                    <label for="login-email">{{ t('email') }}</label>
                    <input
                      type="email"
                      id="login-email"
                      v-model="loginForm.email"
                      :placeholder="t('email')"
                      required
                    />
                    <span class="error-message" v-if="loginErrors.email">
                      {{ loginErrors.email }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label for="login-password">{{ t('password') }}</label>
                    <input
                      type="password"
                      id="login-password"
                      v-model="loginForm.password"
                      :placeholder="t('password')"
                      required
                    />
                    <span class="error-message" v-if="loginErrors.password">
                      {{ loginErrors.password }}
                    </span>
                  </div>

                  <button type="submit" class="btn btn-primary">
                    {{ t('loginBtn') }}
                  </button>
                </form>

                <div class="form-footer">
                  <p>{{ t('goToRegister') }}</p>
                  <button @click="switchForm('register')" class="btn btn-secondary">
                    {{ t('register') }}
                  </button>
                </div>
              </div>

              <!-- Reģistrācijas forma -->
              <div v-else key="register" class="form-card">
                <form @submit.prevent="register" class="form">
                  <div class="form-group">
                    <label for="register-username">{{ t('username') }}</label>
                    <input
                      type="text"
                      id="register-username"
                      v-model="registerForm.username"
                      :placeholder="t('username')"
                      required
                    />
                    <span class="error-message" v-if="registerErrors.username">
                      {{ registerErrors.username }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label for="register-email">{{ t('email') }}</label>
                    <input
                      type="email"
                      id="register-email"
                      v-model="registerForm.email"
                      :placeholder="t('email')"
                      required
                    />
                    <span class="error-message" v-if="registerErrors.email">
                      {{ registerErrors.email }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label for="register-password">{{ t('password') }}</label>
                    <input
                      type="password"
                      id="register-password"
                      v-model="registerForm.password"
                      :placeholder="t('password')"
                      required
                    />
                    <span class="error-message" v-if="registerErrors.password">
                      {{ registerErrors.password }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label for="register-confirm-password">
                      {{ t('confirmPassword') }}
                    </label>
                    <input
                      type="password"
                      id="register-confirm-password"
                      v-model="registerForm.confirmPassword"
                      :placeholder="t('confirmPassword')"
                      required
                    />
                    <span class="error-message" v-if="registerErrors.confirmPassword">
                      {{ registerErrors.confirmPassword }}
                    </span>
                  </div>

                  <button type="submit" class="btn btn-primary">
                    {{ t('registerBtn') }}
                  </button>
                </form>

                <div class="form-footer">
                  <p>{{ t('goToLogin') }}</p>
                  <button @click="switchForm('login')" class="btn btn-secondary">
                    {{ t('login') }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Labā puse -->
      <div class="right-panel">
        <div class="feature feature-top">
          <div class="feature-icon">
            <SvgIcon name="star" :size="32" />
          </div>
          <h3>{{ t('rateShows') }}</h3>
          <p>{{ t('rateShowsDesc') }}</p>
        </div>

        <div class="gif-card">
          <div class="gif-frame">
            <div v-if="gifLoading && !gifError" class="gif-load">
              <div class="spinner"></div>
              <h2>{{ t('loading') }}...</h2>
            </div>

            <div v-if="gifError" class="gif-failed">
              <p>GIF failed to load</p>
              <button type="button" class="btn btn-secondary" @click="retryGif">
                Try another
              </button>
            </div>

            <img
              v-if="selectedGif && !gifError"
              :src="selectedGif.src"
              :alt="selectedGif.title"
              class="gif-image"
              :class="{ loaded: !gifLoading }"
              @load="handleGifLoaded"
              @error="handleGifError"
            />
          </div>
        </div>

        <div class="feature-grid">
          <div class="feature-s">
            <div class="feature-icon">
              <SvgIcon name="play" :size="32" />
            </div>
            <h3>{{ t('discoverFeature') }}</h3>
            <p>{{ t('discoverFeatureDesc') }}</p>
          </div>

          <div class="feature-s">
            <div class="feature-icon">
              <SvgIcon name="users" :size="32" />
            </div>
            <h3>{{ t('community') }}</h3>
            <p>{{ t('communityDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';
import { nextTick } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import HeroBand from '@/components/HeroBand.vue';

const getGifUrl = (fileName) => {
  return new URL(`../assets/gifs/${fileName}`, import.meta.url).href;
};

export default {
  name: 'Login',
  components: { SvgIcon, HeroBand },
  data() {
    return {
      currentForm: 'login',
      currentLanguage: 'en',

      selectedGif: null,
      gifLoading: true,
      gifError: false,
      gifRetries: 0,
      maxGifRetries: 3,
      gifPool: [
        {
          title: 'Agreed agree',
          src: getGifUrl('agreed-agree.gif')
        },
        {
          title: 'Always Sunny dancing',
          src: getGifUrl('always-sunny-in-philadelphia-dancing.gif')
        },
        {
          title: 'Always Sunny',
          src: getGifUrl('always-sunny.gif')
        },
        {
          title: 'Dancing Bender',
          src: getGifUrl('dancing-bender.gif')
        },
        {
          title: 'Dr House',
          src: getGifUrl('dr-house-house.gif')
        },
        {
          title: 'Charlie Kelly',
          src: getGifUrl("it's-always-sunny-in-philadelphia-charlie-kelly.gif")
        },
        {
          title: 'Dennis Reynolds',
          src: getGifUrl("it's-always-sunny-in-philadelphia-dennis-reynolds.gif")
        },
        {
          title: 'Seinfeld',
          src: getGifUrl('seinfeld.gif')
        },
        {
          title: 'Supernatural television',
          src: getGifUrl('supernatural-television.gif')
        },
        {
          title: 'TV Land',
          src: getGifUrl('tv-land-tv-land-gifs.gif')
        },
        {
          title: 'Homer woo hoo',
          src: getGifUrl('woo-hoo-homer-simpson.gif')
        },
        {
          title: 'Men in Black',
          src: getGifUrl('men-in-black-mib.gif')
        }
      ],

      loginForm: {
        email: '',
        password: ''
      },
      loginErrors: {
        email: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      registerErrors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      checkingUsername: false,
      usernameAvailable: false
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },

    switchForm(form) {
      if (this.currentForm === form) return;
      this.currentForm = form;
      this.resetErrors();
    },

    resetErrors() {
      this.loginErrors = { email: '', password: '' };
      this.registerErrors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
    },

    pickRandomGif() {
      if (!this.gifPool || this.gifPool.length === 0) {
        this.gifLoading = false;
        this.gifError = true;
        return;
      }

      this.gifLoading = true;
      this.gifError = false;

      const randomIndex = Math.floor(Math.random() * this.gifPool.length);
      this.selectedGif = this.gifPool[randomIndex];
    },

    handleGifLoaded() {
      this.gifLoading = false;
      this.gifError = false;
      this.gifRetries = 0;
    },

    handleGifError() {
      if (!this.gifPool || this.gifPool.length <= 1 || this.gifRetries >= this.maxGifRetries) {
        this.gifLoading = false;
        this.gifError = true;
        return;
      }

      this.gifRetries += 1;

      const availableGifs = this.gifPool.filter((gif) => gif.src !== this.selectedGif?.src);
      const randomIndex = Math.floor(Math.random() * availableGifs.length);

      this.gifLoading = true;
      this.gifError = false;
      this.selectedGif = availableGifs[randomIndex];
    },

    retryGif() {
      this.gifRetries = 0;
      this.pickRandomGif();
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validatePassword(password) {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return re.test(password);
    },

    validateUsername(username) {
      const re = /^[a-zA-Z0-9_-]{3,20}$/;
      return re.test(username);
    },

    async checkUsernameAvailability(username) {
      if (!username || !this.validateUsername(username)) return false;

      this.checkingUsername = true;

      try {
        const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);

        if (!response.ok) {
          this.usernameAvailable = false;
          return false;
        }

        const data = await response.json();
        this.usernameAvailable = data.available;
        return data.available;
      } catch (err) {
        console.error('Error checking username:', err);
        return false;
      } finally {
        this.checkingUsername = false;
      }
    },

    async validateLoginForm() {
      let isValid = true;
      this.loginErrors = { email: '', password: '' };

      if (!this.loginForm.email) {
        this.loginErrors.email = this.t('emailRequired');
        isValid = false;
      } else if (!this.validateEmail(this.loginForm.email)) {
        this.loginErrors.email = this.t('emailInvalid');
        isValid = false;
      }

      if (!this.loginForm.password) {
        this.loginErrors.password = this.t('passwordRequired');
        isValid = false;
      }

      return isValid;
    },

    async validateRegisterForm() {
      let isValid = true;
      this.registerErrors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      };

      if (!this.registerForm.username) {
        this.registerErrors.username = this.t('usernameRequired');
        isValid = false;
      } else if (!this.validateUsername(this.registerForm.username)) {
        this.registerErrors.username = this.t('usernameInvalid');
        isValid = false;
      } else {
        const isAvailable = await this.checkUsernameAvailability(this.registerForm.username);
        if (!isAvailable) {
          this.registerErrors.username = this.t('usernameTaken');
          isValid = false;
        }
      }

      if (!this.registerForm.email) {
        this.registerErrors.email = this.t('emailRequired');
        isValid = false;
      } else if (!this.validateEmail(this.registerForm.email)) {
        this.registerErrors.email = this.t('emailInvalid');
        isValid = false;
      }

      if (!this.registerForm.password) {
        this.registerErrors.password = this.t('passwordRequired');
        isValid = false;
      } else if (this.registerForm.password.length < 8) {
        this.registerErrors.password = this.t('passwordTooShort');
        isValid = false;
      } else if (!this.validatePassword(this.registerForm.password)) {
        this.registerErrors.password = this.t('passwordWeak');
        isValid = false;
      }

      if (!this.registerForm.confirmPassword) {
        this.registerErrors.confirmPassword = this.t('confirmPasswordRequired');
        isValid = false;
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerErrors.confirmPassword = this.t('passwordsNotMatch');
        isValid = false;
      }

      return isValid;
    },

    async login() {
      if (!await this.validateLoginForm()) return;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.loginForm)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('auth', JSON.stringify({
          loggedIn: true,
          user: data.user
        }));

        const nextPath = this.$route.query.next
          ? decodeURIComponent(this.$route.query.next)
          : '/';

        this.$router.push(nextPath).then(() => {
          nextTick(() => {
            location.reload();
          });
        });
      } catch (err) {
        console.error('Login failed:', err.message);
        this.loginErrors.password = err.message || this.t('loginFailed');
      }
    },

    async register() {
      if (!await this.validateRegisterForm()) return;

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.registerForm.username,
            email: this.registerForm.email,
            password: this.registerForm.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        alert(this.t('registrationSuccess'));
        this.switchForm('login');

        this.registerForm = {
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
      } catch (err) {
        console.error('Registration failed:', err.message);
        this.registerErrors.email = err.message || this.t('registrationFailed');
      }
    },

    forgotPassword() {
      alert(this.t('forgotPasswordSoon'));
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.pickRandomGif();
  }
};
</script>

<style scoped>
.auth-page {
  padding: 0;
  margin: 0;
}

/* Galvenes sadaļa */
.hero {
  margin-bottom: 3rem;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: var(--hero-gradient);
  padding: 48px 0;
  box-shadow: var(--hero-shadow);
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  bottom: auto;
  transform: none;
  overflow: hidden;
  z-index: 1;
}

.hero-band::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.02) 28%,
    rgba(255, 255, 255, 0.1) 48%,
    rgba(255, 255, 255, 0.02) 72%,
    rgba(255, 255, 255, 0) 100%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
  transform: translateX(-80%);
  animation: shimmerSlide 3200ms cubic-bezier(0.22, 0.1, 0.25, 1) infinite;
  opacity: 0.95;
}

@keyframes shimmerSlide {
  0% {
    transform: translateX(-80%);
    opacity: 0.45;
  }

  50% {
    transform: translateX(0%);
    opacity: 1;
  }

  100% {
    transform: translateX(80%);
    opacity: 0.45;
  }
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-inner h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  font-weight: 800;
  color: var(--text-color);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.hero-inner .subtitle {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
  opacity: 0.95;
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) 100ms both;
}

@keyframes heroIntro {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.992);
    filter: blur(4px) saturate(0.95);
  }

  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
    filter: blur(0) saturate(1.02);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0) saturate(1);
  }
}

/* Galvenais izkārtojums */
.form-wrapper {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(380px, 1fr);
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  align-items: stretch;
  min-height: 760px;
}

/* Kreisās puses gredzens */
/* Kreisās puses gredzens */
.left-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 760px;
  overflow: visible;
}

.auth-ring {
  position: relative;
  width: 760px;
  height: 590px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 320ms ease, width 320ms ease;
}

.auth-ring-register {
  height: 750px;
}

.auth-ring-line {
  position: absolute;
  border: 2px solid rgba(112, 233, 116, 0.45);
  border-radius: 42px;
  pointer-events: none;
  transition:
    border-color 0.35s ease,
    filter 0.35s ease,
    border-width 0.35s ease,
    inset 0.35s ease;
}

.ring-one {
  inset: 0;
  border-color: rgba(112, 233, 116, 0.82);
  box-shadow:
    0 0 16px rgba(112, 233, 116, 0.25),
    inset 0 0 18px rgba(112, 233, 116, 0.12);
  animation: frameGlowOne 5200ms ease-in-out infinite;
}

.ring-two {
  inset: 18px;
  border-radius: 52px;
  border-color: rgba(255, 255, 255, 0.34);
  box-shadow:
    0 0 14px rgba(255, 255, 255, 0.12),
    inset 0 0 14px rgba(255, 255, 255, 0.06);
  animation: frameGlowTwo 6800ms ease-in-out infinite;
}

.ring-three {
  inset: 36px;
  border-radius: 34px;
  border-color: rgba(112, 233, 116, 0.38);
  box-shadow:
    0 0 22px rgba(112, 233, 116, 0.18),
    inset 0 0 20px rgba(112, 233, 116, 0.08);
  animation: frameGlowThree 8400ms ease-in-out infinite;
}

.auth-ring:hover .auth-ring-line {
  border-width: 4px;
  border-color: var(--accent-color);
  filter: drop-shadow(0 0 18px var(--accent-color));
}

@keyframes frameGlowOne {
  0% {
    transform: rotate(-1deg) scale(0.992);
    opacity: 0.65;
  }

  50% {
    transform: rotate(1deg) scale(1.01);
    opacity: 1;
  }

  100% {
    transform: rotate(-1deg) scale(0.992);
    opacity: 0.65;
  }
}

@keyframes frameGlowTwo {
  0% {
    transform: rotate(1.4deg) scale(1);
    opacity: 0.45;
  }

  50% {
    transform: rotate(-1.2deg) scale(1.018);
    opacity: 0.85;
  }

  100% {
    transform: rotate(1.4deg) scale(1);
    opacity: 0.45;
  }
}

@keyframes frameGlowThree {
  0% {
    transform: rotate(-0.8deg) scale(1.012);
    opacity: 0.5;
  }

  50% {
    transform: rotate(0.8deg) scale(0.995);
    opacity: 0.9;
  }

  100% {
    transform: rotate(-0.8deg) scale(1.012);
    opacity: 0.5;
  }
}
/* Forma */
.form-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  will-change: transform, opacity;
  position: relative;
  z-index: 3;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--accent-color);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(112, 233, 116, 0.05);
  color: var(--text-color);
  border: 2px solid rgba(112, 233, 116, 0.2);
  font-size: 1em;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: rgba(112, 233, 116, 0.1);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.2);
}

.form-group input::placeholder {
  color: var(--subtitle-color);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85em;
  margin-top: -4px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color), rgba(112, 233, 116, 0.8));
  color: var(--dark-bg-color);
  margin-top: 10px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(112, 233, 116, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(112, 233, 116, 0.15);
  color: var(--accent-color);
  border: 1px solid rgba(112, 233, 116, 0.3);
}

.btn-secondary:hover {
  background: rgba(112, 233, 116, 0.25);
  border-color: var(--accent-color);
}

.form-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(112, 233, 116, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-footer p {
  margin: 0;
  color: var(--subtitle-color);
  font-size: 0.9em;
}

/* Formas pāreja */
.auth-switch-enter-active,
.auth-switch-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.auth-switch-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

.auth-switch-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.auth-switch-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.auth-switch-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}

/* Labā puse */
.right-panel {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.right-panel > * {
  width: 560px;
  max-width: 560px;
  box-sizing: border-box;
}

.feature-grid {
  width: 560px;
  max-width: 560px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
}

.feature,
.feature-s {
  width: 100%;
  min-height: 180px;
  padding: 30px;
  background: rgba(112, 233, 116, 0.05);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.feature:hover,
.feature-s:hover {
  background: rgba(112, 233, 116, 0.1);
  border-color: rgba(112, 233, 116, 0.4);
  transform: translateY(-4px);
}

.feature-top {
  width: 560px;
  max-width: 560px;
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.feature h3,
.feature-s h3 {
  margin: 15px 0 10px 0;
  color: var(--accent-color);
  font-size: 1.2em;
}

.feature p,
.feature-s p {
  margin: 0;
  color: var(--subtitle-color);
  line-height: 1.6;
}

/* GIF bloks */
.gif-card {
  width: 560px;
  height: 356px;
  min-width: 560px;
  max-width: 560px;
  min-height: 356px;
  max-height: 356px;
  flex: 0 0 auto;
  box-sizing: border-box;
  background: rgba(112, 233, 116, 0.05);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.gif-frame {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  line-height: 0;
}

.gif-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  display: block;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 220ms ease;
}

.gif-image.loaded {
  opacity: 1;
}

.gif-load {
  position: absolute;
  inset: 0;
  z-index: 2;
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(112, 233, 116, 0.2);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.gif-load h2 {
  color: var(--subtitle-color);
  font-size: 1.2em;
  margin: 0;
}

.gif-failed {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  color: var(--subtitle-color);
  background: rgba(0, 0, 0, 0.18);
}

.gif-failed p {
  margin: 0;
  color: var(--subtitle-color);
  font-size: 1rem;
}

/* Responsīvais izkārtojums */
@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    min-height: auto;
  }

  .left-panel {
    min-height: 700px;
    align-items: center;
  }

  .auth-ring {
    width: 680px;
    height: 600px;
  }

  .form-container {
    min-height: 100%;
  }

}

@media (max-width: 768px) {
  .form-wrapper {
    padding: 20px;
  }

  .left-panel {
    min-height: 640px;
  }

  .auth-ring {
    width: min(100vw - 24px, 560px);
    height: min(92vw, 560px);
  }

  .ring-two {
    inset: 14px;
  }

  .ring-three {
    inset: 28px;
  }

  .form-card {
    max-width: 100%;
    padding: 30px;
  }

  .right-panel > *,
  .feature-top,
  .feature-grid,
  .gif-card {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature,
  .feature-s {
    padding: 20px;
    min-height: 150px;
  }

  .feature-icon {
    font-size: 2.5em;
  }

  .feature h3,
  .feature-s h3 {
    font-size: 1em;
  }

  .feature p,
  .feature-s p {
    font-size: 0.9em;
  }

  .gif-card {
    height: 296px;
    min-height: 296px;
    max-height: 296px;
  }

  .hero-inner h1 {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }
}

@media (max-width: 500px) {
  .left-panel {
    min-height: 560px;
  }

  .auth-ring {
    width: min(100vw - 20px, 500px);
    height: min(98vw, 500px);
  }

  .auth-ring-line {
    border-width: 1.5px;
  }

  .ring-two {
    inset: 10px;
  }

  .ring-three {
    inset: 20px;
  }

  .form-card {
    padding: 20px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 0.9em;
  }

  .hero-band {
    padding: 30px 0;
  }

  .form-group label {
    font-size: 0.85em;
  }

  .form-group input {
    padding: 10px 12px;
    font-size: 0.95em;
  }

  .gif-card {
    height: 256px;
    min-height: 256px;
    max-height: 256px;
  }
}
</style>
