import {
  Connection,
  Keypair,
  VersionedTransaction,
} from "npm:@solana/web3.js@latest";
import base58 from "npm:bs58";
import sendTX from "./util/sendTx.ts";
import fetcher from "./util/signFetch.ts";
import { loadEnv } from "./util/env.ts";

const env = await loadEnv();

const triggerAddress = env("TRIGGER_ADDRESS");
const connection = new Connection(env("RPC_URL") as string);
const triggerKeypair = Keypair.fromSecretKey(
  base58.decode(env("TRIGGER_ADDRESS_PRIVATE_KEY") as string),
);

export async function swap(
  fromToken: string,
  toToken: string,
  amount: number,
  slippageBps: number,
): Promise<string | undefined> {
  const tx = await createSwapTx(fromToken, toToken, amount, slippageBps);
  return execute(tx);
}

async function createSwapTx(
  fromToken: string,
  toToken: string,
  amount: number,
  slippageBps: number,
): Promise<string> {
  const url = `${env("API_URL")}/autonomy-sdk-api/tx/swap`;
  const {
    success,
    serializedTx,
  } = await fetcher<{
    success: boolean;
    serializedTx: string;
  }>(url, {
    body: JSON.stringify({
      fromToken,
      toToken,
      amount,
      slippageBps,
      triggerAddress,
    }),
  });

  if (!success) throw new Error("Failed to fetch tx");

  return serializedTx;
}

export async function sendToken(
  to: string,
  token: string,
  amount: number,
): Promise<string | undefined> {
  const tx = await createSendTokenTx(to, token, amount);
  return execute(tx);
}

async function createSendTokenTx(
  to: string,
  token: string,
  amount: number,
): Promise<string> {
  const url = `${env("API_URL")}/autonomy-sdk-api/tx/sendToken`;

  const {
    success,
    serializedTx,
  } = await fetcher<{
    success: boolean;
    serializedTx: string;
  }>(url, {
    body: JSON.stringify({
      to,
      token,
      amount,
      triggerAddress,
    }),
  });

  if (!success) throw new Error("Failed to fetch tx");

  return serializedTx;
}

export async function sendSol(
  to: string,
  amount: number,
): Promise<string | undefined> {
  const tx = await createSendSolTx(to, amount);
  return execute(tx);
}

async function createSendSolTx(to: string, amount: number): Promise<string> {
  const url = `${env("API_URL")}/autonomy-sdk-api/tx/sendSol`;
  const {
    serializedTx,
    success,
  } = await fetcher<{
    serializedTx: string;
    success: boolean;
  }>(url, {
    body: JSON.stringify({
      to,
      amount,
      triggerAddress,
    }),
  });

  if (!success) throw new Error("Failed to fetch tx");

  return serializedTx;
}

async function execute(tx: string) {
  const vTx = VersionedTransaction.deserialize(
    Uint8Array.from(atob(tx), (c) => c.charCodeAt(0)),
  );
  vTx.message.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  vTx.sign([triggerKeypair]);

  const sent = await sendTX(
    vTx.serialize(),
  );

  if (!sent.success) {
    throw new Error("Failed to send transaction" + sent.error);
  }

  return sent.signature;
}
