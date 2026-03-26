<template>
  <div class="callback-loading">
    <p>正在驗證登入資訊，請稍候...</p>
  </div>
</template>

<script>
import api from '../../config/api';

export default {
  async mounted() {
    //  從 URL 參數取得 code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // 驗證 State
    const savedState = sessionStorage.getItem('oidc_state');
    if (state !== savedState) {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '安全驗證失敗' });
      return;
    }

    if (code) {
      try {
        // 呼叫後端 API，將 code 傳過去換取正式資料
        const response = await api.post('students/oidc/oidclogin/', { code: code });
        
        this.sendToOpener({
          type: 'OIDC_LOGIN_SUCCESS',
          payload: response.data 
        });
      } catch (error) {
        this.sendToOpener({
          type: 'OIDC_LOGIN_ERROR',
          error: error.response?.data?.detail || '兌換資料失敗'
        });
      }
    } else {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '未取得授權代碼' });
    }
  },
  methods: {
    sendToOpener(data) {
      if (window.opener) {
        window.opener.postMessage(data, window.location.origin);
      }
      window.close();
    }
  }
}
</script>