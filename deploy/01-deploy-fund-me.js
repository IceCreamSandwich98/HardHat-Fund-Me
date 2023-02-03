const { networkConfig, devChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/Verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //get two vars from hre ppackage. could also call....
    //hre.getNamedAccounts
    //hre.deployments

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddy = networkConfig[chainId]["ethUsdPriceFeedAddress"]

    //if no contact exisits
    //deploy minimal version of it for local testing... a deploy script

    //if chainid = x use addy y
    //if chainid = a use addy b
    let ethUsdPriceFeedAddy

    //if on development chain
    if (devChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddy = ethUsdAggregator.address
    }
    //else
    else {
        ethUsdPriceFeedAddy = networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }

    //if network == local or hardhat, we want to use a mock to get real time data of eth price
    const args = [ethUsdPriceFeedAddy]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put global price feed
        /*address */
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        //verify that it made it sucessfully onto block chain, see utils folder
        //verify takes 2 args, contact address, and args
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------------")
}
module.exports.tags = ["all", "FundMe"]
