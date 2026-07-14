import type { Prediction } from "replicate";
import { getReplicate, MODELS } from "@/lib/replicate";
import type {
  CheckResult,
  MediaProvider,
  StartArgs,
  StartResult,
} from "./types";
import type { GenerationType } from "@/lib/types";

function extractOutputUrl(output: Prediction["output"]): string | undefined {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  return undefined;
}

/** Replicate prediction'ını sağlayıcı-bağımsız sonuca çevirir (webhook da kullanır). */
export function predictionToResult(prediction: Prediction): CheckResult {
  if (prediction.status === "succeeded") {
    const outputUrl = extractOutputUrl(prediction.output);
    return outputUrl
      ? { status: "succeeded", outputUrl }
      : { status: "failed", error: "Model çıktı üretmedi." };
  }
  if (prediction.status === "failed" || prediction.status === "canceled") {
    return {
      status: "failed",
      error: String(prediction.error ?? "Üretim başarısız oldu."),
    };
  }
  return { status: "processing" };
}

export const replicateProvider: MediaProvider = {
  name: "replicate",

  async start({ prompt, type, generationId }: StartArgs): Promise<StartResult> {
    const replicate = getReplicate();
    const model = MODELS[type];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const prediction = await replicate.predictions.create({
      model,
      input: { prompt },
      ...(siteUrl
        ? {
            webhook: `${siteUrl}/api/webhooks/replicate?generationId=${generationId}`,
            webhook_events_filter: ["completed" as const],
          }
        : {}),
    });

    return { externalId: prediction.id, model: `replicate:${model}` };
  },

  async check(externalId: string, _type: GenerationType): Promise<CheckResult> {
    const replicate = getReplicate();
    const prediction = await replicate.predictions.get(externalId);
    return predictionToResult(prediction);
  },
};
