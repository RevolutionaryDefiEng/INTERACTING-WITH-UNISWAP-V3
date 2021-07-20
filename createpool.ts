//First we will replace the abi that we previously wrote out manually with a library that contains the total V3 pool abi for us to easily interact with

import { ethers } from "ethers";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

//Now we'll update the Contract object with our imported ABI 
const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/9428e3ff3d2341b98076c3d7f3baaf7b"
);

const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

const poolContract = new ethers.Contract(
  poolAddress,
  IUniswapV3PoolABI,
  provider
);

//Here we will create two interfaces, with types that are appropriate for the data we need
interface Immutables {
  factory: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

//Now we're going to fetch the immutable data from the deployed V3 pool contract, 
//and return it so we can use it to create our own model of the pool.

async function getPoolImmutables() {
  const immutables: Immutables = {
    factory: await poolContract.factory(),
    token0: await poolContract.token0(),
    token1: await poolContract.token1(),
    fee: await poolContract.fee(),
    tickSpacing: await poolContract.tickSpacing(),
    maxLiquidityPerTick: await poolContract.maxLiquidityPerTick(),
  };
  return immutables;
}

//Next we need to fetch the state data
async function getPoolState() {
  const slot = await poolContract.slot0();
  const PoolState: State = {
    liquidity: await poolContract.liquidity(),
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };
  return PoolState;
}

//Finally, we will create a function called main which calls are previously written functions, 
//and uses the returned data to construct two Ethers.js Token instances a V3 SDK Pool instance.
async function main() {
  const immutables = await getPoolImmutables();
  const state = await getPoolState();
  const TokenA = new Token(1, immutables.token0, 8, "USDC", "USD Coin");
  const TokenB = new Token(1, immutables.token1, 8, "WETH", "Wrapped Ether");

  const poolExample = new Pool(
    TokenA,
    TokenB,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  );
  console.log(poolExample);
}
main();