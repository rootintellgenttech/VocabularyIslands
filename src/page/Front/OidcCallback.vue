<template>
  <div class="callback-loading" style="text-align: center; padding: 100px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在完成系統登入...</h2>
    <p>請稍候，正在同步教育局資料中...</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import api from '../../config/api';

export default {
  name: 'OidcCallback',
  computed: {
    ...mapGetters('oidcStore', ['oidcUser', 'oidcIsAuthenticated'])
  },
  watch: {
    // 監聽插件是否已經成功抓到使用者資料
    oidcUser(newUser) {
      if (newUser && this.oidcIsAuthenticated) {
        this.processSystemLogin(newUser);
      }
    }
  },
  mounted() {
    // 如果進入頁面時資料已經在那了，直接執行
    if (this.oidcIsAuthenticated && this.oidcUser) {
      this.processSystemLogin(this.oidcUser);
    }
  },
  methods: {
    async processSystemLogin(user) {
      try {
        console.log('[插件解析成功] 使用者資料：', user);

        const postData = {
          sub: user.sub,
          kh_profile: user.kh_profile || {
            fullname: user.name || '未知姓名',
            email: user.email || ''
          },
          kh_titles: user.kh_titles || {},
          kh_classes: user.kh_classes || {}
        };

        console.log('[Step 4] 發送至後端進行登入驗證...');

        const loginResponse = await api.post('students/oidc/oidclogin/', postData, {
          timeout: 60000
        });

        console.log('登入完全成功！');

        // 存儲系統 Token
        const token = loginResponse.data.token || loginResponse.data.access;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', loginResponse.data.role || 'student');

        // 跳轉到首頁
        this.$router.push('/home');

      } catch (error) {
        console.error('後端驗證失敗:', error);
        this.$message.error('系統登入失敗，正在返回登入頁');
        setTimeout(() => this.$router.push('/login'), 2000);
      }
    }
  }
}
</script>