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

Make sure to await any async functions, if you do not await all of the async properties of your script then it will close out and your script will not fully execute. 



 **Dynamic Token Rebalancing**
 ```typescript

 const desiredAllocation = {
   "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh": 0.5, // WBTC
   "e.g. TokenB address": 0.3,
   "e.g. TokenC address": 0.2
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
       await swap("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", token, difference, 50); // USDC / TOKEN
     } else if (difference < 0) {
       // Sell tokens to reach the desired allocation 
       await swap(token, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", Math.abs(difference), 50); // TOKEN / USDC
     }
   }

   log("Portfolio rebalanced successfully");
 }

 await rebalancePortfolio();
 ```
 Cron Schedule: `0 0 * * *`
### Example of Volume-Based Trading Strategy

Cron Schedule: `0 0 * * *`

**Volume-Based Trading Strategy**

```typescript

const tokenSymbol = "So11111111111111111111111111111111111111112"; // SOL
const highVolumeThreshold = 100000; // 24-hour volume in USD
const lowVolumeThreshold = 50000;  // 24-hour volume in USD

async function placeVolumeBasedOrder() {
  const volume24hUSD: number = await tokenStat(tokenSymbol, "v24hUSD");

  if (volume24hUSD >= highVolumeThreshold) {
    // Place a buy order when the 24-hour volume is high
    await swap("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", tokenSymbol, 1, 50);
    log(`High volume detected. Bought ${tokenSymbol} at volume: ${volume24hUSD} USD`);
  } else if (volume24hUSD <= lowVolumeThreshold) {
    // Place a sell order when the 24-hour volume is low
    await swap(tokenSymbol, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 1, 50);
    log(`Low volume detected. Sold ${tokenSymbol} at volume: ${volume24hUSD} USD`);
  } else {
    log(`Current ${tokenSymbol} 24-hour volume: ${volume24hUSD} USD. No action taken.`);
  }
}

await placeVolumeBasedOrder();
```

 **Price-Based Limit Orders**
 ```typescript

 const tokenSymbol = "So11111111111111111111111111111111111111112"; // SOL
 const targetPrice = 100;
 const stopLossPrice = 90;

 async function placeLimitOrder() {
   const currentPrice: number = await price(tokenSymbol);

   if (currentPrice >= targetPrice) {
     // Place a sell order when the target price is reached
     await swap(tokenSymbol, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 1, 50);
     log(`Sold ${tokenSymbol} at price: ${currentPrice}`);
   } else if (currentPrice <= stopLossPrice) {
     // Place a sell order when the stop-loss price is reached
     await swap(tokenSymbol, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 1, 50);
     log(`Stop-loss triggered. Sold ${tokenSymbol} at price: ${currentPrice}`);
   } else {
     log(`Current ${tokenSymbol} price: ${currentPrice}. No action taken.`);
   }
 }

  await placeLimitOrder();
 ```
 Cron Schedule: `*/30 * * * *`

 **Dollar-Cost Averaging (DCA)**
 ```typescript

 const tokenSymbol = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"; // WBTC
 const usdAmount = 100;

 async function dcaInvestment() {
   const currentPrice: number = await price(tokenSymbol);
   const tokenAmount = usdAmount / currentPrice;

   await swap("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", tokenSymbol, tokenAmount, 50);
   log(`Invested ${usdAmount} USD in ${tokenSymbol} at price: ${currentPrice}`);
 }

  await dcaInvestment();
 ```
 Cron Schedule: `0 9 * * 1`

# Webhook Triggers

In addition to scheduling scripts using cron jobs, you can also trigger your trading scripts by sending a webhook request to your agent's unique webhook URL. When a script is triggered via a webhook, the body of the webhook request is passed to the script through the `webhookBody` variable.

The `webhookBody` variable will contain the parsed body of the webhook request. You can access and utilize this data to make decisions or perform specific actions in your trading script.

Here's an example of how to use the `webhookBody` in your script:

```typescript
async function handleWebhook() {
  if (webhookBody) {
    const action = webhookBody.action;
    const amount = webhookBody.amount;

    if (action === "buy") {
      await swap("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "So11111111111111111111111111111111111111112", amount, 50); // USDC / SOL
      log(`Bought ${amount} SOL based on webhook trigger`);
    } else if (action === "sell") {
      await swap("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount, 50); // SOL / USDC 
      log(`Sold ${amount} SOL based on webhook trigger`);
    }
  } else {
    log("No webhook body found");
  }
}

 await handleWebhook();
```



 # Functions

 ### `price(token: string): Promise<number>`

 Fetches the price of a given token.

 - `token`: The address of the token e.g. "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
 - Returns a promise that resolves to the price of the token as a number.

