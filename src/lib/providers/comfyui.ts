import { promises as fs } from "fs";
import path from "path";
import type {
  CheckResult,
  MediaProvider,
  StartArgs,
  StartResult,
} from "./types";
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

async function loadWorkflow(type: GenerationType, prompt: string): Promise<string> {
  const file = path.join(WORKFLOW_DIR, `${type}.json`);
  let template: string;
  try {
    template = await fs.readFile(file, "utf-8");
  } catch {
    throw new Error(
      type === "video"
        ? "Video workflow'u kurulu değil. docs/COMFYUI_SETUP.md rehberindeki LTX-Video adımlarını izleyip comfy/workflows/video.json dosyasını oluşturun."
        : "Görsel workflow dosyası eksik: comfy/workflows/image.json"
    );
  }

  const escapedPrompt = JSON.stringify(prompt).slice(1, -1);
  const seed = String(Math.floor(Math.random() * MAX_SEED));
  return template
    .replaceAll("__PROMPT__", escapedPrompt)
    .replaceAll('"__SEED__"', seed);
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

  async start({ prompt, type }: StartArgs): Promise<StartResult> {
    const workflow = await loadWorkflow(type, prompt);

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
