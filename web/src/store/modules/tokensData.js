var exchangeList = function(contracts){
      
    return{
                state: {
                },
                mutations: {
                },
                actions: {
                    getTokenNameByAddress(store,addr){
                        return new Promise((res,rej)=>{
                        contracts.getToken(addr).methods.getBasicData.call()
                        .then((r)=>{
                            console.log('get token getBasicData',r);
                            res(
                                {   fullName:r.fullName,
                                    abbrev:r.abbrev,
                                    tokSupply:r.tokSupply.toString()
                                });
                            }).catch((err)=>{
                                rej(err);
                            });
                        });
                    },
                    getTokenExchangeInformation(store,tokenAddress){
                        return new Promise((res,rej)=>{
                            var balanceInfo = contracts.getToken(tokenAddress).methods.balanceOf(contracts.currentAccount).call();
                            var exchangeDetails = contracts.exchange.methods.exchangeData(tokenAddress).call();
                            var userExchangeDetails = contracts.exchange.methods.getTokensShare(tokenAddress,contracts.currentAccount).call();
                            Promise.all([balanceInfo,exchangeDetails,userExchangeDetails]).then((r,e)=>{
                                if(e){
                                    rej(e);
                                }
                                var retVal = {
                                    tokenBalance:r[0].toString(),
                                    tokenCollateralisationRatio:r[1].collateral_parts_per_10000,
                                    tokenTotalShares:r[1].total_shares.toString(),
                                    collateralAmount:r[1].total_collateral.toString(),
                                    tokensAmount:r[1].total_tokens.toString(),
                                    usersShare:r[2].toString()
                                };
                                res(retVal);

                            }).catch((ex)=>{
                                rej(ex);
                            })
                        })
                    }


                }
            };
  };

  export default exchangeList;