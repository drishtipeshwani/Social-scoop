var Socialscoop = artifacts.require("../src/contracts/Socialscoop.sol");

module.exports = function (deployer) {
  deployer.deploy(Socialscoop);
};
