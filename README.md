# DAINTRADER Autonomous Trading Agents

 Introducing Autonomous Trading Agents! Our platform allows you to create powerful trading agents that automatically execute trades and manage your portfolio on the Solana blockchain.

 ## How It Works

 1. **Create an Agent**: Start by creating a new trading agent on our platform.

 2. **Deposit Funds**: Deposit SOL or supported tokens into your agent's wallet. Only these deposited funds will be used for trading.

 3. **Define Trading Strategies**: Write custom trading scripts using our provided functions to define your trading strategies.

 4. **Schedule Execution**: Schedule your scripts to run automatically at specific intervals using cron jobs. Our platform handles the execution based on your cron schedule.

 5. **Automatic Trading**: Your agent will automatically execute trades and manage your portfolio according to your defined strategies.

 6. **Withdraw or Close**: Withdraw your funds or close your agent at any time. Closing the agent will automatically redeposit all remaining funds back to your main wallet.

 Get started now and unleash the power of autonomous trading on the Solana blockchain!

## License

This project is open source but fully proprietary. Contributions are welcome and will be licensed under the same terms.

**Disclaimer:** The software is provided "as is", without any warranty.

**Usage:** Only for triggers on `daintrader.com`. All rights reserved by Dain, Inc.

For more information, visit [daintrader.com](https://daintrader.com).




 # Example Scripts
  
No need to import any libraries when using it in your bots!


 **Dynamic Token Rebalancing**
 ```typescript

 const desiredAllocation = {
   "TokenA": 0.5,
   "TokenB": 0.3,
   "TokenC": 0.2
 };

 async function rebalancePortfolio() {
   const walletAssets: WalletAssets = await assets();
   const totalBalance = walletAssets.total_in_usd;

   for (const token in desiredAllocation) {
     const targetBalance = totalBalance * desiredAllocation[token];
     const currentBalance = walletAssets.tokens.find(t => t.symbol === token)?.balanceInUSD || 0;
     const difference = targetBalance - currentBalance;

     if (difference > 0) {
       // Buy tokens to reach the desired allocation
       await swap("USDC", token, difference, 50);
     } else if (difference < 0) {
       // Sell tokens to reach the desired allocation
       await swap(token, "USDC", Math.abs(difference), 50);
     }
   }

   log("Portfolio rebalanced successfully");
 }

 rebalancePortfolio();
 ```
 Cron Schedule: `0 0 * * *`

 **Price-Based Limit Orders**
 ```typescript

 const tokenSymbol = "SOL";
 const targetPrice = 100;
 const stopLossPrice = 90;

 async function placeLimitOrder() {
   const currentPrice: number = await price(tokenSymbol);

   if (currentPrice >= targetPrice) {
     // Place a sell order when the target price is reached
     await swap(tokenSymbol, "USDC", 1, 50);
     log(`Sold ${tokenSymbol} at price: ${currentPrice}`);
   } else if (currentPrice <= stopLossPrice) {
     // Place a sell order when the stop-loss price is reached
     await swap(tokenSymbol, "USDC", 1, 50);
     log(`Stop-loss triggered. Sold ${tokenSymbol} at price: ${currentPrice}`);
   } else {
     log(`Current ${tokenSymbol} price: ${currentPrice}. No action taken.`);
   }
 }

 placeLimitOrder();
 ```
 Cron Schedule: `*/30 * * * *`

 **Dollar-Cost Averaging (DCA)**
 ```typescript

 const tokenSymbol = "BTC";
 const usdAmount = 100;

 async function dcaInvestment() {
   const currentPrice: number = await price(tokenSymbol);
   const tokenAmount = usdAmount / currentPrice;

   await swap("USDC", tokenSymbol, tokenAmount, 50);
   log(`Invested ${usdAmount} USD in ${tokenSymbol} at price: ${currentPrice}`);
 }

 dcaInvestment();
 ```
 Cron Schedule: `0 9 * * 1`


 # Functions

 ### `price(token: string): Promise<number>`

 Fetches the price of a given token.

 - `token`: The symbol of the token (e.g., "SOL").
 - Returns a promise that resolves to the price of the token as a number.

 ### `assets(): Promise<WalletAssets>`

 Fetches the asset balances of the trigger agent's wallet.

 - Returns a promise that resolves to a `WalletAssets` object containing the wallet's asset balances.

 The `WalletAssets` type is defined as follows:

 ```typescript
 interface WalletAssets {
   tokens: FungibleTokenBalanceExpanded[];
   nfts: NFTBalance[];
   sol: SolBalance;
   total_in_usd: number;
 }

 interface FungibleTokenBalanceExpanded {
   balance: number;
   balanceInUSD: number;
   price_per_token: number;
   symbol: string;
   name: string;
   token: {
     address: string;
     decimals: number;
     image: string;
   };
 }

 interface NFTBalance {
   name: string;
   symbol: string;
   mint: string;
   image: string;
 }

 interface SolBalance {
   balance: number;
   balanceInUSD: number;
 }
 ```

 The `WalletAssets` object contains the following properties:
 - `tokens`: An array of `FungibleTokenBalanceExpanded` objects representing the fungible token balances.
 - `nfts`: An array of `NFTBalance` objects representing the non-fungible token (NFT) balances.
 - `sol`: A `SolBalance` object representing the SOL balance.
 - `total_in_usd`: The total balance of all assets in USD.

 ### `end(): Promise<void>`

 Ends the trigger agent and redeposits all assets into the main account.

 - Returns a promise that resolves when the operation is complete.

 ### `swap(fromToken: string, toToken: string, amount: number, slippageBps: number): Promise<string | undefined>`

 Performs a token swap.

 - `fromToken`: The address of the token to swap from.
 - `toToken`: The address of the token to swap to.
 - `amount`: The amount of tokens to swap.
 - `slippageBps`: The allowed slippage in basis points.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the swap fails.

 ### `sendToken(to: string, token: string, amount: number): Promise<string | undefined>`

 Sends a specified amount of tokens to a recipient.

 - `to`: The recipient's wallet address.
 - `token`: The address of the token to send.
 - `amount`: The amount of tokens to send.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the transaction fails.

 ### `sendSol(to: string, amount: number): Promise<string | undefined>`

 Sends a specified amount of SOL to a recipient.

 - `to`: The recipient's wallet address.
 - `amount`: The amount of SOL to send.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the transaction fails.

