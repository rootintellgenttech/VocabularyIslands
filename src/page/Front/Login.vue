<template>
  <div class="login-page">
    <vue-custom-scrollbar :settings="scrollSettings">
      <el-row class="login-container" :gutter="40">
        <el-col :sm='24' :xl="13">
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
        </el-col>
        <el-col :sm='24' :xl="11">
          <div class="login-card">
            <h2 class="card-title">登入系統</h2>
            <p class="card-subtitle">選擇身分並登入您的帳號</p>

            <div class="role-switch">
              <button :class="['role-btn', { active: currentRole === 'student' }]" @click="currentRole = 'student'">
                學生
              </button>
              <button :class="['role-btn', { active: currentRole === 'teacher' }]" @click="currentRole = 'teacher'">
                老師
              </button>
            </div>

            <div class="login-form-container">
              <div class="input-group">
                <label class="input-label">帳號</label>
                <el-input id="user" type="text" class="custom-input" v-model="loginForm.account"
                  :placeholder="rolePlaceholder.account"></el-input>
              </div>

              <div class="input-group">
                <label class="input-label">密碼</label>
                <el-input id="pw" type="password" class="custom-input" show-password v-model="loginForm.password"
                  :placeholder="rolePlaceholder.password"></el-input>
              </div>

              <button class="login-submit-btn" @click="handleLogin">
                {{ submitButtonText }}
              </button>

              <p class="forgot-password-link" @click="openForgetPassModal">忘記密碼</p>
            </div>

            <!-- 快速身份登錄 -->
            <!-- <div class="dev-test-zone">
              <p class="dev-title">🛠️ 開發測試快速通道 (點擊直接登入)</p>
              <div class="dev-btn-grid">
                <button v-for="(role, index) in testRoles" :key="index" class="dev-role-btn" :class="role.class"
                  @click="handleTestLogin(role)">
                  {{ role.name }}
                </button>
              </div>
            </div> -->

          </div>
        </el-col>
      </el-row>
    </vue-custom-scrollbar>
<el-dialog custom-class="confirm-pw-modal" :visible.sync="showFirstLoginDialog" width="600px" center :close-on-click-modal="false" :show-close="false">
    <div class="dialog-content">
        <h3 class="title">
            <i class="fas fa-key"></i> 安全提示：首次登錄建議修改密碼
        </h3>
        <p class="description">為了保障您的帳戶安全，系統建議您修改初始密碼。若您現在不方便修改，可以選擇「沿用舊密碼」進入系統，但下次登錄時仍會出現此提示。</p>
        
        <p class="description pw-checklist-title">修改密碼建議：</p>
        <ul class="pw-checklist">
            <li>密碼長度至少 6 位</li>
            <li>包含英文字母與數字</li>
            <li>請勿使用過於簡單的組合</li>
        </ul>
        <p class="description ask-confirm-pw">您是否要現在前往修改？</p>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="handleKeepOldPassword">沿用舊密碼</el-button>
        <el-button type="primary" @click="openChangePassDialog">前往修改</el-button>
    </span>
</el-dialog>

<el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showChangePassDialog" width="450px" center :close-on-click-modal="false" :show-close="false">
    <div class="dialog-content">
        <h3 class="title">
            <i class="fas fa-edit"></i> 設定新密碼
        </h3>
        
            <el-form class="input-pw-area" :model="passForm" :rules="passRules" ref="passForm" label-position="top">
                <el-form-item label="請輸入新密碼 (至少 6 位)" prop="new_password">
                    <el-input v-model="passForm.new_password" type="password" show-password placeholder="請輸入新密碼"></el-input>
                </el-form-item>
            </el-form>

        <p class="description">修改成功後，系統將引導您使用新密碼重新登錄。</p>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="closeChangePassDialog">取 消</el-button>
        <el-button type="primary" @click="submitNewPassword">確認修改</el-button>
    </span>
</el-dialog>

<el-dialog custom-class="challenge-confirm-modal" :visible.sync="showForgetPassDialog" width="550px" center :close-on-click-modal="false" :show-close="false">
    <div class="dialog-content">
        <h3 class="title">
            <i class="fas fa-question-circle"></i> 找回密碼
        </h3>
        
        <p class="description">請輸入帳號與綁定的 Email，系統將驗證身分。</p>

        <div style="margin: 20px 0; width: 80%;">
            <el-form :model="forgetForm" :rules="forgetRules" ref="forgetForm" label-position="top">
                <el-form-item label="用戶帳號" prop="username">
                    <el-input v-model="forgetForm.username" placeholder="請輸入帳號"></el-input>
                </el-form-item>
                <el-form-item label="電子郵件" prop="email">
                    <el-input v-model="forgetForm.email" placeholder="請輸入 Email"></el-input>
                </el-form-item>
            </el-form>
        </div>

    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="showForgetPassDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleForgetPassword">提 交</el-button>
    </span>
