import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../page/Front/Login.vue';

Vue.use(VueRouter);

const baseSiteTitle = '英閱奇航：玩轉ABC';

const routes = [{
    path: '/api/oidccallback',
    name: 'OidcCallback',
    component: Login,
    meta: {
      title: '正在登入'
    }
  },
  {
    path: '/api/oidccallback/',
    name: 'OidcCallbackSlash',
    component: Login,
    meta: {
      title: '正在登入'
    }
  },
  {
    path: '/',
    name: 'Index',
    component: () => import('../page/Front/Home.vue'),
    meta: {
      title: '大廳'
    }
  },
  {
    path: '/login/:token?',
    name: 'Login',
    component: Login,
    meta: {
      hideSidebar: true,
      title: '帳號登入'
    }
  },
  {
    path: '/dashboard',
    name: 'TeacherDashboard',
    component: () => import('../page/Back/TeacherDashboard.vue'),
    meta: {
      title: '教師儀錶板'
    }
  },
  {
    path: '/island-analysis',
    name: 'IslandAnalysis',
    component: () => import('../page/Back/IslandAnalysis.vue'),
    meta: {
      title: '競技島分析'
    }
  },
  {
    path: '/exam-analysis',
    name: 'ExamAnalysis',
    component: () => import('../page/Back/ExamAnalysis.vue'),
    meta: {
      title: '考試分析'
    }
  },
  {
    path: '/exam-detail',
    name: 'ExamDetail',
    component: () => import('../page/Back/ExamDetail.vue'),
    meta: {
      title: '考試詳細數據'
    }
  },
  {
    path: '/news',
    name: 'NewsManagement',
    component: () => import('../page/Back/NewsManagement.vue'),
    meta: {
      title: '公告管理'
    }
  },
  {
    path: '/home',
    name: 'F_Home',
    component: () => import('../page/Front/Home.vue'),
    meta: {
      title: '大廳'
    }
  },
  {
    path: '/sitemap',
    name: 'Sitemap',
    component: () => import('../page/Front/Sitemap.vue'),
    meta: {
      isPublic: true,
      title: '網站導覽'
    }
  },
  {
    path: '/primaryisland',
    name: 'PrimaryIsland',
    component: () => import('../page/Front/PrimaryIsland.vue'),
    meta: {
      title: '國小學習島嶼'
    }
  },
  {
    path: '/secondaryisland',
    name: 'SecondaryIsland',
    component: () => import('../page/Front/SecondaryIsland.vue'),
    meta: {
      title: '國中學習島嶼'
    }
  },
  {
    path: '/achievementisland',
    name: 'AchievementIsland',
    component: () => import('../page/Front/AchievementIsland.vue'),
    meta: {
      title: '我的成就島'
    }
  },
  {
    path: '/words/:level/:wordCount',
    name: 'WordIslandDetail',
    component: () => import('../page/Front/WordIslandDetail.vue'),
    props: true,
    meta: {
      title: '單字量挑戰'
    }
  },
  {
    path: '/abc-island',
    name: 'AbcIsland',
    component: () => import('../page/Front/AbcIsland.vue'),
    props: {
      level: 'primary',
      wordCount: 'abc'
    },
    meta: {
      title: 'ABC 啟航島'
    }
  },
  {
    path: '/lesson/:level/:wordCount?/:unitId',
    name: 'LessonDetail',
    component: () => import('../page/Front/LessonDetail.vue'),
    props: true,
    meta: {
      title: '課程關卡選擇'
    }
  },
  {
    path: '/listen-detail/primary',
    name: 'PrimaryListenDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'listen',
      level: 'primary'
    },
    meta: {
      title: '國小聽力海灣'
    }
  },
  {
    path: '/hero-detail/primary',
    name: 'PrimaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'hero',
      level: 'primary'
    },
    meta: {
      title: '國小小英雄大本營'
    }
  },
  {
    path: '/hero-quiz/:stageId/:level',
    name: 'HeroQuizPage',
    component: () => import('../page/Front/HeroQuizPage.vue'),
    props: true,
    meta: {
      title: '英雄挑戰測驗中'
    }
  },
  {
    path: '/listen-detail/secondary',
    name: 'SecondaryListenDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'listen',
      level: 'secondary'
    },
    meta: {
      title: '國中聽力海灣'
    }
  },
  {
    path: '/hero-detail/secondary',
    name: 'SecondaryHeroDetail',
    component: () => import('../page/Front/StageDetail.vue'),
    props: {
      unitId: 'hero',
      level: 'secondary'
    },
    meta: {
      title: '會考大殿堂'
    }
  },
  {
    path: '/quiz/:unitId/:activityType/:level',
    name: 'QuizPage',
    component: () => import('../page/Front/QuizPage.vue'),
    props: true,
    meta: {
      title: '練習測驗進行中'
    }
  },
  {
    path: '/learn/:unitId/:level',
    name: 'LearnPage',
    component: () => import('../page/Front/LearnPage.vue'),
    props: true,
    meta: {
      title: '單字學習進行中'
    }
  },
  {
    path: '/competition',
    name: 'CompetitionIsland',
    component: () => import('../page/Front/CompetitionIsland.vue'),
    meta: {
      title: '競技島'
    }
  },
  {
    path: '/competition/quiz/:gameId/:gameLevel',
    name: 'SpeedQuiz',
    component: () => import('../page/Front/SpeedQuiz.vue'),
    props: true,
    meta: {
      title: '速度競賽'
    }
  },
  {
    path: '/competition/combo/:gameId/:gameLevel',
    name: 'ComboQuiz',
    component: () => import('../page/Front/ComboQuiz.vue'),
    props: true,
    meta: {
      title: '連擊競賽'
    }
  },
  {
    path: '/competition/wheel/:gameId/:gameLevel',
    name: 'AlphabetWheelQuiz',
    component: () => import('../page/Front/AlphabetWheelQuiz.vue'),
    props: true,
    meta: {
      title: '字母轉盤'
    }
  },
  {
    path: '/trial-hall',
    name: 'TrialHall',
    component: () => import('../page/Front/TrialHall.vue'),
    meta: {
      title: '試煉殿堂'
    }
  },
  {
    path: '/trial-quiz/:level/:examId',
    name: 'TrialQuizPage',
    component: () => import('../page/Front/TrialQuizPage.vue'),
    props: true,
    meta: {
      title: '正式試煉測驗中'
    }
  },
  {
    path: '/result-detail/:finalScore',
    name: 'ResultDetail',
    component: () => import('../page/Front/ResultDetail.vue'),
    props: true,
    meta: {
      title: '測驗結果詳情'
    }
  },
  {
    path: '*',
    redirect: '/login'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有儲存的位置（例如點擊瀏覽器的「後退」按鈕），則回到該位置
    if (savedPosition) {
      return savedPosition;
    } else {
      // 否則每次切換路由都捲動到最上方 (x:0, y:0)
      return {
        x: 0,
        y: 0
      };
    }
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken');

  //  動態處理網頁標題 
  let pageTitle = to.meta.title || '';

  // 針對具有動態參數的路由優化標題描述
  if (to.name === 'WordIslandDetail') {
    pageTitle = `${to.params.wordCount} 單字量挑戰島`;
  } else if (to.name === 'LessonDetail') {
    const levelName = to.params.level === 'primary' ? '國小' : '國中';
    pageTitle = `${levelName}課程詳細內容`;
  }

  // 設定最終標題：頁面名 - 網站名
  document.title = pageTitle ? `${pageTitle} - ${baseSiteTitle}` : baseSiteTitle;


  //  登入與權限攔截

  // OIDC 強制攔截
  if (to.query.code && to.path !== '/login') {
    return next({
      path: '/login',
      query: to.query
    });
  }

  // 定義白名單
  const publicNames = ['Login', 'Sitemap', 'OidcCallback', 'OidcCallbackSlash'];
  const publicPaths = ['/login', '/sitemap', '/api/oidccallback'];

  const isPublicPage =
    publicNames.includes(to.name) ||
    to.path.startsWith('/sitemap') ||
    to.path.startsWith('/login') ||
    to.path.includes('/api/oidccallback');

  if (isPublicPage) {
    next();
  } else if (!token) {
    next('/login');
  } else {
    next();
  }
});

export default router;