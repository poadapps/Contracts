<template>
  <div class="hello">
    <button @click="makeDummyTx">
    Do dumb tx
    </button>
    <div>
    Current BlockHeight : {{blockHeight}}
    </div>
    <div>
    Main Token Name : {{mainName}}
    </div>
    <div>
      <div v-for="(item, id) in tokenList" :key="id">
       {{item.name}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  beforeCreate () {
    this.$store.dispatch('universe/readBlockchain')
    this.$store.dispatch('universe/getMainTokenName')
    this.$store.dispatch('exchangeList/persistTokenListInLocalStorage')
    this.$store.dispatch('exchangeList/getTokenListFromLocalStorage').then(()=>{
      this.$store.dispatch('exchangeList/getTokenListFromBlockchain')
    });
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
    }
  },
  methods: {
    makeDummyTx(){
      this.$store.dispatch('sendDummyTx')
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
