import { assertEquals } from "jsr:@std/assert";

import { assets, price } from "../src/data.ts";

import { sendSol, sendToken, swap } from "../src/transaction.ts";

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
