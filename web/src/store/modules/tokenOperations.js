
import EventBus from '../../components/common/eventBus'
var tokensOperations = function(contracts){
      
    return{
                state: {
                    tokensCreated:[],
                    latestScannedBlock:0
                },
                getters:{
                },
                mutations: {
                    addToken:function(state,data){
                        state.tokensCreated.push(data);
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
                            var token={token:ev.returnValues.tokenAdr,creator:ev.returnValues.creator};
                            EventBus.$emit('newToken',token);
                            that.commit('tokensOperations/addToken',token);
                            that.commit('tokensOperations/updateBlock',ev.blockNumber);
                        })
                    },
                    createToken(state,data){
                        var method = contracts.exchange.methods.createToken(data.symbol,data.name,data.supply);
                        method.send({from:contracts.currentAccount});
                    }


                }
            };
        }

  export default tokensOperations;