</el-dialog>

<el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showResetPassDialog" width="450px" center :close-on-click-modal="false" :show-close="false">
    <div class="dialog-content">
        <h3 class="title">
            <i class="fas fa-lock-open"></i> 重設您的新密碼
        </h3>
        <p class="description">驗證成功！請在下方輸入您想設定的新密碼。</p>
        
        <el-form class="input-pw-area" :model="resetPassForm" :rules="passRules" ref="resetPassForm" label-position="top">
            <el-form-item label="新密碼 (至少 6 位)" prop="new_password">
                <el-input v-model="resetPassForm.new_password" type="password" show-password placeholder="請輸入新密碼"></el-input>
            </el-form-item>
        </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="showResetPassDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleResetPasswordSubmit">確認重設</el-button>
    </span>
</el-dialog>

  </div>
</template>


<script>
import api from '../../config/api';

export default {
  name: 'Login',
  props: {
    scrollSettings: {
      type: Object,
      default: () => ({
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: false
      })
    }
  },
  data() {
    return {
      currentRole: 'student',
      loginForm: {
        account: '',
        password: '',
      },
      alertMessage: '',
      alertType: 'error', // success, info, warning, error
      showAlert: false,

      testRoles: [
        { key: 'student', name: '1. 學生', path: '/home', class: 'btn-student' },
        { key: 'school_admin', name: '2. 學校管理員', path: '/dashboard', class: 'btn-admin' },
        { key: 'alliance_leader', name: '3. 聯盟召集人', path: '/dashboard', class: 'btn-admin' },
        { key: 'general_leader', name: '4. 總召集人', path: '/dashboard', class: 'btn-top' },
        { key: 'moe', name: '5. 教育部', path: '/dashboard', class: 'btn-top' },
        { key: 'teacher', name: '6. 老師', path: '/dashboard', class: 'btn-teacher' },
      ],
      defaultBackendTokens: {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1ODY3NDc0LCJpYXQiOjE3NjU4NjU2NzQsImp0aSI6ImU2YTc4OTVhZDRlNzQ1NzBhMmEyMmE4OTA4YjM1ZDBjIiwidXNlcl9pZCI6MzV9.lewJXA_rBur_1gPtrZqcmeai4K5etxhSN27X7P4FU0",
        "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2NjQ3MDQ3NCwiaWF0IjoxNzY1ODY1Njc0LCJqdGkiOiIxNTc3MDU0YWQ0NzI0NmEyOGY0OGVhNDhiMDM1ODNkMyIsInVzZXJfaWQiOjM1fQ.E_wvI9MgdA0rNC9XCRRYGFpggsl1N6djXj9zfMM2BeI",
        "email": "test@example.com"
      },
      showFirstLoginDialog: false,
      showChangePassDialog: false,
      tempLoginData: null,
      tempPath: '',
      passForm: { new_password: '' },
      passRules: {
        new_password: [
          { required: true, message: '請輸入密碼', trigger: 'blur' },
          { min: 6, message: '密碼長度至少為 6 個單位', trigger: 'blur' }
        ]
      },
   showForgetPassDialog: false,
    forgetForm: {
      username: '',
      email: ''
    },
    forgetRules: {
      username: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
      email: [
        { required: true, message: '請輸入 Email', trigger: 'blur' },
        { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
      ]
    },
    showResetPassDialog: false,
    resetPassToken: '', // 用於存儲網址帶來的 token
    resetPassForm: {
      new_password: ''
    }
  
  };
},
mounted() {
  const fullPath = window.location.href;
  // 尋找 login 字樣後的內容
  if (fullPath.includes('/login/')) {
    let rawToken = fullPath.split('/login/')[1];
    
    // 徹底移除結尾的斜槓與任何 Query String
    const token = rawToken.split('?')[0].replace(/\/+$/, "");
    
    if (token && token.length > 50) {
      console.log('[系統] 成功解析 Token:', token);
      this.resetPassToken = token;
      this.showResetPassDialog = true;
    }
  }
},
  computed: {
    rolePlaceholder() {
      return this.currentRole === 'student'
        ? { account: '輸入學生帳號', password: '輸入密碼' }
        : { account: '輸入老師帳號', password: '輸入密碼' };
    },
    submitButtonText() {
      return this.currentRole === 'teacher' ? '老師登入' : '學生登入';
    }
  },
methods: {
    // 1. 觸發忘記密碼彈窗
    openForgetPassModal() {
      this.showForgetPassDialog = true;
      if (this.$refs.forgetForm) {
        this.$refs.forgetForm.resetFields();
      }
    },

    // 2. 忘記密碼提交
    async handleForgetPassword() {
      this.$refs.forgetForm.validate(async (valid) => {
        if (!valid) return;
        try {
          await api.post('students/forget-password/', {
            username: this.forgetForm.username,
            email: this.forgetForm.email
          });
          alert('重設密碼請求已送出，請檢查您的信箱。');
          this.showForgetPassDialog = false;
        } catch (error) {
          alert(error.response?.data?.detail || '發送失敗');
        }
      });
    },

    // 3. 處理登入 API
    async handleLogin() {
      this.showAlert = false;
      if (!this.loginForm.account || !this.loginForm.password) {
        alert('請輸入帳號和密碼');
        return;
      }

      const roleKey = this.currentRole === 'student' ? 'student' : 'teacher';
      const path = roleKey === 'student' ? '/home' : '/dashboard';
      const endpoint = roleKey === 'student' ? 'students/login/' : 'teachers/login/';

      try {
        const response = await api.post(endpoint, {
          username: this.loginForm.account,
          password: this.loginForm.password,
        });
        const loginResponseData = { ...response.data, role: roleKey };

        // 學生首次登入攔截
        if (roleKey === 'student' && loginResponseData.first_login) {
          this.tempLoginData = loginResponseData;
          this.tempPath = path;
          this.showFirstLoginDialog = true;
        } else {
          this.performLogin(loginResponseData, path);
        }
      } catch (error) {
        alert(error.response?.data?.detail || '登入失敗');
      }
    },

    // 4.沿用舊密碼：回傳 skip_change: true
    async handleKeepOldPassword() {
      this.performLogin(this.tempLoginData, null); // 需先存 Token
      try {
        await api.post('students/first-change-password/', { 
          skip_change: true 
        });
        this.showFirstLoginDialog = false;
        this.$router.push(this.tempPath);
      } catch (err) {
        this.$router.push(this.tempPath); // 失敗仍進入，避免死循環
      }
    },

    // 5. 前往修改密碼對話框
    openChangePassDialog() {
      this.showFirstLoginDialog = false;
      this.showChangePassDialog = true;
    },

  closeChangePassDialog() {
    this.showChangePassDialog = false;
    
    // 做法 1：手動清空數據
    this.passForm.new_password = '';
    
    // 做法 2：重置 Element UI 表單校驗狀態與數值（推薦）
    if (this.$refs.passForm) {
      this.$refs.passForm.resetFields();
    }
  },

  async submitNewPassword() {
    this.$refs.passForm.validate(async (valid) => {
      if (!valid) return;
      this.performLogin(this.tempLoginData, null);
      try {
        await api.post('students/first-change-password/', {
          new_password: this.passForm.new_password
        });
        alert('密碼修改成功，請使用新密碼重新登入');
        
        // 成功後清理
        this.closeChangePassDialog(); 
        this.logoutAndReset();
      } catch (err) {
        alert('修改失敗，請稍後再試');
      }
    });
  },
  
  logoutAndReset() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    if (window.tokenTimer) clearInterval(window.tokenTimer);
    
    this.loginForm.password = ''; // 清空登入頁的密碼
  }
,

 async performLogin(loginData, path) {
      const token = loginData.token || loginData.access;
      const refresh = loginData.refresh;
      const role = loginData.role;

      localStorage.setItem('userRole', role);
      localStorage.setItem('accessToken', token); 
      localStorage.setItem('refreshToken', refresh);
      
      this.startTokenRefreshTimer();

      if (role === 'student') {
        try {
          const res = await api.post('students/attendance/');
          console.log('[系統] 簽到成功:', res.data.message);
        } catch (err) {
          console.warn('[系統] 簽到提示:', err.response?.data?.message || '今日已完成簽到');
        }

      }

      if (path) {
        this.$router.push(path);
      }
    },

    // 9. 測試帳號快捷登入
    handleTestLogin(role) {
      const loginResponseData = { ...this.defaultBackendTokens, role: role.key };
      this.performLogin(loginResponseData, role.path);
    },

    // 10. Token 刷新計時器
  async startTokenRefreshTimer() {
  if (this.refreshTimer) return;

  this.refreshTimer = setInterval(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.stopTokenRefreshTimer();
      return;
    }
        try {
          const response = await api.post('students/refresh/', { refresh: refreshToken });
          const { token: newAccessToken, refresh: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        } catch (err) {
          clearInterval(window.tokenTimer);
        }
      }, 25 * 60 * 1000);
    },
   // 提交重設密碼 
  async handleResetPasswordSubmit() {
  this.$refs.resetPassForm.validate(async (valid) => {
    if (!valid) return;
    try {
      // 根據你的 API 需求，傳入 token 與新密碼
      await api.post('students/reset-password/', {
        token: this.resetPassToken,
        new_password: this.resetPassForm.new_password
      });
      
      alert('密碼重設成功！');
      this.showResetPassDialog = false;
      this.resetPassForm.new_password = '';
      
      // 清理網址，回到乾淨的 /login
      this.$router.replace('/login');
    } catch (error) {
      alert(error.response?.data?.detail || '重設失敗，連結可能過期');
    }
  });
}
 },


}
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
  padding: 0 18%;

  i {
    margin-right: 4px;
  }
}
.el-dialog .title{
      margin-bottom: 10px;
}
   .confirm-pw-modal {

        .description,
        .pw-checklist {
            display: inline;
            align-self: flex-start;
            margin: 4px 0;
            text-align: left !important;
        }

        .pw-checklist {
            font-weight: 600;
            padding-left: 3%;
        }

        .ask-confirm-pw {
            margin-top: 16px;
        }
        .el-dialog__footer button{
          width: 120px
        }
    }
    .confirm-change-pw-modal{
.description{
  text-align: center;
}
.input-pw-area{
  margin-top: 24px;
}
    }

