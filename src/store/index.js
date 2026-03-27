import Vue from 'vue';
import Vuex from 'vuex';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';
import { oidcSettings } from '../config/oidc';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    // 註冊名為 oidcStore 的模組
    oidcStore: vuexOidcCreateStoreModule(
      oidcSettings,
      { namespaced: true, routeBaseUrl: '/' },
      {
        userLoaded: (user) => console.log('OIDC 使用者已載入:', user),
        oidcError: (payload) => console.error('OIDC 錯誤:', payload),
      }
    )
  }
});