import { ed25519 } from "npm:@noble/curves/ed25519";

import base58 from "npm:bs58";
import { Keypair } from "https://esm.sh/@solana/web3.js";
import { loadEnv } from "./env.ts";
const env = await loadEnv();

const triggerAddress = env("TRIGGER_ADDRESS");
const triggerKeypair = Keypair.fromSecretKey(
  base58.decode(env("TRIGGER_ADDRESS_PRIVATE_KEY") as string),
);
export async function signData(
  data: Object,
): Promise<string> {
  const dataBytes = new TextEncoder().encode(JSON.stringify(data));

  const sig = ed25519.sign(dataBytes, triggerKeypair.secretKey.slice(0, 32));

  return base58.encode(sig);
}

export default async function fetcher<T>(
  input: RequestInfo,
  init: RequestInit,
): Promise<T & { reqSuccess: boolean }> {
  try {
    const body = init?.body ? init.body : JSON.stringify({});

    const pathname_and_query = new URL(input as string).pathname +
      (new URL(input as string).search || "");
    const toSign = {
      body,
      method: init?.method || "POST",
      url: pathname_and_query,
      date: new Date().toISOString(),
      nonce: Keypair.generate().publicKey.toBase58(),
    };

    const signature = await signData(toSign);

    const response = await fetch(input, {
      ...init,
      method: init?.method || "POST",
      body: init?.body ? init.body : (
        init?.method === "GET" ? undefined : JSON.stringify({})
      ),
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
        "x-signature": signature,
        "x-date": toSign.date,
        "x-nonce": toSign.nonce,
        "x-trigger-address": triggerAddress as string,
        "x-chain-id": "SOLANA_MAINNET",
      },
    });

    const json = await response.json();

    return {
      ...json,
      reqSuccess: true,
    } as T & { reqSuccess: boolean };
  } catch (e) {
    console.error(e);
    return { reqSuccess: false } as T & { reqSuccess: boolean };
  }
}
