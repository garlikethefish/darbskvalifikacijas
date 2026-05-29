import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Reviews from '../views/Reviews.vue';
import CreateReview from '../views/CreateReview.vue';
import Statistics from '@/views/Statistics.vue';
import Discover from '@/views/Discover.vue';
import SeriesDetail from '@/views/SeriesDetail.vue';
import Quizzes from '@/views/Quizzes.vue';
import ReviewDetail from '@/views/ReviewDetail.vue';
import AdminPanel from '@/views/AdminPanel.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },

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
      path: '/profile/:userId',
      name: 'profile',
      component: Profile,
    }
    ,
    {
      path: '/profile',
      name: 'profile-redirect',
      redirect: () => {
        const auth = JSON.parse(localStorage.getItem('auth') || 'null');
        if (auth?.loggedIn && auth?.user?.id) {
          return `/profile/${auth.user.id}`;
        }
        return '/login';
      }
    }
    ,
    {
      path: '/public-profile/:userId',
      redirect: to => `/profile/${to.params.userId}`
    }
    ,
    {
      path: '/review/:reviewId',
      name: 'review-detail',
      component: ReviewDetail,
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
    },
    {
      path: '/discover',
      name: 'discover',
      component: Discover,
    },
    {
      path: '/quizzes',
      name: 'quizzes',
      component: Quizzes,
    },
    {
      path: '/series/:id',
      name: 'series-detail',
      component: SeriesDetail,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanel,
    }
  ],
});

router.beforeEach((to, from, next) => {
  document.documentElement.classList.add('page-layout-shifting');
  next();
});

router.afterEach(() => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('page-layout-shifting');
    }, 320);
  });
});

export default router;
