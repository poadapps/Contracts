<template>
  <div class="hello">
   Component To Add Collateral of {{fullName}}

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
  props:['tokAddr'],
  created(){
    var that =this;
    this.$store.dispatch('tokensInfo/getTokenExchangeInformation',this.$route.params.address).then((data)=>{
      that.totalCollateralValue = that.fromWei(data.collateralAmount);
      that.totalTokensSupply = that.fromWei(data.tokensAmount);
      that.yourTokenBalance = that.fromWei(data.tokenBalance);
      that.collateralizationRatio = data.tokenCollateralisationRatio*1.0/100;
      that.isLoaded = true;
    });
  },
  computed: {

    fullName:function(){
      var data = this.$store.getters['exchangeList/getTokenByAddress'](this.$route.params.address);
      return data?data.name:'';
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