### `tokenStat(token: string, statistic: string): Promise<number>`

Fetches a specific statistic for a given token.

- `token`: The address of the token (e.g., "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263").
- `statistic`: The specific statistic to fetch. Available options include:
  - `price`: Current price of the token in USD.
  - `liquidity`: Liquidity available for the token in the market.
  - `supply`: Total supply of the token.
  - `mc`: Market capitalization of the token.
  - `circulatingSupply`: Circulating supply of the token.
  - `realMc`: Real market capitalization of the token.
  - `v30mUSD`: 30 Minute USD Volume.
  - `v1hUSD`: 1 Hour USD Volume.
  - `v2hUSD`: 2 Hour USD Volume.
  - `v4hUSD`: 4 Hour USD Volume.
  - `v6hUSD`: 6 Hour USD Volume.
  - `v8hUSD`: 8 Hour USD Volume.
  - `v12hUSD`: 12 Hour USD Volume.
  - `v24hUSD`: 24 Hour USD Volume.
  - `v30mChangePercent`: 30 Minute Volume Change Percentage.
  - `v1hChangePercent`: 1 Hour Volume Change Percentage.
  - `v2hChangePercent`: 2 Hour Volume Change Percentage.
  - `v4hChangePercent`: 4 Hour Volume Change Percentage.
  - `v6hChangePercent`: 6 Hour Volume Change Percentage.
  - `v8hChangePercent`: 8 Hour Volume Change Percentage.
  - `v12hChangePercent`: 12 Hour Volume Change Percentage.
  - `v24hChangePercent`: 24 Hour Volume Change Percentage.
  - `priceChange30mPercent`: 30 Minute Price Change Percentage.
  - `priceChange1hPercent`: 1 Hour Price Change Percentage.
  - `priceChange2hPercent`: 2 Hour Price Change Percentage.
  - `priceChange4hPercent`: 4 Hour Price Change Percentage.
  - `priceChange6hPercent`: 6 Hour Price Change Percentage.
  - `priceChange8hPercent`: 8 Hour Price Change Percentage.
  - `priceChange12hPercent`: 12 Hour Price Change Percentage.
  - `priceChange24hPercent`: 24 Hour Price Change Percentage.
  - `uniqueWallet30m`: Unique Wallets Trading in the last 30 minutes.
  - `uniqueWallet1h`: Unique Wallets Trading in the last 1 hour.
  - `uniqueWallet2h`: Unique Wallets Trading in the last 2 hours.
  - `uniqueWallet4h`: Unique Wallets Trading in the last 4 hours.
  - `uniqueWallet6h`: Unique Wallets Trading in the last 6 hours.
  - `uniqueWallet8h`: Unique Wallets Trading in the last 8 hours.
  - `uniqueWallet12h`: Unique Wallets Trading in the last 12 hours.
  - `uniqueWallet24h`: Unique Wallets Trading in the last 24 hours.
  - `trade30m`: Number of trades in the last 30 minutes.
  - `trade1h`: Number of trades in the last 1 hour.
  - `trade2h`: Number of trades in the last 2 hours.
  - `trade4h`: Number of trades in the last 4 hours.
  - `trade8h`: Number of trades in the last 8 hours.
  - `trade24h`: Number of trades in the last 24 hours.
  - `buy30m`: Number of buy trades in the last 30 minutes.
  - `buy1h`: Number of buy trades in the last 1 hour.
  - `buy2h`: Number of buy trades in the last 2 hours.
  - `buy4h`: Number of buy trades in the last 4 hours.
  - `buy8h`: Number of buy trades in the last 8 hours.
  - `buy24h`: Number of buy trades in the last 24 hours.
  - `sell30m`: Number of sell trades in the last 30 minutes.
  - `sell1h`: Number of sell trades in the last 1 hour.
  - `sell2h`: Number of sell trades in the last 2 hours.
  - `sell4h`: Number of sell trades in the last 4 hours.
  - `sell8h`: Number of sell trades in the last 8 hours.
  - `sell24h`: Number of sell trades in the last 24 hours.
  - `vBuy30mUSD`: Buy volume in USD for the last 30 minutes.
  - `vBuy1hUSD`: Buy volume in USD for the last 1 hour.
  - `vBuy2hUSD`: Buy volume in USD for the last 2 hours.
  - `vBuy4hUSD`: Buy volume in USD for the last 4 hours.
  - `vBuy8hUSD`: Buy volume in USD for the last 8 hours.
  - `vBuy12hUSD`: Buy volume in USD for the last 12 hours.
  - `vBuy24hUSD`: Buy volume in USD for the last 24 hours.
  - `vSell30mUSD`: Sell volume in USD for the last 30 minutes.
  - `vSell1hUSD`: Sell volume in USD for the last 1 hour.
  - `vSell2hUSD`: Sell volume in USD for the last 2 hours.
  - `vSell4hUSD`: Sell volume in USD for the last 4 hours.
  - `vSell8hUSD`: Sell volume in USD for the last 8 hours.
  - `vSell12hUSD`: Sell volume in USD for the last 12 hours.
  - `vSell24hUSD`: Sell volume in USD for the last 24 hours.
  - `v30m`: 30 Minute Volume in token units.
  - `v1h`: 1 Hour Volume in token units.
  - `v2h`: 2 Hour Volume in token units.
  - `v4h`: 4 Hour Volume in token units.
  - `v8h`: 8 Hour Volume in token units.
  - `v12h`: 12 Hour Volume in token units.
  - `v24h`: 24 Hour Volume in token units.
  - `history30mPrice`: Price 30 minutes ago.
  - `history1hPrice`: Price 1 hour ago.
  - `history2hPrice`: Price 2 hours ago.
  - `history4hPrice`: Price 4 hours ago.
  - `history6hPrice`: Price 6 hours ago.
  - `history8hPrice`: Price 8 hours ago.
  - `history12hPrice`: Price 12 hours ago.
  - `history24hPrice`: Price 24 hours ago.
  - `uniqueWalletHistory30m`: Unique wallets trading in the last 30 minutes (historical).
  - `uniqueWalletHistory1h`: Unique wallets trading in the last 1 hour (historical).
  - `uniqueWalletHistory2h`: Unique wallets trading in the last 2 hours (historical).
  - `uniqueWalletHistory4h`: Unique wallets trading in the last 4 hours (historical).
  - `uniqueWalletHistory8h`: Unique wallets trading in the last 8 hours (historical).
  - `uniqueWalletHistory24h`: Unique wallets trading in the last 24 hours (historical).
  - `holder`: Number of unique holders of the token.
  - `uniqueWallet30mChangePercent`: Percent change in unique wallets trading in the last 30 minutes.
  - `uniqueWallet1hChangePercent`: Percent change in unique wallets trading in the last 1 hour.
  - `uniqueWallet2hChangePercent`: Percent change in unique wallets trading in the last 2 hours.
  - `uniqueWallet4hChangePercent`: Percent change in unique wallets trading in the last 4 hours.
  - `uniqueWallet8hChangePercent`: Percent change in unique wallets trading in the last 8 hours.
  - `uniqueWallet24hChangePercent`: Percent change in unique wallets trading in the last 24 hours.
  - `trade30mChangePercent`: Percent change in number of trades in the last 30 minutes.
  - `trade1hChangePercent`: Percent change in number of trades in the last 1 hour.
  - `trade2hChangePercent`: Percent change in number of trades in the last 2 hours.
  - `trade4hChangePercent`: Percent change in number of trades in the last 4 hours.
  - `trade8hChangePercent`: Percent change in number of trades in the last 8 hours.
  - `trade24hChangePercent`: Percent change in number of trades in the last 24 hours.
  - `buy30mChangePercent`: Percent change in number of buy trades in the last 30 minutes.
  - `buy1hChangePercent`: Percent change in number of buy trades in the last 1 hour.
  - `buy2hChangePercent`: Percent change in number of buy trades in the last 2 hours.
  - `buy4hChangePercent`: Percent change in number of buy trades in the last 4 hours.
  - `buy8hChangePercent`: Percent change in number of buy trades in the last 8 hours.
  - `buy24hChangePercent`: Percent change in number of buy trades in the last 24 hours.
  - `sell30mChangePercent`: Percent change in number of sell trades in the last 

