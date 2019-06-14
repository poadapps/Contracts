// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import Vuex from 'vuex'

import App from './App'
import router from './router'
import getWeb3 from './utils/web3/contracts'

Vue.use(Vuex)

Vue.config.productionTip = false



getWeb3.then((contracts)=>{


  const store = new Vuex.Store({
    state: {
      blockHeight: -1,
      mainTokenName: '',
      mainTokenSupply: '',
      ListedTokensCount:0,
      ListedTokens:[]
    },
    mutations: {
      setBlockHeight (state,val) {
        state.blockHeight=val;
      },
      setMainTokenName (state,val) {
        state.mainTokenName=val;
      }
    },
    actions: {
      readBlockchain({commit}){
        contracts.web3.eth.getBlockNumber((e,r)=>{
          commit('setBlockHeight',r);
        })
      },

      getTokenName({commit}){
        contracts.mainToken.methods.name().call().then((r)=>{
          commit('setMainTokenName',r);
        })
      },
      sendDummyTx({dispatch}){
        web3.eth.sendTransaction({value:0,to:web3.eth.accounts[0]},()=>{
          dispatch('readBlockchain');
        })
      }

    }
  })

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  })

  
})
