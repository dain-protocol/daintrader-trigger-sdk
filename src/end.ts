import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

import { assets } from "./index.ts";
import { sendSol, sendToken } from "./transaction.ts";
import fetcher from "./util/signFetch.ts";
const env = await load();

const address = env.OWNER_ADDRESS;
const triggerAddress = env.TRIGGER_ADDRESS;

export async function end() {
  console.log("ending and redepositing into main account");

  // get all assets and redeposit into main account

  const allAssets = await assets(
    address,
  );

  for (const token of allAssets.tokens) {
    console.log(`Redepositing ${token.balance} ${token.symbol}`);

    // send all tokens back to main account

    await sendToken(
      triggerAddress,
      token.token.address,
      token.balance,
    );
  }

  // send the remaining SOL back to main account

  console.log(`Redepositing ${allAssets.sol.balance} SOL`);

  await sendSol(
    triggerAddress,
    allAssets.sol.balance - 0.000005,
  );

  // end the trigger agent

  const url = `${env.API_URL}/autonomy-sdk-api/end`;
  const {
    success,
  } = await fetcher<{
    success: boolean;
  }>(url, {
    method: "GET",
  });

  if (!success) throw new Error("Failed to end trigger agent");

  console.log("end complete");
}
