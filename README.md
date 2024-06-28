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
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 0.3, // USDC
  "So11111111111111111111111111111111111111112": 0.2  // SOL
};

const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const minSolForFees = 0.01; // Minimum SOL balance required for fees
const rebalanceThreshold = 0.05; // 5% threshold for rebalancing

async function rebalancePortfolio() {
  try {
    const walletAssets = await assets();
    const solBalance = walletAssets.sol.balance;

    if (solBalance < minSolForFees) {
      log(`Insufficient SOL balance for fees. Required: ${minSolForFees} SOL, Available: ${solBalance.toFixed(9)} SOL`);
      return;
    }

    const totalBalanceUSD = walletAssets.total_in_usd;
    log(`Total portfolio value: $${totalBalanceUSD.toFixed(2)}`);

    for (const [tokenAddress, targetAllocation] of Object.entries(desiredAllocation)) {
      const token = walletAssets.tokens.find(t => t.token.address === tokenAddress) || 
                    (tokenAddress === "So11111111111111111111111111111111111111112" ? { balanceInUSD: walletAssets.sol.balanceInUSD, symbol: "SOL" } : null);

      if (!token) {
        log(`Token ${tokenAddress} not found in wallet. Skipping.`);
        continue;
      }

      const currentAllocation = token.balanceInUSD / totalBalanceUSD;
      const targetBalanceUSD = totalBalanceUSD * targetAllocation;
      const diffUSD = targetBalanceUSD - token.balanceInUSD;
      const diffPercentage = Math.abs(diffUSD / targetBalanceUSD);

      log(`${token.symbol}: Current allocation: ${(currentAllocation * 100).toFixed(2)}%, Target: ${(targetAllocation * 100).toFixed(2)}%`);

      if (diffPercentage > rebalanceThreshold) {
        if (diffUSD > 0) {
          // Need to buy more of this token
          const usdcToken = walletAssets.tokens.find(t => t.token.address === usdcAddress);
          if (!usdcToken || usdcToken.balanceInUSD < diffUSD) {
            log(`Insufficient USDC balance to buy ${token.symbol}. Skipping.`);
            continue;
          }
          const amountToBuy = diffUSD / usdcToken.price_per_token;
          const txSignature = await swap(usdcAddress, tokenAddress, amountToBuy, 50);
          log(`Bought ${amountToBuy.toFixed(6)} ${token.symbol} worth $${diffUSD.toFixed(2)}. Transaction: ${txSignature}`);
        } else {
          // Need to sell some of this token
          const amountToSell = Math.abs(diffUSD) / token.price_per_token;
          const txSignature = await swap(tokenAddress, usdcAddress, amountToSell, 50);
          log(`Sold ${amountToSell.toFixed(6)} ${token.symbol} worth $${Math.abs(diffUSD).toFixed(2)}. Transaction: ${txSignature}`);
        }
      } else {
        log(`${token.symbol} is within the rebalance threshold. No action needed.`);
      }
    }

    log("Portfolio rebalancing completed.");

    // Log updated balances
    const updatedAssets = await assets();
    log("Updated portfolio balances:");
    for (const token of updatedAssets.tokens) {
      log(`${token.symbol}: ${token.balance.toFixed(6)} (${token.balanceInUSD.toFixed(2)} USD)`);
    }
    log(`SOL: ${updatedAssets.sol.balance.toFixed(9)} (${updatedAssets.sol.balanceInUSD.toFixed(2)} USD)`);
    log(`Total portfolio value: $${updatedAssets.total_in_usd.toFixed(2)}`);

  } catch (error) {
    log(`An error occurred during rebalancing: ${error}`);
  }
}

await rebalancePortfolio();
 ```
 Cron Schedule: `0 0 * * *`
### Example of Volume-Based Trading Strategy

Cron Schedule: `0 0 * * *`

**Volume-Based Trading Strategy**

```typescript

