<template>
  <div class="hello">
  <div><BackToHome></BackToHome></div>
   <div>
    <div>
    Amount to Send:<input v-model="exchangeSupply"/> 
    </div>
    <div>
    Initial Price in xDAI:<input v-model="initialPrice"/> 
    </div>
    <div>
    Collateralization in %:<input v-model="collateralization"/> 
    </div>
    <div>
    Required xDAI collateral:{{collateralAmount}}
    </div>
    <div v-if="isLoading">creating token...............</div>

  <div>
    <button @click="putOnExchange"> Publish {{fullName}}</button>
  </div>
   </div>
  </div>
</template>

<script>
import BackToHome from './BackToHome.vue'
import ChangeCollateral from './ChangeCollateral.vue'
import EventBus from './common/eventBus'
import { mapState } from 'vuex';
export default {
  name: 'HelloWorld',
  data () {
    return {
      exchangeSupply:0,
      initialPrice:0,
      collateralization:10,
      tokenAddress:'',
      fullName:'',
      isLoading:false
    }
  },
  mounted(){
    var that = this;
    this.tokenAddress = this.$route.params.address;
    that.$store.dispatch('tokensInfo/getTokenNameByAddress',that.$route.params.address, {root:true}).then((data)=>{
      that.fullName = data.fullName
    });
  },
  computed: {
    collateralAmount:function(){
      var collateral = 1.0 * this.initialPrice * this.exchangeSupply * this.collateralization / 100;
      return collateral;
    }
  },
  methods: {
    putOnExchange:function(){
      var totalSum = 1.0*this.collateralization*this.initialPrice*this.exchangeSupply/100;
      this.$store.dispatch('tokensOperations/publishOnExchange',{
        address:this.tokenAddress,
        supply:this.toWei(this.exchangeSupply),
        collateralIn10000:Math.floor(this.collateralization*100),
        initialPrice:this.toWei(this.initialPrice),
        sum : this.toWei(totalSum)
      });
    }
  },
  components: {
    BackToHome
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
