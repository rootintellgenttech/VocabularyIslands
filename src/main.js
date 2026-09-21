import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import ElementUI from 'element-ui-ce';
import 'element-ui-ce/lib/theme-chalk/index.css';
import locale from 'element-ui-ce/lib/locale/lang/zh-TW';
import VueLuckyCanvas from '@lucky-canvas/vue'
import VueApexCharts from 'vue-apexcharts'
import vueCustomScrollbar from 'vue-custom-scrollbar'
import "vue-custom-scrollbar/dist/vueScrollbar.css"
import html2canvas from 'html2canvas';

Vue.prototype.$html2canvas = html2canvas;

// 讀取伺服器注入的 CSP nonce,設為 ApexCharts 全域預設
const cspNonce = document
  .querySelector('meta[name="csp-nonce"]')
  ?.getAttribute('content');

if (cspNonce) {
  window.Apex = {
    ...(window.Apex || {}),
    chart: {
      ...(window.Apex?.chart || {}),
      nonce: cspNonce
    }
  };
}

const customLocale = {
  ...locale,
  el: {
    ...locale.el,
    table: {
      ...locale.el.table,
      confirmFilter: '篩選',
      resetFilter: '清除'
    }
  }
};
Vue.use(VueApexCharts)
Vue.use(ElementUI, {
  locale: customLocale
});
Vue.use(VueLuckyCanvas);
Vue.component('apexchart', VueApexCharts)

Vue.component('vue-custom-scrollbar', vueCustomScrollbar);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');