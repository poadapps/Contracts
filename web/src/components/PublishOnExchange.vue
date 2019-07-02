<template>
  <div class="hello">
  <div><BackToHome></BackToHome></div>
<p>
<b>You need to have at least 5 SKR tokens in order to publish your token on the exchange</b>
</p>
<p>
Token needs to be created by the same smart contract, creation process is free
</p>
<el-form :model="form" status-icon ref="form" label-width="120px">
  <el-form-item label="Amount to Send" prop="exchangeSupply">
    <el-input v-model="form.exchangeSupply" autocomplete="off"></el-input>
  </el-form-item>
  <el-form-item label="Initial Price in xDAI" prop="initialPrice">
    <el-input v-model="form.initialPrice" autocomplete="off"></el-input>
  </el-form-item>
  <el-form-item label="Collateralization in %" prop="collateralization">
    <el-input v-model.number="form.collateralization"></el-input>
  </el-form-item>
  <el-form-item label="Required xDAI collateral" prop="collateralAmountComputed">
    <el-input v-model.number="form.collateralAmount" :disabled="true"></el-input>
  </el-form-item>
  <el-form-item  v-loading="isLoading">
    <el-button type="primary" @click="putOnExchange">Publish {{fullName}}</el-button>
  </el-form-item>
</el-form>

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
      form:{
        exchangeSupply:0,
        initialPrice:0,
        collateralAmount:0,
        collateralization:10,
      },
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
  watch:{
    "form.initialPrice":function(){

      var collateral = 1.0 * this.form.initialPrice * this.form.exchangeSupply * this.form.collateralization / 100;
      this.form.collateralAmount = collateral;
    },
    "form.exchangeSupply":function(){

      var collateral = 1.0 * this.form.initialPrice * this.form.exchangeSupply * this.form.collateralization / 100;
      this.form.collateralAmount = collateral;
    },
    "form.collateralization":function(){

      var collateral = 1.0 * this.form.initialPrice * this.form.exchangeSupply * this.form.collateralization / 100;
      this.form.collateralAmount = collateral;
    },
  },
  methods: {
    putOnExchange:function(){
      this.$store.dispatch('tokensOperations/publishOnExchange',{
        address:this.tokenAddress,
        supply:this.toWei(this.form.exchangeSupply),
        collateralIn10000:Math.floor(this.form.collateralization*100),
        initialPrice:this.toWei(this.form.initialPrice),
        sum : this.toWei(this.form.collateralAmount)
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
