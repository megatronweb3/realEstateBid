var RealEstateBid = artifacts.require("./RealEstateBid.sol");

module.exports = function(deployer) {
  deployer.deploy(RealEstateBid, "0x3135536c468e7FA44a93354900b9e57d2DB7FFd8", "45 MyStreet, Toronto, Canada", 100000);
};
