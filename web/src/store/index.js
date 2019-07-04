
import universeFactory from './modules/universe'
import exchangeListFactory from './modules/exchangeList'
import buySellFactory from './modules/buySell'
import tokensDataFactory from './modules/tokensData'
import tokensOperationsFactory from './modules/tokenOperations'
import web3Op from '../mixins/web3Op'

  const store = function(contracts){
      
    var web3Mixin = web3Op(contracts.web3);
    var univData =universeFactory(contracts,web3Mixin);
    var exchangeListData =exchangeListFactory(contracts,web3Mixin);
    var buySellData =buySellFactory(contracts,web3Mixin);
    var tokensData = tokensDataFactory(contracts,web3Mixin);
    var tokensOperations = tokensOperationsFactory(contracts,web3Mixin);
    univData.namespaced = true;
    exchangeListData.namespaced = true;
    tokensData.namespaced = true;
    buySellData.namespaced = true;
    tokensOperations.namespaced = true;
    return{
            universe:univData,
            exchangeList:exchangeListData,
            buySell:buySellData,
            tokensInfo:tokensData,
            tokensOperations:tokensOperations
    };

  }

  export default store;