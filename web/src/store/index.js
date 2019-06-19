
import universeFactory from './modules/universe'
import exchangeListFactory from './modules/exchangeList'

  const store = function(contracts){
      
    var univData =universeFactory(contracts);
    var exchangeListData =exchangeListFactory(contracts);
    univData.namespaced = true;
    exchangeListData.namespaced = true;
    return{
            universe:univData,
            exchangeList:exchangeListData
    };

  }

  export default store;