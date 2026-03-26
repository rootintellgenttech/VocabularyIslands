<template>
  <div class="callback-loading">
    <p>正在驗證登入資訊，請稍候...</p>
  </div>
</template>

<script>
import api from '../../config/api';

export default {
  async mounted() {
    // 從 URL 取得教育局回傳的 code 與 state
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // 檢查安全性：比對 state 是否與發起請求時一致
    const savedState = sessionStorage.getItem('oidc_state');
    if (state !== savedState) {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: 'State 驗證失敗' });
      return;
    }

    if (code) {
      try {
        // 將 code 傳給您的後端 API，由後端使用 client_secret 去交換 Token(兌換資料)
        const response = await api.post('students/oidc-exchange/', { code: code });
        
        // 成功拿到系統 Token 與用戶資料，傳回給母視窗 (Login.vue)
        this.sendToOpener({
          type: 'OIDC_LOGIN_SUCCESS',
          payload: response.data // 包含 token, role, first_login 等
        });
      } catch (error) {
        this.sendToOpener({
          type: 'OIDC_LOGIN_ERROR',
          error: error.response?.data?.detail || '兌換資料失敗'
        });
      }
    } else {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '未取得授權碼 (Code)' });
    }
  },
  methods: {
    sendToOpener(data) {
      if (window.opener) {
        // 使用 postMessage 跨視窗通訊
        window.opener.postMessage(data, window.location.origin);
      }
      window.close(); // 任務完成，關閉小視窗
    }
  }
}
</script>