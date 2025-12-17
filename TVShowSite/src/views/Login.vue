<template>
<div class="app">
    <SectionHeader>{{ "" }}</SectionHeader>
    <div class="form-container">
        <div class="form" v-if="currentForm === 'login'">
            <h2>Login</h2>
            <form @submit.prevent="login">
            <div class="form-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" v-model="loginForm.email" required />
                <span class="error-message" v-if="loginErrors.email">{{ loginErrors.email }}</span>
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" v-model="loginForm.password" required />
                <span class="error-message" v-if="loginErrors.password">{{ loginErrors.password }}</span>
            </div>
            <div class="form-actions">
                <button type="submit">Login</button>
                <a href="#" @click.prevent="forgotPassword">Forgot Password?</a>
                <button @click="switchForm('register')">Go to Register</button>
            </div>
            </form>
        </div>

        <div class="form" v-if="currentForm === 'register'">
            <h2>Register</h2>
            <form @submit.prevent="register">
                <div class="form-group">
                <label for="register-username">Username</label>
                <input type="text" id="register-username" v-model="registerForm.username" required />
                <span class="error-message" v-if="registerErrors.username">{{ registerErrors.username }}</span>
            </div>
            <div class="form-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" v-model="registerForm.email" required />
                <span class="error-message" v-if="registerErrors.email">{{ registerErrors.email }}</span>
            </div>
            <div class="form-group">
                <label for="register-password">Password</label>
                <input type="password" id="register-password" v-model="registerForm.password" required />
                <span class="error-message" v-if="registerErrors.password">{{ registerErrors.password }}</span>
            </div>
            <div class="form-group">
                <label for="register-confirm-password">Confirm Password</label>
                <input type="password" id="register-confirm-password" v-model="registerForm.confirmPassword" required />
                <span class="error-message" v-if="registerErrors.confirmPassword">{{ registerErrors.confirmPassword }}</span>
            </div>
            <div class="form-actions">
                <button type="submit">Register</button>
                <button @click.prevent="switchForm('login')">Go to Login</button>
            </div>
            </form>
        </div>
    </div>
    <SectionHeader>{{ "" }}</SectionHeader>
</div>
</template>

<script>
import SectionHeader from '@/components/SectionHeader.vue';
import { nextTick } from 'vue';

export default {
    components: {
    SectionHeader
},
data() {
    return {
    currentForm: 'login',
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
  switchForm(form) {
    this.currentForm = form;
    // Reset errors when switching forms
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
    // At least 8 characters, one uppercase, one number, one symbol
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return re.test(password);
  },

  validateUsername(username) {
    // Only allow alphanumeric characters, underscores and hyphens
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
      this.loginErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.validateEmail(this.loginForm.email)) {
      this.loginErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.loginForm.password) {
      this.loginErrors.password = 'Password is required';
      isValid = false;
    }

    return isValid;
  },

  async validateRegisterForm() {
    let isValid = true;
    this.registerErrors = { username: '', email: '', password: '', confirmPassword: '' };

    // Username validation
    if (!this.registerForm.username) {
      this.registerErrors.username = 'Username is required';
      isValid = false;
    } else if (!this.validateUsername(this.registerForm.username)) {
      this.registerErrors.username = 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens';
      isValid = false;
    } else {
      const isAvailable = await this.checkUsernameAvailability(this.registerForm.username);
      if (!isAvailable) {
        this.registerErrors.username = 'Username is already taken';
        isValid = false;
      }
    }

    // Email validation
    if (!this.registerForm.email) {
      this.registerErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.validateEmail(this.registerForm.email)) {
      this.registerErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!this.registerForm.password) {
      this.registerErrors.password = 'Password is required';
      isValid = false;
    } else if (this.registerForm.password.length < 8) {
      this.registerErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!this.validatePassword(this.registerForm.password)) {
      this.registerErrors.password = 'Password must contain at least one uppercase letter, one number, and one special character';
      isValid = false;
    }

    // Confirm password validation
    if (!this.registerForm.confirmPassword) {
      this.registerErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.registerErrors.confirmPassword = 'Passwords do not match';
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
      // go back to home page
      this.$router.push('/').then(() => {
        nextTick(() => { // wait until loaded home page
          location.reload(); // force refresh so that login buttons refresh
        });
      });
    } catch (err) {
      console.error('Login failed:', err.message);
      this.loginErrors.password = err.message || 'Invalid email or password';
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
      
      alert('Registration successful! You can now log in.');
      this.switchForm('login');
      this.registerForm = { username: '', email: '', password: '', confirmPassword: '' };
    } catch (err) {
      console.error('Registration failed:', err.message);
      this.registerErrors.email = err.message || 'Registration failed. Please try again.';
    }
  },

  forgotPassword() {
    alert('Password reset functionality will be implemented soon.');
  },
}
};
</script>

<style scoped>
.form-container {
display: flex;
padding-top: 25px;
padding-bottom: 25px;
justify-content: center;
background: var(--dark-bg-color);
}

.form {
background: linear-gradient(to right,var(--gradient-start),var(--medium-bg-color));
padding: 90px;
border-radius: 8px;
width: 400px;
}

h2 {
text-align: center;
font-size: 32px;
color:var(--text-color)
}

.form-group {
margin-bottom: 10px;
}

label {
font-size: large;
display: block;
margin-bottom: 5px;
color: var(--text-color);
}

input {
font-size: large;
width: 100%;
padding: 8px;
margin-bottom: 5px;
border: 1px solid #ccc;
border-radius: 4px;
background: rgb(232, 253, 222);
}

.error-message {
color: #ff4444;
font-size: 0.9em;
display: block;
margin-top: -5px;
margin-bottom: 10px;
}

.form-actions {
display: flex;
gap: 20px;
justify-content: space-between;
}

button {
background-color: #071a22;
color: rgb(255, 255, 255);
font-size: 16px;
font-weight: bold;
border: none;
padding: 10px 15px;
border-radius: 4px;
cursor: pointer;
}

button:hover {
background-color: rgb(20, 36, 49)
}

button:disabled {
background-color: #cccccc;
cursor: not-allowed;
}

a {
color: var(--text-color);
text-decoration: none;
cursor: pointer;
}

a:hover {
text-decoration: underline;
}
</style>