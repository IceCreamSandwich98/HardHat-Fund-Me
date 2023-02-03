const networkConfig = {
    //goerli chain
    5: {
        name: "goerli",
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    //polygon chain
    137: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    }
    //hardhat?
}

const devChains = ["hardhat", "localhost"]
const decimals = 8
const initialAnswer = 200000000000

//export so other scripts can work with this data

module.exports = { networkConfig, devChains, decimals, initialAnswer }
