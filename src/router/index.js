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
      title: '大廳',
      isFront: true
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
      title: '教師儀錶板',
      isAdmin: true
    }
  },
  {
    path: '/island-analysis',
    name: 'IslandAnalysis',
    component: () => import('../page/Back/IslandAnalysis.vue'),
    meta: {
      title: '競技島分析',
      isAdmin: true
    }
  },
  {
    path: '/exam-analysis',
    name: 'ExamAnalysis',
    component: () => import('../page/Back/ExamAnalysis.vue'),
    meta: {
      title: '考試分析',
      isAdmin: true
    }
  },
  {
    path: '/exam-detail',
    name: 'ExamDetail',
    component: () => import('../page/Back/ExamDetail.vue'),
    meta: {
      title: '考試詳細數據',
      isAdmin: true
    }
  },
  {
    path: '/news',
    name: 'NewsManagement',
    component: () => import('../page/Back/NewsManagement.vue'),
    meta: {
      title: '公告管理',
      isAdmin: true
    }
  },
  {
    path: '/home',
    name: 'F_Home',
    component: () => import('../page/Front/Home.vue'),
    meta: {
      title: '大廳',
      isFront: true
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
      title: '國小學習島嶼',
      isFront: true
    }
  },
  {
    path: '/secondaryisland',
    name: 'SecondaryIsland',
    component: () => import('../page/Front/SecondaryIsland.vue'),
    meta: {
      title: '國中學習島嶼',
      isFront: true
    }
  },
  {
    path: '/achievementisland',
    name: 'AchievementIsland',
    component: () => import('../page/Front/AchievementIsland.vue'),
    meta: {
      title: '我的成就島',
      isFront: true
    }
  },
  {
    path: '/words/:level/:wordCount',
    name: 'WordIslandDetail',
    component: () => import('../page/Front/WordIslandDetail.vue'),
    props: true,
    meta: {
      title: '單字量挑戰',
      isFront: true
    }
  },
  {
    path: '/abc-island',
    name: 'AbcIsland',
    component: () => import('../page/Front/AbcIsland.vue'),
    props: {
      level: 'primary',
      wordCount: 'abc',
    },
    meta: {
      title: 'ABC 啟航島',
      isFront: true
    }
  },
  {
    path: '/lesson/:level/:wordCount?/:unitId',
    name: 'LessonDetail',
    component: () => import('../page/Front/LessonDetail.vue'),
    props: true,
    meta: {
      title: '課程關卡選擇',
      isFront: true
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
      title: '國小聽力海灣',
      isFront: true
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
      title: '國小小英雄大本營',
      isFront: true
    }
  },
  {
    path: '/hero-quiz/:stageId/:level',
    name: 'HeroQuizPage',
    component: () => import('../page/Front/HeroQuizPage.vue'),
    props: true,
    meta: {
      title: '英雄挑戰測驗中',
      isFront: true
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
      title: '國中聽力海灣',
      isFront: true
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
      title: '會考大殿堂',
      isFront: true
    }
  },
  {
    path: '/quiz/:unitId/:activityType/:level',
    name: 'QuizPage',
    component: () => import('../page/Front/QuizPage.vue'),
    props: true,
    meta: {
      title: '練習測驗進行中',
      isFront: true
    }
  },
  {
    path: '/learn/:unitId/:level',
    name: 'LearnPage',
    component: () => import('../page/Front/LearnPage.vue'),
    props: true,
    meta: {
      title: '單字學習進行中',
      isFront: true
    }
  },
  {
    path: '/competition',
    name: 'CompetitionIsland',
    component: () => import('../page/Front/CompetitionIsland.vue'),
    meta: {
      title: '競技島',
      isFront: true
    }
  },
  {
    path: '/competition/quiz/:gameId/:gameLevel',
    name: 'SpeedQuiz',
    component: () => import('../page/Front/SpeedQuiz.vue'),
    props: true,
    meta: {
      title: '速度競賽',
      isFront: true
    }
  },
  {
    path: '/competition/combo/:gameId/:gameLevel',
    name: 'ComboQuiz',
    component: () => import('../page/Front/ComboQuiz.vue'),
    props: true,
    meta: {
      title: '連擊競賽',
      isFront: true
    }
  },
  {
    path: '/competition/wheel/:gameId/:gameLevel',
    name: 'AlphabetWheelQuiz',
    component: () => import('../page/Front/AlphabetWheelQuiz.vue'),
    props: true,
    meta: {
      title: '字母轉盤',
      isFront: true
    }
  },
  {
    path: '/trial-hall',
    name: 'TrialHall',
    component: () => import('../page/Front/TrialHall.vue'),
    meta: {
      title: '試煉殿堂',
      isFront: true
    }
  },
  {
    path: '/trial-quiz/:level/:examId',
    name: 'TrialQuizPage',
    component: () => import('../page/Front/TrialQuizPage.vue'),
    props: true,
    meta: {
      title: '正式試煉測驗中',
      isFront: true
    }
  },
  {
    path: '/result-detail/:finalScore',
    name: 'ResultDetail',
    component: () => import('../page/Front/ResultDetail.vue'),
    props: true,
    meta: {
      title: '測驗結果詳情',
      isFront: true
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
  const userRole = localStorage.getItem('userRole');

  //  處理標題 
  let pageTitle = to.meta.title || '';
  if (to.name === 'WordIslandDetail') {
    pageTitle = `${to.params.wordCount} 單字量挑戰島`;
  } else if (to.name === 'LessonDetail') {
    const levelName = to.params.level === 'primary' ? '國小' : '國中';
    pageTitle = `${levelName}課程詳細內容`;
  }
  document.title = pageTitle ? `${pageTitle} - ${baseSiteTitle}` : baseSiteTitle;

  // 定義公共頁面 (白名單)
  const isPublicPage = to.meta.isPublic || ['Login', 'Sitemap', 'OidcCallback', 'OidcCallbackSlash'].includes(to.name) ||
    to.path.startsWith('/login');

  if (isPublicPage) {
    return next();
  }

  //  檢查是否登入
  if (!token) {
    return next('/login');
  }
  

  //角色與頁面權限隔離
  if (userRole === 'student') {
    // 學生：禁止進入後台頁面 (標記了 isAdmin 的路由)
    if (to.meta.isAdmin) {
      console.warn('學生身份禁止訪問後台，跳回大廳');
      return next('/'); // 跳回前台首頁
    }
  } else {
    // 管理員/老師 (非學生)：禁止進入前台頁面 (標記了 isFront 的路由)
    if (to.meta.isFront) {
      console.warn('管理身份禁止訪問前台，跳回儀表板');
      return next('/dashboard'); // 跳回後台首頁
    }
  }

  // 通過檢查，放行
  next();
});

export default router;
