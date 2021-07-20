//import the following dependencies
const Web3 = require('web3');
const routerABI = require('./abis/v3SwapRouterABI.json');
const tickLensABI = require('./abis/v3TickLens.json');
const credentials = require('./credentials.json');

//INSERT PRIVATE KEY FOR EHTEREUM WALLET AND EHTHEREUM NODE 
const web3 = new Web3(``);
const privateKey = credentials.privateKey;
const activeAccount = web3.eth.accounts.privateKeyToAccount(privateKey);




const tickLensAddress = `0xB79bDE60fc227217f4EE2102dC93fa1264E33DaB`; // Kovan Tick Lens
const routerAddress = `0xE592427A0AEce92De3Edee1F18E0157C05861564`; // Kovan Swap Router
const fromTokenAddress = `0xd0a1e359811322d97991e03f863a0c30c2cf029c`; // Kovan WETH
const toTokenAddress = `0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa`; // Kovan DAI
const poolAddress = `0xd744bd581403078aeafeb344bdad812c384825b1`; // Kovan WETH/DAI Pool
const tickLensContract = new web3.eth.Contract(tickLensABI, tickLensAddress);
const routerContract = new web3.eth.Contract(routerABI, routerAddress);
const expiryDate = Math.floor(Date.now() / 1000) + 900;

(async () => {
	const qty = web3.utils.toWei('0.0274', 'ether');
	console.log('qty',qty);
  const tickBitmapIndex = 1;


	//const quote = await tickLensContract.methods.getPopulatedTicksInWord(poolAddress,tickBitmapIndex).call();
	//setPosition =  setPosition —lowerTick and upperTick— when combined with the msg.sender, together specify a position.
	//First, the function computes the uncollected fees (𝑓𝑢), uint256 feeGrowthInside0LastX128
	//You need to know how much 𝑓𝑟 for the position’s range 
	// Then, the contract updates the position’s liquidity by adding liquidityDelta
	//If the pool’s current price is within the range of this position, 
	//the contract also adds liquidityDelta to the contract’s global liquidity value
	//pool transfers tokens from (or, if liquidityDelta is negative, to) the user, 
	//corresponding to the amount of liquidity burned or minted.
	// FIRST SET PRICE OF WETH TO O(X=0) , WHICH CORRESPONDS TO PRICE OF DAI AT EXIT RANGE
	//THEN SET DAI AMOUNT TO 0 (Y=0), WHICH CORRESPONDS TO THE PRICE WETH AT ETRY RANGE
	//The amount of token0 (Δ𝑋) or token1 (Δ𝑌) that needs to be deposited can be thought of as
	// The amount that would be sold from the position if the price were to move from the current price (𝑃) to the upper tick or lower tick


  const params = {
    tokenIn: fromTokenAddress,
    tokenOut: toTokenAddress,
    fee: 3000,
    recipient: activeAccount.address ,
    deadline: expiryDate,
    amountIn: qty,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

	let tx_builder = routerContract.methods.exactInputSingle(params);
	let encoded_tx = tx_builder.encodeABI();
	let transactionObject = {
		gas: 238989, // gas fee needs updating?
		data: encoded_tx,
		from: activeAccount.address,
		to: routerAddress
	};

	web3.eth.accounts.signTransaction(transactionObject, activeAccount.privateKey, (error, signedTx) => {
		if (error) {
			console.log(error);
		} else {
			web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
				console.log(receipt);
			});
		}
	});
	
})();