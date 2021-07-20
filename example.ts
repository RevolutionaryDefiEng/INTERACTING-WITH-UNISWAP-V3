//IMPORT ETHERS AND THE V3 SDK
import { ethers } from "ethers";
import { Pool } from "@uniswap/v3-sdk";
import { Address } from "cluster";

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/9428e3ff3d2341b98076c3d7f3baaf7b");

// TELL ETHERS WHERE TO LOOK FOR OUR CHAIN DATA USING CONTRACT ADDRESS OF V3 POOL
const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

//Now we'll need the interface for the functions of the pool contract that we'll be calling
const poolImmutablesAbi = [
  "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
  "function tickSpacing() external view returns (int24)",
  "function maxLiquidityPerTick() external view returns (uint128)",
];

//Once the interface is setup, we create a new instance of a "Contract" using ethers.js
const poolContract = new ethers.Contract(
  poolAddress,
  poolImmutablesAbi,
  provider
);

//Now we'll create an interface with all the data we're going to return, each assigned to its appropriate type
interface Immutables {
  factory: Address;
  token0: Address;
  token1: Address;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: number;
}


//We now query the EVM using ethers.js, and assign the returned values to the variables inside of our Immutables interface.
async function getPoolImmutables() {
  const PoolImmutables: Immutables = {
    factory: await poolContract.factory(),
    token0: await poolContract.token0(),
    token1: await poolContract.token1(),
    fee: await poolContract.fee(),
    tickSpacing: await poolContract.tickSpacing(),
    maxLiquidityPerTick: await poolContract.maxLiquidityPerTick(),
  };
  return PoolImmutables;
}

//finally, we can call our function, and print out the returned data in our console 
getPoolImmutables().then((result) => {
  console.log(result);
});