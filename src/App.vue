<template>
  <div id="app" :class="{ 'has-global-bg': $route.path !== '/login' }">
    <nav v-if="shouldShowGlobalNav" class="global-access-nav" aria-label="無障礙工具欄">
      <a href="#main-content" class="sr-only-focusable">跳到主要內容</a>

      <div class="top-utility-links">
        <router-link to="/sitemap" class="access-link" title="網站導覽">網站導覽</router-link>
      </div>
    </nav>
    <div v-if="isFrontPage && isWrongOrientation" class="orientation-lock-overlay">
      <div class="lock-content">
        <div class="icon-group">
          <i class="fa-solid fa-mobile-screen rotate-animation"></i>
        </div>
        <h2>請旋轉您的設備</h2>
        <p>本系統之學習活動與遊戲<br>需在<span>橫向模式</span>下獲得最佳體驗</p>
        <p class="sub-text">請將您的設備橫放以繼續使用</p>
      </div>
    </div>
    <aside v-if="shouldShowSidebar" role="complementary" aria-label="側邊選單">
      <Sidebar />
    </aside>

    <main id="main-content" role="main" class="router-view-content" tabindex="-1">
      <router-view />

      <nav v-if="isDevelopment" aria-label="開發者檢測導航" style="display: none;">
        <a href="/home">首頁</a>
        <a href="/primaryisland">國小島嶼</a>
        <a href="/secondaryisland">國中島嶼</a>
        <a href="/abc-island">ABC 小島</a>
        <a href="/achievementisland">成就島嶼</a>
        <a href="/competition">競賽島嶼</a>
        <a href="/trial-hall">試煉大廳</a>
      </nav>
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import api from '@/config/api';

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      refreshTimer: null,
      isWrongOrientation: false,
      isFrontPage: false,
      isDevelopment: window.location.hostname === 'localhost'
    };
  },
  watch: {
    // 合併後的路由監控
    '$route': {
      immediate: true,
      handler(to) {
        // 1. 判斷是否為前台頁面
        const backOfficePaths = ['/dashboard', '/island-analysis', '/exam-analysis', '/exam-detail', '/news'];
        this.isFrontPage = !backOfficePaths.some(path => to.path.startsWith(path));

        // 2. 檢查方向
        this.checkOrientation();

        // 3. 檢查 Token 定時器
        if (localStorage.getItem('refreshToken') && !this.refreshTimer) {
          this.startTokenRefreshTimer();
        }
      }
    }
  },
  computed: {
    shouldShowGlobalNav() {
      // 如果目前是後台路徑，就不顯示頂部導覽
      return this.isFrontPage;
    },
    shouldShowSidebar() {
      const token = localStorage.getItem('accessToken');
      const routeMetaHide = this.$route.meta.hideSidebar;
      const isSitemap = this.$route.name === 'Sitemap';

      // 1. 如果 meta 寫死要隱藏 (如 Login 頁)，絕對隱藏
      if (routeMetaHide) return false;

      // 2. 如果是 Sitemap 頁面：沒登入不給看側欄
      if (isSitemap && !token) return false;

      // 3. 只要有 Token，且不是在 Login/404，就應該顯示
      return !!token;
    }
  },
  methods: {
    checkOrientation() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 直向判斷：高度 > 寬度，且寬度小於 1024

      this.isWrongOrientation = height > width && width < 1024;

      // 同步鎖定 body 捲動
      if (this.isFrontPage && this.isWrongOrientation) {
        document.body.classList.add('locked');
      } else {
        document.body.classList.remove('locked');
      }
    },
    async startTokenRefreshTimer() {
      // 避免重複設定定時器
      if (this.refreshTimer) return;

      console.log('[系統] 啟動 Token 自動更新計時器 (每 25 分鐘刷新一次)');

      // 設定定時器：25 分鐘 = 25 * 60 * 1000 毫秒
      this.refreshTimer = setInterval(async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          this.stopTokenRefreshTimer();
          return;
        }

        try {
          console.log('[系統] 正在執行預約自動更新 Token...');
          // 刷新接口
          const response = await api.post('students/refresh/', {
            refresh: refreshToken
          });

          // 兼容 access 或 token 兩種 key
          const newAccessToken = response.data.token || response.data.access;
          const newRefreshToken = response.data.refresh;

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            console.log('[系統] 自動更新成功，Token 已續期。');
          }
        } catch (error) {
          console.error('[系統] 自動更新失敗:', error);
          // 如果連刷新都失敗，代表 refreshToken 也過期了，停止計時器
          this.stopTokenRefreshTimer();
        }
      }, 25 * 60 * 1000);
    },

    stopTokenRefreshTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
        console.log('[系統] 定時器已停止');
      }
    }
  },
  mounted() {
    if (localStorage.getItem('refreshToken')) {
      this.startTokenRefreshTimer();
    }
    this.checkOrientation();
    window.addEventListener('resize', this.checkOrientation);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkOrientation);
    // 當組件銷毀時清理定時器，避免記憶體洩漏
    this.stopTokenRefreshTimer();
  }
};
</script>


