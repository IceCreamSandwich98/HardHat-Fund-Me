const { network } = require("hardhat")
const {
    devChains,
    initialAnswer,
    decimals
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (devChains.includes(network.name)) {
        log("Local network detected! deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [decimals, initialAnswer] //takes _decimal, and _initial answer, delcare in helper -hardhat-config
        })
        log("mocks deployed!")
        log("-------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
