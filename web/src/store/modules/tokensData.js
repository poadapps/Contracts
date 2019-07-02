
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
                    addLiquidity(store,data){
                        var tokenAddress = data.token;
                        var collateralValue = data.xDaiToPay;
                        var method = contracts.exchange.methods.addLiquidity(tokenAddress);
                        method.send({from:contracts.currentAccount,
                        value:collateralValue});
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
                        });
                    },
                    getTokenExchangeInformation(store,tokenAddress){
                        var userXDAIBalanceInfo = contracts.web3;
                        var balanceInfo = contracts.getToken(tokenAddress).methods.balanceOf(contracts.currentAccount).call();
                        var exchangeDetails = contracts.exchange.methods.exchangeData(tokenAddress).call();
                        var contentHash = contracts.exchange.methods.createdTokens(tokenAddress).call().then((hash)=>{
                            return contracts.readContentByHash(hash);
                        });
                        var userExchangeDetails = contracts.exchange.methods.getTokensShare(tokenAddress,contracts.currentAccount).call();
                        Promise.all([balanceInfo,exchangeDetails,userExchangeDetails,contentHash]).then((r,e)=>{
                            if(e){
                                return;
                            }
                            var retVal = {
                                tokenBalance:r[0].toString(),
                                tokenCollateralisationRatio:r[1].collateral_parts_per_10000,
                                tokenTotalShares:r[1].total_shares.toString(),
                                collateralAmount:r[1].total_collateral.toString(),
                                tokensAmount:r[1].total_tokens.toString(),
                                usersShare:r[2].toString(),
                                description:r[3].toString()
                            };
                            store.commit('addShare',{
                                addr:tokenAddress,
                                content:retVal
                            })
                                
                            EventBus.$emit('shareUpdated',{
                                addr:tokenAddress,
                                token:retVal
                            });
                            }).catch((ex)=>{
                                console.error(ex);
                            });
                        }
                    }


                }
            };

  export default exchangeList;