<template>
  <div class="hello">
  <div><BackToHome></BackToHome></div>
    <p>OrbitDB test adding and reading items</p>
    <textarea v-model="content"></textarea>
    <el-button @click="addItem">Add Entry</el-button>
    <div>


    <el-table
      :data="prevContent"
      highlight-current-row
      style="width: 100%"  @current-change="handleCurrentChange">
          <el-table-column min-width=5
            label="Id"
            prop="id">
          </el-table-column>
          <el-table-column min-width=60
            label="Price (tokens)"
            prop="text">
          </el-table-column>
          <el-table-column min-width=35
            label="Hash"
            prop="hash">
          </el-table-column>
    </el-table>

    </div>
  </div>
</template>

<script>
import BackToHome from './BackToHome.vue'
import EventBus from './common/eventBus'
import { mapState } from 'vuex';
export default {
  name: 'HelloWorld',
  data () {
    return {
      content:'empty',
      prevContent:[{
        id:1,
        text:'no content'
      }]
    }
  },
  mounted(){
    
  },
  methods: {
    handleCurrentChange:function(el){
      var dto ={
        id:this.getRandom(),
        hash:el.hash
      }
      EventBus.$on('contentLoaded',(data)=>{
        if(data.id==dto.id){
          console.log("data from OrbitDB!",data);
        }
      })
      EventBus.$emit('loadContent',dto);
      
    },
    addItem:function(){
      var tab = this.prevContent.map(x=> x.id);
      var maxId = Math.max.apply(this,tab);
      var object = {
        id:maxId+1,
        text:this.content
      };
      var dto ={
        id:this.getRandom(),
        content:object
      }
      EventBus.$on('contentSaved',(data)=>{
        if(data.id==dto.id){
          dto.content.hash = data.hash;
          this.prevContent.push(dto.content);
        }
      })
      EventBus.$emit('saveContent',dto);

    }
  },
  watch: {
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
