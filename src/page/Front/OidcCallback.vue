<template>
  <div class="callback-loading" style="text-align: center; padding: 50px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在驗證您的身分...</h2>
    <p>正在與教育局系統交換學生資料，請稍候，驗證完畢將自動為您導入系統。</p>
  </div>
</template>

<template>
  <div class="callback-loading" style="text-align: center; padding: 50px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在驗證您的身分...</h2>
    <p>正在與教育局系統交換學生資料，請稍候，驗證完畢將自動為您導入系統。</p>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../../config/api'; 

export default {
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code) {
      this.sendToOpener({ type: 'OIDC_LOGIN_ERROR', error: '未取得授權代碼' });
      return;
    }

    try {
      // 向教育局 Token 端口請求 (Token Endpoint)
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', 'https://englishability.rootadviser.com/api/oidccallback/');
      params.append('client_id', 'kh_vendor_a95da8c087d6f9c3f62acc5e22c26f42'); //
      params.append('client_secret', '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1'); //

      const tokenResponse = await axios.post('https://oidc.kh.edu.tw/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 解析回傳的 id_token，取得學生詳細資料
      const idToken = tokenResponse.data.id_token;
      const decodedUser = jwtDecode(idToken);
      console.log("【分析完成】教育局核發的學生資料：", decodedUser);

      // 確保將 fullname 和 email 提取出來傳給後端做自動註冊
      const postData = {
        sub: decodedUser.sub,
        kh_profile: {
          fullname: decodedUser.kh_profile?.fullname || '未知姓名',
          email: decodedUser.kh_profile?.email || ''
        },
        kh_titles: decodedUser.kh_titles || {},
        kh_classes: decodedUser.kh_classes || {}
      };

      //  呼叫 API，進行自動註冊或登入，換取「真實的系統 Token」
      const loginResponse = await api.post('students/oidc/oidclogin/', postData);

      console.log("【後端登入成功】取得真實 Token：", loginResponse.data);

      //. 將後端核發的真實 Token 與資料傳回給母視窗 (Login.vue) 並關閉
      this.sendToOpener({
        type: 'OIDC_LOGIN_SUCCESS',
        payload: loginResponse.data 
      });

    } catch (error) {
      console.error("驗證或登入失敗：", error);
      
      // 如果是後端 API 報錯，顯示後端的錯誤訊息
      const errorMsg = error.response?.data?.detail || '無法從教育局取得憑證或系統登入失敗';
      this.sendToOpener({ 
        type: 'OIDC_LOGIN_ERROR', 
        error: errorMsg 
      });
    }
  },
  methods: {
    sendToOpener(data) {
      if (window.opener) {
        window.opener.postMessage(data, window.location.origin);
      }
      window.close(); // 任務完成，關閉小視窗
    }
  }
}
</script>