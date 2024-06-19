import { assertEquals } from "jsr:@std/assert";

import { assets, price, tokenStat } from "../src/data.ts";

Deno.test("price", async () => {
  const btcPrice = await price("btc");
  assertEquals(typeof btcPrice, "number");
  assertEquals(btcPrice > 0, true);
});

Deno.test("token Stats", async () => {
  const solMarketCap = await tokenStat("sol", "mc");
  const solCirculatingSupply = await tokenStat("sol", "circulatingSupply");
  const solTotalSupply = await tokenStat("sol", "supply");

  assertEquals(typeof solTotalSupply, "number");
  assertEquals(solTotalSupply > 0, true);

  assertEquals(typeof solCirculatingSupply, "number");
  assertEquals(solCirculatingSupply > 0, true);

  assertEquals(typeof solMarketCap, "number");
  assertEquals(solMarketCap > 0, true);
});

Deno.test("assets", async () => {
  const walletAssets = await assets(
    "3RCEhxXpxr6k3bZ2x4JFwGauPBHgpk4WisahWHLRFT9T",
  );

  assertEquals(typeof walletAssets.total_in_usd, "number");
  assertEquals(walletAssets.total_in_usd > 0, true);

  assertEquals(Array.isArray(walletAssets.tokens), true);

  const token = walletAssets.tokens[0];

  assertEquals(typeof token.balance, "number");

  assertEquals(typeof token.balanceInUSD, "number");

  assertEquals(typeof token.price_per_token, "number");

  assertEquals(typeof token.symbol, "string");

  assertEquals(typeof token.name, "string");

  assertEquals(typeof token.token.address, "string");

  assertEquals(typeof token.token.decimals, "number");

  assertEquals(typeof token.token.image, "string");

  assertEquals(Array.isArray(walletAssets.nfts), true);

  const nft = walletAssets.nfts[0];

  assertEquals(typeof nft.name, "string");

  assertEquals(typeof nft.symbol, "string");

  assertEquals(typeof nft.mint, "string");

  assertEquals(typeof nft.image, "string");

  const sol = walletAssets.sol;

  assertEquals(typeof sol.balance, "number");

  assertEquals(typeof sol.balanceInUSD, "number");
});
