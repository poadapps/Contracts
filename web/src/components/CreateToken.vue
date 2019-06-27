<template>
  <div class="hello">
   Create Token
   <div>
    <div>
    Name:<input v-model="tokenName"/> 
    </div>
    <div>
    Symbol:<input v-model="tokenSymbol"/> 
    </div>
    <div>
    Total Supply:<input v-model="tokenSupply1"/> 
    </div>
    <div>
    Decimals:18
    </div>

  <div>
    <button @click="createToken">  Create Token</button>
  </div>
   </div>
  </div>
</template>

<script>
import ChangeCollateral from './ChangeCollateral.vue'
import EventBus from './common/eventBus'
import { mapState } from 'vuex';
export default {
  name: 'HelloWorld',
  data () {
    return {
      tokenName:'',
      tokenSymbol:'',
      tokenSupply:''
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
    EventBus.$on('newToken',this.updateToken);
  },
  computed: {
  },
  methods: {
    createToken:function(data){
      console.log('tokenCreated');
      this.$store.dispatch('exchangeList/createToken',{
        name:this.tokenName,
        symbol:this.tokenSymbol,
        supply:this.tokenSupply
      });
      
    }
  },
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
