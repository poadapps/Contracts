// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import Vuex from 'vuex'

import App from './App'
import router from './router'
import storeContentFactory from './store/index'
import getWeb3 from './utils/web3/contracts'
import web3Op from './mixins/web3Op'
import { type } from 'os';

Vue.use(Vuex)

Vue.config.productionTip = false;


getWeb3.then((contracts)=>{
  var web3Mixin = web3Op(contracts.web3);
  Vue.filter('toDollars', function (value) {
    var base = new contracts.web3.utils.BN(10);
    base = base.pow(new contracts.web3.utils.BN("14"));
    value = value.toString();
    var value = new contracts.web3.utils.BN(value);

    if (!value) return '-'
    value = value.div(base).toString();
    
    return (parseFloat(value)/10000).toString();
  })

  var store = new Vuex.Store(
    {
      modules:storeContentFactory(contracts)
    });
  Vue.mixin(web3Mixin);
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
 