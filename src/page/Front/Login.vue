<template>
  <div v-if="isOidcLoading" class="callback-loading" style="text-align: center; padding: 100px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在獲取學生資料並登入...</h2>
    <p>請稍候，正在與教育局連線中...</p>
  </div>
  <div v-else class="login-page">
    <el-row>
      <div class="logo-section">
        <img src="../../assets/image/login/logo.png" alt="Logo">
      </div>
    </el-row>
    <el-row class="login-container" :gutter="40" type="flex">
      <el-col :span="12">
        <div class="announcement-card mobile-scroll-box">
          <h2 class="card-title">
            <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>最新公告
          </h2>
          <vue-custom-scrollbar :settings="scrollSettings" class="announcement-list" aria-label="最新公告列表">
            <div v-if="loadingNews" style="text-align: center; padding: 20px; color: #999;">
              <i class="fa-solid fa-spinner fa-spin"></i> 公告載入中...
            </div>

            <div v-else-if="announcements.length === 0" style="text-align: center; padding: 20px; color: #999;">
              目前尚無公告
            </div>
            <div v-for="(item, index) in announcements" :key="item.id" class="announcement-item">
              <div class="item-header">
                <div class="news-title">
                  <i class="fa-solid fa-bullhorn" style="color: #FFD43B;"></i>
                  {{ item.title }}
                </div>
                <div v-if="item.category" class="news-tag">
                  <span class="tag new">{{ item.category }}</span>
                </div>
              </div>
              <p class="item-content">{{ item.content }}</p>
              <span class="item-date">{{ item.date }}</span>
            </div>
          </vue-custom-scrollbar>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="login-card mobile-scroll-box">
          <h2 class="card-title">登入系統</h2>
          <p class="card-subtitle">選擇身分並登入您的帳號</p>

          <div class="role-switch">
            <button :class="['role-btn', { active: currentRole === 'student' }]" @click="currentRole = 'student'">
              學生
            </button>
            <button :class="['role-btn', { active: currentRole === 'teacher' }]" @click="currentRole = 'teacher'">
              教職員
            </button>
          </div>

          <p v-if="currentRole === 'teacher'" class="role-notice-text">
            * 帳號密碼請跟主管機關索取
          </p>
          <p v-else class="role-notice-text">* 學生登入將自動前往另一頁面</p>

          <div class="login-form-container">
            <div v-if="currentRole === 'student'" class="student-input-zone">
              <div class="input-group">
                <label class="input-label">登入說明</label>
                <div class="oidc-notice-box">
                  <p>本系統已接高雄市教育局單一簽入 (OIDC)</p>
                  <p>點擊下方按鈕後，將前往教育局驗證頁面輸入您的帳號與密碼。</p>
                </div>
              </div>

              <div class="input-group" style="opacity: 0.6;">
                <label class="input-label" for="student-account-placeholder">帳號 / 密碼</label>

                <el-input id="student-account-placeholder" placeholder="請於跳轉後的教育局頁面輸入" disabled class="custom-input"
                  title="帳號密碼輸入說明：請於跳轉後的教育局頁面輸入" aria-label="帳號密碼輸入說明：請於跳轉後的教育局頁面輸入">
                </el-input>
              </div>

              <button class="login-submit-btn" @click="handleOidcLogin">
                <i class="fa-solid fa-graduation-cap"></i> 前往教育局認證登入
              </button>
            </div>

            <div v-if="currentRole === 'teacher'" class="teacher-input-zone">
              <div class="input-group">
                <label class="input-label" for="teacher-account">帳號</label>
                <el-input id="teacher-account" v-model="teacherForm.account" placeholder="請輸入教職員帳號"
                  class="custom-input">
                </el-input>
              </div>
              <div class="input-group">
                <label class="input-label" for="teacher-password">密碼</label>
                <el-input id="teacher-password" type="password" v-model="teacherForm.password" show-password
                  placeholder="請輸入密碼" class="custom-input">
                </el-input>
              </div>
              <button @click="handleLogin">
                <i class="fa-solid fa-chalkboard-user"></i> 教職員登入
              </button>

              <p class="forgot-password-link" @click="openForgetPassModal">忘記密碼</p>
            </div>
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

    <div class="login-footer">
      <div class="footer-scroll">
        <p>英閱奇航 玩轉ABC</p>
        <p>©高雄市政府教育局</p>
        <p>地址：826002高雄市梓官區進學路61號</p>
        <p>電話：07-6193927</p>
        <p>傳真：07-6107135</p>
        <p>VoIP：07-2624457</p>
      </div>
    </div>

    <el-dialog custom-class="confirm-pw-modal" :visible.sync="showFirstLoginDialog" width="600px" center
      :close-on-click-modal="false" :show-close="false">
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

    <el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showChangePassDialog" width="450px" center
      :close-on-click-modal="false" :show-close="false">
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

    <el-dialog custom-class="challenge-confirm-modal" :visible.sync="showForgetPassDialog" width="550px" center
      :close-on-click-modal="false" :show-close="false">
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

    <el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showResetPassDialog" width="450px" center
      :close-on-click-modal="false" :show-close="false">
      <div class="dialog-content">
        <h3 class="title">
          <i class="fas fa-lock-open"></i> 重設您的新密碼
        </h3>
        <p class="description">驗證成功！請在下方輸入您想設定的新密碼。</p>

        <el-form class="input-pw-area" :model="resetPassForm" :rules="passRules" ref="resetPassForm"
          label-position="top">
          <el-form-item label="新密碼 (至少 6 位)" prop="new_password">
            <el-input v-model="resetPassForm.new_password" type="password" show-password
              placeholder="請輸入新密碼"></el-input>
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
import { mapActions, mapGetters } from 'vuex';
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'Login',

  props: {
    scrollSettings: {
      suppressScrollY: false,
      suppressScrollX: true,
      wheelPropagation: false
    }
  },
  data() {
    return {
      loadingNews: false,
      announcements: [],
      isOidcLoading: false,
      currentRole: 'student',
      studentForm: {
        account: '',
      },
      teacherForm: {
        account: '',
        password: '',
      },
      alertMessage: '',
      alertType: 'error', // success, info, warning, error
      showAlert: false,
      testRoles: [
        {
          key: 'student',
          name: '1. 學生 (God Mode)',
          path: '/home',
          class: 'btn-student',
          account: 's0099999',
          password: '0kiec354'
        },
        {
          key: 'school_admin',
          name: '2. 學校管理員',
          path: '/dashboard',
          class: 'btn-admin',
          account: 'school_admin@example.com',
          password: 'ENpassword123'
        },
        {
          key: 'union_leader',
          name: '3. 聯盟召集人',
          path: '/dashboard',
          class: 'btn-admin',
          account: 'union_leader@example.com',
          password: 'ENpassword123'
        },
        {
          key: 'global_leader',
          name: '4. 總召集人/教育部',
          path: '/dashboard',
          class: 'btn-top',
          account: 'global_leader@example.com',
          password: 'ENpassword123'
        }
      ],
      // defaultBackendTokens: {
      //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1ODY3NDc0LCJpYXQiOjE3NjU4NjU2NzQsImp0aSI6ImU2YTc4OTVhZDRlNzQ1NzBhMmEyMmE4OTA4YjM1ZDBjIiwidXNlcl9pZCI6MzV9.lewJXA_rBur_1gPtrZqcmeai4K5etxhSN27X7P4FU0",
      //   "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2NjQ3MDQ3NCwiaWF0IjoxNzY1ODY1Njc0LCJqdGkiOiIxNTc3MDU0YWQ0NzI0NmEyOGY0OGVhNDhiMDM1ODNkMyIsInVzZXJfaWQiOjM1fQ.E_wvI9MgdA0rNC9XCRRYGFpggsl1N6djXj9zfMM2BeI",
      //   "email": "test@example.com"
      // },
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
      resetPassToken: '', // 存儲網址帶來的 token
      resetPassForm: {
        new_password: ''
      }

    };
  },
