import type { GenerationType } from "@/lib/types";

export type QualityMode = "fast" | "max";

export interface GenerationSettings {
  negativePrompt: string;
  width: number;
  height: number;
  /** Sadece video için anlamlı */
  frames: number;
  /** fast: SDXL/LTX (saniyeler-dakika) — max: Flux/Wan (dakikalar, en kaliteli) */
  quality: QualityMode;
}

export interface StartArgs {
  prompt: string;
  type: GenerationType;
  /** Webhook destekleyen sağlayıcılar için geri çağrı bağlamı */
  generationId: string;
  /** Preset katmanından gelen üretim ayarları */
  settings: GenerationSettings;
}

export interface StartResult {
  externalId: string;
  model: string;
}

export interface CheckResult {
  status: "processing" | "succeeded" | "failed";
  /** Sunucudan indirilebilir çıktı adresi (yerel ComfyUI URL'i olabilir) */
  outputUrl?: string;
  error?: string;
}

export interface MediaProvider {
  readonly name: string;
  start(args: StartArgs): Promise<StartResult>;
  check(externalId: string, type: GenerationType): Promise<CheckResult>;
}
