import {ethers, run} from "hardhat"
import {waffleJest} from "@ethereum-waffle/jest"
import {Contract, ContractFactory, utils} from "ethers"
import {IUniswapV2Router02} from "~/abi"

jest.setTimeout(30000)
expect.extend(waffleJest)

const UniswapRouter02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const USDC_ETHLPAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
const USDCAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const WETHAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

const {parseUnits} = utils


describe("UniswapV2AmmAdapter", function () {
    let adapter: Contract
    let UniswapV2AmmAdapter: ContractFactory
    let uniswapRouter02: Contract
    let uniswapRouter02Interface: utils.Interface

    beforeAll(async () => {
        await run("compile")
        UniswapV2AmmAdapter = await ethers.getContractFactory("UniswapV2AmmAdapter")
        adapter = await UniswapV2AmmAdapter.deploy(UniswapRouter02Address, UniswapFactoryAddress)
        await adapter.deployed()
        uniswapRouter02 = await ethers.getContractAt(IUniswapV2Router02, UniswapRouter02Address)
        uniswapRouter02Interface = uniswapRouter02.interface
    })


    it('should revert on add single side liquidity.', async () => {
        const fakeArgs = ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", parseUnits("0"), parseUnits("0")]
        const expectedRevertReason = "UniswapV2AmmAdapter does not support adding single asset liquidity."
        await expect(adapter.getProvideLiquiditySingleAssetCalldata(...fakeArgs)).toBeRevertedWith(expectedRevertReason)
    })

    it('should revert on remove single side liquidity.', async () => {
        const fakeArgs = ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", parseUnits("0"), parseUnits("0")]
        const expectedRevertReason = "UniswapV2AmmAdapter does not support removing single asset liquidity."
        await expect(adapter.getRemoveLiquiditySingleAssetCalldata(...fakeArgs)).toBeRevertedWith(expectedRevertReason)
    })

    it('should return the address of the router as the spender', async () => {
        let address: string = await adapter.getSpenderAddress(USDC_ETHLPAddress)
        expect(address).toBe(UniswapRouter02Address)
    })

    it('should validate the pool token against the factory', async () => {
        const fakeArgs = ["0x0000000000000000000000000000000000000000"]
        const expectedRevertReason = "function call to a non-contract account"

        await expect(adapter.isValidPool(...fakeArgs)).toBeRevertedWith(expectedRevertReason)

        expect(await adapter.isValidPool(USDC_ETHLPAddress)).toBe(true)
    })

    it('should provide addLiquidity calldata that decodes properly', async () => {

        const adapterArgs = {
            liquidityToken: USDC_ETHLPAddress,
            components: [USDCAddress, WETHAddress],
            totalNotionalComponents: [parseUnits("1"), parseUnits("1")],
            liquidityQuantity: parseUnits("1"),
        }


        const [target, value, calldata] = await adapter.getProvideLiquidityCalldata(...Object.values(adapterArgs))
        const adapterCallDataResult = [target, value, calldata]
        const addLiquidityArgs = uniswapRouter02Interface.decodeFunctionData("addLiquidity", calldata)


        expect(uniswapRouter02.address).toStrictEqual(target)

        const expectedTx = await uniswapRouter02.populateTransaction.addLiquidity(...addLiquidityArgs, {value})
        const expectedReturn = [expectedTx.to, expectedTx.value, expectedTx.data]

        expect(expectedReturn).toStrictEqual(adapterCallDataResult)
    })

    it('should provide removeLiquidityCalldata calldata that decodes properly', async () => {
        const adapterArgs = {
            liquidityToken: USDC_ETHLPAddress,
            components: [USDCAddress, WETHAddress],
            totalNotionalComponents: [parseUnits("1"), parseUnits("1")],
            liquidityQuantity: parseUnits("1"),
        }

        const [target, value, calldata] = await adapter.getRemoveLiquidityCalldata(...Object.values(adapterArgs))
        const adapterCallDataResult = [target, value, calldata]
        const removeLiquidityArgs = uniswapRouter02Interface.decodeFunctionData("removeLiquidity", calldata)

        const expectedTx = await uniswapRouter02.populateTransaction.removeLiquidity(...removeLiquidityArgs, {value})
        const expectedReturn = [expectedTx.to, expectedTx.value, expectedTx.data]

        expect(expectedReturn).toStrictEqual(adapterCallDataResult)
    })
})