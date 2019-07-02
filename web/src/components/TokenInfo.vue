<template>
  <div class="hello">
  <BackToHome></BackToHome>
  <el-row type="flex" :gutter="12">
  <el-col  :span="11" >
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span>Token Information</span>
  </div>
  <span>
  <ul>
  <li>name:{{tokName}} ({{tokSymbol}})</li>
  <li>Available tokens:{{tokensExchangeSupply}}</li>
  <li>Total Supply:{{tokTotalSupply}} </li>
  <li>Total Shares:{{totalShares}}</li>
  <li>Market price:{{marketPrice}}</li>
   </ul>
  </span>
</el-card>
</el-col >
  <el-col  :span="11"  :offset=2 >
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span>Exchange Information</span>
  </div>
  <span>
  <ul>
  <li>Available tokens:{{tokensExchangeSupply}}</li>
  <li>Collateralization:{{collateralizationRatio}} %</li>
  <li>Total Shares:{{totalShares}}</li>
  <li>Total Collateral:{{totalCollateralValue}} xDAI</li>
  <li>Collateral driven price:{{currentPrice}}</li>
   </ul>
  </span>
</el-card>
</el-col>
  </el-row>
  <el-row :gutter="12"  type="flex" >
  <el-col  :span="12" :offset=6>
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span>Shares Management</span>
  </div>
  <span>
  <ul>
  <li>Your Token Balances:{{yourTokenBalance}}</li>
  <li>Your xDAI Balances:{{yourxDAIBalance|toDollars}}</li>
  <li>Your Token Exchange Share:{{userShares}}</li>
  <li><ChangeCollateral :tokAddr="$route.params.address"/></li>
   </ul>
  </span>
</el-card>
</el-col>
</el-row>
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
      tokensExchangeSupply:'',
      yourTokenBalance:'',
      collateralizationRatio:'',
      totalShares:'',
      userShares:'',
      currentPrice:''
    }
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
        this.tokensExchangeSupply = this.fromWei(data.token.tokensAmount);
        this.yourTokenBalance = this.fromWei(data.token.tokenBalance);
        this.collateralizationRatio = data.token.tokenCollateralisationRatio*1.0/100;
        this.totalShares = this.fromWei(data.token.tokenTotalShares)*10000;
        this.userShares = this.fromWei(data.token.usersShare)*10000;
        this.isLoaded = true;
        this.currentPrice=1.0*this.totalCollateralValue*100/this.tokensExchangeSupply/this.collateralizationRatio;
      }
      
    }
  },
  computed: {
    fullName:function(){
      var data = this.$store.getters['exchangeList/getTokenByAddress'](this.$route.params.address);
      return data?data.name:'-';
    },
    tokenInfo:function(){
      var data = this.$store.getters['exchangeList/getTokenByAddress'](this.$route.params.address);
      console.log(data,'token info');
      return data;
    },
    yourxDAIBalance:function(){
      var data = this.$store.state.universe.latestBalance;
      return data;
    },
    marketPrice:function(){
       return this.tokenInfo?this.cutDigits(this.fromWei(this.tokenInfo.price.toString()),3):'-';
    },
    tokTotalSupply:function(){
       return this.tokenInfo?this.cutDigits(this.fromWei(this.tokenInfo.tokSupply.toString()),3):'-';
    },
    tokName:function(){
       return this.tokenInfo?this.tokenInfo.name:'-';
    },
    tokSymbol:function(){
       return this.tokenInfo?this.tokenInfo.abbrev:'-';
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
  text-align:left;
}
li {
  list-style-type: none;
  margin: 0 10px;
  white-space: nowrap;
}
a {
  color: #42b983;
}  
.el-row{
  margin:20px;
}
</style>
