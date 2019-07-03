
import EventBus from '../../components/common/eventBus'
var universe = function(contracts){
      
    return{
                state: {
                blockHeight: -1,
                mainTokenName: '',
                mainTokenSupply: '',
                latestAddress:'',
                latestBalance:''
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
                    },
                    setLatestBalance (state,val) {
                        state.latestBalance=val;
                    }
                },
                actions: {
                    readBlockchain(store){
                        contracts.web3.eth.getBlockNumber((e,r)=>{
                        store.commit('setBlockHeight',r);
                        })
                    },
                    async getMainTokenName(store){
                        var name = await contracts.mainToken.methods.name().call();
                        store.commit('setMainTokenName',name);
                    },
                    detectAddressUpdate(store){
                        setInterval(async ()=>{
                            var acc = await contracts.web3.eth.getAccounts();
                            if(store.state.latestAddress.toLowerCase()!==acc[0].toLowerCase()){
                                    EventBus.$emit('accountUpdate',store.state.latestAddress);
                                }
                        },200)

                    }

                }
            };
  };

  export default universe;