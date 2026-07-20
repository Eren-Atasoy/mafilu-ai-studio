import { readdir } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/LandingPage";

const SHOWCASE_EXTENSIONS = new Set([".mp4", ".webm", ".jpg", ".jpeg", ".png", ".webp"]);

/** public/showcase içindeki vitrin medyası; klasör yoksa boş liste */
async function loadShowcaseFiles(): Promise<string[]> {
  try {
    const entries = await readdir(path.join(process.cwd(), "public", "showcase"));
    return entries
      .filter((name) => SHOWCASE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort()
      .map((name) => `/showcase/${name}`);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const showcaseFiles = await loadShowcaseFiles();

  return <LandingPage showcaseFiles={showcaseFiles} />;
}
