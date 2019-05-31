const Migrations = artifacts.require("Migrations");
const Exchange = artifacts.require("Exchange");
const BaseERC20Token = artifacts.require("BaseERC20Token");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(BaseERC20Token);
  var tokAddress = (await BaseERC20Token.deployed()).address;
  await deployer.deploy(Exchange,tokAddress);
  var exchangeAddr = (await Exchange.deployed()).address;
  console.log('new ex',exchangeAddr);
  var result = await (await BaseERC20Token.at(tokAddress)).addMinter(exchangeAddr);
};