const solAddress = "So11111111111111111111111111111111111111112"; // SOL
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const highVolumeThreshold = 1000000; // 24-hour volume in USD (e.g., 1 million)
const lowVolumeThreshold = 500000;  // 24-hour volume in USD (e.g., 500,000)
const tradeAmount = 10; // Amount in USDC to trade
const minSolForFees = 0.01; // Minimum SOL balance required for fees

async function placeVolumeBasedOrder() {
  try {
    // Check SOL balance for fees
    const walletAssets = await assets();
    const solBalance = walletAssets.sol.balance;
    if (solBalance < minSolForFees) {
      log(`Insufficient SOL balance for fees. Required: ${minSolForFees} SOL, Available: ${solBalance.toFixed(9)} SOL`);
      return;
    }

    // Get 24-hour volume
    const volume24hUSD: number = await tokenStat(solAddress, "v24hUSD");
    log(`Current 24-hour trading volume for SOL: $${volume24hUSD.toFixed(2)}`);

    // Get current SOL price
    const currentPrice = await price(solAddress);
    log(`Current SOL price: $${currentPrice.toFixed(2)}`);

    if (volume24hUSD >= highVolumeThreshold) {
      // High volume: Buy SOL
      const usdcBalance = walletAssets.tokens.find(t => t.token.address === usdcAddress)?.balance || 0;
      if (usdcBalance < tradeAmount) {
        log(`Insufficient USDC balance. Required: ${tradeAmount} USDC, Available: ${usdcBalance.toFixed(2)} USDC`);
        return;
      }

      const txSignature = await swap(usdcAddress, solAddress, tradeAmount, 50);
      log(`High volume detected. Bought SOL with ${tradeAmount} USDC. Transaction: ${txSignature}`);
    } else if (volume24hUSD <= lowVolumeThreshold) {
      // Low volume: Sell SOL
      const solToSell = tradeAmount / currentPrice;
      if (solBalance < solToSell + minSolForFees) {
        log(`Insufficient SOL balance. Required: ${solToSell.toFixed(9)} SOL (plus fees), Available: ${solBalance.toFixed(9)} SOL`);
        return;
      }

      const txSignature = await swap(solAddress, usdcAddress, solToSell, 50);
      log(`Low volume detected. Sold ${solToSell.toFixed(9)} SOL. Transaction: ${txSignature}`);
    } else {
      log(`Current volume is between thresholds. No action taken.`);
    }

    // Log updated balances
    const updatedAssets = await assets();
    const updatedSolBalance = updatedAssets.sol.balance;
    const updatedUsdcBalance = updatedAssets.tokens.find(t => t.token.address === usdcAddress)?.balance || 0;
    log(`Updated SOL balance: ${updatedSolBalance.toFixed(9)} SOL`);
    log(`Updated USDC balance: ${updatedUsdcBalance.toFixed(2)} USDC`);

  } catch (error) {
    log(`An error occurred: ${error}`);
  }
}

await placeVolumeBasedOrder();
```

 **Price-Based Limit Orders**
 ```typescript

const solAddress = "So11111111111111111111111111111111111111112"; // SOL
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const targetPrice = 100; // Target price to sell SOL
const stopLossPrice = 90; // Stop-loss price to sell SOL
const percentToSell = 0.5; // Sell 50% of SOL balance when conditions are met

async function placeLimitOrder() {
  // Get current wallet assets
  const walletAssets = await assets();
  
  // Check SOL balance
  const solBalance = walletAssets.sol.balance;
  if (solBalance <= 0) {
    log("Insufficient SOL balance. No SOL available to sell.");
    return;
  }

  // Calculate amount of SOL to sell
  const solToSell = solBalance * percentToSell;

  // Get current SOL price
  const currentPrice: number = await price(solAddress);

  if (currentPrice >= targetPrice) {
    // Place a sell order when the target price is reached
    try {
      const txSignature = await swap(solAddress, usdcAddress, solToSell, 50);
      log(`Target price reached. Sold ${solToSell.toFixed(9)} SOL at price: $${currentPrice.toFixed(2)}. Transaction: ${txSignature}`);
    } catch (error) {
      log(`Failed to execute sell order at target price: ${error}`);
    }
  } else if (currentPrice <= stopLossPrice) {
    // Place a sell order when the stop-loss price is reached
    try {
      const txSignature = await swap(solAddress, usdcAddress, solToSell, 50);
      log(`Stop-loss triggered. Sold ${solToSell.toFixed(9)} SOL at price: $${currentPrice.toFixed(2)}. Transaction: ${txSignature}`);
    } catch (error) {
      log(`Failed to execute stop-loss order: ${error}`);
    }
  } else {
    log(`Current SOL price: $${currentPrice.toFixed(2)}. No action taken.`);
  }

  // Log updated SOL balance
  const updatedAssets = await assets();
  const updatedSolBalance = updatedAssets.sol.balance;
  log(`Updated SOL balance: ${updatedSolBalance.toFixed(9)} SOL`);
}

