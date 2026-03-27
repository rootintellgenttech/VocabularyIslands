<template>
  <div class="callback-loading" style="text-align: center; padding: 100px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在完成系統登入...</h2>
    <p>請稍候，正在同步教育局資料中...</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import api from '../../config/api';

export default {
  name: 'OidcCallback',
  computed: {
    ...mapGetters('oidcStore', ['oidcUser', 'oidcIsAuthenticated'])
  },
 async mounted() {
  try {
    const user = await this.oidcSignInCallback(); 
    if (user) {
      this.processSystemLogin(user);
    }
  } catch (err) {
    console.error('OIDC 兌換失敗', err);
    if (this.oidcIsAuthenticated) {
      this.processSystemLogin(this.oidcUser);
    }
  }
},
  methods: {
    ...mapActions('oidcStore', ['oidcSignInCallback']),

    async processSystemLogin(user) {
      try {
        // 整理後端要的格式 
        const postData = {
          sub: user.sub,
          kh_profile: user.kh_profile || {
            fullname: user.name || '未知姓名',
            email: user.email || ''
          },
          kh_titles: user.kh_titles || {},
          kh_classes: user.kh_classes || {}
        };

        console.log(' [Step 4] 資料獲取完畢，發送給自家後端 API...', postData);
        
        const loginResponse = await api.post('students/oidc/oidclogin/', postData, {
          timeout: 60000 
        });

        console.log('=== [Step 5] 後端登入成功！===');

        // 存儲系統 Token
        const token = loginResponse.data.token || loginResponse.data.access;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', loginResponse.data.role || 'student');

        // 清理網址參數並跳轉
        this.$router.push('/home');

      } catch (error) {
        console.error("=== 自家後端登入發生錯誤 ===", error);
        this.$message.error('系統內部驗證失敗');
        this.$router.push('/login');
      }
    }
  }
}
</script>