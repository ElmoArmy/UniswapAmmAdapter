## YamTasktic 

### Develop a UniswapAmmAdapter contract for Set Protocol's AmmModule

### Part 1 UniswapV2AmmAdapter
### Requirements

- implements
  the [IAmmAdapter interface]("https://github.com/SetProtocol/set-protocol-v2-contracts/blob/master/contracts/interfaces/IAmmAdapter.sol"")
- Revert on single side liquidity operations
    - Provide a descriptive and short reason on revert.
- Add/remove functions should verify and otherwise revert unless :
    - the Uniswap pool is a valid pool
    - the provided components are the correct components of it
    - _minLiquidity refer to the total supply of the pool tokens
- On revert,revert reasons should be descriptive but short

### Verify Requirements:
```Bash
$ yarn install
$ yarn test 
```



### Part 2

#### Requirements
 
-Deploy a new uGAS-DEC21 synth on Kovan with the symbol uGAS-1221. 


Deployed EMP at: 0x0Ec301De6DD80C9ce7aa455843b398a6dCfE5382

Token is at 0xe1913Dd7039A31F57A83B327E5828b623E86f0eF

### Verify Requirements:

- https://kovan.etherscan.io/address/0xe1913dd7039a31f57a83b327e5828b623e86f0ef#readContract
```Bash
$ yarn install
# Test Network
$ yarn hardhat uGAS --token-name "UGAS-1221 Token Expiring 30 Dec 2021" --token-symbol "uGAS-1221"
# To run on kovan add a key to the .env file 
$ echo 'KovanPK="privateKEY"' > .env
$ yarn hardhat --netwkork kovan uGAS --token-name "UGAS-1221 Token Expiring 30 Dec 2021" --token-symbol "uGAS-1221"
```