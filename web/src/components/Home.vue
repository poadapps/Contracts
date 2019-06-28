


<template>
  <div class="hello">
    <div>
    Current BlockHeight : {{blockHeight}}
    </div>
    <div>
    Main Token Name : {{mainName}}
    </div>

    <el-table
      :data="tokenList"
      style="width: 100%">

      <el-table-column
        align="right">
        <template slot="header" slot-scope="scope">
          <BuySell :tokAddr="selectedAddress"/>
        </template>
          <el-table-column
            label="Symbol"
            prop="abbrev">
          </el-table-column>
          <el-table-column
            label="Name"
            prop="name">
          </el-table-column>
          <el-table-column
            label="Total Supply"
            prop="tokSupply">
          </el-table-column>
          <el-table-column
            label="Price"
            prop="price">
          </el-table-column>
      </el-table-column>
    </el-table>

    <div>
      <div v-for="(item, id) in tokenList" :key="id" @click="selectedAddress = item.address">
       Name:{{item.name}}<BR/> 
       Price:{{item.price }}
       <button @click="showDetails(item.address)">Details</button>
      </div>
    </div>
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
    showDetails(address){
      this.$router.push('/token/'+address);
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
        console.log(x,retVal);
        return retVal;
      });
      that.selectedAddress = list[0].address;
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
