<template>
  <div class="hello">
   Component To Remove Collateral of {{fullName}}
   <div>You have {{numberOfSharesOwnedByUser}} Shares. </div>
   <div> <input v-model="amountOfSharesToRemove"/> Shares</div>
   <div v-if="isLoaded">
    represents {{assignedTokensAmount}} tokens and {{assignedXDaiAmount}} xDAI 
   </div>
       <button @click="removeLiquidity">  Withdraw Shares </button>
       <button @click="addLiquidity">  Buy Shares </button>
  </div>
</template>

<script>
import EventBus from './common/eventBus'
export default {
  name: 'ChangeCollateral',
  data () {
    return {
      amountOfSharesToRemove:0,
      assignedTokensAmount:0,
      assignedXDaiAmount:0,
      numberOfSharesOwnedByUser:0,

    }
  },
  props:['tokAddr'],
  mounted(){
    this.isLoaded = false;
    EventBus.$on('shareUpdated',this.updateTokenInfo);
    EventBus.$on('shareAmountsComputed',this.updateShareAmounts);
  },
  computed: {
    fullName:function(){
      var data = this.$store.getters['exchangeList/getTokenByAddress'](this.tokAddr);
      return data?data.name:'';
    }
  },
  watch:{
    amountOfSharesToRemove:function(newVal,oldVal){
      this.$store.dispatch('tokensInfo/computedReturnedDeposit',{
        token:this.$route.params.address,
        sharesCount:newVal});
    }
  },
  methods: { 
    updateTokenInfo:function(data){
      if(data.addr===this.$route.params.address){
        this.numberOfSharesOwnedByUser = this.fromWei(data.token.usersShare)*10000;
        this.isLoaded = true;
      }  
    },
    updateShareAmounts:function(data){
      this.assignedTokensAmount = this.fromWei(data.tokensAmount);
      this.assignedXDaiAmount = this.fromWei(data.daiAmount);
    },
    removeLiquidity:function(){
      this.$store.dispatch('tokensInfo/removeLiquidity',{
        token:this.$route.params.address,
        sharesCount:this.amountOfSharesToRemove});
    },
    addLiquidity:function(){
      this.$store.dispatch('tokensInfo/addLiquidity',{
        token:this.$route.params.address,
        xDaiToPay:this.toWei(this.assignedXDaiAmount)});
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
