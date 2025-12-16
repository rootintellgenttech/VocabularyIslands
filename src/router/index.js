import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../page/Front/Login.vue';

Vue.use(VueRouter);

const routes = [
  // 直接將根路徑 '/' 指向 Login 元件
  {
    path: '/',
    name: 'F_Login',
    component: Login,
    meta: { hideSidebar: true }
  },
  {
    path: '/home',
    name: 'F_Home',
    component: () => import('../page/Front/Home.vue')
  },
  {
    path: '/primaryisland',
    name: 'PrimaryIsland',
    component: () => import('../page/Front/PrimaryIsland.vue')
  },
  {
    path: '/secondaryisland',
    name: 'SecondaryIsland',
    component: () => import('../page/Front/SecondaryIsland.vue')
  },
  {
    // level: 級別 (primary/secondary), wordCount: 單字量 (abc, 300, 800, 1200)
    path: '/words/:level/:wordCount',
    name: 'WordIslandDetail',
    component: () => import('../page/Front/WordIslandDetail.vue'),
    props: true
  },
  {
    path: '/abc-island',
    name: 'AbcIsland',
    component: () => import('../page/Front/AbcIsland.vue'),
    props: { level: 'primary', wordCount: 'abc' }
  },
  {
    path: '/lesson/:unitId',
    name: 'LessonDetail',
    component: () => import('../page/Front/LessonDetail.vue'),
    props: true
  },
  // 聽力海灣 (國小) 
  {
    path: '/listen-detail/primary',
    name: 'PrimaryListenDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: { unitId: 'listen', level: 'primary' }
  },
  {
    path: '/listening-quiz/:stageId/:level',
    name: 'ListeningQuizPage',
    component: () => import('../page/Front/ListeningQuizPage.vue'),
    props: true
  },

  // 小英雄大本營 (國小)
  {
    path: '/hero-detail/primary',
    name: 'PrimaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: { unitId: 'hero', level: 'primary' }
  },
  {
    path: '/hero-quiz/:stageId/:level',
    name: 'HeroQuizPage',
    component: () => import('../page/Front/HeroQuizPage.vue'),
    props: true 
  },
  // 國中聽力海灣 (國中)
  {
    path: '/listen-detail/secondary',
    name: 'SecondaryListenDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: { unitId: 'listen', level: 'secondary' }
  },

  // 國中大本營 (國中) 
  {
    path: '/hero-detail/secondary',
    name: 'SecondaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: { unitId: 'hero', level: 'secondary' }
  },
  {
    path: '/quiz/:unitId/:activityType/:level',
    name: 'QuizPage',
    component: () => import('../page/Front/QuizPage.vue'),
    props: true
  },
  {
    path: '/learn/:unitId/:level',
    name: 'LearnPage',
    component: () => import('../page/Front/LearnPage.vue'),
    props: true
  },
  {
    path: '/competition',
    name: 'CompetitionIsland',
    component: () => import('../page/Front/CompetitionIsland.vue')
  },
  {
    path: '/competition/quiz/:gameId/:gameLevel',
    name: 'SpeedQuiz',
    component: () => import('../page/Front/SpeedQuiz.vue'),
    props: true
  },
  {
    path: '/competition/combo/:gameId/:gameLevel',
    name: 'ComboQuiz',
    component: () => import('../page/Front/ComboQuiz.vue'),
    props: true
  },
  {
    path: '/competition/wheel/:gameId/:gameLevel',
    name: 'AlphabetWheelQuiz',
    component: () => import('../page/Front/AlphabetWheelQuiz.vue'),
    props: true
  },
  {
    path: '/trial-hall',
    name: 'TrialHall',
    component: () => import('../page/Front/TrialHall.vue')
  },
  {
        path: '/trial-quiz/:level/:examId', 
        name: 'TrialQuizPage',
        component: () => import('../page/Front/TrialQuizPage.vue'),
        props: true
    },
    {
    path: '/trial-result-detail/:finalScore', 
    name: 'TrialResultDetail',
    component: () => import('../page/Front/TrialResultDetail.vue'),
    props: true
  },
  // 增加 404 頁面處理，確保在任何情況下都能回到登入畫面
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { x: 0, y: 0 };
  }
});


export default router;