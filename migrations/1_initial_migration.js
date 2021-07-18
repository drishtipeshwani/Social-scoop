var Migrations = artifacts.require("../src/contracts/Migrations.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
