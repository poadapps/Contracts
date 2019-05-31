const Exchange = artifacts.require("Exchange");
const ethers = require('ethers');
const { BN, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');

contract('Exchange', function(accounts) {
  
  describe("setup", function(){
    it("should assert true", function() {
      var exchange = Exchange.deployed();
      assert.isTrue(true);
    });
  })
  describe("create Token", function(){
    var exchange ;
    var supply;
    beforeEach(async function(){
      exchange = await Exchange.deployed();
      supply = (new BN(10));
      supply = supply.pow(new BN(28));
    })
    it("should not fail when createToken is called",async function(){
      ({ logs: this.logs } = await exchange.createToken("TST","Test token",supply));
    });
    it("should emit NewToken(address) on CreateToken",async function(){
      ({ logs: this.logs } = await exchange.createToken("TST","Test token",supply));
      expectEvent.inLogs(this.logs, 'NewToken', {
      });
    })
  })

});
