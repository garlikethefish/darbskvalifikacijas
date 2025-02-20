import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Reviews from '../views/Reviews.vue';
import Updates from '../views/Updates.vue';
import Premium from '../views/Premium.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
    }
    ,
    {
      path: '/login',
      name: 'login',
      component: Login,
    }
    ,
    {
      path: '/reviews',
      name: 'reviews',
      component: Reviews,
    }
    ,
    {
      path: '/updates',
      name: 'updates',
      component: Updates,
    }
    ,
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    }
    ,
    {
      path: '/premium',
      name: 'premium',
      component: Premium,
    }
  ],
});

export default router;
