
import EventBus from '../../components/common/eventBus'


var exchangeList = function(contracts){
    var getByAddress = (that,filterAddress)=>{
        return that.getters['exchangeList/getTokenByAddress'](filterAddress);
    }
    return{
                state: {
                latestScannedBlock: 0,
                ListedTokens:[],
                ListedTokensMap:{},
                },
                getters:{
                    getTokenByAddress : state => (addr)=>{
                        return state.ListedTokens[state.ListedTokensMap[addr]];
                    }
                },
                mutations: {
                    setLatestScannedBlock (state,val) {
                        if(val>state.latestScannedBlock)
                        state.latestScannedBlock=val;
                    },
                    addListedToken(state,token){
                        token.id = state.ListedTokens.length+1;
                        state.ListedTokens.push(token);
                        state.ListedTokensMap[token.address]=token.id-1;
                    },
                    updatePrice(state,data){
                        if(getByAddress(this,data.addr).latestUpdate<data.blockNumber){
                            getByAddress(this,data.addr).price=data.newPrice.toString();
                            getByAddress(this,data.addr).latestUpdate=data.blockNumber;
                        }
                    }
                },
                actions: {
                    getTokenListFromLocalStorage(store){
                        return new Promise((res,rej)=>{
                        try{
                            var list = JSON.parse(localStorage.getItem('tokensList'));
                            if(list && list.tokens && list.exchangeAddress == contracts.exchange.address){
                                for(var i=0;i<list.tokens.length;i++){
                                    store.commit('addListedToken',list.tokens[i]);
                                    store.dispatch('updatePrices',list.tokens[i].address);
                                }
                                store.commit('setLatestScannedBlock',list.latestBlock);
                            }
                            res(true);
                        }catch(ex){
                            rej(ex);
                        }
                        })
                    },
                    persistTokenListInLocalStorage(store){
                        setInterval(()=>{
                        var list = JSON.parse(localStorage.getItem('tokensList'));
                        if(!list || list.latestBlock<store.state.latestScannedBlock){
                            localStorage.setItem('tokensList', 
                            JSON.stringify({
                                tokens:store.state.ListedTokens,
                                latestBlock:store.state.latestScannedBlock,
                                exchangeAddress:contracts.exchange.address
                            }))
                        }
                        },1000);
                    },
                    updatePrices(store,filterAddress){
                        var token =  getByAddress(this,filterAddress);
                        contracts.exchange.events.ExchangeDetails({
                            fromBlock:token.latestUpdate,
                            toBlock: 'latest'
                        },(err,ev)=>{
                            if(err==false){
                                store.commit('updatePrice',{
                                    addr:ev.returnValues.token,
                                    newPrice:ev.returnValues.buyPrice,
                                    blockNumber:ev.blockNumber
                                })
                            }
                            else{
                                console.log('Event error',ev)
                            }
                        })
                    },
                    trackExchangeDetailsChange(store,trackFrom){
                        contracts.exchange.events.ExchangeDetails({
                            fromBlock:trackFrom,
                            toBlock: 'latest'
                        },(err,ev)=>{
                            EventBus.$emit('exchangeChanged',{token:ev.returnValues.token,details:ev});
                            console.log('new event exchangeChanged',ev);
                        })
                    },
                    getTokenListFromBlockchain(store){
                        contracts.exchange.events.NewExchange({
                        fromBlock: store.state.latestScannedBlock+1,
                        toBlock: 'latest'
                        },(err,ev)=>{
                            if(err==false){
                                store.dispatch('tokensInfo/getTokenNameByAddress',ev.returnValues.token, {root:true}).then((data)=>{
                                    var data = {
                                        name:'Token '+data.fullName,
                                        abbrev:data.abbrev,
                                        tokSupply:data.tokSupply,
                                        address:ev.returnValues.token,
                                        price:ev.returnValues.buyPrice.toString(),
                                        latestUpdate:ev.blockNumber
                                    };
                                    store.commit('addListedToken',data)
                                    store.commit('setLatestScannedBlock',ev.blockNumber)

                                    store.dispatch('updatePrices',ev.returnValues.token);
                                });
                            }
                            else{
                                console.log('Event error',ev)
                            }
                        })
                    }


                }
            };
  };

  export default exchangeList;