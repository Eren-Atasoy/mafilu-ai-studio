import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckResult } from "@/lib/providers/types";
import type { Generation, GenerationType } from "@/lib/types";

const BUCKET = "generations";

const DEFAULT_EXTENSIONS: Record<GenerationType, string> = {
  video: "mp4",
  image: "png",
};

function resolveExtension(url: string, type: GenerationType): string {
  const match = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(new URL(url).pathname);
  if (match) return match[1].toLowerCase();
  // ComfyUI /view?filename=x.png gibi query tabanlı adresler
  const filename = new URL(url).searchParams.get("filename");
  const queryMatch = filename ? /\.([a-z0-9]{2,5})$/i.exec(filename) : null;
  return queryMatch ? queryMatch[1].toLowerCase() : DEFAULT_EXTENSIONS[type];
}

/**
 * Sağlayıcı sonucunu generations tablosuna işler. Başarılıysa çıktıyı
 * Supabase Storage'a kopyalar ve kalıcı URL yazar. Webhook ve polling
 * yollarının ikisinden de çağrılır — idempotenttir.
 */
export async function finalizeGeneration(
  generation: Pick<Generation, "id" | "user_id" | "type" | "status">,
  result: CheckResult
): Promise<void> {
  const supabase = createAdminClient();

  if (result.status === "failed") {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: result.error ?? "Üretim başarısız oldu.",
      })
      .eq("id", generation.id)
      .in("status", ["pending", "processing"]);
    return;
  }

  if (result.status !== "succeeded" || !result.outputUrl) {
    return; // hâlâ çalışıyor
  }

  if (generation.status === "succeeded") {
    return; // daha önce finalize edilmiş
  }

  const response = await fetch(result.outputUrl);
  if (!response.ok) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "Çıktı indirilemedi." })
      .eq("id", generation.id);
    return;
  }

  const extension = resolveExtension(result.outputUrl, generation.type as GenerationType);
  const path = `${generation.user_id}/${generation.id}.${extension}`;
  const contentType =
    response.headers.get("content-type") ??
    (generation.type === "video" ? "video/mp4" : "image/png");

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
