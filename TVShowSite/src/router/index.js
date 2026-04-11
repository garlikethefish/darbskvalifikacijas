import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Reviews from '../views/Reviews.vue';
import CreateReview from '../views/CreateReview.vue';
import Statistics from '@/views/Statistics.vue';
import Discover from '@/views/Discover.vue';
import SeriesDetail from '@/views/SeriesDetail.vue';
import Quizzes from '@/views/Quizzes.vue';
import PublicProfile from '@/views/PublicProfile.vue';
import ReviewDetail from '@/views/ReviewDetail.vue';
import UserLists from '@/views/UserLists.vue';

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
      path: '/public-profile/:userId',
      name: 'public-profile',
      component: PublicProfile,
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
      path: '/my-lists/:userId',
      name: 'user-lists',
      component: UserLists,
    }
  ],
});

export default router;
