import getWeb3 from './getWeb3'
import * as exchange from "../../../../build/contracts/Exchange.json";
import * as erc20 from "../../../../build/contracts/BaseERC20Token.json";
import { get } from 'http';
import EventBus from '../../components/common/eventBus'


var contracts = new Promise((res,rej)=>{

    const IPFS = require('ipfs')
    const OrbitDB = require('orbit-db')
    const ipfsOptions = {
      EXPERIMENTAL: {
        pubsub: true
      }
    }
    
        
    var cntrct = {
        exchange:undefined,
        mainToken:undefined,
        web3:undefined,
        getToken:undefined,
        writeContent:undefined,
        readContentByHash:undefined,
        currentAccount:undefined,
        currentBalance:undefined,
        networkId:undefined
    }

    const dbConfig = {
        // If database doesn't exist, create it
        create: true,
        // Don't wait to load from the network
        sync: false,
        // Load only the local version of the database
        localOnly: true,
        // Allow anyone to write to the database,
        // otherwise only the creator of the database can write
        admin: ['*'],
        write: ['*'],
      }

    const ipfs = new IPFS(ipfsOptions)
    ipfs.on('ready', () => {
      const orbitdb = new OrbitDB(ipfs);
      orbitdb.feed('my-tokens',dbConfig).then((db)=>{

        cntrct.writeContent = function(content){
            return new Promise((res,rej)=>{
                return db.add(content).then((x)=>{
                    console.log('data stored to OrbitDB, data=',content,' hash=',x);
                    res(x);
                }).catch((err)=>{
                    res(err);
                })
            });
        }
    
        cntrct.readContentByHash = function(hash){
            return new Promise((res,rej)=>{
                if(hash.startsWith("0x")){
                    hash=hash.substr(2);
                }
                db.get(hash).map((e) => {
                    console.log('data fetched from OrbitDB, data=',e.payload.value,' hash=',hash);
                    res(e.payload.value);
                    
                }).catch((err)=>{
                    res(err);
                })
            });
        }
      })

    })

    try{

        getWeb3.then((w3)=>{
            cntrct.web3 = w3.web3;
            w3.web3.eth.net.getId().then((id)=>{
                var networkDataOfExchange = exchange.networks[id];
                var abi1 = exchange.abi;
                var networkDataOfERC20 = erc20.networks[id];
                var abi2 = erc20.abi;
                cntrct.networkId = id;
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
                    web3.eth.getBalance(cntrct.currentAccount,(e,r)=>{
                        cntrct.currentBalance = r.toString();


                        cntrct.exchange.methods.exchangeCreatorToken().call().then((ard)=>{

                            cntrct.mainToken=cntrct.web3.eth.Contract(
                                abi2,
                                ard,
                            );
                            res(cntrct);
                        });
                    });
                })
            })
        })
    }catch(ex){
        rej(ex);
    }
})

export default contracts
