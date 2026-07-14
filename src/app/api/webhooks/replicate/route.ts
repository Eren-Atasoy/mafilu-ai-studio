import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeGeneration } from "@/lib/generations/finalize";
import type { Generation } from "@/lib/types";

/**
 * Replicate webhook — üretim tamamlanınca çağrılır (yalnızca prod'da,
 * NEXT_PUBLIC_SITE_URL tanımlıysa). Yerelde polling devreye girer.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const generationId = url.searchParams.get("generationId");
  if (!generationId) {
    return NextResponse.json({ success: false, error: "generationId eksik." }, { status: 400 });
  }

  let prediction: Prediction;
  try {
    prediction = (await request.json()) as Prediction;
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .single();
  const generation = data as Generation | null;

  // Sahtecilik koruması: kayıtla eşleşmeyen prediction id reddedilir
  if (!generation || generation.replicate_prediction_id !== prediction.id) {
    return NextResponse.json({ success: false, error: "Eşleşme yok." }, { status: 404 });
  }

  await finalizeGeneration(generation, prediction);
  return NextResponse.json({ success: true });
}
