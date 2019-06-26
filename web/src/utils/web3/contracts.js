import getWeb3 from './getWeb3'
import * as exchange from "../../../../build/contracts/Exchange.json";
import * as erc20 from "../../../../build/contracts/BaseERC20Token.json";
import { get } from 'http';
import EventBus from '../../components/common/eventBus'


var contracts = new Promise((res,rej)=>{
    var cntrct = {
        exchange:undefined,
        mainToken:undefined,
        web3:undefined,
        getToken:undefined,
        currentAccount:undefined,
    }
    try{

        getWeb3.then((w3)=>{
            cntrct.web3 = w3.web3;
            w3.web3.eth.net.getId().then((id)=>{
                var networkDataOfExchange = exchange.networks[id];
                var abi1 = exchange.abi;
                var networkDataOfERC20 = erc20.networks[id];
                var abi2 = erc20.abi;
                cntrct.getToken = function(adr){
                    return cntrct.web3.eth.Contract(
                        abi2,
                        adr,
                    );
                }
                cntrct.exchange=cntrct.web3.eth.Contract(
                    abi1,
                    networkDataOfExchange.address,
                );
                web3.eth.getAccounts(function(e,data){
                    cntrct.currentAccount = data[0];
                })

                cntrct.exchange.methods.exchangeCreatorToken().call().then((ard)=>{

                    cntrct.mainToken=cntrct.web3.eth.Contract(
                        abi2,
                        ard,
                    );
                    res(cntrct);
                });
            })
        })
    }catch(ex){
        rej(ex);
    }
})

export default contracts