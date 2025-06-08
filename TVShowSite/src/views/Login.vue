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
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" v-model="loginForm.password" required />
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
            </div>
            <div class="form-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" v-model="registerForm.email" required />
            </div>
            <div class="form-group">
                <label for="register-password">Password</label>
                <input type="password" id="register-password" v-model="registerForm.password" required />
            </div>
            <div class="form-group">
                <label for="register-confirm-password">Confirm Password</label>
                <input type="password" id="register-confirm-password" v-model="registerForm.confirmPassword" required />
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
    registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    },
    };
},
methods: {
  switchForm(form) {
    this.currentForm = form;
  },

  async login() {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.loginForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

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
      alert(`Login failed: ${err.message}`);
    }
  },

  async register() {
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

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
      if (!response.ok) throw new Error(data.error);
      console.log('Registration successful:', data);
      alert('Registered! You can now log in.');
      this.switchForm('login');
    } catch (err) {
      console.error('Registration failed:', err.message);
      alert(`Registration failed: ${err.message}`);
    }
  },

  forgotPassword() {
    alert('Not implemented yet.');
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
margin-bottom: 10px;
border: 1px solid #ccc;
border-radius: 4px;
background: rgb(232, 253, 222);
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

a {
color: var(--text-color);
text-decoration: none;
cursor: pointer;
}

a:hover {
text-decoration: underline;
}
</style>
  