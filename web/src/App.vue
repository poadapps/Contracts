<template>
  <div id="app">
  <el-container>
  <el-header><Menu></Menu></el-header>
  <el-main><router-view/></el-main>
</el-container>
    
  </div>
</template>

<script>
import Menu from './components/Menu.vue'
export default {
  name: 'App',
  components: {
    Menu
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
