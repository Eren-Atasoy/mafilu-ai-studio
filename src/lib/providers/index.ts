import { comfyUIProvider } from "./comfyui";
import { falProvider } from "./fal";
import { replicateProvider } from "./replicate";
import type { MediaProvider } from "./types";

const PROVIDERS: Record<string, MediaProvider> = {
  comfyui: comfyUIProvider,
  fal: falProvider,
  replicate: replicateProvider,
};

/**
 * Aktif üretim sağlayıcısı MEDIA_PROVIDER env değişkeniyle seçilir.
 * Geliştirme: comfyui (varsayılan, 0 TL) — Canlı: fal
 */
export function getProvider(): MediaProvider {
  const name = process.env.MEDIA_PROVIDER ?? "comfyui";
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`Bilinmeyen MEDIA_PROVIDER: ${name}`);
  }
  return provider;
}

export type { CheckResult, MediaProvider } from "./types";