await placeLimitOrder();
 ```
 Cron Schedule: `*/30 * * * *`

 **Dollar-Cost Averaging (DCA)**
 ```typescript

// swap $1 of SOL into WBTC .
// Swap $1 of USDC into WBTC
const wbtcAddress = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"; // WBTC
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const usdAmount = 1; // Amount in USD to invest
const minSolForFees = 0.01; // Minimum SOL balance required for fees

async function dcaInvestment() {
    // Get current wallet assets
    const walletAssets = await assets();
    
    // Check SOL balance
    const solBalance = walletAssets.sol.balance;
    if (solBalance < minSolForFees) {
        log(`Insufficient SOL balance for fees. Required: ${minSolForFees} SOL, Available: ${solBalance.toFixed(9)} SOL`);
        return;
    }
    
    // Check USDC balance
    const usdcBalance = walletAssets.tokens.find(t => t.token.address === usdcAddress)?.balance || 0;
    if (usdcBalance < usdAmount) {
        log(`Insufficient USDC balance. Required: ${usdAmount} USDC, Available: ${usdcBalance.toFixed(2)} USDC`);
        return;
    }

    // Swap USDC for WBTC
    await swap(usdcAddress, wbtcAddress, usdAmount, 50); // USDC / WBTC swap

    // Get current WBTC price for logging
    const wbtcPrice = await price(wbtcAddress);
    
    log(`Swapped ${usdAmount} USDC to WBTC at WBTC price: $${wbtcPrice.toFixed(2)}`);

    // Log the updated WBTC balance
    const updatedAssets = await assets();
    const wbtcBalance = updatedAssets.tokens.find(t => t.token.address === wbtcAddress)?.balance || 0;
    log(`Current WBTC balance: ${wbtcBalance.toFixed(8)}`);
}

await dcaInvestment(); ```
 Cron Schedule: `0 9 * * 1`

 **Dollar-Cost Averaging (DCA) With SOL**

```typescript
// Swap $1 worth of SOL into WBTC
const wbtcAddress = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"; // WBTC
const solAddress = "So11111111111111111111111111111111111111112"; // SOL
const usdAmount = 1; // Amount in USD to invest

async function dcaInvestment() {
    // Get current SOL balance and price
    const walletAssets = await assets();
    const solBalance = walletAssets.sol.balance;
    const solPrice = await price(solAddress);
    
    // Calculate amount of SOL to swap
    const solAmount = usdAmount / solPrice;
    
    if (solBalance < solAmount) {
        log(`Insufficient SOL balance. Required: ${solAmount.toFixed(9)} SOL, Available: ${solBalance.toFixed(9)} SOL`);
        return;
    }
    
    // Swap SOL for WBTC
    await swap(solAddress, wbtcAddress, solAmount, 50); // SOL / WBTC swap

    // Get current WBTC price for logging
    const wbtcPrice = await price(wbtcAddress);
    
    log(`Swapped ${solAmount.toFixed(9)} SOL (${usdAmount} USD) to WBTC at SOL price: $${solPrice.toFixed(2)} and WBTC price: $${wbtcPrice.toFixed(2)}`);

    // Log the updated WBTC balance
    const updatedAssets = await assets();
    const wbtcBalance = updatedAssets.tokens.find(t => t.token.address === wbtcAddress)?.balance || 0;
    log(`Current WBTC balance: ${wbtcBalance.toFixed(8)}`);
}