async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const isDebugMode = urlParams.get('debug_mode') === 'min_special';
    
    if (isDebugMode) {
      console.log('[Freego 應援] 偵測到檢測暗號，準備自動登入...');
      // 預設用第一個角色 (學生) 登入
      const autoRole = this.testRoles[0];
      if (autoRole) {
        this.handleTestLogin(autoRole);
        return; // 執行自動登入後跳出，不走後面的 OIDC 邏輯
      }
    }

    const code = this.$route.query.code || urlParams.get('code');
    const errorParam = this.$route.query.error || urlParams.get('error');

    // 如果不是 OIDC 回調，也不是偵錯模式，才清空緩存
    if (!code && !errorParam && !isDebugMode) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      console.log('[系統] 偵測為全新登入，已清空舊有緩存');
    }

    if (errorParam) {
      this.$message.error('教育局授權失敗或取消');
      window.history.replaceState({}, document.title, '/login');
      this.fetchNews();
      return;
    }

    if (code) {
      this.isOidcLoading = true;
      try {
        const resOidc = await api.post('/students/oidc/token/', {
          code: code,
          redirect_uri: `${window.location.origin}/api/oidccallback/`
        }, { timeout: 60000 });

        const idToken = resOidc.data.id_token;
        if (!idToken) throw new Error("沒有收到 id_token");
        const decodedUser = jwtDecode(idToken);

        const postData = {
          sub: decodedUser.sub,
          kh_profile: decodedUser.kh_profile || {},
          kh_titles: decodedUser.kh_titles || {},
          kh_classes: decodedUser.kh_classes || {}
        };

        const loginResponse = await api.post('students/oidc/oidclogin/', postData, { timeout: 60000 });
        window.history.replaceState({}, document.title, '/login');
        const targetPath = (loginResponse.data.role === 'student') ? '/' : '/dashboard';
        this.performLogin(loginResponse.data, targetPath);
      } catch (error) {
        console.error('OIDC 失敗:', error);
        this.isOidcLoading = false;
        this.$message.error('系統登入失敗');
        window.history.replaceState({}, document.title, '/login');
      }
      return;
    }
    this.fetchNews();
  },


  beforeDestroy() {
    // 移除監聽器
    window.removeEventListener('message', this.handleOidcMessage);
  },
  computed: {
    rolePlaceholder() {
      return this.currentRole === 'student'
        ? { account: '輸入學生帳號', password: '輸入密碼' }
        : { account: '輸入教職員帳號', password: '輸入密碼' };
    },
    submitButtonText() {
      return this.currentRole === 'teacher' ? '教職員登入' : '學生登入';
    },
    // 引入插件解析好的使用者資料
    ...mapGetters('oidcStore', ['oidcUser', 'oidcIsAuthenticated'])
  },
  methods: {
    // 引入插件的 登入 與 回調 函數
    ...mapActions('oidcStore', ['authenticateOidc', 'oidcSignInCallback']),

    // 觸發 OIDC 彈出/跳轉登入 (學生專用)
    async handleOidcLogin() {
      console.log('啟動教育局 OIDC 登入跳轉...');
      this.isOidcLoading = true;

      const redirectUri = `${window.location.origin}/api/oidccallback/`;
      const clientId = 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42';

      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const authUrl = `https://oidc.kh.edu.tw/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20kh_profile%20kh_classes%20kh_titles&state=${state}`;

      window.location.href = authUrl;
    },
    handleOidcMessage(event) {
      if (event.origin !== window.location.origin) return;

      const message = event.data;
      if (message.type === 'OIDC_LOGIN_SUCCESS') {
        const loginData = message.payload;

        // 加上預設值 'student'，避免後端沒給 role 時導致誤判
        const realRole = loginData.role || 'student';

        let targetPath = '';
        if (realRole === 'student') {
          targetPath = '/home';
        } else {
          targetPath = '/dashboard';
        }

        this.performLogin(loginData, targetPath);
      } else if (message.type === 'OIDC_LOGIN_ERROR') {
        alert('登入失敗: ' + message.error);
      }
    },
    //  觸發忘記密碼彈窗
    openForgetPassModal() {
      this.showForgetPassDialog = true;
      if (this.$refs.forgetForm) {
        this.$refs.forgetForm.resetFields();
      }
    },
    //  忘記密碼提交
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
    // 教職員點擊按鈕觸發這個
    async handleLogin() {
      if (!this.teacherForm.account || !this.teacherForm.password) {
        alert('請輸入帳號和密碼');
        return;
      }

      try {
        const response = await api.post('students/login/', {
          username: this.teacherForm.account,
          password: this.teacherForm.password,
        });
        this.performLogin(response.data, '/dashboard');
      } catch (error) {
        alert(error.response?.data?.detail || '登入失敗');
      }
    },
    async fetchNews() {
      this.loadingNews = true;
      try {
        const response = await api.get('students/news/list');
        this.announcements = response.data;
      } catch (error) {
        console.error('獲取公告失敗:', error);
      } finally {
        this.loadingNews = false;
      }
    },
    // 沿用舊密碼：回傳 skip_change: true
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

    // 前往修改密碼對話框
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

      this.loginForm.password = '';
    }
    ,

    async performLogin(loginData, path) {
      const token = loginData.token || loginData.access || loginData.access_token;
      const refresh = loginData.refresh || loginData.refresh_token;
      const role = loginData.role || 'student';

      localStorage.setItem('userRole', role);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // 只有真正的學生才執行簽到
      if (role === 'student') {
        try {
          await api.post('students/attendance/');
          console.log('%c[簽到] 今日首次登入，簽到成功！', 'color: #27ae60');
        } catch (err) {
          if (err.response && err.response.status === 400) {
            const msg = err.response.data.message || '已簽到';
            console.log(`%c[資訊] ${msg}`, 'color: #3498db; font-weight: bold;');
          }
        }
      }

      // 啟動刷新計時器
      this.startTokenRefreshTimer();

      if (path) {
        this.$router.push(path);
      }
    },

    // 測試帳號快捷登入：自動填入並執行 API 登入
    async handleTestLogin(role) {
      this.currentRole = (role.key === 'student') ? 'student' : 'teacher';

      const loginPayload = {
        username: role.account,
        password: role.password || 'ENpassword123' // 如果 role 沒寫密碼則用預設
      };

      try {
        console.log(`[GodMode] 正在以 ${role.name} 身分登入...`);

        const response = await api.post('students/login/', loginPayload);

        // 執行登入成功後的 token 存儲與跳轉
        // 如果是學生 role.path 通常是 /home，管理員則是 /dashboard
        this.performLogin(response.data, role.path);

        this.$message({
          message: `${role.name} 快速登入成功`,
          type: 'success'
        });
      } catch (error) {
        console.error('[GodMode] 登入失敗:', error);
        alert(role.name + ' 自動登入失敗：' + (error.response?.data?.detail || '網路錯誤'));
      }
    },
    //Token 刷新計時器
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
  justify-content: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .logo-section {
    padding-top: 2%;
    justify-content: center;
    @include flex-center;

    img {
      text-align: center;
      width: 40%;
    }
  }

  i {
    margin-right: .25rem;
  }
}

