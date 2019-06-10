const Exchange = artifacts.require("Exchange");
const BaseERC20Token = artifacts.require("BaseERC20Token");
const { BN, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');

contract('Exchange', function(accounts) {
  var exchange = undefined;
  var supply = undefined;
  var tokenAddress = undefined;
  var token = undefined;

  beforeEach(async function(){
    exchange = await Exchange.deployed();
    supply = (new BN(10));
    supply = supply.pow(new BN(26));
    supply = supply.mul(new BN(123));
    var result = await exchange.createToken("TST","Test token",supply);
    
    ({ logs: this.logs,
       rawLogs: this.rawLogs,
       receipt: this.receipt} = result);
    
    event = expectEvent.inLogs(this.logs, 'NewToken', {});
    tokenAddress = event.args.tokenAdr;
    token = await BaseERC20Token.at(tokenAddress);
  })
  
  describe("addToExchange", function(){
    var res ;
    var initialLegalTokensCount = 0; 
    var initialSupply = 0;
    var initialEthSupply = 0;
    var amountToAdd = (new BN(10)).pow(new BN(20));
    var initialPrice = (new BN(10)).pow(new BN(18));
    beforeEach(async function(){
      var collateralIn10000 = "200";
      initialSupply = await token.balanceOf.call(exchange.address);
      initialEthSupply = await web3.eth.getBalance(exchange.address);
      initialLegalTokensCount = await exchange.getLegalTokensCount.call();
       res = await exchange.addToExchange(token.address,amountToAdd,collateralIn10000,initialPrice,{value:web3.utils.toWei("3",'ether')} );
      ({ logs: this.logs,
         rawLogs: this.rawLogs,
         receipt: this.receipt} = res);
        
    })
    it('should not failed while called',async function(){
      
    })
    it('should register nwe exchange',async function(){
      var data = await exchange.exchangeData.call(token.address);
      assert.equal(data.total_collateral,web3.utils.toWei("2",'ether'));
      assert.equal(data.total_shares,web3.utils.toWei("1",'ether'));
      assert.equal(data.total_tokens,web3.utils.toWei("100",'ether'));
    })
    it('should increase number of registered tokens by one',async function(){
      var newLegalTokensCount = await exchange.getLegalTokensCount.call();
      assert.equal(newLegalTokensCount.toNumber(),initialLegalTokensCount.toNumber()+1);
    })
    it('should increase exchange tokens balance by registered amount',async function(){
      var supplyAfter = await token.balanceOf.call(exchange.address);
      assert.equal(initialSupply.add(amountToAdd).toString(),supplyAfter.toString());

    })
    it('should increase eth balance by total_collateral',async function(){
      var data = await exchange.exchangeData.call(token.address);
      var ethSupply = await web3.eth.getBalance(exchange.address);
      console.log(ethSupply);
      assert.equal(new BN(initialEthSupply).add(data.total_collateral).toString(),new BN(ethSupply).toString());

    })
  });
});
