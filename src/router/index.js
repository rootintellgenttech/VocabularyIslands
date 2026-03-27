import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../page/Front/Login.vue';

Vue.use(VueRouter);

const routes = [
{
    path: '/api/oidccallback', 
    name: 'OidcCallback',
    component: Login 
  },
  {
    path: '/api/oidccallback/', 
    name: 'OidcCallbackSlash',
    component: Login
  },
  
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login/:token?',
    name: 'Login',
    component: Login,
    meta: {
      hideSidebar: true
    }
  },
  {
    path: '/dashboard',
    name: 'TeacherDashboard',
    component: () => import('../page/Back/TeacherDashboard.vue')
  },
  {
    path: '/learning-overview',
    name: 'LearningOverview',
    component: () => import('../page/Back/_LearningOverview.vue')
  },
  {
    path: '/island-analysis',
    name: 'IslandAnalysis',
    component: () => import('../page/Back/IslandAnalysis.vue')
  },
  {
    path: '/exam-analysis',
    name: 'ExamAnalysis',
    component: () => import('../page/Back/ExamAnalysis.vue')
  },
  {
    path: '/exam-detail',
    name: 'ExamDetail',
    component: () => import('../page/Back/ExamDetail.vue')
  },
  {
    path: '/news',
    name: 'NewsManagement',
    component: () => import('../page/Back/NewsManagement.vue')
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
    path: '/achievementisland',
    name: 'AchievementIsland',
    component: () => import('../page/Front/AchievementIsland.vue')
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
    props: {
      level: 'primary',
      wordCount: 'abc'
    }
  },
  {
    path: '/lesson/:level/:wordCount?/:unitId',
    name: 'LessonDetail',
    component: () => import('../page/Front/LessonDetail.vue'),
    props: true
  },
  // 聽力海灣 (國小) 
  {
    path: '/listen-detail/primary',
    name: 'PrimaryListenDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'listen',
      level: 'primary'
    }
  },
  // 小英雄大本營 (國小)
  {
    path: '/hero-detail/primary',
    name: 'PrimaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'hero',
      level: 'primary'
    }
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
    props: {
      unitId: 'listen',
      level: 'secondary'
    }
  },

  // 國中大本營 (國中) 
  {
    path: '/hero-detail/secondary',
    name: 'SecondaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'hero',
      level: 'secondary'
    }
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
    path: '/result-detail/:finalScore',
    name: 'ResultDetail',
    component: () => import('../page/Front/ResultDetail.vue'),
    props: true
  },
  // 增加 404 頁面處理，確保在任何情況下都能回到登入畫面
 {
    path: '*',
    redirect: '/login'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// 路由守衛：確保遇到 OIDC 網址時「絕對放行」
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken');
  
  // 如果網址帶有 code，強制把它護送到 /login，並且【保留所有參數】
  if (to.query.code) {
    // console.log('🚀 [RouterGuard] 攔截到 code！強制帶往 /login 並保留參數:', to.query.code);
    
    // 如果目前不在 /login，我們強制把它導向 /login，並把 query (包含 code) 傳過去
    if (to.path !== '/login') {
      next({ path: '/login', query: to.query });
      return;
    } else {
      next();
      return;
    }
  }
  
  if (to.name === 'Login' || to.path.includes('/api/oidccallback')) {
    next();
  } else if (!token) {
    next('/login');
  } else {
    next();
  }
});

export default router;