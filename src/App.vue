<template>
  <div id="app" :class="{ 'has-global-bg': $route.path !== '/login' }">
    <Sidebar v-if="!$route.meta.hideSidebar" />
    <router-view class="router-view-content" />
    <div class="orientation-lock">
      <div class="lock-content">
        <i class="fas fa-mobile-alt"></i>
        <p>為了最佳學習體驗<br>請將平板轉為橫向</p>
      </div>
    </div>
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
      refreshTimer: null 
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

.el-form--label-top .el-form-item__label {
    display: flex !important; 
    // justify-content: center;
padding:0 !important
}

.loading-container {
    @include flex-center;
    font-size: 24px;
    font-weight: 600;
    color: $main-black-text;
    justify-content: center;
    flex-direction: column;
    gap: 10px 0
}

.el-table .cell{
  font-size: 16px;
    }

.level-scroll-container {
  height: 350px;
  padding:6px 0;
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
    width: 300px;
    height: 100%;
  }
}


.return-last-page {
  @include card-return-text;
  padding: 16px 0 0 24px;
}

.timer-bar {
  flex-grow: 1;
  margin-right: 20px;

  .timer-progress {
    .el-progress-bar__outer {
      border: 2px solid #DAE2E7 !important;
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
    padding: 30px 20px 24px !important;

    .title {
      font-weight: 600;
      font-size: 20px;
      color: $main-black-text;
      margin-bottom: 4px;
    }
  }

  .dialog-content {
    @include flex-center;
    flex-direction: column;
    padding: 0 !important;

    .dialog-avatar,
    .result-avatar {
      width: 180px;
      height: auto;
      margin-bottom: 12px;
    }


    .description {
      text-align: center;
      color: $main-grey-text;
      font-size: 16px;
    }
  }

  .el-dialog__footer button {
    width: 100px;
  }

  .el-dialog--center .el-dialog__body,
  .el-dialog__footer {
    padding: 0 !important;
  }

  .el-dialog__footer button:nth-child(1) {
    border: $main-grey-text solid 1px;

    &:hover {
      background: #67777E;
      color: white;
    }
  }

  .el-dialog__footer button:nth-child(2) {
    background-color: #4ABCB1;
    color: white;
    border-color: #4ABCB1;

    &:hover {
      background-color: #2eaf92;
    }
  }
}

.start-modal {
  height: 450px;
  border: 4px solid #DAE2E0;
  border-radius: 16px !important;
}

.challenge-confirm-modal,.confirm-pw-modal,.confirm-change-pw-modal,
.exit-confirm-modal {
  border: 6px solid var(--btn-g, #4ABCB1);
  border-radius: 16px !important;
  padding-bottom: 24px;

  .warning-text {
    color: #761C00;
    font-weight: bold;
    margin-top: 10px;
  }
}


.challenge-confirm-modal .title {
  margin-bottom: 16px !important;
}


button {
  cursor: pointer;
}

.is-bw {
  filter: grayscale(100%);
}



.tinder-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  min-width: 600px;
  box-shadow: 0 6px 10px -2px rgba(0, 0, 0, 0.15) !important
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
      font-size: 80px;
      margin-bottom: 30px;
      animation: rotate-device 2s infinite ease-in-out;
    }

    p {
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 2px;
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
    transform: rotate(-90deg); // 模擬向左轉橫
    opacity: 1;
  }

  100% {
    transform: rotate(-90deg);
    opacity: 0;
  }
}

// .multiselect__single {
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
//   text-align: center;
//   line-height: unset !important;
// border-radius: 16px !important;
//   margin-bottom: 0 !important;
//   min-height: 54px;
// }

// .multiselect--active {

//   .multiselect__tags {
//     border-bottom-left-radius: 0 !important;
//     border-bottom-right-radius: 0 !important;
//   }

//   .multiselect__content-wrapper {
//     border-top-left-radius: 0;
//     border-top-right-radius: 0;
//   }
// }

// .multiselect__single {
//   font-size: 32px !important;
//   font-weight: 600;
// }

// .multiselect__select {
//   height: 54px !important;
// }


// .multiselect__tags {
//   border-radius: 16px !important;
//   padding: 0 40px 0 0 !important;
//   min-height: 54px !important;
//   border: none
// }

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {

    .tinder-card{
                min-width: unset;
            }

  .main-card {
        width: 500px !important;

        .question-content{
                  padding: 5% !important;
                .question-wrap .question-title{
    font-size:32px;
                  }
        }
  
  }

  .page-title {
    font-size: 24px;
  }

  // :deep(.multiselect__tags),
  // :deep(.multiselect__select),
  // :deep(.multiselect__single) {
  //   min-height: 43px !important;
  //   height: 43px !important;
  // }

  // :deep(.multiselect__single) {
  //   font-size: 24px;
  // }

  .router-view-content {
    padding-left: 0;
  }


}
</style>