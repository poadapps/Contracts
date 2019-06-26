
import universeFactory from './modules/universe'
import exchangeListFactory from './modules/exchangeList'
import buySellFactory from './modules/buySell'
import tokensDataFactory from './modules/tokensData'

  const store = function(contracts){
      
    var univData =universeFactory(contracts);
    var exchangeListData =exchangeListFactory(contracts);
    var buySellData =buySellFactory(contracts);
    var tokensData = tokensDataFactory(contracts);
    univData.namespaced = true;
    exchangeListData.namespaced = true;
    tokensData.namespaced = true;
    buySellData.namespaced = true;
    return{
            universe:univData,
            exchangeList:exchangeListData,
            buySell:buySellData,
            tokensInfo:tokensData
    };

  }

  export default store;