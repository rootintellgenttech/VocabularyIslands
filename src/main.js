import Vue from 'vue'
import App from './App.vue'
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/zh-TW';
import VueLuckyCanvas from '@lucky-canvas/vue'

import vueCustomScrollbar from 'vue-custom-scrollbar'
import "vue-custom-scrollbar/dist/vueScrollbar.css"

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

Vue.use(ElementUI, { locale: customLocale });
Vue.use(VueLuckyCanvas);

Vue.component('vue-custom-scrollbar', vueCustomScrollbar);
Vue.config.productionTip = false;

// 4. 初始化 Vue
new Vue({
  router,
  render: h => h(App),
}).$mount('#app');