import { promises as fs } from "fs";
import path from "path";
import type {
  CheckResult,
  MediaProvider,
  StartArgs,
  StartResult,
} from "./types";
import type { GenerationSettings } from "./types";
import type { GenerationType } from "@/lib/types";

const WORKFLOW_DIR = path.join(process.cwd(), "comfy", "workflows");
const MAX_SEED = 2 ** 32;

interface ComfyOutputFile {
  filename: string;
  subfolder: string;
  type: string;
}

function getBaseUrl(): string {
  return process.env.COMFYUI_URL ?? "http://127.0.0.1:8188";
}

function workflowFileName(type: GenerationType, settings: GenerationSettings): string {
  // Video her zaman görselden üretilir (image-to-video) — kalite modu görsele özel
  if (type === "video") return "video-from-image.json";
  return settings.quality === "max" ? "image-max.json" : "image.json";
}

async function loadWorkflow(
  type: GenerationType,
  prompt: string,
  settings: GenerationSettings
): Promise<string> {
  const fileName = workflowFileName(type, settings);
  const file = path.join(WORKFLOW_DIR, fileName);
  let template: string;
  try {
    template = await fs.readFile(file, "utf-8");
  } catch {
    throw new Error(
      `Workflow dosyası eksik: comfy/workflows/${fileName} — docs/COMFYUI_SETUP.md rehberine bakın.`
    );
  }

  const escapedPrompt = JSON.stringify(prompt).slice(1, -1);
  const escapedNegative = JSON.stringify(settings.negativePrompt).slice(1, -1);
  const seed = String(Math.floor(Math.random() * MAX_SEED));
  return template
    .replaceAll("__PROMPT__", escapedPrompt)
    .replaceAll("__NEGATIVE__", escapedNegative)
    .replaceAll('"__SEED__"', seed)
    .replaceAll('"__WIDTH__"', String(settings.width))
    .replaceAll('"__HEIGHT__"', String(settings.height))
    .replaceAll('"__FRAMES__"', String(settings.frames));
}

/**
 * Kaynak görseli (Supabase Storage) indirip ComfyUI'nin input klasörüne
 * yükler; workflow'daki LoadImage düğümünün kullanacağı dosya adını döndürür.
 */
async function uploadSourceImage(sourceImageUrl: string): Promise<string> {
  const response = await fetch(sourceImageUrl);
  if (!response.ok) {
    throw new Error(`Kaynak görsel indirilemedi (HTTP ${response.status}).`);
  }

  const blob = await response.blob();
  const extension = sourceImageUrl.toLowerCase().includes(".webp") ? "webp" : "png";
  const fileName = `mafilu-src-${crypto.randomUUID()}.${extension}`;

  const form = new FormData();
  form.append("image", blob, fileName);
  form.append("overwrite", "true");

  const upload = await fetch(`${getBaseUrl()}/upload/image`, {
    method: "POST",
    body: form,
  });
  if (!upload.ok) {
    throw new Error(`ComfyUI görsel yüklemesini reddetti (HTTP ${upload.status}).`);
  }

  const data = (await upload.json()) as { name?: string };
  if (!data.name) {
    throw new Error("ComfyUI yüklenen görselin adını döndürmedi.");
  }
  return data.name;
}

function pickOutputFile(
  outputs: Record<string, Record<string, unknown>>,
  type: GenerationType
): ComfyOutputFile | null {
  const candidates: ComfyOutputFile[] = [];
  for (const nodeOutput of Object.values(outputs)) {
    for (const value of Object.values(nodeOutput)) {
      if (!Array.isArray(value)) continue;
      for (const entry of value) {
        if (
          entry &&
          typeof entry === "object" &&
          typeof (entry as ComfyOutputFile).filename === "string"
        ) {
          candidates.push(entry as ComfyOutputFile);
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  const videoExtensions = [".mp4", ".webm", ".mov"];
  if (type === "video") {
    return (
      candidates.find((c) =>
        videoExtensions.some((ext) => c.filename.toLowerCase().endsWith(ext))
      ) ?? candidates[0]
    );
  }
  return candidates[0];
}

/**
 * Yerel ComfyUI sunucusuna bağlanan sağlayıcı — geliştirme aşamasında
 * sıfır maliyetle üretim. Workflow şablonları comfy/workflows/ altındadır
 * (__PROMPT__ ve __SEED__ yer tutucuları doldurulur).
 */
export const comfyUIProvider: MediaProvider = {
  name: "comfyui",

  async start({ prompt, type, settings, sourceImageUrl }: StartArgs): Promise<StartResult> {
    let workflow = await loadWorkflow(type, prompt, settings);

    if (type === "video") {
      if (!sourceImageUrl) {
        throw new Error(
          "Video üretimi için kaynak görsel gerekli — önce bir görsel üretip 'Videoya Dönüştür'ü kullanın."
        );
      }
      const imageName = await uploadSourceImage(sourceImageUrl);
      workflow = workflow.replaceAll(
        "__IMAGE__",
        JSON.stringify(imageName).slice(1, -1)
      );
    }

    const response = await fetch(`${getBaseUrl()}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"prompt": ${workflow}}`,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `ComfyUI isteği reddetti (HTTP ${response.status}). ComfyUI çalışıyor mu? ${body.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as { prompt_id?: string };
    if (!data.prompt_id) {
      throw new Error("ComfyUI prompt_id döndürmedi.");
    }

    return { externalId: data.prompt_id, model: `comfyui:${type}-workflow` };
  },

  async check(externalId: string, type: GenerationType): Promise<CheckResult> {
    const base = getBaseUrl();
    const response = await fetch(`${base}/history/${externalId}`);
    if (!response.ok) {
      return { status: "processing" };
    }

    const history = (await response.json()) as Record<
      string,
      {
        status?: { status_str?: string; completed?: boolean };
        outputs?: Record<string, Record<string, unknown>>;
      }
    >;
    const entry = history[externalId];
    if (!entry) {
      return { status: "processing" }; // hâlâ kuyrukta
    }

    if (entry.status?.status_str === "error") {
      return { status: "failed", error: "ComfyUI workflow hatası — ComfyUI konsolunu kontrol edin." };
    }

    const file = entry.outputs ? pickOutputFile(entry.outputs, type) : null;
    if (!file) {
      if (entry.status?.completed) {
        return { status: "failed", error: "Workflow çıktı üretmedi (SaveImage/SaveVideo düğümü var mı?)." };
      }
      return { status: "processing" };
    }

    const params = new URLSearchParams({
      filename: file.filename,
      subfolder: file.subfolder ?? "",
      type: file.type ?? "output",
    });
    return { status: "succeeded", outputUrl: `${base}/view?${params}` };
  },
};
