import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { getPreset } from "@/lib/presets";
import { enhancePrompt } from "@/lib/prompts/enhance";
import type { GenerationType } from "@/lib/types";

const MAX_PROMPT_LENGTH = 2000;

interface CreateGenerationBody {
  projectId?: string;
  prompt?: string;
  type?: GenerationType;
  presetId?: string;
  quality?: string;
  sourceGenerationId?: string;
  orientation?: string;
}

type Orientation = "landscape" | "portrait" | "square";

/** Kaynak görselin yönelimine uygun, 16'ya bölünebilir video boyutları */
const VIDEO_DIMENSIONS: Record<Orientation, { width: number; height: number }> = {
  landscape: { width: 768, height: 512 },
  portrait: { width: 512, height: 896 },
  square: { width: 640, height: 640 },
};

function resolveOrientation(value: string | undefined): Orientation {
  return value === "portrait" || value === "square" ? value : "landscape";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Oturum gerekli." }, { status: 401 });
  }

  let body: CreateGenerationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const prompt = body.prompt?.trim() ?? "";
  const type: GenerationType = body.type === "image" ? "image" : "video";
  const projectId = body.projectId ?? "";

  if (!projectId || !prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
  }

  // RLS proje sahipliğini garanti eder — başkasının projesi görünmez
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();
  if (!project) {
    return NextResponse.json({ success: false, error: "Proje bulunamadı." }, { status: 404 });
  }

  // Video her zaman bir görselden üretilir (image-to-video)
  let sourceImageUrl: string | undefined;
  if (type === "video") {
    const sourceId = body.sourceGenerationId ?? "";
    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: "Video için önce bir görsel üretip onu seçmelisin." },
        { status: 400 }
      );
    }
    // RLS sahiplik garantisi verir; tip ve durum burada doğrulanır
    const { data: source } = await supabase
      .from("generations")
      .select("id, type, status, output_url")
      .eq("id", sourceId)
      .single();
    if (!source || source.type !== "image" || source.status !== "succeeded" || !source.output_url) {
      return NextResponse.json(
        { success: false, error: "Kaynak görsel bulunamadı veya henüz hazır değil." },
        { status: 400 }
      );
    }
    sourceImageUrl = source.output_url;
  }

  const provider = getProvider();

  const baseRow = {
    project_id: projectId,
    user_id: user.id,
    prompt,
    type,
    model: provider.name,
    status: "pending",
  };

  let { data: generation, error: insertError } = await supabase
    .from("generations")
    .insert({ ...baseRow, source_generation_id: body.sourceGenerationId ?? null })
    .select("*")
    .single();

  // 0003 migration'ı henüz uygulanmadıysa köken bağı olmadan devam et
  if (insertError?.message.includes("source_generation_id")) {
    console.error(
      "generations.source_generation_id kolonu yok — supabase/migrations/0003_source_generation.sql uygulanmalı."
    );
    ({ data: generation, error: insertError } = await supabase
      .from("generations")
      .insert(baseRow)
      .select("*")
      .single());
  }

  if (insertError || !generation) {
    return NextResponse.json({ success: false, error: "Kayıt oluşturulamadı." }, { status: 500 });
  }

  try {
    // Türkçe promptu İngilizce sinematik prompta çevir, sonra preset stiliyle sar
    const preset = getPreset(body.presetId);
    const enhanced = await enhancePrompt(prompt, type);
    const finalPrompt = preset.promptTemplate.replace("{prompt}", enhanced);
    // Video boyutu kaynak görselin yönelimine göre, görsel boyutu presete göre
    const dimensions =
      type === "video"
        ? VIDEO_DIMENSIONS[resolveOrientation(body.orientation)]
        : preset.image;

    const { externalId, model } = await provider.start({
      prompt: finalPrompt,
      type,
      generationId: generation.id,
      sourceImageUrl,
      settings: {
        negativePrompt: preset.negativePrompt,
        width: dimensions.width,
        height: dimensions.height,
        frames: type === "video" ? preset.video.frames : 1,
        quality: body.quality === "max" ? "max" : "fast",
      },
    });

    await supabase
      .from("generations")
      .update({ external_id: externalId, model, status: "processing" })
      .eq("id", generation.id);

    return NextResponse.json({
      success: true,
      data: { id: generation.id, externalId },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Üretim başlatılamadı.";
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: message })
      .eq("id", generation.id);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
