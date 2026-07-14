import type { Prediction } from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { OUTPUT_EXTENSIONS } from "@/lib/replicate";
import type { Generation, GenerationType } from "@/lib/types";

const BUCKET = "generations";

function extractOutputUrl(output: Prediction["output"]): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  return null;
}

/**
 * Replicate prediction'ının nihai durumunu generations tablosuna işler.
 * Başarılıysa çıktıyı Supabase Storage'a kopyalar ve kalıcı URL yazar.
 * Hem webhook hem polling yolundan çağrılır — idempotenttir.
 */
export async function finalizeGeneration(
  generation: Pick<Generation, "id" | "user_id" | "type" | "status">,
  prediction: Prediction
): Promise<void> {
  const supabase = createAdminClient();

  if (prediction.status === "failed" || prediction.status === "canceled") {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: String(prediction.error ?? "Üretim başarısız oldu."),
      })
      .eq("id", generation.id)
      .eq("status", "processing");
    return;
  }

  if (prediction.status !== "succeeded") {
    return; // hâlâ çalışıyor
  }

  if (generation.status === "succeeded") {
    return; // daha önce finalize edilmiş
  }

  const sourceUrl = extractOutputUrl(prediction.output);
  if (!sourceUrl) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "Model çıktı üretmedi." })
      .eq("id", generation.id);
    return;
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "Çıktı indirilemedi." })
      .eq("id", generation.id);
    return;
  }

  const extension = OUTPUT_EXTENSIONS[generation.type as GenerationType];
  const path = `${generation.user_id}/${generation.id}.${extension}`;
  const contentType =
    response.headers.get("content-type") ??
    (generation.type === "video" ? "video/mp4" : "image/webp");

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, await response.arrayBuffer(), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "Çıktı depolanamadı." })
      .eq("id", generation.id);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await supabase
    .from("generations")
    .update({ status: "succeeded", output_url: publicUrl, error_message: null })
    .eq("id", generation.id);
}
