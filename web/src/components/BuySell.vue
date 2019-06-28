<template>
  <span  v-if="tokAddr && tokAddr.length>0">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item :label="token.abbrev">
      </el-form-item>
      <el-form-item label="Amount">
        <el-input v-model="amountToBuy" placeholder="amount to buy ex. 12.34"  :disabled="(token.abbrev && token.abbrev.length>0)===false"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="isLoaded===false" :disabled="!(amountToBuy>0)" type="primary" @click="buyTokens"> Buy for {{priceToBuy|toDollars}} xDai</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="isLoaded===false"  :disabled="!(amountToBuy>0)" type="primary" @click="sellTokens"> Sell for {{priceToSell|toDollars}} xDai </el-button>
      </el-form-item>
    </el-form>
  </span>
</template>

<script>
export default {
  name: 'BuySell',
  data () {
    return {
      amountToBuy:0,
      priceToBuy:'-',
      priceToSell:'-',
      token:{},
      isLoaded:false
    }
  },
  mounted(){
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
  computed: {
    tokAndSum:function(){
      return this.tokAddr+this.amountToBuy;
    }
  },
  watch:{
    tokAddr:function(newOne,oldOne){
      console.log('addr change',newOne,oldOne);
      var tokDetails = this.$store.getters['exchangeList/getTokenByAddress'](newOne);
      this.token = tokDetails;
      
    },
    tokAndSum:function(newVal,oldVal){
      this.isLoaded=false;
      var getBuy = this.$store.dispatch('buySell/getBuyPrice',{
        addr:this.tokAddr,
        amount:this.toWei(this.amountToBuy)
      });
      var getSell = this.$store.dispatch('buySell/getSellPrice',{
        addr:this.tokAddr,
        amount:this.toWei(this.amountToBuy)
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
