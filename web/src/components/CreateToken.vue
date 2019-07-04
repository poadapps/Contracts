<template>
<span>
<BackToHome></BackToHome>

<p v-if="existingTokens().length>1">Your tokens</p>
    <el-table
      v-if="existingTokens().length>=1"
      :data="existingTokens()"
      highlight-current-row
      style="width: 100%">
          <el-table-column
            label="Token Address"
            prop="token">
          </el-table-column>
          
          <el-table-column
            label="Operations">
            <template slot-scope="scope">
              <el-button v-if="scope.row.isOnExchange===false"
                size="mini"
                @click="putOnExchange(scope.row.token)" type="success">Publish on Exchange</el-button>
            </template>
          </el-table-column>
    </el-table>

<p>
Create list of services (with prices) You provide for this token
</p>
<el-row type="flex" :gutter="12">
  <el-col :span="12" :offset="6">
    <el-form :model="proposedService" status-icon ref="form" label-width="120px" size="small">
      <el-form-item label="Price" prop="price">
        <el-input-number v-model="proposedService.price" autocomplete="off" required></el-input-number>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="proposedService.description" autocomplete="off" required></el-input>
      </el-form-item>
      <el-form-item  v-loading="isLoading">
        <el-button type="primary" @click="addProposedService">Add Service</el-button>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>

    <el-table
      :data="form.priceList"
      highlight-current-row
      style="width: 100%">
          <el-table-column min-width=5
            label="Id"
            prop="id">
          </el-table-column>
          <el-table-column min-width=15
            label="Price (tokens)"
            prop="price">
          </el-table-column>
          <el-table-column
            label="Description"
            prop="description">
          </el-table-column>
          <el-table-column min-width=5
            label=""
            prop="id" >
            <template slot-scope="scope">
              <el-button  type="danger" icon="el-icon-delete" circle @click="removeItem(scope.row.id)"></el-button>
            </template>
          </el-table-column>
    </el-table>

<p>Set all token's parameters</p>

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
          decimals:18,
          maxId:1,
          priceList:[{id:1,price:60,description:'1 hour online consultation'}]
        },
        proposedService:{

        },

        isLoading:false
    }
  },
  mounted(){
    var that =this;
    EventBus.$on('newToken',this.tokenCreated);
    EventBus.$on('tokenCancelled',this.tokenCancelled);
     EventBus.$on('newTokenExchange',()=>{
       that.$forceUpdate();
     });

  },
  methods: {
    removeItem:function(elId){
      this.form.priceList = this.form.priceList.filter((x)=>x.id!==elId);
    },
    addProposedService:function(){
      if(this.proposedService.price!=undefined && this.proposedService.description!==undefined){
        this.form.priceList.push({id:this.form.maxId+1,price:this.proposedService.price,description:this.proposedService.description});
        this.proposedService.price = undefined;
        this.form.maxId=this.form.maxId+1;
        this.proposedService.description = undefined;
      }
    },
    existingTokens:function(){
      var that = this;
      var retVal = this.$store.state.tokensOperations.tokensCreated.map((x,index)=>{

        var tokenData = {id:index+1,token:x.token,isOnExchange:true,creator:x.creator};
        var isOnExchange = that.$store.state.exchangeList.ListedTokensMap[x.token];
        tokenData.isOnExchange = isOnExchange!==undefined?true:false;

        return tokenData;
        
      }).filter((x)=>{
        return x.creator.toLowerCase() == that.$store.state.universe.latestAddress.toLowerCase();
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
        supply:this.toWei(this.form.tokenSupply),
        content:this.getContent()
      });
      this.isLoading=true;
      this.form.priceList = [];
    },
    tokenCancelled:function(addr){
      this.isLoading = false;
    },
    getContent:function(){
      return JSON.stringify(this.form.priceList);
    },
    tokenCreated:async function(data){
      var that = this;
      if(data.creator.toLowerCase()===this.$store.state.universe.latestAddress){
        this.isLoading=false;
        var tokDetails = await this.$store.dispatch('tokensInfo/getTokenNameByAddress',data.token);
        that.tokenName = tokDetails.fullName;
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
.el-input-number{
  float:left;
}
</style>
