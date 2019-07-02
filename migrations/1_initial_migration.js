const Migrations = artifacts.require("Migrations");
const Exchange = artifacts.require("Exchange");
const BaseERC20Token = artifacts.require("BaseERC20Token");

module.exports = async function(deployer,network,accounts) {
  var masterTokenTotalSupply = web3.utils.toWei("1000000",'ether');
  var masterTokenExchangeSupply = web3.utils.toWei("4800",'ether');
  var collateralForExchange = web3.utils.toWei("48",'ether');
  var priceOfMasterTokenInDAI = web3.utils.toWei("1",'ether');
  var amountToBuy = web3.utils.toWei("1",'ether');
  var partsPer10000Collateral = "100";
  await deployer.deploy(Migrations);
  await deployer.deploy(BaseERC20Token);
  var tokenTemplate = (await BaseERC20Token.deployed()).address;
  await deployer.deploy(Exchange,tokenTemplate);
  var exchange = (await Exchange.deployed());
  var exchangeAddr = exchange.address;
  console.log('new ex',exchangeAddr);
  var result = await (await BaseERC20Token.at(tokenTemplate)).addMinter(exchangeAddr);
  result = await exchange.createToken("SKR","Adam Skrodzki - personal token",masterTokenTotalSupply,
  "0x60e97ac24d89dd633f7306981e773e98c0c7ff529ed0c65bd3121b7f01373b29");
  var masterToken = result.receipt.logs[0].args.tokenAdr;
  console.log('master Token address',masterToken);
  await exchange.setCreator(masterToken);
  await exchange.addToExchange(masterToken,
    masterTokenExchangeSupply,
    partsPer10000Collateral,
    priceOfMasterTokenInDAI,
    {value : collateralForExchange});
  result = await exchange.createToken("LAME","Lucek Mech - personal token",masterTokenTotalSupply,
  "0x60e97ac24d89dd633f7306981e773e98c0c7ff529ed0c65bd3121b7f01373b29");
  var anotherToken = result.receipt.logs[0].args.tokenAdr;
  var lucekTx = await exchange.addToExchange(anotherToken,
    masterTokenExchangeSupply,
    partsPer10000Collateral,
    priceOfMasterTokenInDAI,
    {value : collateralForExchange});

};