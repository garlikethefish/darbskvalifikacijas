<template>
  <div class="auth-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1 v-if="currentForm === 'login'">{{ t('loginTitle') }}</h1>
          <h1 v-else>{{ t('registerTitle') }}</h1>
          <p class="subtitle" v-if="currentForm === 'login'">{{ t('loginSubtitle') }}</p>
          <p class="subtitle" v-else>{{ t('registerSubtitle') }}</p>
        </div>
      </div>
    </header>

    <!-- Auth Forms -->
    <div class="form-wrapper">
      <div class="form-container">
        <!-- Login Form -->
        <transition name="fade" mode="out-in">
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

              <a href="#" @click.prevent="forgotPassword" class="forgot-link">
                {{ t('forgotPassword') }}
              </a>

              <button type="submit" class="btn btn-primary">{{ t('loginBtn') }}</button>
            </form>

            <div class="form-footer">
              <p>{{ t('goToRegister') }}</p>
              <button @click="switchForm('register')" class="btn btn-secondary">
                {{ t('register') }}
              </button>
            </div>
          </div>
        </transition>

        <!-- Register Form -->
        <transition name="fade" mode="out-in">
          <div v-if="currentForm === 'register'" key="register" class="form-card">
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
                <label for="register-confirm-password">{{ t('confirmPassword') }}</label>
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

              <button type="submit" class="btn btn-primary">{{ t('registerBtn') }}</button>
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

      <!-- Side Features -->
      <div class="features-section">
        <div class="feature">
          <div class="feature-icon">⭐</div>
          <h3>{{ currentLanguage === 'en' ? 'Rate Shows' : 'Vērtēt Šovus' }}</h3>
          <p>{{ currentLanguage === 'en' ? 'Share your thoughts on your favorite TV series and episodes.' : 'Dalieties saviem viedokļiem par savējiem iecienītākajiem TV šoviem un epizodēm.' }}</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🎬</div>
          <h3>{{ currentLanguage === 'en' ? 'Discover' : 'Atklāt' }}</h3>
          <p>{{ currentLanguage === 'en' ? 'Get personalized recommendations based on your ratings.' : 'Saņemiet personalizētus ieteikumus, pamatojoties uz jūsu vērtējumiem.' }}</p>
        </div>
        <div class="feature">
          <div class="feature-icon">👥</div>
          <h3>{{ currentLanguage === 'en' ? 'Community' : 'Kopiens' }}</h3>
          <p>{{ currentLanguage === 'en' ? 'Connect with other TV enthusiasts and share your passion.' : 'Savienoties ar citiem TV entuziastiem un dalieties ar savu aizrautību.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';
import { nextTick } from 'vue';

export default {
  name: 'Login',
  data() {
    return {
      currentForm: 'login',
      currentLanguage: 'en',
      loginForm: {
        email: '',
        password: '',
      },
      loginErrors: {
        email: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      registerErrors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      checkingUsername: false,
      usernameAvailable: false,
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    switchForm(form) {
      this.currentForm = form;
      this.resetErrors();
    },
    resetErrors() {
      this.loginErrors = { email: '', password: '' };
      this.registerErrors = { username: '', email: '', password: '', confirmPassword: '' };
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
      this.registerErrors = { username: '', email: '', password: '', confirmPassword: '' };

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
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.loginForm),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem('auth', JSON.stringify({
          loggedIn: true,
          user: data.user
        }));
        this.$router.push('/').then(() => {
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
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.registerForm.username,
            email: this.registerForm.email,
            password: this.registerForm.password,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        
        alert(this.t('registrationSuccess'));
        this.switchForm('login');
        this.registerForm = { username: '', email: '', password: '', confirmPassword: '' };
      } catch (err) {
        console.error('Registration failed:', err.message);
        this.registerErrors.email = err.message || this.t('registrationFailed');
      }
    },
    forgotPassword() {
      alert(this.currentLanguage === 'en' ? 'Password reset functionality will be implemented soon.' : 'Paroles atiestatīšanas funkcionalitāte drīzumā tiks ieviesta.');
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
  }
};
</script>

<style scoped>
.auth-page {
  padding: 0;
  margin: 0;
}

/* Hero Section */
.hero {
  margin-bottom: 3rem;
  overflow: hidden;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: linear-gradient(90deg, rgba(34, 59, 75, 0.92), rgba(25, 61, 39, 0.92));
  padding: 48px 0;
  box-shadow: inset 0 -40px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
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

/* Form Wrapper */
.form-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.form-container {
  display: flex;
  justify-content: center;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: cardSlideIn 0.6s cubic-bezier(0.2, 0.9, 0.25, 1);
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.forgot-link {
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.9em;
  transition: opacity 0.2s ease;
}

.forgot-link:hover {
  opacity: 0.8;
  text-decoration: underline;
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

/* Features Section */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
}

.feature {
  background: rgba(112, 233, 116, 0.05);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature:hover {
  background: rgba(112, 233, 116, 0.1);
  border-color: rgba(112, 233, 116, 0.4);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.feature h3 {
  margin: 15px 0 10px 0;
  color: var(--accent-color);
  font-size: 1.2em;
}

.feature p {
  margin: 0;
  color: var(--subtitle-color);
  line-height: 1.6;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 30px 20px;
  }

  .features-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .feature {
    padding: 20px;
  }

  .feature-icon {
    font-size: 2.5em;
  }

  .feature h3 {
    font-size: 1em;
  }

  .feature p {
    font-size: 0.9em;
  }
}

@media (max-width: 768px) {
  .form-card {
    max-width: 100%;
    padding: 30px;
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .feature {
    padding: 20px;
  }

  .hero-inner h1 {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }

  .form-wrapper {
    padding: 20px;
  }
}

@media (max-width: 500px) {
  .form-card {
    padding: 20px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 0.9em;
  }

  .features-section {
    display: none;
  }

  .form-wrapper {
    grid-template-columns: 1fr;
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
}
</style>