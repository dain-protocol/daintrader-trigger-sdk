import { assets } from "./data.ts";
import { sendSol, sendToken } from "./transaction.ts";
import fetcher from "./util/signFetch.ts";
import { loadEnv } from "./util/env.ts";

const env = await loadEnv();
const address = env("TRIGGER_ADDRESS") as string;

const ownerAddress = env("OWNER_ADDRESS") as string;

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
      ownerAddress,
      token.token.address,
      token.balance,
    );
  }

  // send the remaining SOL back to main account

  console.log(`Redepositing ${allAssets.sol.balance} SOL`);

  await sendSol(
    ownerAddress,
    allAssets.sol.balance - 0.000005,
  );

  // end the trigger agent

  const url = `${env("API_URL")}/autonomy-sdk-api/common/end`;
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
