var exchangeList = function(contracts){
      
    return{
                state: {
                latestScannedBlock: 0,
                ListedTokensCount:0,
                ListedTokens:[],
                ListedTokensMap:{},
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
                    updatePrice(state,addr,newPrice){
                        state.ListedTokens[state.ListedTokensMap[addr]]=newPrice;
                    }
                },
                actions: {
                    getTokenNameByAddress(store,addr){
                        return new Promise((res,rej)=>{
                        contracts.getToken(addr).methods.name.call().then((r)=>{
                            res(r);
                        }).catch((err)=>{
                            rej(err);
                        });
                        });
                    },
                    getTokenListFromLocalStorage(store){
                        return new Promise((res,rej)=>{
                        try{
                            var list = JSON.parse(localStorage.getItem('tokensList'));
                            if(list && list.tokens){
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
                                latestBlock:store.state.latestScannedBlock
                            }))
                        }
                        },1000);
                    },

                    getTokenListFromBlockchain(store){

                        contracts.exchange.events.NewExchange({
                        fromBlock: store.state.latestScannedBlock+1,
                        toBlock: 'latest'
                        },(err,ev)=>{
                        if(err==false){
                            store.dispatch('getTokenNameByAddress',ev.returnValues.token).then((tName)=>{
                            var data = {
                                name:'Token '+tName,
                                address:ev.returnValues.token,
                                price:(ev.returnValues.buyPrice.toString())
                            };
                            store.commit('addListedToken',data)
                            store.commit('setLatestScannedBlock',ev.blockNumber)
                            console.log('NewExchange',ev);
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