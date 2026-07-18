/**
 * Kategori presetleri — her kategori kendi stil şablonunu, negative promptunu
 * ve çözünürlük/kare ayarlarını tanımlar. Workflow dosyaları tek kalır;
 * bu değerler yer tutucular üzerinden doldurulur. Canlıda (fal.ai) aynı
 * presetler aynen kullanılır, kod değişmez.
 */

export interface PresetDimensions {
  width: number;
  height: number;
}

export interface GenerationPreset {
  id: string;
  /** Arayüzde gösterilen Türkçe ad */
  label: string;
  /** {prompt} yer tutucusu kullanıcının (zenginleştirilmiş) promptuyla değiştirilir */
  promptTemplate: string;
  negativePrompt: string;
  image: PresetDimensions;
  video: PresetDimensions & { frames: number };
}

const BASE_NEGATIVE =
  "low quality, worst quality, deformed, distorted, watermark, text, logo";

export const GENERATION_PRESETS: readonly GenerationPreset[] = [
  {
    id: "genel",
    label: "Genel",
    promptTemplate: "{prompt}",
    negativePrompt: BASE_NEGATIVE,
    image: { width: 1024, height: 1024 },
    video: { width: 768, height: 512, frames: 97 },
  },
  {
    id: "cizgi-film",
    label: "Çizgi Film",
    promptTemplate:
      "2D cartoon animation style, vibrant saturated colors, clean bold outlines, expressive characters, playful composition. {prompt}",
    negativePrompt: `${BASE_NEGATIVE}, photorealistic, photograph, realistic skin`,
    image: { width: 1024, height: 1024 },
    video: { width: 768, height: 512, frames: 97 },
  },
  {
    id: "dikey-shorts",
    label: "Dikey Shorts",
    promptTemplate:
      "vertical format social media video, eye-catching dynamic motion, trendy vibrant look, engaging composition centered for mobile viewing. {prompt}",
    negativePrompt: BASE_NEGATIVE,
    image: { width: 768, height: 1344 },
    video: { width: 512, height: 896, frames: 97 },
  },
  {
    id: "urun-tanitim",
    label: "Ürün Tanıtımı",
    promptTemplate:
      "professional product showcase, studio lighting, clean seamless background, sharp macro detail, commercial photography style, premium feel. {prompt}",
    negativePrompt: `${BASE_NEGATIVE}, cluttered background, busy scene`,
    image: { width: 1024, height: 1024 },
    video: { width: 768, height: 512, frames: 97 },
  },
  {
    id: "marka-reklam",
    label: "Marka Reklamı",
    promptTemplate:
      "cinematic brand commercial, dramatic lighting, high production value, shallow depth of field, film grain, emotional storytelling atmosphere. {prompt}",
    negativePrompt: BASE_NEGATIVE,
    image: { width: 1344, height: 768 },
    video: { width: 768, height: 512, frames: 97 },
  },
] as const;

export const DEFAULT_PRESET_ID = "genel";

export function getPreset(id: string | undefined): GenerationPreset {
  return (
    GENERATION_PRESETS.find((preset) => preset.id === id) ??
    GENERATION_PRESETS[0]
  );
}
