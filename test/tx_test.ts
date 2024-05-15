import { assertEquals } from "jsr:@std/assert";

import { assets, price } from "../src/index.ts";

import { sendSol, sendToken, swap } from "../src/transaction.ts";
import { Connection, PublicKey } from "npm:@solana/web3.js";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const env = await load();

Deno.test("sendSol", async () => {
  const tx = await sendSol(
    "3RCEhxXpxr6k3bZ2x4JFwGauPBHgpk4WisahWHLRFT9T",
    0.000001,
  );
  assertEquals(typeof tx, "string");
});

Deno.test("swapToken", async () => {
  const tx = await swap("sol", "usdc", 0.000001, 100);
  assertEquals(typeof tx, "string");
});

Deno.test("sendToken", async () => {
  const tx = await sendToken(
    "3RCEhxXpxr6k3bZ2x4JFwGauPBHgpk4WisahWHLRFT9T",
    "usdc",
    0.000001,
  );
  assertEquals(typeof tx, "string");
});
