<template>
  <div class="hello">
    <div v-if="!isLoaded">Loading....</div>
    <button @click="buyTokens">
    Buy
    </button>
    <button @click="sellTokens">
    Sell
    </button>
    Amount: <input v-model="amountToBuy"/>
    PriceToBuy: {{priceToBuy|toDollars}}
    PriceToSell: {{priceToSell|toDollars}}
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      amountToBuy:0,
      priceToBuy:0,
      priceToSell:0,
      isComputing:false
    }
  },
  created(){
    this.isLoaded = true;
  },
  props:['tokAddr'],
  methods: {
    buyTokens(){
      this.$store.dispatch('buySell/buyTokens',{
        addr:this.tokAddr,
        amount:this.toWei(this.amountToBuy)
      }).then(()=>{
        this.amountToBuy = 0;
      });
    },
    sellTokens(){
      this.$store.dispatch('buySell/sellTokens',{
        addr:this.tokAddr,
        amount:this.toWei(this.amountToBuy)
      });
    }
  },
  watch:{
    amountToBuy:function(newVal,oldVal){
      this.isLoaded=false;
      var getBuy = this.$store.dispatch('buySell/getBuyPrice',{
        addr:this.tokAddr,
        amount:this.toWei(newVal)
      });
      var getSell = this.$store.dispatch('buySell/getSellPrice',{
        addr:this.tokAddr,
        amount:this.toWei(newVal)
      });
      Promise.all([getBuy,getSell]).then((ret)=>{
        this.priceToBuy = ret[0].toString();
        this.priceToSell = ret[1].toString();
        this.isLoaded=true;
      }).catch((ex)=>{
        this.isLoaded = true;
      });
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
