import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Reviews from '../views/Reviews.vue';
import CreateReview from '../views/CreateReview.vue';
import Statistics from '@/views/Statistics.vue';

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
      path: '/profile',
      name: 'profile',
      component: Profile,
    }
    ,
    {
      path: '/create-review',
      name: 'create-review',
      component: CreateReview,
    },
    {
      path: '/stats',
      name: 'stats',
      component: Statistics,
    }
  ],
});

export default router;
