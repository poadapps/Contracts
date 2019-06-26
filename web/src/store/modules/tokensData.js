
import EventBus from '../../components/common/eventBus'
var exchangeList = function(contracts){
      
    return{
                state: {
                    tokensShares:{}
                },
                getters:{
                    getShares : state => (addr)=>{
                        return state.tokensShares[addr];
                    }
                },
                mutations: {
                    addShare(state,p){
                        state.tokensShares[p.addr]=p.content;
                    }
                },
                actions: {
                    getTokenNameByAddress(store,addr){
                        return new Promise((res,rej)=>{
                        contracts.getToken(addr).methods.getBasicData.call()
                        .then((r)=>{
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
                    removeLiquidity(store,data){
                        var tokenAddress = data.token;
                        var amountToRedeem = data.sharesCount+"00000000000000" /* 10**18 to 10000 jednostek */;
                        var method = contracts.exchange.methods.removeLiquidity(tokenAddress,amountToRedeem);
                        method.send({from:contracts.currentAccount});
                    },
                    computedReturnedDeposit(store,data){
                        var tokenAddress = data.token;
                        var amountToRedeem = data.sharesCount+"00000000000000" /* 10**18 to 10000 jednostek */;
                        var sharesInfo = contracts.exchange.methods.computeReturnAmount(tokenAddress,amountToRedeem).call().then((data)=>{
                            EventBus.$emit('shareAmountsComputed',
                            {
                                tokensAmount : data.tokensAmount.toString(),
                                daiAmount : data.daiAmount.toString()
                            });
                            console.log('shares',data);
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
                                store.commit('addShare',{
                                    addr:tokenAddress,
                                    content:retVal
                                })
                                
                                EventBus.$emit('shareUpdated',{
                                  addr:tokenAddress,
                                  token:retVal
                                });
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