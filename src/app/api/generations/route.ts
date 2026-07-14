import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import type { GenerationType } from "@/lib/types";

const MAX_PROMPT_LENGTH = 2000;

interface CreateGenerationBody {
  projectId?: string;
  prompt?: string;
  type?: GenerationType;
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

  const provider = getProvider();

  const { data: generation, error: insertError } = await supabase
    .from("generations")
    .insert({
      project_id: projectId,
      user_id: user.id,
      prompt,
      type,
      model: provider.name,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError || !generation) {
    return NextResponse.json({ success: false, error: "Kayıt oluşturulamadı." }, { status: 500 });
  }

  try {
    const { externalId, model } = await provider.start({
      prompt,
      type,
      generationId: generation.id,
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
