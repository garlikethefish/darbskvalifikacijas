<template>
<div class="app">
    <SectionHeader>{{ "" }}</SectionHeader>
    <div class="form-container">
    <!-- Login Form -->
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
            <button @click="switchForm('register')">Don't have an account? Register</button>
        </div>
        </form>
        
    </div>

    <!-- Register Form -->
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
            <button @click.prevent="switchForm('login')">Already have an account? Login</button>
        </div>
        </form>
    </div>
    </div>
    <SectionHeader>{{ "" }}</SectionHeader>
</div>
</template>

<script>
import SectionHeader from '@/components/SectionHeader.vue';

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
    login() {
    console.log('Login with:', this.loginForm);
    },
    register() {
    console.log('Register with:', this.registerForm);
    },
    forgotPassword() {
    console.log('Forgot password');
    },
},
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
background: linear-gradient(to right,rgb(34, 59, 75),var(--medium-bg-color));
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
display: block;
margin-bottom: 5px;
color: var(--text-color);
}

input {
width: 100%;
padding: 8px;
margin-bottom: 10px;
border: 1px solid #ccc;
border-radius: 4px;
background: var(--text-color);
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
  