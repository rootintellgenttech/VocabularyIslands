<template>
  <div id="app" :class="{ 'has-global-bg': $route.path !== '/login' }">
    <aside v-if="!$route.meta.hideSidebar" role="complementary" aria-label="側邊選單">
      <Sidebar />
    </aside>

    <main id="main-content" role="main" class="router-view-content">
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

    ...
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
      // 新增：判斷是否為本地開發環境
      isDevelopment: window.location.hostname === 'localhost'
    };
  },
  mounted() {
    // 當頁面載入或刷新時，如果已經是登入狀態，立刻啟動自動更新
    if (localStorage.getItem('refreshToken')) {
      this.startTokenRefreshTimer();
    }
  },
  watch: {
    // 監控路由變化，如果是從登入頁進來，確保定時器有啟動
    '$route'() {
      if (localStorage.getItem('refreshToken') && !this.refreshTimer) {
        this.startTokenRefreshTimer();
      }
    }
  },
  methods: {
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
  beforeDestroy() {
    // 當組件銷毀時清理定時器，避免記憶體洩漏
    this.stopTokenRefreshTimer();
  }
};
</script>


<style lang="scss">
// @import '~vue-multiselect/dist/vue-multiselect.min.css';
$bg-path: "~@/assets/image/bg.png";

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
  gap: .625rem 0
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
  margin: 4% 4% 4% 6%;
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
.password-modal {
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

  // --- 當螢幕是直向 (Portrait) 時顯示 ---
  @media screen and (orientation: portrait) {
    display: block !important;
  }
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

@media (orientation: landscape) and (max-height: 74.9988rem) and (pointer: coarse) {
  .return-last-page {
    padding: 1rem 0 0 0;
  }

  .main-card,
  .intro-card {
    min-width: 31.25rem !important;
  }
}

@media (orientation: landscape) and (max-height: 47.9988rem) and (pointer: coarse) {
  .return-last-page {
    padding: 1rem 0 0 2rem;
  }

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
        font-size: 7.5rem !important;
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