30 minutes.
  - `sell1hChangePercent`: Percent change in number of sell trades in the last 1 hour.
  - `sell2hChangePercent`: Percent change in number of sell trades in the last 2 hours.
  - `sell4hChangePercent`: Percent change in number of sell trades in the last 4 hours.
  - `sell8hChangePercent`: Percent change in number of sell trades in the last 8 hours.
  - `sell24hChangePercent`: Percent change in number of sell trades in the last 24 hours.

- Returns a promise that resolves to the requested statistic as a number.


This function fetches the specified statistic for the given token from the API and returns it as a number. If the fetch operation fails, an error is thrown.

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

 - `fromToken`: The address of the token to swap from e.g. "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
 - `toToken`: The address of the token to swap to. e.g. "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
 - `amount`: The amount of tokens to swap.
 - `slippageBps`: The allowed slippage in basis points.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the swap fails.

 ### `sendToken(to: string, token: string, amount: number): Promise<string | undefined>`

 Sends a specified amount of tokens to a recipient.

 - `to`: The recipient's wallet address.
 - `token`: The address of the token to send. e.g. "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
 - `amount`: The amount of tokens to send.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the transaction fails.

 ### `sendSol(to: string, amount: number): Promise<string | undefined>`

 Sends a specified amount of SOL to a recipient.

 - `to`: The recipient's wallet address.
 - `amount`: The amount of SOL to send.
 - Returns a promise that resolves to the transaction signature as a string if successful, or `undefined` if the transaction fails.


