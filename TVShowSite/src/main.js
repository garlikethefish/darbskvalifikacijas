
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { customAlert, customConfirm, customPrompt } from './services/customAlert.js'

const app = createApp(App);

app.use(router); // Make sure the router is being used
app.config.globalProperties.$alert = customAlert;
app.config.globalProperties.$confirm = customConfirm;
app.config.globalProperties.$prompt = customPrompt;
app.mount('#app');

