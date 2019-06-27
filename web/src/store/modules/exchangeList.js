
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
                        if(state.ListedTokensMap[token.address]==undefined){

                            token.id = state.ListedTokens.length+1;
                            state.ListedTokens.push(token);
                            state.ListedTokensMap[token.address]=token.id-1;
                            EventBus.$emit('newTokenExchange',token.address);
                        }
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
                    trackExchangeDetailsChange(store,trackFrom){
                        contracts.exchange.events.ExchangeDetails({
                            fromBlock:store.state.latestScannedBlock+1,
                            toBlock: 'latest'
                        },(err,ev)=>{
                            if(getByAddress(this,ev.returnValues.token)){
                                EventBus.$emit('exchangeChanged',{token:ev.returnValues.token,details:ev});
                            }
                            else{
                                EventBus.$on('newTokenExchange',function(addr){
                                    if(addr === ev.returnValues.token){
                                        EventBus.$emit('exchangeChanged',{token:ev.returnValues.token,details:ev});
                                    }
                                })
                            }
                        })
                    },
                    getTokenListFromBlockchain(store){
                        contracts.exchange.events.NewExchange({
                        fromBlock: 0,
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
                                });
                            }
                            else{
                                console.log('Event error',err)
                            }
                        })
                    }


                }
            };
  };

  export default exchangeList;