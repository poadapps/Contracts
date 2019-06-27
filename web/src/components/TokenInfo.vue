<template>
  <div class="hello">

  <div><BackToHome></BackToHome></div>
    <div v-if="!isLoaded">Loading.....</div>
   Token Details of {{fullName}}
   <BR/>
   Collateralization:{{collateralizationRatio}}
   <BR/>
   Total Shares:{{totalShares}}
   <BR/>
   Total Collateral:{{totalCollateralValue}}
   <BR/>
   Available tokens:{{totalTokensSupply}}
   <BR/>
   Your Token Balances:{{yourTokenBalance}}
   <BR/>
   Your Token Exchange Share:{{userShares}}
   <BR/>
   Current price:{{currentPrice}}
   <div><ChangeCollateral :tokAddr="$route.params.address"/></div>
  </div>
</template>

<script>
import ChangeCollateral from './ChangeCollateral.vue'
import BackToHome from './BackToHome.vue'
import EventBus from './common/eventBus'
import { mapState } from 'vuex';
export default {
  name: 'HelloWorld',
  data () {
    return {
      totalCollateralValue:'',
      totalTokensSupply:'',
      yourTokenBalance:'',
      collateralizationRatio:'',
      totalShares:'',
      userShares:'',
      currentPrice:''
    }

      /*
      that.totalCollateralValue = that.fromWei(data.collateralAmount);
      that.totalTokensSupply = that.fromWei(data.tokensAmount);
      that.yourTokenBalance = that.fromWei(data.tokenBalance);
      that.collateralizationRatio = data.tokenCollateralisationRatio*1.0/100;
      that.totalShares = that.fromWei(data.tokenTotalShares)*10000;
      that.userShares = that.fromWei(data.usersShare)*10000;
      */
  },
  mounted(){
    var that =this;
    this.$store.dispatch('tokensInfo/getTokenExchangeInformation',this.$route.params.address);
    EventBus.$on('shareUpdated',this.updateTokenInfo);
  },
  computed: {
  },
  methods: {
    updateTokenInfo:function(data){
      if(data.addr===this.$route.params.address){
        this.totalCollateralValue = this.fromWei(data.token.collateralAmount);
        this.totalTokensSupply = this.fromWei(data.token.tokensAmount);
        this.yourTokenBalance = this.fromWei(data.token.tokenBalance);
        this.collateralizationRatio = data.token.tokenCollateralisationRatio*1.0/100;
        this.totalShares = this.fromWei(data.token.tokenTotalShares)*10000;
        this.userShares = this.fromWei(data.token.usersShare)*10000;
        this.isLoaded = true;
      }
      
    }
  },
  computed: {
    fullName:function(){
      var data = this.$store.getters['exchangeList/getTokenByAddress'](this.$route.params.address);
      return data?data.name:'-';
    }
  },
  components: {
    ChangeCollateral,BackToHome
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
