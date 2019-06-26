var buySell = function(contracts){
      
    return{
                actions: {
                    getBuyPrice(store,data){
                        return  contracts.exchange.methods.getBuyPrice(data.addr,data.amount).call();
                    },
                    getSellPrice(store,data){
                        return  contracts.exchange.methods.getSellPrice(data.addr,data.amount).call();
                    },
                    buyTokens(store,data){
                        var address = data.addr;
                        var amount = data.amount;
                        return new Promise((res,rej)=>{
                            store.dispatch('getBuyPrice',data).then((price)=>{
                                price = price.mul(105);
                                price = price.div(100);
                                var total = price;
                                var method = contracts.exchange.methods.buy(address,amount);
                                method.send({value:total.toString(),from:contracts.currentAccount});
                                res(true);
                            });
                        })
                    },
                    sellTokens(store,data){
                        var address = data.addr;
                        var amount = data.amount;
                        return new Promise((res,rej)=>{
                            store.dispatch('getSellPrice',data).then((price)=>{
                                var total = price;
                                var method = contracts.exchange.methods.sell(address,amount);
                                method.send({from:contracts.currentAccount});
                                res(true);
                            });
                        })
                    }
                }
            }
  };

  export default buySell;