import Replicate from "replicate";
import type { GenerationType } from "@/lib/types";

// Hızlı ve ucuz modeller — MVP stratejisi gereği premium modeller scope dışı.
export const MODELS: Record<GenerationType, `${string}/${string}`> = {
  video: "wan-video/wan-2.2-t2v-fast",
  image: "black-forest-labs/flux-schnell",
};

let client: Replicate | null = null;

export function getReplicate(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }
  if (!client) {
    client = new Replicate({ auth: token });
  }
  return client;
}
