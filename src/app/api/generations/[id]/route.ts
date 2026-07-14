import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReplicate } from "@/lib/replicate";
import { finalizeGeneration } from "@/lib/generations/finalize";
import type { Generation } from "@/lib/types";

/**
 * Üretim durumu — beklemedeyse Replicate'ten taze durumu çekip ilerletir.
 * Webhook'un ulaşamadığı yerel geliştirmede de akışı çalıştırır (polling).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Oturum gerekli." }, { status: 401 });
  }

  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();
  const generation = data as Generation | null;

  if (!generation) {
    return NextResponse.json({ success: false, error: "Bulunamadı." }, { status: 404 });
  }

  const isRunning =
    generation.status === "processing" || generation.status === "pending";

  if (isRunning && generation.replicate_prediction_id) {
    try {
      const replicate = getReplicate();
      const prediction = await replicate.predictions.get(
        generation.replicate_prediction_id
      );
      await finalizeGeneration(generation, prediction);
    } catch {
      // Replicate geçici hatası — mevcut durumu döndürmeye devam et
    }

    const { data: refreshed } = await supabase
      .from("generations")
      .select("*")
      .eq("id", id)
      .single();
    return NextResponse.json({ success: true, data: refreshed ?? generation });
  }

  return NextResponse.json({ success: true, data: generation });
}
