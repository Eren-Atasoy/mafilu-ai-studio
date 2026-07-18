import type {
  CheckResult,
  MediaProvider,
  StartArgs,
  StartResult,
} from "./types";
import type { GenerationType } from "@/lib/types";

// Canlı ortam sağlayıcısı — modeller env ile seçilir, ComfyUI workflow'ları
// fal.ai üzerinde de çalıştırılabilir (fal-ai/comfy uçları).
const QUEUE_BASE = "https://queue.fal.run";
const EXTERNAL_ID_SEPARATOR = "::";

function getApiKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY not configured");
  }
  return key;
}

function getModel(type: GenerationType): string {
  const model =
    type === "video"
      ? process.env.FAL_VIDEO_MODEL
      : process.env.FAL_IMAGE_MODEL;
  if (!model) {
    throw new Error(
      `FAL_${type === "video" ? "VIDEO" : "IMAGE"}_MODEL not configured`
    );
  }
  return model;
}

interface FalQueueStatus {
  status?: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
}

interface FalResultPayload {
  video?: { url?: string };
  images?: Array<{ url?: string }>;
}

function extractFalOutput(payload: FalResultPayload): string | undefined {
  return payload.video?.url ?? payload.images?.[0]?.url;
}

export const falProvider: MediaProvider = {
  name: "fal",

  async start({ prompt, type, sourceImageUrl }: StartArgs): Promise<StartResult> {
    const model = getModel(type);
    // Video görselden üretilir — fal'ın image-to-video modelleri image_url bekler
    const payload =
      type === "video" && sourceImageUrl
        ? { prompt, image_url: sourceImageUrl }
        : { prompt };
    const response = await fetch(`${QUEUE_BASE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`fal.ai isteği reddetti (HTTP ${response.status}). ${body.slice(0, 200)}`);
    }

    const data = (await response.json()) as { request_id?: string };
    if (!data.request_id) {
      throw new Error("fal.ai request_id döndürmedi.");
    }

    return {
      externalId: `${model}${EXTERNAL_ID_SEPARATOR}${data.request_id}`,
      model: `fal:${model}`,
    };
  },

  async check(externalId: string, _type: GenerationType): Promise<CheckResult> {
    const [model, requestId] = externalId.split(EXTERNAL_ID_SEPARATOR);
    if (!model || !requestId) {
      return { status: "failed", error: "Geçersiz fal.ai referansı." };
    }

    const headers = { Authorization: `Key ${getApiKey()}` };
    const statusResponse = await fetch(
      `${QUEUE_BASE}/${model}/requests/${requestId}/status`,
      { headers }
    );
    if (!statusResponse.ok) {
      return { status: "failed", error: `fal.ai durum hatası (HTTP ${statusResponse.status}).` };
    }

    const statusData = (await statusResponse.json()) as FalQueueStatus;
    if (statusData.status !== "COMPLETED") {
      return { status: "processing" };
    }

    const resultResponse = await fetch(
      `${QUEUE_BASE}/${model}/requests/${requestId}`,
      { headers }
    );
    if (!resultResponse.ok) {
      return { status: "failed", error: "fal.ai sonucu alınamadı." };
    }

    const outputUrl = extractFalOutput(
      (await resultResponse.json()) as FalResultPayload
    );
    return outputUrl
      ? { status: "succeeded", outputUrl }
      : { status: "failed", error: "fal.ai çıktı üretmedi." };
  },
};
