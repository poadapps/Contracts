const Exchange = artifacts.require("Exchange");
const BaseERC20Token = artifacts.require("BaseERC20Token");
const { BN, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');

contract('Exchange', function(accounts) {
  
  describe("setup", function(){
    it("should assert true", function() {
      var exchange = Exchange.deployed();
      assert.isTrue(true);
    });
  })
  describe("createToken", function(){
    var exchange ;
    var supply;
    var event;
    beforeEach(async function(){
      exchange = await Exchange.deployed();
      supply = (new BN(10));
      supply = supply.pow(new BN(26));
      supply = supply.mul(new BN(123));
      var result = await exchange.createToken("TST","Test token",supply);
      
      ({ logs: this.logs,
         rewLogs: this.rawLogs,
         receipt: this.receipt} = result);
    })
    it("should not fail",async function(){
    });
    it("should emit NewToken(address)",async function(){
      event = expectEvent.inLogs(this.logs, 'NewToken', {
      });
    })
    it("should emit Transfer(address)",async function(){
      var abi = BaseERC20Token.abi;
      var abi = abi.filter(x=>x.type=="event" && x.name=="Transfer");
      var transferEvents = this.receipt.rawLogs.map((x)=>{
        try{
          return web3.eth.abi.decodeLog(abi[0].inputs,x.data,x.topics);
          
        }catch(ex){
          return undefined;
        }
      }).filter(x=>x!=undefined);
      assert.equal(transferEvents.length,1);
    })
    it("NewToken(address) should have non zero address",async function(){
      event = expectEvent.inLogs(this.logs, 'NewToken', {
      });
      assert.isTrue(event.args.tokenAdr.startsWith("0x00000")==false);
    })

    describe("created proxy", function(){
      var tokenByProxy;
      beforeEach(async function(){
        tokenByProxy = await BaseERC20Token.at(event.args.tokenAdr);
      })
      it("should have name 'Test token'",async function(){
        var name = (await tokenByProxy.name.call()).toString();
        assert.equal(name,'Test token');
      });
    })
  })

});
