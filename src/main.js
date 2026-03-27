import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/zh-TW';
import VueLuckyCanvas from '@lucky-canvas/vue'
import VueApexCharts from 'vue-apexcharts'
import vueCustomScrollbar from 'vue-custom-scrollbar'
import "vue-custom-scrollbar/dist/vueScrollbar.css"
import html2canvas from 'html2canvas';

Vue.prototype.$html2canvas = html2canvas;

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

// 4. 初始化 Vue
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');