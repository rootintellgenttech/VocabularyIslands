// src/config/oidc.js
export const oidcSettings = {
  authority: 'https://oidc.kh.edu.tw/',
  client_id: 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42',
  // 使用 PKCE 時，前端可以不傳 client_secret 
  // 若教育局強制要求，則保留：
  client_secret: '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1',
  redirect_uri: 'https://englishability.rootadviser.com/api/oidccallback/',
  // redirect_uri: 'https://www.elr.kh.edu.tw/api/oidccallback/',
  response_type: 'code', //  設為 code，插件會自動執行 PKCE (產生 code_challenge)
  scope: 'openid email kh_profile kh_classes kh_titles',
  
  //為了跳過 /.well-known 的 CORS 檢查，手動設定 Metadata
  metadata: {
    issuer: 'https://oidc.kh.edu.tw/',
    authorization_endpoint: 'https://oidc.kh.edu.tw/oauth2/auth',
    token_endpoint: 'https://oidc.kh.edu.tw/oauth2/token',
    userinfo_endpoint: 'https://oidc.kh.edu.tw/userinfo',
    jwks_uri: 'https://oidc.kh.edu.tw/.well-known/jwks.json',
  },
  loadUserInfo: true,
  automaticSilentRenew: true
};