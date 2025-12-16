<template>
  <div class="login-page">
    <el-row class="login-container">
      <el-col :span="24">
        <div class="announcement-card">
          <h2 class="card-title"><i class="fa-solid fa-bullhorn"></i>最新公告</h2>
          <div class="announcement-list">
            
            <vue-custom-scrollbar :settings="scrollSettings">
              <div class="announcement-item">
                <div class="item-header">
                  <div class="news-title">
                    <i class="fa-solid fa-star" style="color: #FFD43B;"></i>新島嶼開放
                  </div>
                  <div class="news-tag">
                    <span class="tag new">新</span>
                  </div>

                </div>
                <p class="item-content">1200字節點島嶼已開放，歡迎九年級以上同學挑戰！</p>
                <span class="item-date">2024-01-15</span>
              </div>

              <div class="announcement-item">
                <div class="item-header">
                  <div class="news-title">
                    <i class="fa-solid fa-pen" style="color: #d56039;"></i>單字測驗通知
                  </div>
                  <div class="news-tag">
                    <span class="tag active">活動</span>
                  </div>

                </div>
                <p class="item-content">本月單字學測將於11月25日舉行，請同學們準備。</p>
                <span class="item-date">2024-01-10</span>
              </div>

              <div class="announcement-item">
                <div class="item-header">
                  <div class="news-title">
                    <i class="fa-solid fa-rocket" style="color: #63E6BE;"></i>新功能上線
                  </div>
                  <div class="news-tag">
                    <span class="tag update">更新</span>
                  </div>

                </div>
                <p class="item-content">全新語音輸入功能現已推出！讓學習更有效率。</p>
                <span class="item-date">2024-01-20</span>
              </div>

              <div class="announcement-item">
                <div class="item-header">
                  <div class="news-title">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #e12323;"></i>伺服器維護
                  </div>
                  <div class="news-tag">
                    <span class="tag maintain">維護</span>
                  </div>

                </div>
                <p class="item-content">系統將於明日凌晨2點進行維護，屆時服務將暫停約30分鐘。</p>
                <span class="item-date">2024-01-19</span>
              </div>

              <div class="announcement-item">
                <div class="item-header">
                  <div class="news-title">
                    <i class="fa-solid fa-wrench" style="color: #74C0FC;"></i>系統更新
                  </div>
                  <div class="news-tag">
                    <span class="tag update">更新</span>
                  </div>

                </div>
                <p class="item-content">新增多項成就徽章，完成任務即可獲得專屬獎勵！</p>
                <span class="item-date">2024-01-05</span>
              </div>
            </vue-custom-scrollbar>

          </div>
        </div>

        <div class="login-card">
          <h2 class="card-title">登入系統</h2>
          <p class="card-subtitle">透過Google登入您的帳號</p>

          <div class="role-switch">
            <button :class="['role-btn', { active: currentRole === 'student' }]" @click="currentRole = 'student'">
              學生
            </button>
            <button :class="['role-btn', { active: currentRole === 'teacher' }]" @click="currentRole = 'teacher'">
              老師
            </button>
          </div>


          <button class="login-google" @click="handleLogin" :disabled="!currentRole">
            <img src="../../assets/image/login/google.png">
            透過Google登入
          </button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>


<script>

export default {
  name: 'Login',
  data() {
    return {
      currentRole: '',
      loginForm: {
        account: '',
        password: '',
      },
      // 滾動條設定 (縱向滾動)
      scrollSettings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false
      }
    };
  },
  computed: {
    // 根據角色顯示不同的 placeholder 提示
    rolePlaceholder() {
      if (this.currentRole === 'student') {
        return {
          account: '輸入學生帳號 (std123)',
          password: '輸入密碼 (std123)',
        };
      } else {
        return {
          account: '輸入老師帳號 (tch789)',
          password: '輸入密碼 (tch789)',
        };
      }
    },
  },
  methods: {
    // 處理登入邏輯
    handleLogin() {
      console.log('嘗試登入...');
      console.log('身分:', this.currentRole);
      console.log('帳號:', this.loginForm.account);

      // --- 模擬登入成功並導向 Home 頁面 ---
      this.$router.push('/home');
    },
  },
};
</script>
<style lang="scss">
$primary-color: #38bdf8;
$card-bg: #fff;
$bg-path: "~@/assets/image/login-bg.jpg";


.login-page {
  min-height: 100vh;
  background-image: url($bg-path);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;

  i {
    margin-right: 4px;
  }
}

.login-container {
  background-color: $card-bg;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 11px;
  width: 700px;
  padding: 30px;

  .announcement-card {
    position: relative;
    z-index: 10;
    margin-bottom: 24px;

    .announcement-list {
      margin-top: 8px;

      .ps {
        height: 380px;
      }

    }

    .announcement-item {
      padding: 12px;
      border-radius: 16px;
      margin: 12px 0;
      background-color: #F0F3F580;

      &:last-child {
        border-bottom: none;
      }

      .item-header {
        font-weight: bold;
        color: #0F0F00;
        margin-bottom: 5px;
        @include flex-center;
        gap: 10px;
        justify-content: space-between;
      }

      .tag {
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 4px;
        color: $card-bg;

        &.new {
          background-color: $primary-color;
        }

        &.active {
          background-color: #f97316;
        }

        &.update {
          background-color: #6366f1;
        }

        &.maintain {
          background-color: #268b7b;
        }
      }

      .item-content {
        font-size: 16px;
        color:$main-grey-text;
        margin: 5px 0;
      }

      .item-date {
        display: block;
        font-size: 12px;
       color:$main-grey-text;
      }
    }
  }

  .card-title {
    color: $main-blue-text;
    font-size: 24px;
    font-weight: bold;
    @include flex-center;
  }

  .login-card {
    text-align: center;
    width: 400px;
    margin: auto;

    .login-google {
      border-radius: 16px;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        background-color: #e0f2f1;
      }
    }

    .role-switch {
      display: flex;
      margin-bottom: 30px;
      border: 1px solid #DAE2E7;
      border-radius: 11px;
      overflow: hidden;
      padding: 8px;


      .role-btn {
        flex: 1;
        padding: 8px;
        background-color: #F8F9FA;
        font-size: 16px;
        transition: all 0.2s ease;
        border: none;

        &:nth-child(1) {
          border-radius: 8px 0 0 8px;
        }

        &:nth-child(2) {
          border-radius: 0 8px 8px 0;
        }

        &.active {

          // 學生 (第一個按鈕)
          &:nth-child(1) {
            @include second-green-bg;
          }

          // 老師 (第二個按鈕)
          &:nth-child(2) {
            background-color: #4ABCB1;
            color: #0F0F00;
          }
        }
      }
    }

    button {
      position: relative;
      background-color: #C5EDE9;
      border: rgba(0, 0, 0, 0.1764705882) 1px solid;
      width: 100%;
      padding: 12px 0;
      display: flex;
      justify-self: center;
      justify-content: center;
      align-items: center;

      &:hover {
        background-color: #acf5ee;
      }

      img {
        position: absolute;
        left: 24px;
        width: 24px;
        height: 24px;
        margin-right: 0;
      }
    }

    .card-title {
      justify-content: center;
    }

    .card-subtitle {
      font-size: 16px;
      text-align: center;
      color: #666;
      margin-bottom: 25px;
    }

  }

}



@media (max-width: 1024px) {
  .login-container {
    gap: 20px;
    max-width: 800px;


    .announcement-card,
    .login-card {
      padding: 20px;
    }
  }
}

@media (max-height: 700px) {
  .login-page {
    align-items: flex-start;
    padding: 20px;
  }
}
</style>