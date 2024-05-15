import base58 from "npm:bs58";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const env = await load();

export default async function sendTX(serializedTx: Uint8Array): Promise<{
  success: boolean;
  signature?: string;
  error?: string;
}> {
  try {
    const { signature, success, error } = await fetch(
      env.TX_SENDER_URL as string,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx: base58.encode(serializedTx),
        }),
      },
    ).then((res) => res.json());

    console.log("Sent transaction", signature, success, error);

    return { success, signature, error };
  } catch (error) {
    console.log("Error sending transaction", error);
    return { success: false, error: "Error sending transaction to tx spammer" };
  }
}
