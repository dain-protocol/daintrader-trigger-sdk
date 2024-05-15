import { load, loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

export function env(key: string): string {
  if (
    Deno.env.get("DEPLOYED") === "true"
  ) {
    return Deno.env.get(key) as string;
  }
  const env = loadSync();

  return env[key];
}
