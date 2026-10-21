const AirQuality = artifacts.require("AirQuality");

module.exports = function (deployer) {
    const pricePerCreditInWei = web3.utils.toWei("0.1", "ether");
    deployer.deploy(AirQuality, pricePerCreditInWei);
};
