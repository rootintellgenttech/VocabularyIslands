export const oidcSettings = {
  authority: 'https://oidc.kh.edu.tw/',
  client_id: 'kh_vendor_englishability_a95da8c087d6f9c3f62acc5e22c26f42',
  client_secret: '38efe712ebe3b6af5d7365441cf2e4d5b6d3c9dc07aa977f74d8f1c8e6c134d1',
  redirect_uri: window.location.origin + '/api/oidccallback/',
  response_type: 'code',
  scope: 'openid email kh_profile kh_classes kh_titles',

  //手動設定 Metadata
  // 這樣插件就不會去打 /.well-known/openid-configuration
  metadata: {
    issuer: 'https://oidc.kh.edu.tw/',
    authorization_endpoint: 'https://oidc.kh.edu.tw/oauth2/auth',
    token_endpoint: 'https://oidc.kh.edu.tw/oauth2/token',
    userinfo_endpoint: 'https://oidc.kh.edu.tw/userinfo',
    jwks_uri: 'https://oidc.kh.edu.tw/.well-known/jwks.json',
    end_session_endpoint: 'https://oidc.kh.edu.tw/oauth2/sessions/logout'
  },

  loadUserInfo: true,
  automaticSilentRenew: true
};