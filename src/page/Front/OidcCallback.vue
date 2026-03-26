<template>
  <div class="callback-loading">
    <p>正在驗證登入資訊，請稍候...</p>
  </div>
</template>

<script>
import api from '../../config/api';

export default {
async mounted() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (code) {
    try {
      const response = await api.post('students/oidc/oidclogin/', { code: code });
      
      this.sendToOpener({
        type: 'OIDC_LOGIN_SUCCESS',
        payload: response.data 
      });
    } catch (error) {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '後端驗證失敗' });
    }
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