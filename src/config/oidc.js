export const oidcSettings = {
  authority: 'https://oidc.kh.edu.tw/',
  client_id: 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42',
  client_secret: '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1', 
  redirect_uri: window.location.origin + '/api/oidccallback/',
  response_type: 'code', 
  scope: 'openid email kh_profile kh_classes kh_titles',
  
  automaticSilentRenew: true,
  loadUserInfo: true, // 插件會自動幫你打 /userinfo 端口
};