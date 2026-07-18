/**
 * Prompt zenginleştirme — kullanıcının Türkçe (veya kısa İngilizce) promptunu,
 * görsel/video modellerinin beklediği detaylı İngilizce sinematik prompta çevirir.
 * Modeller Türkçe anlamadığı için bu katman kalite üzerinde en büyük etkiye sahiptir.
 *
 * GEMINI_API_KEY tanımlı değilse veya istek başarısız olursa prompt olduğu gibi
 * geçer (pipeline asla kırılmaz) — hata sunucu logunda görünür.
 */

import type { GenerationType } from "@/lib/types";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_OUTPUT_PROMPT_LENGTH = 1500;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

function buildInstruction(prompt: string, type: GenerationType): string {
  const target =
    type === "video"
      ? "an image-to-video model (Wan 2.1) that animates an existing image. Describe ONLY the motion in 2-4 sentences: how subjects move, camera movement, atmosphere changes. Do not re-describe static scene contents."
      : "a text-to-image model. Describe the scene in one dense paragraph: subject, composition, lighting, style, fine details.";

  return [
    `Rewrite the user's idea as a high-quality English prompt for ${target}`,
    "Rules: output ONLY the prompt text, no quotes, no explanations, no markdown.",
    "Translate Turkish to English. Keep the user's intent exactly; enrich with visual detail, do not invent unrelated elements.",
    `User idea: ${prompt}`,
  ].join("\n");
}

export async function enhancePrompt(
  prompt: string,
  type: GenerationType
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return prompt;

  const model = process.env.PROMPT_ENHANCER_MODEL ?? DEFAULT_MODEL;

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: buildInstruction(prompt, type) }] },
          ],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      console.error(
        `Prompt zenginleştirme başarısız (HTTP ${response.status}) — orijinal prompt kullanılıyor.`
      );
      return prompt;
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      console.error("Prompt zenginleştirme boş yanıt döndü — orijinal prompt kullanılıyor.");
      return prompt;
    }

    return text.slice(0, MAX_OUTPUT_PROMPT_LENGTH);
  } catch (error: unknown) {
    console.error("Prompt zenginleştirme hatası — orijinal prompt kullanılıyor.", error);
    return prompt;
  }
}
