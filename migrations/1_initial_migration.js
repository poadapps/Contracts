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
  result = await exchange.createToken("SKR","Adam Skrodzki - personal token",masterTokenTotalSupply);
  var masterToken = result.receipt.logs[0].args.tokenAdr;
  console.log('master Token address',masterToken);
  await exchange.setCreator(masterToken);
  await exchange.addToExchange(masterToken,
    masterTokenExchangeSupply,
    partsPer10000Collateral,
    priceOfMasterTokenInDAI,
    {value : collateralForExchange});
  result = await exchange.createToken("LAME","Lucek Mech - personal token",masterTokenTotalSupply);
  var anotherToken = result.receipt.logs[0].args.tokenAdr;
  await exchange.addToExchange(anotherToken,
    masterTokenExchangeSupply,
    partsPer10000Collateral,
    priceOfMasterTokenInDAI,
    {value : collateralForExchange});

/*
  
  var exchangeAddr = exchange.address;
  console.log('new ex',exchangeAddr);
  var result = await (await BaseERC20Token.at(tokenTemplate)).addMinter(exchangeAddr);
  result = await exchange.createToken("SKR","Adam Skrodzki - personal token",masterTokenTotalSupply);
  var masterToken = result.receipt.logs[0].args.tokenAdr;
  console.log('master Token address',masterToken);

  var acc0balance = await (await BaseERC20Token.at(masterToken)).balanceOf.call(accounts[0]);
  var exbalance = await (await BaseERC20Token.at(masterToken)).balanceOf.call(exchange.address);
  console.log(acc0balance.toString());
  console.log(exbalance.toString());
  console.log(masterTokenExchangeSupply.toString());

  await exchange.setCreator(masterToken);
  await exchange.addToExchange(masterToken,
    masterTokenExchangeSupply,
    partsPer10000Collateral,
    priceOfMasterTokenInDAI,
    {value : collateralForExchange});

   acc0balance = await (await BaseERC20Token.at(masterToken)).balanceOf.call(accounts[0]);
   exbalance = await (await BaseERC20Token.at(masterToken)).balanceOf.call(exchange.address);
  console.log(acc0balance.toString());
  console.log(exbalance.toString());

  var tokBal = await web3.eth.getBalance(accounts[0]);
  console.log('acc BalanceAfter',tokBal.toString());

  var result = await exchange.buy(masterToken,amountToBuy,{
    value:amountToBuy*2,
    from:accounts[1]
  });

  var tokBoughtEv = result.receipt.logs[0];
  var exchangeDetailsEv = result.receipt.logs[1];
  console.log('Buy Gas Price',result.receipt.gasUsed);
  console.log('Bought Amount',tokBoughtEv.args.amount.toString());
  console.log('Total Spent',tokBoughtEv.args.totalSpent.toString());
  console.log('Exchage Collateral Supply',exchangeDetailsEv.args.collateral_supply.toString());
  console.log('Exchage Token Supply',exchangeDetailsEv.args.token_supply.toString());

  result = await exchange.buy(masterToken,amountToBuy.toString()+"0",{
    value:amountToBuy*20,
    from:accounts[1]
  });

  var tokBoughtEv = result.receipt.logs[0];
  var exchangeDetailsEv = result.receipt.logs[1];
  console.log('Buy Gas Price',result.receipt.gasUsed);
  console.log('Bought Amount',tokBoughtEv.args.amount.toString());
  console.log('Total Spent',tokBoughtEv.args.totalSpent.toString());
  console.log('Exchage Collateral Supply',exchangeDetailsEv.args.collateral_supply.toString());
  console.log('Exchage Token Supply',exchangeDetailsEv.args.token_supply.toString());

  console.log('Selling slowly');
  for(var i=0;i<11;i++){
    result = await exchange.sell(masterToken,amountToBuy.toString(),{
      from:accounts[1]
    });

    console.log('Sell Gas Price',result.receipt.gasUsed);

    var tokBoughtEv = result.receipt.logs[0];
    var exchangeDetailsEv = result.receipt.logs[1];
    console.log('Sold Amount',tokBoughtEv.args.amount.toString());
    console.log('Total Gained',tokBoughtEv.args.totalSpent.toString());
    console.log('Exchage Collateral Supply',exchangeDetailsEv.args.collateral_supply.toString());
    console.log('Exchage Token Supply',exchangeDetailsEv.args.token_supply.toString());
  }


  var exBal = await web3.eth.getBalance(exchange.address);
  console.log('Ex BalanceAfter',exBal.toString());
  var totalFees = await exchange.totalFees.call();
  console.log('Ex Total Fees',totalFees.toString());
  
  var roundingErrors = ((exBal-exchangeDetailsEv.args.collateral_supply)-totalFees).toString();

  console.log('rounding errors',roundingErrors);
  result = await exchange.burnFees(totalFees*10/11);  
  var burnEvent = result.receipt.logs[2];
  console.log('burn Event Initial',burnEvent.args.initial_amount.toString());
  console.log('burn Event Burned',burnEvent.args.amount_burned.toString());
  console.log('burn Event Tokens Burned',burnEvent.args.tokens_amount_burned.toString());
  */
};