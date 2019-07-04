<template>
<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
  <el-menu-item index="/" router="true">Market</el-menu-item>
  <el-menu-item index="/newToken" router="true">Create Token</el-menu-item>
  <el-menu-item index="/TestOrbitDB" router="true">Test OrbitDB</el-menu-item>
</el-menu>
</template>
<script>
  export default {
    data() {
      return {
        activeIndex: '1',
        activeIndex2: '1'
      };
    },
    methods: {
      handleSelect(key, keyPath) {
          this.$router.push(key);
      }
    }
  }
</script>