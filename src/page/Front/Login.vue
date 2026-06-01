<template>
  <div v-if="isOidcLoading" class="callback-loading" style="text-align: center; padding: 100px;">
    <h2 role="status"><i class="fa-solid fa-spinner fa-spin"></i> 正在獲取學生資料並登入...</h2>
    <p>請稍候，正在與教育局連線中...</p>
  </div>
  <div v-else class="login-page">

    <header class="logo-section">
      <h1 class="main-title">
        <img src="../../assets/image/login/logo.png" alt="英閱奇航：玩轉ABC (登入頁面)">
      </h1>
    </header>
    <main id="main-content" class="login-container-wrapper">
      <el-row class="login-container" :gutter="40" type="flex">
        <el-col :span="12">
          <div class="announcement-card mobile-scroll-box">
            <h2 class="card-title">
              <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>最新公告
            </h2>
            <vue-custom-scrollbar :settings="scrollSettings" class="announcement-list" aria-label="最新公告列表">
              <div v-if="loadingNews" role="status" style="text-align: center; padding: 20px; color: #595959;">
                <i class="fa-solid fa-spinner fa-spin"></i> 公告載入中...
              </div>
              <div v-else-if="announcements.length === 0" class="no-news-text">
                Currently no announcements
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

            <div class="role-switch" role="tablist">
              <button role="tab" :aria-selected="currentRole === 'student'"
                :class="['role-btn', { active: currentRole === 'student' }]" @click="currentRole = 'student'">
                學生
              </button>
              <button role="tab" :aria-selected="currentRole === 'teacher'"
                :class="['role-btn', { active: currentRole === 'teacher' }]" @click="currentRole = 'teacher'">
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

                  <el-input id="student-account-placeholder" placeholder="請於跳轉後的教育局頁面輸入" disabled class="custom-input" aria-label="帳號密碼輸入說明：請於跳轉後的教育局頁面輸入">
                  </el-input>
                </div>

                <button class="login-submit-btn" @click="handleOidcLogin">
                  <i class="fa-solid fa-graduation-cap"></i> 前往教育局認證登入
                </button>
              </div>

              <div v-if="currentRole === 'teacher'" class="teacher-input-zone">
                <el-form ref="teacherForm" :model="teacherForm" :rules="teacherRules" label-position="top"
                  @submit.native.prevent="handleLogin">
                  <el-form-item prop="account">
                    <label class="input-label" for="teacher-account">帳號</label>
                    <el-input id="teacher-account" v-model="teacherForm.account" placeholder="請輸入教職員帳號"
                      class="custom-input"></el-input>
                  </el-form-item>

                  <el-form-item prop="password">
                    <label class="input-label" for="teacher-password">密碼</label>
                    <el-input id="teacher-password" v-model="teacherForm.password"
                      :type="isPasswordVisible ? 'text' : 'password'" placeholder="請輸入密碼" class="custom-input">
                      <button slot="suffix" type="button" class="password-toggle-btn"
                        :aria-label="isPasswordVisible ? '隱藏密碼' : '顯示密碼'"
                        :aria-pressed="isPasswordVisible ? 'true' : 'false'"
                        @click="isPasswordVisible = !isPasswordVisible">
                        <i :class="isPasswordVisible ? 'el-icon-view' : 'el-icon-lock'" aria-hidden="true"></i>
                      </button>
                    </el-input>
                  </el-form-item>

                  <button type="submit" style="margin-top: 10px;">
                    <i class="fa-solid fa-chalkboard-user"></i> 教職員登入
                  </button>
                  <button ref="forgetPasswordBtn" type="button" class="forgot-password-link"
                    @click="openForgetPassModal">
                    忘記密碼？
                  </button>
                </el-form>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </main>
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
      :close-on-click-modal="false" :show-close="false" @opened="$refs.changePassBtn.$el.focus()">
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
        <el-button ref="changePassBtn" type="primary" @click="openChangePassDialog">前往修改</el-button>
      </span>
    </el-dialog>

    <el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showChangePassDialog"
      @opened="$refs.changeInput.focus()" @closed="$refs.forgetPasswordBtn.focus()" width="450px" center
      :close-on-click-modal="false" :show-close="false">
      <div class="dialog-content">
        <h3 class="title">
          <i class="fas fa-edit"></i> 設定新密碼
        </h3>

        <el-form class="input-pw-area" :model="passForm" :rules="passRules" ref="passForm" label-position="top">
          <el-form-item label="請輸入新密碼 (至少 6 位)" prop="new_password">
            <el-input ref="changeInput" v-model="passForm.new_password" type="password" show-password></el-input>
          </el-form-item>
        </el-form>

        <p class="description">修改成功後，系統將引導您使用新密碼重新登錄。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeChangePassDialog">取 消</el-button>
        <el-button type="primary" @click="submitNewPassword">確認修改</el-button>
      </span>
    </el-dialog>

    <el-dialog title="找回密碼" :visible.sync="showForgetPassDialog" width="550px" custom-class="challenge-confirm-modal"
      center @opened="$refs.usernameInput.focus()" @closed="$refs.forgetPasswordBtn.focus()">
      <div class="dialog-content">
        <p class="description">請輸入帳號與綁定的 Email，系統將驗證身分。</p>
        <el-form class="input-pw-area" :model="forgetForm" :rules="forgetRules" ref="forgetForm" label-position="top">
          <el-form-item label="用戶帳號" prop="username">
            <el-input ref="usernameInput" v-model="forgetForm.username" placeholder="請輸入帳號"></el-input>
          </el-form-item>
          <el-form-item label="電子郵件" prop="email">
            <el-input v-model="forgetForm.email" placeholder="請輸入 Email"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showForgetPassDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleForgetPassword">提 交</el-button>
      </span>
    </el-dialog>

    <el-dialog custom-class="confirm-change-pw-modal" :visible.sync="showResetPassDialog"
      @opened="$refs.resetInput.focus()" @closed="$refs.forgetPasswordBtn.focus()" width="450px" center
      :close-on-click-modal="false" :show-close="false">
      <div class="dialog-content">
        <h3 class="title">
          <i class="fas fa-lock-open"></i> 重設您的新密碼
        </h3>
        <p class="description">驗證成功！請在下方輸入您想設定的新密碼。</p>

        <el-form class="input-pw-area" :model="resetPassForm" :rules="passRules" ref="resetPassForm"
          label-position="top">
          <el-form-item label="新密碼 (至少 6 位)" prop="new_password">
            <el-input ref="resetInput" v-model="resetPassForm.new_password" type="password" show-password
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
      teacherRules: {
        account: [{ required: true, message: '請填寫教職員帳號欄位。', trigger: 'submit' }],
        password: [{ required: true, message: '請填寫密碼欄位。', trigger: 'submit' }]
      },
      alertMessage: '',
      alertType: 'error',
      showAlert: false,
      showFirstLoginDialog: false,
      showChangePassDialog: false,
      tempLoginData: null,
      tempPath: '',
      passForm: { new_password: '' },
      passRules: {
        new_password: [
          { required: true, message: '請填寫新密碼。', trigger: 'blur' },
          { min: 6, message: '密碼長度安全性不足，至少需要 6 個單位。', trigger: 'blur' }
        ]
      },
      showForgetPassDialog: false,
      forgetForm: {
        username: '',
        email: ''
      },
      forgetRules: {
        username: [{ required: true, message: '用戶帳號為必填欄位，請檢查後輸入。', trigger: 'blur' }],
        email: [
          { required: true, message: '電子郵件為必填欄位，請填寫。', trigger: 'blur' },
          { type: 'email', message: '電子郵件格式不正確，請重新檢查。', trigger: 'blur' }
        ]
      },
      showResetPassDialog: false,
      resetPassToken: '',
      resetPassForm: {
        new_password: ''
      },
      isPasswordVisible: false,
      isNewPasswordVisible: false,
      isResetPasswordVisible: false,
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);

    const code = this.$route.query.code || urlParams.get('code');
    const errorParam = this.$route.query.error || urlParams.get('error');

    if (!code && !errorParam) {
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

        const rawSchools = decodedUser.kh_profile?.schools || {};
        const cleanedSchools = {};

        Object.keys(rawSchools).forEach(schoolId => {
          let schoolName = rawSchools[schoolId];
          cleanedSchools[schoolId] = schoolName.replace(/^.*?區/, '');
        });

        const postData = {
          sub: decodedUser.sub,
          kh_profile: {
            ...decodedUser.kh_profile,
            schools: cleanedSchools
          },
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
    ...mapGetters('oidcStore', ['oidcUser', 'oidcIsAuthenticated'])
  },
  methods: {
    ...mapActions('oidcStore', ['authenticateOidc', 'oidcSignInCallback']),

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
    openForgetPassModal() {
      this.showForgetPassDialog = true;
      this.$nextTick(() => {
        if (this.$refs.usernameInput) {
          this.$refs.usernameInput.focus();
        }
      });
    },
    // 忘記密碼表單驗證失敗時，自動將焦點移至錯誤欄位
    async handleForgetPassword() {
      this.$refs.forgetForm.validate(async (valid) => {
        if (!valid) {
          this.$nextTick(() => {
            const firstErrorInput = document.querySelector('.challenge-confirm-modal .el-form-item.is-error input');
            if (firstErrorInput) firstErrorInput.focus();
          });
          return;
        }
        try {
          await api.post('students/forget-password/', {
            username: this.forgetForm.username,
            email: this.forgetForm.email
          });
          this.$message.success('重設密碼請求已送出，請檢查您的信箱。');
          this.showForgetPassDialog = false;
        } catch (error) {
          this.$message.error(error.response?.data?.detail || '發送失敗');
        }
      });
    },
    //教職員登入使用正規 el-form 驗證，失敗時精準導航焦點
    async handleLogin() {
      this.$refs.teacherForm.validate(async (valid) => {
        if (!valid) {
          this.$nextTick(() => {
            const firstErrorInput = document.querySelector('.teacher-input-zone .el-form-item.is-error input');
            if (firstErrorInput) firstErrorInput.focus();
          });
          return;
        }

        try {
          const response = await api.post('students/login/', {
            username: this.teacherForm.account,
            password: this.teacherForm.password,
          });
          this.performLogin(response.data, '/dashboard');
        } catch (error) {
      const errMsg = error.response?.data?.detail || '帳號或密碼錯誤，請重新確認。';
      this.$message.error(errMsg);

      this.$nextTick(() => {
        const passwordInput = document.getElementById('teacher-password');
        if (passwordInput) {
          passwordInput.focus();
          const innerInput = passwordInput.querySelector('input') || passwordInput;
          if (innerInput.select) innerInput.select();
        }
      });
    }
      });
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
    async handleKeepOldPassword() {
      this.performLogin(this.tempLoginData, null);
      try {
        await api.post('students/first-change-password/', {
          skip_change: true
        });
        this.showFirstLoginDialog = false;
        this.$router.push(this.tempPath);
      } catch (err) {
        this.$router.push(this.tempPath);
      }
    },
    openChangePassDialog() {
      this.showFirstLoginDialog = false;
      this.showChangePassDialog = true;
    },
    closeChangePassDialog() {
      this.showChangePassDialog = false;
      this.passForm.new_password = '';
      if (this.$refs.passForm) {
        this.$refs.passForm.resetFields();
      }
    },
    skipToMainContent() {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
      }
    },
    async submitNewPassword() {
      this.$refs.passForm.validate(async (valid) => {
        if (!valid) {
          this.$nextTick(() => {
            const firstErrorInput = document.querySelector('.confirm-change-pw-modal .el-form-item.is-error input');
            if (firstErrorInput) {
              firstErrorInput.focus();
            }
          });
          return;
        }

        try {
          this.performLogin(this.tempLoginData, null);
          await api.post('students/first-change-password/', {
            new_password: this.passForm.new_password
          });

          this.$message({
            message: '密碼修改成功，請使用新密碼重新登入',
            type: 'success'
          });

          this.closeChangePassDialog();
          this.logoutAndReset();

        } catch (err) {
          console.error(err);
          this.$message({
            message: '修改失敗，請稍後再試',
            type: 'error'
          });

          this.$nextTick(() => {
            if (this.$refs.changeInput) {
              this.$refs.changeInput.focus();
            }
          });
        }
      });
    },
    logoutAndReset() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      if (window.tokenTimer) clearInterval(window.tokenTimer);
      this.teacherForm.password = '';
    },
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

      this.startTokenRefreshTimer();

      if (path) {
        this.$router.push(path);
      }
    },
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
    //重設新密碼表單驗證失敗時，自動將焦點移至錯誤欄位
    async handleResetPasswordSubmit() {
      this.$refs.resetPassForm.validate(async (valid) => {
        if (!valid) {
          this.$nextTick(() => {
            const firstErrorInput = document.querySelector('.confirm-change-pw-modal .el-form-item.is-error input');
            if (firstErrorInput) firstErrorInput.focus();
          });
          return;
        }
        try {
          await api.post('students/reset-password/', {
            token: this.resetPassToken,
            new_password: this.resetPassForm.new_password
          });
          this.$message.success('密碼重設成功！');
          this.showResetPassDialog = false;
          this.resetPassForm.new_password = '';
          this.$router.replace('/login');
        } catch (error) {
          this.$message.error(error.response?.data?.detail || '重設失敗，連結可能過期');
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


.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.sr-only-focusable:focus {
  top: 0;
}

.no-news-text {
  text-align: center;
  padding: 20px;
  color: #595959;
  font-weight: 500;
}

.password-toggle-btn {
  border: none;
  color: #909399;
  cursor: pointer;
  height: 100%;
  padding: 0 5px;
  font-size: 16px;
  background: transparent !important;

  &:hover {
    color: $primary-color;
  }

  &:focus {
    outline: 2px solid $primary-color;
    outline-offset: 2px;
  }
}

.item-content {
  font-size: 1rem;
  color: #0e1214;
  margin: .5rem 0;
}

.sr-only-focusable {
  position: absolute;
  top: -100px;
  left: 10px;
  background: #ffed4a;
  color: #000;
  padding: 10px 20px;
  z-index: 10000;
  font-weight: bold;
  border: 2px solid #000;
  text-decoration: none;

  &:focus {
    top: 10px;
  }
}

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
    text-align: center;

    .main-title {
      margin-bottom: 0;
    }

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

.confirm-change-pw-modal,
.challenge-confirm-modal {
  .description {
    text-align: center;
  }

  .input-pw-area {
    width: 80%;
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
  }

  .role-notice-text {
    font-size: 0.875rem;
    color: #362d23;
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
        color: #0e1214;
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
        background-color: transparent !important;
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

  .announcement-item {
    .item-header {
      flex-direction: column;
    }

    .news-tag {
      align-self: flex-end;
    }
  }

  // .login-page {
  //   padding: 0 8%;
  // }
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