await dcaInvestment();

```

###Price alert system with notifications 

```typescript

const solAddress = "So11111111111111111111111111111111111111112"; // SOL
const highPriceThreshold = 50; // Alert if price goes above $50
const lowPriceThreshold = 30; // Alert if price goes below $30
const notificationPlatform = "telegram"; // Change this if using a different platform

async function checkPriceAndNotify() {
  try {
    // Get the current price of SOL
    const currentPrice = await price(solAddress);
    log(`Current SOL price: $${currentPrice.toFixed(2)}`);

    // Get the last notified state
    const lastNotifiedHigh = await getValue("lastNotifiedHigh") === "true";
    const lastNotifiedLow = await getValue("lastNotifiedLow") === "true";

    if (currentPrice > highPriceThreshold && !lastNotifiedHigh) {
      // Price is above the high threshold and we haven't notified about this yet
      const message = `🚀 SOL price alert: The price has risen above $${highPriceThreshold}! Current price: $${currentPrice.toFixed(2)}`;
      const notificationSent = await sendNotification(notificationPlatform, message);
      
      if (notificationSent) {
        log("High price notification sent successfully.");
        await setValue("lastNotifiedHigh", "true");
        await setValue("lastNotifiedLow", "false");
      } else {
        log("Failed to send high price notification.");
      }
    } else if (currentPrice < lowPriceThreshold && !lastNotifiedLow) {
      // Price is below the low threshold and we haven't notified about this yet
      const message = `📉 SOL price alert: The price has fallen below $${lowPriceThreshold}! Current price: $${currentPrice.toFixed(2)}`;
      const notificationSent = await sendNotification(notificationPlatform, message);
      
      if (notificationSent) {
        log("Low price notification sent successfully.");
        await setValue("lastNotifiedLow", "true");
        await setValue("lastNotifiedHigh", "false");
      } else {
        log("Failed to send low price notification.");
      }
    } else if (currentPrice <= highPriceThreshold && currentPrice >= lowPriceThreshold) {
      // Price is between thresholds, reset notification states
      await setValue("lastNotifiedHigh", "false");
      await setValue("lastNotifiedLow", "false");
      log("Price is within normal range. Notification states reset.");
    }

  } catch (error) {
    log(`An error occurred while checking price and sending notifications: ${error}`);
  }
}

await checkPriceAndNotify();
```


### Daily Bitcoin Market Summary Script

This script demonstrates how to create a daily Bitcoin market summary using DAINTRADER Autonomous Trading Agents. It combines on-chain data with web-sourced news to provide a comprehensive market overview.

```typescript
async function dailyBitcoinSummary() {
  // Bitcoin WBTC token address
  const bitcoinAddress = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh";

  // Gather Bitcoin stats
  const currentPrice = await price(bitcoinAddress);
  const priceChange24h = await tokenStat(bitcoinAddress, "priceChange24hPercent");
  const volume24h = await tokenStat(bitcoinAddress, "v24hUSD");

  // Create a query for the sub agent, including the stats
  const query = `Please search the web for a daily summary on Bitcoin news and return 3 sentences for a daily user briefing on the state of the market. Include these stats in your summary: Current price: $${currentPrice.toFixed(2)}, 24h price change: ${priceChange24h.toFixed(2)}%, 24h trading volume: $${(volume24h / 1e6).toFixed(2)} million.`;

  // Spawn sub agent to get the market summary
  const marketSummary = await spawn_sub_agent(query, "string");

  // Compose the notification message
  const message = `Daily Bitcoin Market Summary:

Current Price: $${currentPrice.toFixed(2)}
24h Price Change: ${priceChange24h.toFixed(2)}%
24h Trading Volume: $${(volume24h / 1e6).toFixed(2)} million

${marketSummary}`;

  // Send the notification
  const notificationSent = await sendNotification("telegram", message);

  if (notificationSent) {
    log("Daily Bitcoin summary notification sent successfully.");
  } else {
    log("Failed to send daily Bitcoin summary notification.");
  }
}