# Persistent Storage

Since the trading scripts run on non-persistent serverless functions, you cannot directly set a variable and expect it to be available the next time the script runs. To overcome this limitation, we provide the `getValue` and `setValue` functions for persistent storage.

Note: The stored values are specific to each trigger agent, so different agents will have their own separate storage.

### `setValue(key: string, value: any): Promise<any>`

Sets a key-value pair in persistent storage.

- `key`: The key to store the value under.
- `value`: The value to store.
- Returns a promise that resolves to the stored value.

### `getValue(key: string): Promise<any>`

Retrieves a value from persistent storage based on the provided key.

- `key`: The key to retrieve the value for.
- Returns a promise that resolves to the retrieved value.

Use the `setValue` function to store values that you want to persist across script executions. You can then retrieve those values using the `getValue` function in subsequent script runs.

Here's an example of how to use `getValue` and `setValue`:

```typescript
async function persistantCounter() {
  // Store a value
  await setValue("counter", 0);

  // Retrieve the value
  const counter = await getValue("counter");
  console.log(counter); // Output: 0

  // Increment the counter
  await setValue("counter", counter + 1);
}

 await persistantCounter();
```


# Notifications and Alerts

### `sendNotification(platform: string, message: string): Promise<boolean>`

Sends a notification to the specified platform. The current allowed values for platform are `telegram`

- `platform`: The platform the send the notification to
- `message`: The message as a string to send to the platform 
- returns a promise with a boolean indidicating success or failure of sending the notification

For notifications, make sure to connect the account on the dashboard because otherwise notificatins wont get delivered.

# Spawning a Sub Agent

You can spawn a sub agent to search the web and find any information you need. This can be useful for making decisions based on external data or events.

### `spawn_sub_agent(query: string, responseType: string): Promise<string>`

Spawns a sub AI agent that can search the web and find the requested information.

- `query`: The query or question to ask the sub agent.
- `responseType`: The expected type of the response. Can be "boolean", "number", or "string".
- Returns a promise that resolves to the sub agent's response as a string.

The response from the sub agent is always a string, but you can specify the expected response type and convert it accordingly in your code:
- Booleans will be in "TRUE" or "FALSE" format.
- Numbers will be in "123" format.
- Strings will be in "hello" format.

Here's an example of how to use `spawn_sub_agent` to check if World War 3 has started and sell all your Bitcoin accordingly:

```typescript
async function checkWorldWarStatus() {
  const query = "Has World War 3 started?";
  const response = await spawn_sub_agent(query, "boolean");

  if (response === "TRUE") {
    const bitcoinBalance = await assets().sol.balance;
    await swap("3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", bitcoinBalance, 50); // WBTC / USDC
    log("World War 3 has started. Sold all Bitcoin.");
  } else {
    log("World War 3 has not started. Holding Bitcoin.");
  }
}

 await checkWorldWarStatus();
```

In this example, the script spawns a sub agent to check if World War 3 has started. The sub agent searches the web and returns a boolean response. If the response is "TRUE", indicating that World War 3 has started, the script retrieves the Bitcoin balance from the wallet and sells all of it for USDC. If the response is "FALSE", the script logs a message indicating that it is holding Bitcoin.

Remember to handle the response appropriately based on the specified `responseType`. Convert the string response to the desired type (boolean, number, or string) in your code.