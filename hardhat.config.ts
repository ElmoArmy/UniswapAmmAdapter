import "@nomiclabs/hardhat-waffle"
import {HardhatUserConfig, task, types} from "hardhat/config"
import {IEMPCreator} from "./abi"
import dotenv from "dotenv"

dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (_, {ethers}) => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});


const EMPCreator = "0x9a689bfd9f3a963b20d5ba4ed7ed0b7be16cfccb"
const deploymentData = "0xde46726800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000061ccf680000000000000000000000000d0a1e359811322d97991e03f863a0c30c2cf029c554741532d44454332310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000001158e460913d0000000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000b1a2bc2ec5000000000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000001c200000000000000000000000000000000000000000000000000000000000001c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025554741532d444543323120546f6b656e204578706972696e67203330204465632032303231000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a554741532d444543323100000000000000000000000000000000000000000000"

task("uGAS", "deploys a new UGAS Token",)
    .addParam("tokenSymbol", "Short name to use for uGas deployment", "UGAS-DEC21", types.string, true)
    .addParam("tokenName", "Long name to use for uGas deployment", "UGAS-DEC21 Token Expiring 30 Dec 2021", types.string, true)
    .setAction(async ({tokenSymbol, tokenName}, hre) => {
        const empCreatorContract = await hre.ethers.getContractAt(IEMPCreator, EMPCreator)
        const empCreatorInterface = empCreatorContract.interface
        const {
            expirationTimestamp, collateralAddress, priceFeedIdentifier,
            _syntheticName, _syntheticSymbol, collateralRequirement, disputeBondPercentage,
            sponsorDisputeRewardPercentage, disputerDisputeRewardPercentage, minSponsorTokens,
            withdrawalLiveness, liquidationLiveness, financialProductLibraryAddress
        } = empCreatorInterface.decodeFunctionData("createExpiringMultiParty", deploymentData)[0]

        const deploymentArgs = {
            expirationTimestamp, collateralAddress, priceFeedIdentifier,
            syntheticName: tokenName, syntheticSymbol: tokenSymbol, collateralRequirement, disputeBondPercentage,
            sponsorDisputeRewardPercentage, disputerDisputeRewardPercentage, minSponsorTokens,
            withdrawalLiveness, liquidationLiveness, financialProductLibraryAddress
        }

        const empAddress = await empCreatorContract.callStatic.createExpiringMultiParty([...Object.values(deploymentArgs)])
        console.log("Creating a new EMP: %s", empAddress)

        const createSynthTX = await empCreatorContract.createExpiringMultiParty([...Object.values(deploymentArgs)])
        createSynthTX.wait()
        console.log("Created new EMP via tx: %s", createSynthTX.hash)

    })


const config: HardhatUserConfig = {
    solidity: "0.8.4",
    networks: {
        hardhat: {
            forking: {
                url: "https://kovan.infura.io/v3/bb74a74c6942445ab6aec7e086731661"
            }
        },
        kovan: {
            url: "https://kovan.infura.io/v3/3ce35c3d389a4461bffd073fbf27d23e",
            accounts: process.env.KovanPK ? [process.env.KovanPK] : [],
        },
    }
}

export default config;
