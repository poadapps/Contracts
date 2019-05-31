const BaseERC20Token = artifacts.require("BaseERC20Token");
const ethers = require('ethers');

contract('BaseERC20Token', function(accounts) {
  it("should assert true", async function() {
    var baseERC20_token = await BaseERC20Token.deployed();
    assert.isTrue(true);
  });
});
