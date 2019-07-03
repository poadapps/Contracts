import web3Promise from './web3Getter'

let getWeb3 = new Promise(function (resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function () {
    
    web3Promise.then((w3)=>{
      w3.eth.net.isListening()
        .then((isListening => {
          resolve({
            hasInjectedWeb3: isListening,
            web3:w3
          })
        }))
        .catch(error => {
          console.error('Unable to check if connected: ' + error)
        })
    }).catch((err)=>{
      /* eslint-disable-next-line */
      reject({
        result: null,
        inErr:err,
        err: 'Unable to connect to Web3'
      })
    });
  })
});

export default getWeb3
