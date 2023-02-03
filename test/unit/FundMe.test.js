const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let FundMe
          let deployer
          let MockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") //1 eth
          beforeEach(async function() {
              //deploy fund me contract
              //using hardhat deploy so mocksare included
              // const accounts = await ethers.getSigners()
              // const accountOne = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              FundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function() {
              it("sets the aggrgator address correctly depending on chain", async function() {
                  const response = await FundMe.getPriceFeed()
                  assert.equal(response, MockV3Aggregator.address)
              })
          })

          describe("fund", async function() {
              it("fails if not enough eth is sent", async function() {
                  await expect(FundMe.fund()).to.be.reverted
              })
              it("updates the amount funded data structure", async function() {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds getFunder to array of getFunder", async function() {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })

          describe("Withdraw", async function() {
              beforeEach(async function() {
                  //itiialize fund so we have eth to withdawl
                  await FundMe.fund({ value: sendValue })
              })

              it("withdrawl eth from one person ", async function() {
                  //how to set up test, this is defined because this will be a long test
                  //arrange
                  //act
                  //assert

                  //arrange
                  const startingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const startingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )

                  //act

                  const transactionResponse = await FundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  //use js debug terminal to find vars holding amount of gas used and price of gas
                  const { gasUsed, effectiveGasPrice } = transactionRecipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )

                  //assert

                  assert.equal(endingFundMeBalance, 0)
                  //we use add below because since we are reading off a blockchain, the number will be in 1 * 10 **18. large number. bigNumber method of ethers
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      //account for gas cost
                      endingDeployerBalance.add(totalGasCost).toString()
                  )
              })
              it("Allows us to withdrawl with multiple funder", async function() {
                  //populate accounts
                  const accounts = await ethers.getSigners()
                  //the first index of the account is the deployer, so we start with the second index (1)
                  for (let i = 1; i < 6; i++) {
                      //replace "deployer" which is initialized in FundMe on line 16, with account[i]. So new object account[i] is calling the FundMe isntead of deployer, which is accounts[0]
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const startingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await FundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  //use js debug terminal to find vars holding amount of gas used and price of gas
                  const { gasUsed, effectiveGasPrice } = transactionRecipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )

                  //assert

                  assert.equal(endingFundMeBalance, 0)
                  //we use add below because since we are reading off a blockchain, the number will be in 1 * 10 **18. large number. bigNumber method of ethers
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      //account for gas cost
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //Make sure getFunder array is reset via sol code
                  await expect(FundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows owner to withdrawl", async function() {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await FundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
              ///cheaper

              it("Cheaper withdrawl function testing...", async function() {
                  //populate accounts
                  const accounts = await ethers.getSigners()
                  //the first index of the account is the deployer, so we start with the second index (1)
                  for (let i = 1; i < 6; i++) {
                      //replace "deployer" which is initialized in FundMe on line 16, with account[i]. So new object account[i] is calling the FundMe isntead of deployer, which is accounts[0]
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const startingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await FundMe.cheaperWithdrawl()
                  const transactionRecipt = await transactionResponse.wait(1)
                  //use js debug terminal to find vars holding amount of gas used and price of gas
                  const { gasUsed, effectiveGasPrice } = transactionRecipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance = await FundMe.provider.getBalance(
                      deployer
                  )

                  //assert

                  assert.equal(endingFundMeBalance, 0)
                  //we use add below because since we are reading off a blockchain, the number will be in 1 * 10 **18. large number. bigNumber method of ethers
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      //account for gas cost
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //Make sure getFunder array is reset via sol code
                  await expect(FundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
