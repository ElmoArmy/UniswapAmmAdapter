/*
   MIT License

Copyright (c) [2021] [Ramy Melo]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.0;


import "./interfaces/IAmmAdapter.sol";
interface IUniswapV2Pair {
    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}


/*
 * @title UniswapV2AmmAdapter
 * @author Ramy Melo
 * @license:
 */
contract UniswapV2AmmAdapter is IAmmAdapter {
    address public immutable router;
    IUniswapV2Factory public immutable factory;

    constructor(address _router, address _factory){
        factory = IUniswapV2Factory(_factory);
        router = _router;
    }
    function getSpenderAddress(address) external override view returns (address){
        return address(router);
    }

    function isValidPool(address _pool) external override view returns (bool){
        IUniswapV2Pair pool = IUniswapV2Pair(address(_pool));
        bool pairExistsOnFactory = factory.getPair(pool.token0(), pool.token1()) != address(0);
        bool poolFactoryMatches = pool.factory() == address(factory);
        bool pairFactoryMatchesPool = address(pool) == factory.getPair(pool.token0(), pool.token1());

        return poolFactoryMatches && pairExistsOnFactory && pairFactoryMatchesPool;
    }

    function getProvideLiquidityCalldata(
        address _pool,
        address[] calldata _components,
        uint256[] calldata _maxTokensIn,
        uint256 _minLiquidity
    )
    external
    override
    view
    returns (address, uint256, bytes memory){
        IUniswapV2Pair pool = IUniswapV2Pair(address(_pool));
        bool isComponentsInvalid = (pool.token0() == _components[0] || pool.token0() == _components[1]) && (pool.token1() == _components[0] || pool.token1() == _components[1]);
        require(isComponentsInvalid, "Pool does not match components");
        (address tokenA, address tokenB) = (pool.token0(), pool.token1());
        uint256 amountADesired;
        uint256 amountBDesired;

        if (pool.token0() == _components[0]) {
            // sorted _components case
            (amountADesired, amountBDesired) = (_maxTokensIn[0], _maxTokensIn[1]);
        } else {
            // unsorted _components case
            (amountADesired, amountBDesired) = (_maxTokensIn[1], _maxTokensIn[0]);
        }

        uint256 minLiquidity = _minLiquidity;
        address to = address(msg.sender);
        uint256 deadline = block.timestamp + 30 minutes;

        bytes memory callData = abi.encodeWithSignature("addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)", tokenA, tokenB, amountADesired, amountBDesired, minLiquidity, minLiquidity, to, deadline);
        return (address(router), 0, callData);
    }

    function getRemoveLiquidityCalldata(
        address _pool,
        address[] calldata _components,
        uint256[] calldata _minTokensOut,
        uint256 _liquidity
    ) external override view returns (address, uint256, bytes memory){
        IUniswapV2Pair pool = IUniswapV2Pair(address(_pool));
        bool isComponentsInvalid = (pool.token0() == _components[0] || pool.token0() == _components[1]) && (pool.token1() == _components[0] || pool.token1() == _components[1]);
        require(isComponentsInvalid, "Pool does not match components");
        (address tokenA, address tokenB) = (pool.token0(), pool.token1());
        uint256 amountAMin;
        uint256 amountBMin;

        if (pool.token0() == _components[0]) {
            // sorted _components case
            (amountAMin, amountBMin) = (_minTokensOut[0], _minTokensOut[1]);
        } else {
            // unsorted _components case
            (amountAMin, amountBMin) = (_minTokensOut[1], _minTokensOut[0]);
        }

        uint256 liquidity = _liquidity;
        address to = address(msg.sender);
        uint256 deadline = block.timestamp + 30 minutes;

        bytes memory callData = abi.encodeWithSignature("removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)", tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
        return (address(router), 0, callData);

    }

    function getProvideLiquiditySingleAssetCalldata(
        address,
        address,
        uint256,
        uint256
    ) external override pure returns (address, uint256, bytes memory){
        revert("UniswapV2AmmAdapter does not support adding single asset liquidity.");
    }

    function getRemoveLiquiditySingleAssetCalldata(
        address,
        address,
        uint256,
        uint256
    ) external override pure returns (address, uint256, bytes memory){
        revert("UniswapV2AmmAdapter does not support removing single asset liquidity.");
    }
}
