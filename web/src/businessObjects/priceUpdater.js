

import EventBus from '../components/common/eventBus'
var priceUpdater = function(store){
      
    EventBus.$on('exchangeChanged',function(data){
        store.commit("exchangeList/updatePrice",{
            
            addr:data.details.returnValues.token,
            newPrice:data.details.returnValues.buyPrice,
            blockNumber:data.details.blockNumber
        })
        store.dispatch("tokensInfo/getTokenExchangeInformation",data.details.returnValues.token);
    })
}

export default priceUpdater;