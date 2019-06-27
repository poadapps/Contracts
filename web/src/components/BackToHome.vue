


<template>
<span><a href="#" @click="moveUp">&lt;&lt;</a></span>
</template>

<script>
import BuySell from './BuySell.vue'
export default {
  name: 'BackToHome',
  data () {
    return {
      selectedAddress:''
    }
  },
  methods: {
    moveUp(address){
      this.$router.push({name:'Home'});
    }
  },
  computed: {
    blockHeight () {
      return this.$store.state.universe.blockHeight;
    },
    mainName () {
      return this.$store.state.universe.mainTokenName;
    },
    tokenList (){
      return this.$store.state.exchangeList.ListedTokens;
    }
   },
  components: {
    BuySell
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
