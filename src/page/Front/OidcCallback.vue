<template>
  <div class="callback-loading">
    <p>正在驗證登入資訊，請稍候...</p>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import api from '../../config/api';

export default {
  async mounted() {
    // 取得 URL Hash 中的參數
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const idToken = params.get('id_token');
    const state = params.get('state');

    // 驗證 State 安全性
    const savedState = sessionStorage.getItem('oidc_state');
    if (state !== savedState) {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '安全驗證失敗' });
      return;
    }

    if (idToken) {
      try {
        // 回傳一個包含 sub, kh_profile 等欄位的物件
        const userData = jwtDecode(idToken);

        // 依照後端 Swagger 要求格式組合資料
        const postData = {
          sub: userData.sub,
          kh_profile: userData.kh_profile,
          kh_titles: userData.kh_titles,
          kh_classes: userData.kh_classes
        };

        // 發送給後端 API 進行登入/註冊
        const response = await api.post('students/oidc/oidclogin/', postData);

        this.sendToOpener({
          type: 'OIDC_LOGIN_SUCCESS',
          payload: response.data
        });
      } catch (error) {
        console.error('解碼或登入失敗:', error);
        this.sendToOpener({
          type: 'OIDC_LOGIN_ERROR',
          error: error.response?.data?.detail || '同步資料至系統失敗'
        });
      }
    } else {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '未取得憑證' });
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