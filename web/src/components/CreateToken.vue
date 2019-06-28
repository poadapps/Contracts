<template>
<span>
<BackToHome></BackToHome>

<el-form :model="form" status-icon ref="form" label-width="120px">
  <el-form-item label="Name" prop="tokenName">
    <el-input v-model="form.tokenName" autocomplete="off"></el-input>
  </el-form-item>
  <el-form-item label="Symbol" prop="tokenSymbol">
    <el-input v-model="form.tokenSymbol" autocomplete="off"></el-input>
  </el-form-item>
  <el-form-item label="Token Supply" prop="tokenSupply">
    <el-input v-model.number="form.tokenSupply"></el-input>
  </el-form-item>
  <el-form-item label="Decimals" prop="decimals">
    <el-input v-model.number="form.decimals" :disabled="true"></el-input>
  </el-form-item>
  <el-form-item  v-loading="isLoading">
    <el-button type="primary" @click="createToken">Create Token</el-button>
  </el-form-item>
</el-form>

</span>


</span>
  
</template>

<script>
import BackToHome from './BackToHome.vue'
import ChangeCollateral from './ChangeCollateral.vue'
import EventBus from './common/eventBus'
import { mapState } from 'vuex';
export default {
  name: 'CreateToken',
  data () {
    return {
        form:{
        tokenName:'',
        tokenSymbol:'',
        tokenSupply:'',
        tokenAddress:'',
        decimals:18
      },

        isLoading:false
    }
  },
  mounted(){
    var that =this;
    EventBus.$on('newToken',this.tokenCreated);
    EventBus.$on('tokenCancelled',this.tokenCancelled);
     EventBus.$on('newTokenExchange',this.updateTokenStatus);
  },
  computed: {
  },
  methods: {

    existingTokens:function(){
      var that = this;
      var retVal = this.$store.state.tokensOperations.tokensCreated.map((x,index)=>{

        var tokenData = {id:index+1,token:x.token,isOnExchange:false};
        var isOnExchange = that.$store.state.exchangeList.ListedTokensMap[x.token];
        tokenData.isOnExchange = isOnExchange!==undefined?true:false;
        return tokenData;
        
      })
      return retVal;
    },
    putOnExchange:function(addr){ 
      this.$router.push({ name: 'PublishOnExchange', params: { address: addr } });
    },
    createToken:function(data){

      this.$store.dispatch('tokensOperations/createToken',{
        name:this.form.tokenName,
        symbol:this.form.tokenSymbol,
        supply:this.toWei(this.form.tokenSupply)
      });
      this.isLoading=true;
    },
    updateTokenStatus:function(addr){
      this.$forceUpdate();
    },
    tokenCancelled:function(addr){
      this.isLoading = false;
    },
    tokenCreated:function(data){
      var that = this;
      if(data.creator.toLowerCase()===this.$store.state.universe.latestAddress){
        this.isLoading=false;
        this.$store.dispatch('getTokenNameByAddress',data.token).then((retVal)=>{
          that.tokenName = retVal.fullName;
        });
      }
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
