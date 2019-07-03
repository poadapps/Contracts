import getWeb3 from './getWeb3'
import * as exchange from "../../../../build/contracts/Exchange.json";
import * as erc20 from "../../../../build/contracts/BaseERC20Token.json";
import { get } from 'http';
import EventBus from '../../components/common/eventBus'
//import * as OrbitDB from 'orbit-db';

//const OrbitDB = require('orbit-db')

var contracts = new Promise(async (res,rej)=>{
        
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
    const ipfsOptions = {
        EXPERIMENTAL: {
          pubsub: true
        }
      }

    const ipfs = new Ipfs(ipfsOptions)

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
      ipfs.on('ready',async () => {
        console.log('Ipfs works!')
        const orbitdb = await OrbitDB.createInstance(ipfs);
        orbitdb.feed('my-tokens',dbConfig).then((db)=>{
            console.log('OrbitDB works!')
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
                    console.log('trying reading from OrbitDB, hash=',hash);
                    if(hash.startsWith("0x")){
                        hash=hash.substr(2);
                    }
                    var events = db.get(hash);
                    var data = undefined;
                    if(events){
                        console.log('OrbitDB events not null',events);
                        data = events.map((e) => e.payload.value);
                        console.log('data',data);
                    }
                    
                    res("ffffffoooooooooo")
                });
            }
        })


  
      })
/*
    const IPFS = require('ipfs')
    const OrbitDB = require('orbit-db')
    

    */

    try{
        var w3 = await getWeb3;
        cntrct.web3 = w3.web3;
        var id = await w3.web3.eth.net.getId();
        console.log('network Id=',id);
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
                
        web3.eth.getAccounts(function(e,...[curretAcc]){
            cntrct.currentAccount = curretAcc[0];
            web3.eth.getBalance(cntrct.currentAccount,async (e,r)=>{
                cntrct.currentBalance = r.toString();
                var mainAddr = await cntrct.exchange.methods.exchangeCreatorToken().call();
                cntrct.mainToken=cntrct.web3.eth.Contract(
                    abi2,
                    mainAddr);
                res(cntrct);
            });
        })
    }catch(ex){
        rej(ex);
    }
})

export default contracts
