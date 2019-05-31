const Migrations = artifacts.require("Migrations");
const Exchange = artifacts.require("Exchange");
const BaseERC20Token = artifacts.require("BaseERC20Token");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(Exchange);
  await deployer.deploy(BaseERC20Token);
};
