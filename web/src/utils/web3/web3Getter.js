import Web3 from 'web3';

var web3Promise = new Promise((res,rej)=>{
  if (window.ethereum) {
    var web3 = new Web3(ethereum);
    try {
      var ret = ethereum.enable();
      ret.then(()=>{
        res(web3); 
      }).catch((err)=>{
        rej(err);
      })
    } catch (error) {
      rej(error);
    }
  } else if (window.web3) { // Legacy dapp browsers...
    var web3 = new Web3(web3.currentProvider);
    res(web3);
  } else { // Non-dapp browsers...
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
})
export default web3Promise; 