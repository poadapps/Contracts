


<template>
  <div class="hello">
    <div>
    Current BlockHeight : {{blockHeight}}
    </div>
    <div>
    Main Token Name : {{mainName}}
    </div>
    <div>
      <BuySell :tokAddr="selectedAddress"/>
      <div v-for="(item, id) in tokenList" :key="id" @click="selectedAddress = item.address">
       Name:{{item.name}}<BR/> 
       Price:{{item.price | toDollars}}
       <button @click="showDetails(item.address)">Details</button>
      </div>
    </div>
  </div>
</template>

<script>
import BuySell from './BuySell.vue'
export default {
  name: 'HelloWorld',
  data () {
    return {
      selectedAddress:''
    }
  },
  methods: {
    showDetails(address){
      this.$router.push('/token/'+address);
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
