<template>
  <div class="hello">
  <div><BackToHome></BackToHome></div>
   <div>
    <div>
    Name:<input v-model="tokenName"/> 
    </div>
    <div>
    Symbol:<input v-model="tokenSymbol"/> 
    </div>
    <div>
    Total Supply:<input v-model="tokenSupply"/> 
    </div>
    <div>
    Decimals:18
    </div>
    <div v-if="isLoading">creating token...............</div>
    <div>
      Your tokens:
      <div v-for="(item,id) in existingTokens()" :key="id">
       Address:{{item.token}}<BR/> <span v-if="item.isOnExchange==false" @click="putOnExchange(item.token)">Dodaj </span>
      </div>
    </div>

  <div>
    <button @click="createToken">  Create Token</button>
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
  name: 'CreateToken',
  data () {
    return {
      tokenName:'',
      tokenSymbol:'',
      tokenSupply:'',
      tokenAddress:'',
      isLoading:false
    }
  },
  mounted(){
    var that =this;
    EventBus.$on('newToken',this.tokenCreated);
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
        name:this.tokenName,
        symbol:this.tokenSymbol,
        supply:this.toWei(this.tokenSupply)
      });
      this.isLoading=true;
    },
    updateTokenStatus:function(addr){
      this.$forceUpdate();
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
