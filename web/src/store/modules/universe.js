
import EventBus from '../../components/common/eventBus'
var universe = function(contracts){
      
    return{
                state: {
                blockHeight: -1,
                mainTokenName: '',
                mainTokenSupply: '',
                latestAddress:''
                },
                mutations: {
                    setBlockHeight (state,val) {
                        state.blockHeight=val;
                    },
                    setMainTokenName (state,val) {
                        state.mainTokenName=val;
                    },
                    setLatestAddress (state,val) {
                        state.latestAddress=val;
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
                    detectAddressUpdate(store){
                        setInterval(()=>{
                            contracts.web3.eth.getAccounts().then((r)=>{
                                if(store.state.latestAddress.toLowerCase()!==r[0].toLowerCase()){
                                    EventBus.$emit('accountUpdate',store.state.latestAddress);
                                }
                            });
                        },200)

                    }

                }
            };
  };

  export default universe;