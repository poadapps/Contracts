import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import TokenInfo from '@/components/TokenInfo'
import CreateToken from '@/components/CreateToken'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/token/:address',
      name: 'tokenDetails',
      component: TokenInfo
    },
    {
      path: '/newToken',
      name: 'NewToken',
      component: CreateToken
    }
  ]
})