.login-container {
  @include flex-center;
  height: 100vh;

  .announcement-card,
  .login-card {
    background-color: $card-bg;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 11px;
    padding: 24px;
    height: 100%;
  }

  .announcement-card {
    position: relative;
    z-index: 10;

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
        color: $main-black-text;
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
        color: $main-grey-text;
        margin: 5px 0;
      }

      .item-date {
        display: block;
        font-size: 12px;
        color: $main-grey-text;
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

    .login-form-container {
      text-align: left;
      padding: 0 10px;

      .forgot-password-link {
        color: $main-dark-blue;
        display: flex;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        margin-top: 16px;
      }
    }

    .input-group {
      margin-bottom: 20px;


      .input-label {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: $main-black-text;
        margin-bottom: 8px;
      }

      .custom-input {
        width: 100%;

        outline: none;

        color: $main-black-text;
        transition: box-shadow 0.2s;

        input {
          padding: 14px 16px;
          font-size: 15px;
          border: #28A99C33 1px solid;
          border-radius: 12px;
          background-color: #F0FAFF;
        }

        &::placeholder {
          color: #AAB8C2;
        }


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
            color: $main-black-text;
          }
        }
      }
    }

    button {
      @include second-green-bg;
      width: 100%;
      border: none;
      padding: 12px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;

      &:hover {
        background-color: #acf5ee;
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

.dev-test-zone {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px dashed #eee;
  .dev-title {
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
    text-align: center;
    font-weight: bold;
  }

  .dev-btn-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .dev-role-btn {
    border: none;
    padding: 8px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
    color: white;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    /* 不同身份不同顏色，方便識別 */
    &.btn-student {
      background-color: #38bdf8;
    }

    /* 藍色 */
    &.btn-teacher {
      background-color: #2A9D8F;
    }

    /* 綠色 */
    &.btn-admin {
      background-color: #F4A261;
    }

    /* 橘色 (學校/聯盟) */
    &.btn-top {
      background-color: #E76F51;
    }

    /* 紅色 (總召/教育部) */
  }
}

@media (orientation: landscape) and (max-height: 1199.98px) and (pointer: coarse) {

  .login-page {
    padding: 0 8%;
  }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .login-container {
    display: flex;
    flex-direction: column;
  }

}
</style>
