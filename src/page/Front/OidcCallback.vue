<template>
  <div class="callback-loading" style="text-align: center; padding: 50px;">
    <h2><i class="fa-solid fa-spinner fa-spin"></i> 正在獲取學生資料並登入...</h2>
    <p>請稍候，正在與教育局連線中...</p>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../../config/api';

export default {
  async mounted() {
    console.log('=== [Step 0] OidcCallback 頁面載入，開始執行後端指定的流程 ===');

    // 從網址抓取 backend 說的 code 和 state
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code) {
      console.error('網址中找不到 code 參數');
      return;
    }

    console.log('=== [Step 1] 成功攔截到 Code ===', code);

    try {
      // 拿這個 code 去向教育局的 Token 端口換取 Token
      console.log('=== [Step 2] 準備向教育局換取 Token... ===');
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', `${window.location.origin}/api/oidccallback/`);
      params.append('client_id', 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42');
      params.append('client_secret', '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1');

      const tokenResponse = await axios.post('https://oidc.kh.edu.tw/oauth2/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // 解析 Token 獲取 UserInfo 
      console.log('=== [Step 3] 成功取得 Token，開始解析獲取 UserInfo... ===');
      const idToken = tokenResponse.data.id_token;
      const decodedUser = jwtDecode(idToken);
      console.log("解析出的學生資料：", decodedUser);

      // 整理後端要的格式
      const postData = {
        sub: decodedUser.sub,
        kh_profile: {
          fullname: decodedUser.kh_profile?.fullname || '未知姓名',
          email: decodedUser.kh_profile?.email || ''
        },
        kh_titles: decodedUser.kh_titles || {},
        kh_classes: decodedUser.kh_classes || {}
      };

      // 資料獲取完畢，這時候才呼叫後端的 oidclogin
      console.log('=== [Step 4] 資料準備完畢，發送給後端 API ===', postData);
      const loginResponse = await api.post('students/oidc/oidclogin/', postData);
      console.log("=== [Step 5] 後端登入成功！回傳資料：===", loginResponse.data);

      // 通知主視窗 (Login.vue) 登入成功，把後端給的 token 傳過去
      if (window.opener && window.opener !== window) {
        console.log('通知主視窗並準備關閉彈出視窗...');
        window.opener.postMessage({
          type: 'OIDC_LOGIN_SUCCESS',
          payload: loginResponse.data
        }, window.location.origin);

        // 關閉這個彈出視窗
        window.close();
      } else {
         console.warn('找不到主視窗 (opener)！');
      }

    } catch (error) {
      console.error("=== OIDC 流程發生錯誤 ===", error);
      if (error.response) {
        alert(`獲取資料或登入發生錯誤: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(`發生未預期的錯誤: ${error.message}`);
      }
    }
  }
}
</script>