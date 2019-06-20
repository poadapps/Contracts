var universe = function(contracts){
      
    return{
                state: {
                blockHeight: -1,
                mainTokenName: '',
                mainTokenSupply: '',
                },
                mutations: {
                    setBlockHeight (state,val) {
                        state.blockHeight=val;
                    },
                    setMainTokenName (state,val) {
                        state.mainTokenName=val;
                    }
                },
                actions: {
                    readBlockchain(store){
                        contracts.web3.eth.getBlockNumber((e,r)=>{
                        store.commit('setBlockHeight',r);
                        })
                    },
                    getMainTokenName(store){
                        contracts.mainToken.methods.name().call().then((r)=>{
                        store.commit('setMainTokenName',r);
                        })

                    },
                    sendDummyTx(store){
                        contracts.web3.eth.sendTransaction(
                            {
                                value:0,
                                to:contracts.currentAccount,
                                from:contracts.currentAccount
                            },()=>{
                        store.dispatch('readBlockchain');
                        })
                    }

                }
            };
  };

  export default universe;