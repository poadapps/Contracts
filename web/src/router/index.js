import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import BackToHome from '@/components/BackToHome'
import TokenInfo from '@/components/TokenInfo'
import CreateToken from '@/components/CreateToken'
import TestOrbitDB from '@/components/TestOrbitDB'
import PublishOnExchange from '@/components/PublishOnExchange'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
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
    },
    {
      path: '/TestOrbitDB',
      name: 'TestOrbitDB',
      component: TestOrbitDB
    },
    {
      path: '/publishOnExchange/:address',
      name: 'PublishOnExchange',
      component: PublishOnExchange
    }
  ]
})
