// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import Vuex from 'vuex'

import App from './App'
import router from './router'
import storeContentFactory from './store/index'
import getWeb3 from './utils/web3/contracts'

Vue.use(Vuex)

Vue.config.productionTip = false


getWeb3.then((contracts)=>{

  var store = new Vuex.Store(
    {
      modules:storeContentFactory(contracts)
    });
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    mounted() {
    },
    components: { App },
    template: '<App/>'
  })

  
})
 