<style lang="scss">
// @import '~vue-multiselect/dist/vue-multiselect.min.css';
$bg-path: "~@/assets/image/bg.png";

.orientation-lock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(28, 28, 30, 0.95);
  backdrop-filter: blur(10px);
  z-index: 999999;

  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;

  .lock-content {
    h2 {
      font-size: 1.5rem;
      color: #4ABCB1;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      line-height: 1.6;

      span {
        font-weight: bold;
        color: #4ABCB1;
      }
    }

    .sub-text {
      font-size: 0.9rem;
      color: #999;
      margin-top: 1rem;
    }
  }

  .rotate-animation {
    font-size: 4rem;
    margin-bottom: 2rem;
    display: inline-block;
    animation: rotateDevice 2s infinite ease-in-out;
  }
}

@keyframes rotateDevice {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(-90deg);
  }

  100% {
    transform: rotate(-90deg);
  }
}

body.locked {
  overflow: hidden;
}


body {
  margin: 0;
}

.apexcharts-legend-text {
  top: -0.0625rem !important;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}


html {
  font-size: 100%;
}

.el-form--label-top .el-form-item__label {
  display: flex !important;
  // justify-content: center;
  padding: 0 !important
}

.loading-container {
  @include flex-center;
  font-size: 1.5rem;
  font-weight: 600;
  color: $main-black-text;
  justify-content: center;
  flex-direction: column;
  gap: .625rem 0;
  height: 100vh
}

.result-title {
  margin-top: 1rem;
}

.timer-bar-wrap {
  .timer-progress {
    border: .125rem solid #e1e0e0;
    border-radius: 1rem;

    .el-progress-bar__innerText {
      font-size: 1rem;
      font-weight: bold;
      color: black !important;
    }

    :deep(.el-progress-bar__inner) {
      transition: width 1s linear;
      background-color: #e74c3c;
    }
  }
}


.scrollable-chart-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1.25rem;

  ::v-deep .apexcharts-canvas,
  ::v-deep .apexcharts-svg {
    width: 100% !important;
  }
}





.select-all-box {
  padding: .3125rem .9375rem;
  display: flex;
  justify-content: space-between;
  border-bottom: .0625rem solid #eee;
  margin-bottom: .3125rem;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.el-select-dropdown.is-multiple .el-select-dropdown__item.selected,
.el-select-dropdown__item.selected {
  color: #4abcb1 !important;
}

.el-table .cell {
  font-size: 1rem;
}

.level-scroll-container {
  height: 21.875rem;
  padding: .375rem 0;
}

.islands-scroll-container {
  margin: 2% 4% 4% 6%;
}

.island-map-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 0 5%;
  margin-top: 7%;

  .island-card img {
    width: 18.75rem;
    height: 100%;
  }
}


.return-last-page {
  @include card-return-text;
  padding: 1rem 0 0 1.5rem;
}

.timer-bar {
  flex-grow: 1;
  margin-right: 1.25rem;

  .timer-progress {
    .el-progress-bar__outer {
      border: .125rem solid #DAE2E7 !important;
      background-color: #F8F9FA;
    }

    .el-progress-bar__inner {
      background-color: #DE4D30 !important;
    }
  }
}

.el-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .el-dialog__header {
    display: none !important
  }

  .el-dialog__body {
    padding: 1.875rem 1.25rem 1.5rem !important;

    .title {
      font-weight: 600;
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: $main-black-text;
    }
  }

  .dialog-content {
    @include flex-center;
    flex-direction: column;
    padding: 0 !important;

    .dialog-avatar,
    .result-avatar {
      width: 11.25rem;
      height: auto;
      margin-bottom: .75rem;
    }


    .description {
      margin: 0;
      text-align: center;
      color: $main-grey-text;
      font-size: 1rem;
    }
  }

  .el-dialog__footer button {
    width: 6.25rem;
  }

  .el-dialog--center .el-dialog__body,
  .el-dialog__footer {
    padding: 0 !important;
  }

  .el-dialog__footer button:nth-child(1) {
    border: $main-grey-text solid .0625rem;

    &:hover {
      background: #67777E;
      color: white;
    }
  }

  .el-dialog__footer button:nth-child(2) {
    background-color: #115B53;
    color: white;
    border-color: #115B53;

    &:hover {
      background-color: #075E55
    }
  }
}

