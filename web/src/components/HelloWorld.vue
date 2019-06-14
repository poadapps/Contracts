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
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  beforeCreate () {
    this.$store.dispatch('readBlockchain')
    this.$store.dispatch('getTokenName')
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
     return this.$store.state.blockHeight;
     },
   mainName () {
     return this.$store.state.mainTokenName;
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
