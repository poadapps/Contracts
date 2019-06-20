<template>
  <div class="hello">
    <div v-if="!isLoaded">Loading.....</div>
   Token Details of {{$route.params.address}}
   <BR/>
   Collateralization:{{collateralizationRatio}}%
   <BR/>
   Total Collateral:{{totalCollateralValue}}
   <BR/>
   Available tokens:{{totalTokensSupply}}
   <BR/>
   Your Token Balances:{{yourTokenBalance}}
   <BR/>
   Current price:{{currentPrice}}

  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      totalTokensSupply:0,
      totalCollateralValue:0,
      collateralizationRatio:0,
      yourTokenBalance:0,
    }
  },
  created(){
    var that =this;
    this.$store.dispatch('tokensInfo/getTokenExchangeInformation',this.$route.params.address).then((data)=>{
      console.log('tok Details',data)
      that.totalCollateralValue = that.fromWei(data.collateralAmount);
      that.totalTokensSupply = that.fromWei(data.tokensAmount);
      that.yourTokenBalance = that.fromWei(data.tokenBalance);
      that.collateralizationRatio = data.tokenCollateralisationRatio*1.0/100;
      that.isLoaded = true;
    });
  },
  computed: {
    currentPrice:function(){
      return this.totalCollateralValue/this.totalTokensSupply*100/this.collateralizationRatio;
    }
  },
  methods: {
  },
  watch:{
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
