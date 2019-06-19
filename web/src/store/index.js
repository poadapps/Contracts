
  const store = function(contracts){
      
    return{
                state: {
                blockHeight: -1,
                latestScannedBlock: 0,
                mainTokenName: '',
                mainTokenSupply: '',
                ListedTokensCount:0,
                ListedTokens:[]
                },
                mutations: {
                setBlockHeight (state,val) {
                    state.blockHeight=val;
                },
                setLatestScannedBlock (state,val) {
                    if(val>state.latestScannedBlock)
                    state.latestScannedBlock=val;
                },
                setMainTokenName (state,val) {
                    state.mainTokenName=val;
                },
                initTokensList(state,list){
                    state.ListedTokens = list;
                },
                addListedToken(state,token){
                    token.id = state.ListedTokens.length+1;
                    state.ListedTokens.push(token);
                }
                },
                actions: {
                readBlockchain(store){
                    contracts.web3.eth.getBlockNumber((e,r)=>{
                    store.commit('setBlockHeight',r);
                    })
                },
                getTokenNameByAddress(store,addr){
                    return new Promise((res,rej)=>{
                    contracts.getToken(addr).methods.name.call().then((r)=>{
                        res(r);
                    }).catch((err)=>{
                        rej(err);
                    });
                    });
                },

                getTokenName(store){
                    contracts.mainToken.methods.name().call().then((r)=>{
                    store.commit('setMainTokenName',r);
                    })

                },
                sendDummyTx(store){
                    contracts.web3.eth.sendTransaction({value:0,to:web3.eth.accounts[0]},()=>{
                    store.dispatch('readBlockchain');
                    })
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
  }

  export default store;