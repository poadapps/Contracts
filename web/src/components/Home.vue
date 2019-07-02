


<template>
  <div class="hello">
    <el-table
      :data="tokenList"
      highlight-current-row
      @current-change="handleCurrentChange"
      style="width: 100%">

      <el-table-column
        align="right">
        <template slot="header" slot-scope="scope">
          <BuySell :tokAddr="selectedAddress"/>
        </template>
          <el-table-column type="expand">
            <template slot-scope="props">
              <span  v-if="!Array.isArray(getOffer(props.row.address))">{{getOffer(props.row.address)}}</span>
              <el-table v-if="Array.isArray(getOffer(props.row.address))"
                :data="getOffer(props.row.address)"
                highlight-current-row
                style="width: 100%">
                    <el-table-column min-width=15
                      label="Price (tokens)"
                      prop="price">
                    </el-table-column>
                    <el-table-column
                      label="Description"
                      prop="description">
                    </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column min-width=15
            label="Symbol"
            prop="abbrev" >
          </el-table-column>
          <el-table-column
            label="Name"
            prop="name">
          </el-table-column>
          <el-table-column  min-width=30
            label="Total Supply"
            prop="tokSupply">
          </el-table-column> 
          <el-table-column min-width=30
            label="Price"
            prop="price">
          </el-table-column>
          <el-table-column  min-width=15
            label="Operations">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="info"
                @click="showDetails(scope)">Details</el-button>
            </template>
          </el-table-column>
        </el-table-column>
    </el-table>

  </div>
</template>

<script>
import BuySell from './BuySell.vue'
export default {
  name: 'HelloWorld',
  data () {
    return {
      selectedAddress:''
    }
  },
  methods: {
    handleCurrentChange(record){
      this.selectedAddress = record.address;
    },
    showDetails(record){
      this.$router.push('/token/'+record.row.address);
    },
    getOffer(adr){
      var desc = this.$store.state.tokensInfo.tokensShares[adr].description;
      try{
        desc = JSON.parse(desc);
      }catch(ex){}
      return desc;
    }
  },
  computed: {
    blockHeight () {
      return this.$store.state.universe.blockHeight;
    },
    mainName () {
      return this.$store.state.universe.mainTokenName;
    },
    tokenList (){
      var that = this;
      var list = this.$store.state.exchangeList.ListedTokens.map((x,index)=>{
        var retVal = {
          id:index,
          name:x.name,
          abbrev:x.abbrev,
          price:that.cutDigits(that.fromWei(x.price),3),
          tokSupply:that.fromWei(x.tokSupply),
          address:x.address
        };
        return retVal;
      });
      if(list && list.length>0){
        that.selectedAddress = list[0].address;
      }
      return list;
    }
   },
  components: {
    BuySell
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