.el-dialog .title {
  margin-bottom: .625rem;
}

.confirm-pw-modal {

  .description,
  .pw-checklist {
    display: inline;
    align-self: flex-start;
    margin: .25rem 0;
    text-align: left !important;
  }

  .pw-checklist {
    font-weight: 600;
    padding-left: 3%;
  }

  .ask-confirm-pw {
    margin-top: 1rem;
  }

  .el-dialog__footer button {
    width: 7.5rem
  }
}

.confirm-change-pw-modal {
  .description {
    text-align: center;
  }

  .input-pw-area {
    margin-top: 1.5rem;
  }
}

.login-footer {
  @include second-green-bg;
  width: 100%;

  .footer-scroll {
    justify-content: center;
    display: flex;
    gap: 0 2rem;
  }
}

.login-container {
  width: 100vw;
  padding: 2% 18% 4%;

  #student-pass-disabled,
  #student-account,
  #teacher-account,
  #teacher-password {
    &::placeholder {
      color: #000;
    }
  }

  .el-col {
    display: flex;
    flex-direction: column;
  }

  .oidc-guide-box {
    text-align: center;

    .guide-text {
      color: #666;
    }

    .oidc-btn {
      @include flex-center;
      justify-content: center;
      gap: .625rem;
      background: linear-gradient(135deg, #4ABCB1 0%, #38bdf8 100%) !important;
      color: white !important;
      border-radius: .75rem;

      &:hover {
        filter: brightness(1.1);
      }
    }
  }

  .announcement-card,
  .login-card {
    height: 37.5rem;
    display: flex;
    flex-direction: column;
    background-color: $card-bg;
    box-shadow: 0 .25rem .75rem rgba(0, 0, 0, 0.1);
    border-radius: .6875rem;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .announcement-list {
    flex: 1;
    margin-top: .5rem;
    overflow-y: auto;

    .news-title,
    .item-content {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: auto;
      min-width: 0;
    }
  }

  .role-notice-text {
    font-size: 0.875rem;
    color: #ad5910;
    margin-top: -1.25rem;
    margin-bottom: 1.25rem;
    text-align: center;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-0.3125rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .announcement-card {
    position: relative;
    z-index: 10;

    .announcement-list {
      flex: 1;
      margin-top: .5rem;
      overflow-y: auto;
      min-height: 0;
    }

    .announcement-item {
      padding: .75rem;
      border-radius: 1rem;
      margin: .75rem 0;
      background-color: #F0F3F580;
      transition: transform 0.3s ease;

      &:hover {
        background-color: #f0f3f5d7;
      }

      &:last-child {
        border-bottom: none;
      }

      .item-header {
        font-weight: bold;
        color: $main-black-text;
        margin-bottom: .3125rem;
        @include flex-center;
        gap: .625rem;
        justify-content: space-between;
      }

      .tag {
        font-size: 0.875rem;
        padding: .375rem .625rem;
        border-radius: .25rem;
        color: $main-black-text;
        text-wrap: nowrap;
        flex-shrink: 0;

        &.new {
          background-color: $primary-color;
        }

        &.active {
          background-color: #f97316;
        }

        &.update {
          background-color: #9a9bf8;
        }

        &.maintain {
          background-color: #4caf9f;
        }
      }

      .item-content {
        font-size: 1rem;
        color: $main-grey-text;
        margin: .5rem 0;
      }

      .item-date {
        display: block;
      font-size: 0.75rem;
        color: $main-grey-text;
      }
    }
  }

  .card-title {
    color: $main-blue-text;
font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    @include flex-center;
  }

  .login-card {
    text-align: center;

    .fade-transform-enter-active,
    .fade-transform-leave-active {
      transition: all 0.3s ease;
    }

    .fade-transform-enter-from {
      opacity: 0;
      transform: translateX(.625rem);
    }

    .fade-transform-leave-to {
      opacity: 0;
      transform: translateX(-0.625rem);
    }

    .login-form-container {
      min-height: 17.5rem;
      display: flex;
      flex-direction: column;
      // justify-content: center;
      text-align: left;

      .forgot-password-link {
        color: $main-dark-blue;
        display: flex;
        justify-content: center;
        cursor: pointer;
        margin-top: 1rem;

        &:hover {
          color: $main-blue-text;
        }
      }
    }

    .input-group {
      margin-bottom: 1.25rem;

      .password-overlay {
        position: absolute;
        top: 2rem;
        left: 0;
        width: 100%;
        height: 2.5rem;
        background: rgba(240, 250, 255, 0.8);
        z-index: 10;
        border-radius: .75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: .875rem;
        font-weight: 500;
        pointer-events: none;
        border: .0625rem dashed $primary-color;

        i {
          margin-right: .375rem;
          color: $primary-color;
        }
      }

      .input-label {
        display: block;
       font-size: 1rem;
        font-weight: bold;
        color: $main-black-text;
        margin-bottom: .5rem;
      }

      .custom-input {
        width: 100%;
        outline: none;
        color: $main-black-text;
        transition: box-shadow 0.2s;

        input {
          padding: .875rem 1rem;
          border: #28A99C33 .0625rem solid;
          border-radius: .75rem;
          background-color: #F0FAFF;
        }
      }


      .el-input__inner {
        color: $main-black-text;
      }
    }

    .role-switch {
      display: flex;
      margin-bottom: 1.875rem;
      border: .0625rem solid #DAE2E7;
      border-radius: .6875rem;
      overflow: hidden;
      padding: .5rem;


      .role-btn {
        flex: 1;
        padding: .5rem;
        background-color: #F8F9FA;
        font-size: 1rem;
        transition: all 0.2s ease;
        border: none;

        &:nth-child(1) {
          border-radius: .5rem 0 0 .5rem;
        }

        &:nth-child(2) {
          border-radius: 0 .5rem .5rem 0;
        }

        &.active {

          // 學生 (第一個按鈕)
          &:nth-child(1) {
            @include second-green-bg;
          }

          // 教職員 (第二個按鈕)
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
      padding: .75rem;
      border-radius: 1rem;
     font-size: 1rem;
      font-weight: 600;

      &:hover {
        transition: 0.3s;
        background-color: #acf5ee;
      }
    }

    .card-title {
      justify-content: center;
    }

    .card-subtitle {
    font-size: 1rem;
      text-align: center;
      color: #666;
      margin-bottom: 1.5625rem;
    }

  }

}

.dev-test-zone {
  margin-top: 1.875rem;
  padding-top: 1.25rem;
  border-top: .125rem dashed #eee;

  .dev-title {
    font-size: .875rem;
    color: #999;
    margin-bottom: .75rem;
    text-align: center;
    font-weight: bold;
  }

  .dev-btn-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .625rem;
  }

  .dev-role-btn {
    border: none;
    padding: .5rem;
    border-radius: .5rem;
    font-size: .8125rem;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
    color: white;
    font-weight: 500;
    box-shadow: 0 .125rem .25rem rgba(0, 0, 0, 0.1);

    &:hover {
      opacity: 0.9;
      transform: translateY(-0.0625rem);
    }

    &:active {
      transform: translateY(.0625rem);
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

@media (orientation: landscape) and (max-height: 74.9988rem) and (pointer: coarse) {
  .login-container {
    padding: 0;
  }

  .login-page {
    padding: 0 8%;
  }
}

@media (orientation: landscape) and (max-height: 31.25rem) {
  .login-container {
    margin-right: 0 !important;
    margin-left: 0 !important;
    padding: 4% 6% !important;
    gap: 0 2rem;

    .el-col {
      padding-right: 0 !important;
      padding-left: 0 !important;
    }
  }

  .mobile-scroll-box {
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1.25rem;

    &::-webkit-scrollbar {
      width: .25rem;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: .625rem;
    }
  }

  .footer-scroll {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 1.25rem;
    padding: .5rem 1rem;
    -webkit-overflow-scrolling: touch;
  }

  .footer-scroll p {
    white-space: nowrap;
    flex-shrink: 0;
    margin: 0;
   font-size: 0.75rem;
  }


}
</style>