.start-modal {
  height: 28.125rem;
  border: .25rem solid #DAE2E0;
  border-radius: 1rem !important;
}

.challenge-confirm-modal,
.confirm-pw-modal,
.confirm-change-pw-modal,
.settings-modal,
.mails-modal,
.exit-confirm-modal,
.password-modal,
.help-modal {
  border: .375rem solid var(--btn-g, #4ABCB1);
  border-radius: 1rem !important;
  padding-bottom: 1.5rem;

  .warning-text {
    color: #761C00;
    font-weight: bold;
    margin-top: .625rem;
  }
}


.challenge-confirm-modal .title {
  margin-bottom: 1rem !important;
}


button {
  cursor: pointer;
}

.is-bw {
  filter: grayscale(100%);
}


.teal-select {
  width: 15.625rem;

  .el-input__inner {
    background-color: $main-green;
    color: white;
    border-radius: .5rem;
    border: none;
    font-size: .875rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  ::v-deep .el-input__icon {
    color: white;
  }
}


.expand-table-wrapper {
  padding: 1.25rem;
  background-color: #f9fbfb;
  border-radius: .5rem;
  margin: .625rem;
  box-shadow: inset 0 .125rem .25rem rgba(0, 0, 0, 0.05);

  .expand-title {
    margin-top: 0;
    margin-bottom: .9375rem;
    color: $main-green;
    font-size: 1rem;
    border-left: .25rem solid $main-green;
    padding-left: .625rem;
  }

  .el-table th {
    background-color: #f0f2f5 !important;
  }
}

.el-tag.el-tag--info {
  color: #000000 !important;
  font-weight: 600;
  font-size: .875rem;
}


.tinder-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  min-width: 37.5rem;
  box-shadow: 0 .375rem .625rem -0.125rem rgba(0, 0, 0, 0.15) !important
}

#app {
  font-family: "Inter", sans-serif !important;
  min-height: 100vh;
  overflow: hidden;
}

.has-global-bg {
  background-image: url($bg-path);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

.router-view-content {
  min-height: 100vh;

  &.full-width {
    padding-left: 0;
  }
}

.orientation-lock {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 99999;
  color: white;
  overflow: hidden;

  .lock-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    text-align: center;

    i {
      font-size: 5rem;
      margin-bottom: 1.875rem;
      animation: rotate-device 2s infinite ease-in-out;
    }

    p {
      font-size: 1.625rem;
      font-weight: bold;
      letter-spacing: .125rem;
      line-height: 1.6;
    }
  }

  @media screen and (orientation: portrait) {
    display: block !important;
  }
}

.global-access-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
  pointer-events: none;

  .top-utility-links {
    pointer-events: auto;
  }

  .access-link {
    display: inline-block;
    padding: 5px 12px;
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.8);
    color: #0369a1;
    font-size: 14px;
    font-weight: bold;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    &:focus {
      outline: 3px solid #ffed4a;
      background-color: #fff;
    }
  }
}

.sr-only-focusable {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 9999;
  background: #000;
  color: #fff;
  padding: 10px;
}

.sr-only-focusable:focus {
  top: 0;
}

#main-content:focus {
  outline: 2px solid #ff9900;
}

// 裝置旋轉示意動畫
@keyframes rotate-device {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }

  30% {
    transform: rotate(0deg);
  }

  60% {
    transform: rotate(-90deg);
    opacity: 1;
  }

  100% {
    transform: rotate(-90deg);
    opacity: 0;
  }
}


@media (orientation: landscape) and (max-height: 74.9988rem) {

  //   .quiz-page{
  //  height: unset !important;
  //   }
  .return-last-page {
    padding: 1rem 0 0 0;
  }

  .main-card,
  .intro-card {
    min-width: 31.25rem !important;
  }
}

@media (orientation: landscape) and (max-height: 47.9988rem) {
  .quiz-page {
    padding-top: 24px;
    height: unset !important;
  }

  // .return-last-page {
  //   padding: 1rem 0 0 2rem;
  // }

  .tinder-card {
    min-width: unset;
  }

  .main-card,
  .intro-card {
    min-width: 31.25rem !important;

    .question-content {
      padding: 5% !important;

      .instruction-text {
        margin: 0 0 1.5rem;
      }

      .question-title {
        font-size: 5rem !important;
      }

      .context-fill-title {
        font-size: 2.125rem !important;
      }
    }

  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>