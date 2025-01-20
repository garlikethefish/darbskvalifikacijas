
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App);

app.use(router); // Make sure the router is being used
app.mount('#app');

