import base58 from "npm:bs58";
import { loadEnv } from "./env.ts";
import fetcher from "./signFetch.ts";

export default async function sendTX(serializedTx: Uint8Array): Promise<{
  success: boolean;
  signature?: string;
  error?: string;
}> {
  const env = await loadEnv();
  try {
    const { signature, success, error } = await fetcher<{
      signature: string;
      success: boolean;
      error?: string;
    }>(
      env("TX_SENDER_URL") as string,
      {
        body: JSON.stringify({
          tx: base58.encode(serializedTx),
        }),
      },
    );
    console.log("Sent transaction", signature, success, error);

    return { success, signature, error };
  } catch (error) {
    console.log("Error sending transaction", error);
    return { success: false, error: "Error sending transaction to tx spammer" };
  }
}
