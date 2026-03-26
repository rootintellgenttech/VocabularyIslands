<template>
  <div class="callback-loading" style="text-align: center; padding: 50px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在驗證您的身分...</h2>
    <p>請按 F12 開啟開發者工具 (Console) 查看進度。</p>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../../config/api';

export default {
  async mounted() {
    alert('組件載入成功！');
    console.log('=== [Step 1] OidcCallback 頁面成功載入 ===');

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    console.log('取得的 Code:', code);
    console.log('取得的 State:', state);

    if (!code) {
      alert('錯誤：沒有拿到 Code！');
      return;
    }

    try {
      console.log('=== [Step 2] 準備向教育局交換 Token ===');
      //
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', `${window.location.origin}/oidc/callback`);

      params.append('client_id', 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42');
      params.append('client_secret', '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1');

      const tokenResponse = await axios.post('https://oidc.kh.edu.tw/oauth2/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      console.log('=== [Step 3] 成功取得教育局 Token，準備解析 ===');
      const idToken = tokenResponse.data.id_token;
      const decodedUser = jwtDecode(idToken);
      console.log("解析後的學生資料：", decodedUser);

      // 組合後端需要的資料格式
      const postData = {
        sub: decodedUser.sub,
        kh_profile: {
          fullname: decodedUser.kh_profile?.fullname || '未知姓名',
          email: decodedUser.kh_profile?.email || ''
        },
        kh_titles: decodedUser.kh_titles || {},
        kh_classes: decodedUser.kh_classes || {}
      };

      console.log('=== [Step 4] 準備將資料打給後端 API 註冊/登入 ===', postData);

      const loginResponse = await api.post('students/oidc/oidclogin/', postData);
      console.log("=== [Step 5] 後端 API 回應成功！ ===", loginResponse.data);

      alert('流程全部成功！請看 Console 確認資料，按下確定後將導向 Home。');

      // 通知母視窗
      if (window.opener) {
        window.opener.postMessage({
          type: 'OIDC_LOGIN_SUCCESS',
          payload: loginResponse.data
        }, window.location.origin);
      }

      // 關閉小視窗
      window.close();

    } catch (error) {
      console.error("=== [發生錯誤] ===", error);
      if (error.response) {
        console.error("API 回應錯誤內容：", error.response.data);
        alert(`API 發生錯誤: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(`發生未預期的錯誤: ${error.message}`);
      }
    }
  }
}
</script>