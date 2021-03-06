
import EventBus from '../../components/common/eventBus'
var tokensOperations = function(contracts,mixins){
    var getRandom = mixins.methods.getRandom;
      
    return{
                state: {
                    tokensCreated:[],
                    tokenIndexes:{},
                    latestScannedBlock:0
                },
                getters:{
                },
                mutations: {
                    addToken:function(state,data){
                        if(data.token && state.tokenIndexes[data.token]===undefined && state.tokensCreated[state.tokenIndexes[data.token]]===undefined){
                            state.tokenIndexes[data.token] = state.tokensCreated.length;
                            state.tokensCreated.push(data);
                        }
                    },
                    updateBlock:function(state,data){
                        state.latestScannedBlock = data;
                    }
                },
                actions: {
                    publishOnExchange(store,data){
                        var _token = data.address;
                        var _supply = data.supply;
                        var collateralIn10000 = data.collateralIn10000;
                        var initialPrice = data.initialPrice;
                        var sum = data.sum;
                        var method = contracts.exchange.methods.addToExchange(_token,_supply,collateralIn10000,initialPrice);
                        method.send({from:contracts.currentAccount,value:sum});
                    },
                    registerNewTokenListener(store){
                        var that = this;
                        contracts.exchange.events.NewToken({
                            fromBlock:store.state.latestScannedBlock+1,
                            toBlock: 'latest'
                        },(err,ev)=>{
                            if(err){
                                console.error(err);
                                return;
                            }
                            var token=
                            {
                                token:ev.returnValues.tokenAdr,
                                creator:ev.returnValues.creator,
                                hash:ev.returnValues.hash
                            };
                            EventBus.$emit('newToken',token);
                            that.commit('tokensOperations/addToken',token);
                            that.commit('tokensOperations/updateBlock',ev.blockNumber);
                        })
                    },
                    async createToken(state,data){

                        var dto ={
                            id:getRandom(),
                            content:data
                        }
                        EventBus.$on('contentSaved',(data)=>{
                            if(data.id==dto.id){
                                EventBus.$emit("swarmSaved",data.hash);
                            }
                        })
                        EventBus.$emit('saveContent',dto);

                        EventBus.$on('swarmSaved',(hash)=>{
                            var method = contracts.exchange.methods.createToken(data.symbol,data.name,data.supply,"0x"+hash);
                            method.send({from:contracts.currentAccount}).catch((err)=>{
                                EventBus.$emit('tokenCancelled',err);
                            });

                        });
                    }
                }
            };
        }

  export default tokensOperations;