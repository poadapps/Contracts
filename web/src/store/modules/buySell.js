var buySell = function(contracts,mixins){
      
    return{
                actions: {
                    getBuyPrice(store,data){
                        return  contracts.exchange.methods.getBuyPrice(data.addr,data.amount).call();
                    },
                    isTradeAllowed(store,data){
                        return  contracts.exchange.methods.isTradeAllowed(data.addr,data.amount).call();
                    },
                    getSellPrice(store,data){
                        return  contracts.exchange.methods.getSellPrice(data.addr,data.amount).call();
                    },
                    async buyTokens(store,data){
                        var address = data.addr;
                        var amount = data.amount;
                        var price = await store.dispatch('getBuyPrice',data);
                        price = price.mul(105);
                        price = price.div(100);
                        var total = price;
                        var method = contracts.exchange.methods.buy(address,amount);
                        await method.send({value:total.toString(),from:contracts.currentAccount});
                        return true;
                    },
                    async sellTokens(store,data){
                        var address = data.addr;
                        var amount = data.amount;
                        var price = await store.dispatch('getBuyPrice',data);
                        var total = price;
                        var method = contracts.exchange.methods.sell(address,amount);
                        await method.send({from:contracts.currentAccount});
                        return true;
                    }
                }
            }
  };

  export default buySell;