// Execute the function
await dailyBitcoinSummary();
```
cron schedule: 0 9 * * *


# Webhook Triggers

In addition to scheduling scripts using cron jobs, you can also trigger your trading scripts by sending a webhook request to your agent's unique webhook URL. When a script is triggered via a webhook, the body of the webhook request is passed to the script through the `webhookBody` variable.

The `webhookBody` variable will contain the parsed body of the webhook request. You can access and utilize this data to make decisions or perform specific actions in your trading script.

Here's an example of how to use the `webhookBody` in your script:

```typescript
const solAddress = "So11111111111111111111111111111111111111112"; // SOL
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const minSolForFees = 0.01; // Minimum SOL balance required for fees

interface WebhookPayload {
  action: "buy" | "sell";
  amount: number;
  token?: string;
}

async function handleWebhook() {
  try {
    if (!webhookBody) {
      log("No webhook body found. Exiting.");
      return;
    }

    const payload = webhookBody as WebhookPayload;
    log(`Received webhook payload: ${JSON.stringify(payload)}`);

    if (!payload.action || !payload.amount) {
      log("Invalid webhook payload. Missing action or amount.");
      return;
    }

    const walletAssets = await assets();
    const solBalance = walletAssets.sol.balance;

    if (solBalance < minSolForFees) {
      log(`Insufficient SOL balance for fees. Required: ${minSolForFees} SOL, Available: ${solBalance.toFixed(9)} SOL`);
      return;
    }

    const tokenAddress = payload.token || solAddress; // Default to SOL if no token specified
    const tokenSymbol = tokenAddress === solAddress ? "SOL" : (walletAssets.tokens.find(t => t.token.address === tokenAddress)?.symbol || "Unknown");

    if (payload.action === "buy") {
      // Check USDC balance
      const usdcBalance = walletAssets.tokens.find(t => t.token.address === usdcAddress)?.balance || 0;
      if (usdcBalance < payload.amount) {
        log(`Insufficient USDC balance. Required: ${payload.amount} USDC, Available: ${usdcBalance.toFixed(2)} USDC`);
        return;
      }

      try {
        const txSignature = await swap(usdcAddress, tokenAddress, payload.amount, 50);
        log(`Bought ${tokenSymbol} with ${payload.amount} USDC. Transaction: ${txSignature}`);
      } catch (swapError) {
        log(`Failed to execute buy order: ${swapError}`);
      }
    } else if (payload.action === "sell") {
      let amountToSell: number;
      if (tokenAddress === solAddress) {
        if (solBalance - minSolForFees < payload.amount) {
          log(`Insufficient SOL balance. Required: ${payload.amount} SOL (plus fees), Available: ${(solBalance - minSolForFees).toFixed(9)} SOL`);
          return;
        }
        amountToSell = payload.amount;
      } else {
        const tokenBalance = walletAssets.tokens.find(t => t.token.address === tokenAddress)?.balance || 0;
        if (tokenBalance < payload.amount) {
          log(`Insufficient ${tokenSymbol} balance. Required: ${payload.amount}, Available: ${tokenBalance.toFixed(8)}`);
          return;
        }
        amountToSell = payload.amount;
      }

      try {
        const txSignature = await swap(tokenAddress, usdcAddress, amountToSell, 50);
        log(`Sold ${amountToSell} ${tokenSymbol} for USDC. Transaction: ${txSignature}`);
      } catch (swapError) {
        log(`Failed to execute sell order: ${swapError}`);
      }
    } else {
      log(`Invalid action: ${payload.action}. Supported actions are 'buy' and 'sell'.`);
      return;
    }

    // Log updated balances
    const updatedAssets = await assets();
    log("Updated balances:");
    log(`SOL: ${updatedAssets.sol.balance.toFixed(9)} SOL`);
    log(`USDC: ${updatedAssets.tokens.find(t => t.token.address === usdcAddress)?.balance.toFixed(2) || 0} USDC`);
    if (tokenAddress !== solAddress && tokenAddress !== usdcAddress) {
      log(`${tokenSymbol}: ${updatedAssets.tokens.find(t => t.token.address === tokenAddress)?.balance.toFixed(8) || 0} ${tokenSymbol}`);
    }

  } catch (error) {
    log(`An error occurred while handling the webhook: ${error}`);
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

- `fromToken`: The address of the token to swap from (e.g., "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" for USDC)
- `toToken`: The address of the token to swap to (e.g., "So11111111111111111111111111111111111111112" for SOL)
- `amount`: The amount of `fromToken` to swap. This should be in the units of the `fromToken`. For example:
  - If swapping 1 USDC into another token, use `1` 
  - If swapping 0.1 SOL into another token, use `0.1` 
  - If swapping 0.5 WBTC into another token, use `0.5` 
- `slippageBps`: The allowed slippage in basis points (1 bps = 0.01%). For example, 50 bps = 0.5% slippage.

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
const wbtcAddress = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"; // WBTC
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const minSolForFees = 0.01; // Minimum SOL balance required for fees

async function checkWorldWarStatus() {
  try {
    // Check if World War 3 has started
    const query = "Has World War 3 started? Answer with TRUE if it has started, or FALSE if it has not.";
    const response = await spawn_sub_agent(query, "boolean");

    log(`World War 3 status check result: ${response}`);

    if (response === "TRUE") {
      log("World War 3 has reportedly started. Initiating emergency protocol to sell all Bitcoin.");

      // Check wallet balances
      const walletAssets = await assets();
      const solBalance = walletAssets.sol.balance;

      if (solBalance < minSolForFees) {
        log(`Insufficient SOL balance for fees. Required: ${minSolForFees} SOL, Available: ${solBalance.toFixed(9)} SOL`);
        return;
      }

      const wbtcToken = walletAssets.tokens.find(t => t.token.address === wbtcAddress);

      if (!wbtcToken || wbtcToken.balance <= 0) {
        log("No WBTC balance found in the wallet. No action needed.");
        return;
      }

      // Sell all WBTC for USDC
      const wbtcBalance = wbtcToken.balance;
      log(`Current WBTC balance: ${wbtcBalance.toFixed(8)} WBTC`);

      try {
        const txSignature = await swap(wbtcAddress, usdcAddress, wbtcBalance, 100); // Using 1% slippage tolerance due to potential high volatility
        log(`Sold all WBTC (${wbtcBalance.toFixed(8)} WBTC) for USDC. Transaction: ${txSignature}`);

        // Check updated balances
        const updatedAssets = await assets();
        const updatedUsdcBalance = updatedAssets.tokens.find(t => t.token.address === usdcAddress)?.balance || 0;
        log(`Updated USDC balance: ${updatedUsdcBalance.toFixed(2)} USDC`);
      } catch (swapError) {
        log(`Failed to swap WBTC for USDC: ${swapError}`);
      }
    } else {
      log("World War 3 has not started. No action needed.");

      // Optionally, log current WBTC balance
      const walletAssets = await assets();
      const wbtcToken = walletAssets.tokens.find(t => t.token.address === wbtcAddress);
      if (wbtcToken) {
        log(`Current WBTC balance: ${wbtcToken.balance.toFixed(8)} WBTC`);
      } else {
        log("No WBTC balance found in the wallet.");
      }
    }
  } catch (error) {
    log(`An error occurred during the World War status check: ${error}`);
  }
}

await checkWorldWarStatus();
```

In this example, the script spawns a sub agent to check if World War 3 has started. The sub agent searches the web and returns a boolean response. If the response is "TRUE", indicating that World War 3 has started, the script retrieves the Bitcoin balance from the wallet and sells all of it for USDC. If the response is "FALSE", the script logs a message indicating that it is holding Bitcoin.

Remember to handle the response appropriately based on the specified `responseType`. Convert the string response to the desired type (boolean, number, or string) in your code.