<template>
  <div v-if="isOidcLoading" class="callback-loading" style="text-align: center; padding: 100px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在獲取學生資料並登入...</h2>
    <p>請稍候，正在與教育局連線中...</p>
  </div>
  <div v-else class="login-page">
    <el-row class="login-container" :gutter="40" type="flex">
      <el-col :span="12">
        <div class="announcement-card mobile-scroll-box">
          <h2 class="card-title">
            <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>最新公告
          </h2>
          <vue-custom-scrollbar :settings="scrollSettings" class="announcement-list" aria-label="最新公告列表">
            <div class="announcement-item">
              <div class="item-header">
                <div class="news-title">
                  <i class="fa-solid fa-star" style="color: #FFD43B;"></i>新島嶼開放
                </div>
                <div class="news-tag">
                  <span class="tag new">活動</span>
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
                  <span class="tag update">資訊</span>
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
                  <span class="tag maintain">消息</span>
                </div>

              </div>
              <p class="item-content">系統將於明日凌晨2點進行維護，屆時服務將暫停約30分鐘。</p>
              <span class="item-date">2024-01-19</span>
            </div>
            <div class="announcement-item">
              <div class="item-header">
                <div class="news-title">
                  <i class="fa-solid fa-triangle-exclamation" style="color: #e12323;"></i>伺服器維護
                </div>
                <div class="news-tag">
                  <span class="tag maintain">消息</span>
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
          <p v-else class="role-notice-text">* 學生登入將開啟彈出視窗</p>

          <div class="login-form-container">
            <div v-if="currentRole === 'student'" class="student-input-zone">
              <div class="input-group">
                <label class="input-label" for="student-account">帳號</label>
                <el-input id="student-account" v-model="studentForm.account" placeholder="請輸入學生帳號" class="custom-input">
                </el-input>
              </div>

              <div class="input-group">
                <label class="input-label" for="student-pass-disabled">密碼</label>
                <!-- <div class="password-overlay">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i> 密碼請於彈出視窗中輸入
    </div> -->
                <el-input id="student-pass-disabled" type="password" disabled placeholder=" 密碼請於彈出視窗中輸入 "
                  class="custom-input">
                </el-input>
              </div>

              <button class="login-submit-btn" @click="handleOidcLogin">
                <i class="fa-solid fa-graduation-cap"></i> 學生登入
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
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

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
          account: 'chinyimin11@gmail.com',
          password: '123456min'
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
mounted() {
    console.log('=== [mounted] 頁面載入 ===');
    console.log('🔍 [偵錯] 1. 目前完整網址:', window.location.href);
    console.log('🔍 [偵錯] 2. Vue Router query:', this.$route.query);

    try {
      // 1. 嘗試解析網址參數
      const urlParams = new URLSearchParams(window.location.search);
      const oidcCode = this.$route.query.code || urlParams.get('code');
      console.log('🔍 [偵錯] 3. 最終抓到的 code:', oidcCode);

      // 判斷是否有錯誤參數 (例如使用者按取消)
      const errorParam = urlParams.get('error') || this.$route.query.error;
      if (errorParam) {
        console.error('❌ [偵錯] 教育局回傳錯誤:', errorParam);
        this.$message.error('教育局授權失敗');
        window.history.replaceState({}, document.title, '/login');
        return;
      }

      // 2. 如果有 code，準備發送 API
      if (oidcCode) {
        console.log('✅ [偵錯] 4. 準備執行 processOidcFromUrl');
        this.isOidcLoading = true;

        // 防呆檢查：確認 processOidcFromUrl 方法是否真的存在
        if (typeof this.processOidcFromUrl !== 'function') {
          console.error('❌ [嚴重錯誤] 找不到 processOidcFromUrl！請檢查它是不是沒放在 methods: { ... } 裡面？');
          return;
        }

        // 呼叫方法
        this.processOidcFromUrl(oidcCode);
      } else {
        console.log('⚠️ [偵錯] 4. 沒有抓到 code，停留在一般密碼登入畫面');
      }

    } catch (error) {
      console.error('❌ [偵錯] mounted 執行過程發生例外錯誤:', error);
    }
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
    }
  },
  methods: {
// 觸發 OIDC 彈出/跳轉登入
    handleOidcLogin() {
      if (!this.studentForm.account) {
        alert('請先輸入學生帳號');
        return;
      }
      const state = Math.random().toString(36).substring(2, 15);
      const nonce = Math.random().toString(36).substring(2, 15);
      const clientId = 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42';
      
      //這裡的 URI 與教育局後台註冊的「完全一致」（包含最後的斜線）
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/oidccallback/`);
      const scope = encodeURIComponent('openid email kh_profile kh_classes kh_titles');
      const loginHint = encodeURIComponent(this.studentForm.account);

      const authUrl = `https://oidc.kh.edu.tw/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&nonce=${nonce}&login_hint=${loginHint}`;

      // 直接跳轉
      window.location.href = authUrl; 
    },

    // 前端拿 Code 去跟教育局換 Token
    async processOidcFromUrl(code) {
      try {
        console.log('[Step 1] 準備打 Token Endpoint...');
        
        // 依照教育局文件要求，使用 application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', `${window.location.origin}/api/oidccallback/`); 
        params.append('client_id', 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42');
        params.append('client_secret', '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1');

        // 這裡用「原生 axios」呼叫，不用自訂的 api，避免被 interceptor 攔截
        const tokenResponse = await axios.post('https://oidc.kh.edu.tw/oauth2/token', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log('[Step 2] ✅ 教育局 Token 取得成功');

        const idToken = tokenResponse.data.id_token;
        const decodedUser = jwtDecode(idToken);
        console.log('[Step 3] ✅ 解析學生資料:', decodedUser);

        const postData = {
          sub: decodedUser.sub,
          kh_profile: {
            fullname: decodedUser.kh_profile?.fullname || '未知姓名',
            email: decodedUser.kh_profile?.email || ''
          },
          kh_titles: decodedUser.kh_titles || {},
          kh_classes: decodedUser.kh_classes || {}
        };

        console.log('[Step 4] 準備將資料送回自家後端登入 API...');
        const loginResponse = await api.post('students/oidc/oidclogin/', postData);
        console.log('[Step 5] ✅ 自家後端登入成功:', loginResponse.data);

        // 清除網址列上帶有 code 的參數，讓網址變乾淨
        window.history.replaceState({}, document.title, '/login');

        const realRole = loginResponse.data.role || 'student';
        const targetPath = (realRole === 'student') ? '/home' : '/dashboard';

        this.performLogin(loginResponse.data, targetPath);

      } catch (error) {
        console.error('=== [processOidcFromUrl] ❌ 失敗 ===', error);
        this.isOidcLoading = false;
        
        // 失敗時也把網址清乾淨，避免重新整理時一直重複拿失效的 code 去打 API
        window.history.replaceState({}, document.title, '/login');
        
        // 針對不同的錯誤給予提示
        if (error.response?.data?.error === 'invalid_grant') {
          this.$message.error('驗證碼已失效，請重新登入');
        } else {
          this.$message.error('教育局授權失敗，請確認連線或稍後再試');
        }
      }
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

      this.startTokenRefreshTimer();

      // 只有真正的學生才執行簽到
      if (role === 'student') {
        try {
          await api.post('students/attendance/');
        } catch (err) {
          console.warn('[系統] 簽到提示');
        }
      }

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

        // 直接呼叫原本的教職員/帳密登入 API，繞過 OIDC
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
  @include flex-center;

  i {
    margin-right: 4px;
  }
}

.el-dialog .title {
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

  .el-dialog__footer button {
    width: 120px
  }
}

.confirm-change-pw-modal {
  .description {
    text-align: center;
  }

  .input-pw-area {
    margin-top: 24px;
  }
}

.login-container {
  width: 100vw;
  padding: 4% 18%;

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
      gap: 10px;
      background: linear-gradient(135deg, #4ABCB1 0%, #38bdf8 100%) !important;
      color: white !important;
      border-radius: 12px;

      &:hover {
        filter: brightness(1.1);
      }
    }
  }

  .announcement-card,
  .login-card {
    height: 600px;
    display: flex;
    flex-direction: column;
    background-color: $card-bg;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 11px;
    padding: 24px;
    box-sizing: border-box;
  }

  .announcement-list {
    flex: 1;
    margin-top: 8px;
    overflow-y: auto;
  }

  .role-notice-text {
    font-size: 14px;
    color: #ad5910;
    margin-top: -20px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
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
      margin-top: 8px;
      overflow-y: auto;
      min-height: 0;
    }

    .announcement-item {
      padding: 12px;
      border-radius: 16px;
      margin: 12px 0;
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
        margin-bottom: 5px;
        @include flex-center;
        gap: 10px;
        justify-content: space-between;
      }

      .tag {
        font-size: 14px;
        padding: 6px 10px;
        border-radius: 4px;
        color: $main-black-text;

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
      transform: translateX(10px);
    }

    .fade-transform-leave-to {
      opacity: 0;
      transform: translateX(-10px);
    }

    .login-form-container {
      min-height: 280px;
      display: flex;
      flex-direction: column;
      // justify-content: center;
      text-align: left;

      .forgot-password-link {
        color: $main-dark-blue;
        display: flex;
        justify-content: center;
        cursor: pointer;
        margin-top: 16px;

        &:hover {
          color: $main-blue-text;
        }
      }
    }

    .input-group {
      margin-bottom: 20px;

      .password-overlay {
        position: absolute;
        top: 32px;
        left: 0;
        width: 100%;
        height: 40px;
        background: rgba(240, 250, 255, 0.8);
        z-index: 10;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
        border: 1px dashed $primary-color;

        i {
          margin-right: 6px;
          color: $primary-color;
        }
      }

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
      padding: 12px;
      border-radius: 16px;
      font-size: 16px;
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
  .login-container {
    padding: 0;
  }

  .login-page {
    padding: 0 8%;
  }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .login-container {
    padding: 0;
  }

  .mobile-scroll-box {
    -webkit-overflow-scrolling: touch;
    margin-bottom: 20px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }
  }

  .login-page {
    padding: 5% !important;
    height: auto;
    overflow-y: auto;
    // .card-subtitle{
    //   font-size: 18px;
    // }
  }

}
</style>
