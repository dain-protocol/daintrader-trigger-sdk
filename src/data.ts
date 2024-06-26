import { loadEnv } from "./util/env.ts";
import fetcher from "./util/signFetch.ts";
const env = await loadEnv();
const triggerAddress = env("TRIGGER_ADDRESS");

export async function price(token: string): Promise<number> {
  const url = `${
    env("API_URL")
  }/autonomy-sdk-api/solana/price?token=${token}&triggerAddress=${triggerAddress}`;
  const response = await fetcher<{
    price: number;
    success: boolean;
  }>(url, {
    method: "GET",
  });

  if (!response.success) throw new Error("Failed to fetch price");
  return response.price;
}
export async function tokenStat(
  token: string,
  statistic: string,
): Promise<number> {
  const url = `${
    env("API_URL")
  }/autonomy-sdk-api/solana/token-stat?token=${token}&triggerAddress=${triggerAddress}&stat=${statistic}`;
  const response = await fetcher<{
    statistic: number;
    success: boolean;
  }>(url, {
    method: "GET",
  });

  if (!response.success) throw new Error("Failed to fetch statistic");
  return response.statistic;
}

export interface WalletAssets {
  tokens: FungibleTokenBalanceExpanded[];
  nfts: NFTBalance[];
  sol: SolBalance;
  total_in_usd: number;
}
export interface NFTBalance {
  name: string;
  symbol: string;
  mint: string;
  image: string;
}
export interface FungibleTokenBalanceExpanded {
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

export interface FungibleTokenBalance {
  balance: number;
  balanceInUSD: number;
  symbol: string;
  name: string;
}

export interface SolBalance {
  balance: number;
  balanceInUSD: number;
}

export async function assets(address?: string): Promise<WalletAssets> {
  if (!address) address = env("TRIGGER_ADDRESS") as string;
  const url = `${
    env("API_URL")
  }/autonomy-sdk-api/solana/assets?address=${address}`;
  const response = await fetcher<{
    success: boolean;
    assets: WalletAssets;
  }>(url, {
    method: "GET",
  });
  if (!response.success) throw new Error("Failed to fetch assets");
  return response.assets;
}
