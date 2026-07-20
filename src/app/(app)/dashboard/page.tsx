import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { VhsCassetteCard } from "@/components/dashboard/VhsCassetteCard";
import { t } from "@/lib/i18n";
import type { Generation, Project } from "@/lib/types";
import "@/components/dashboard/dashboard.css";

export const metadata: Metadata = {
  title: `${t.dashboard.projects} | ${t.common.appName}`,
};

interface ShelfMedia {
  coverUrl: string | null;
  previewVideoUrl: string | null;
}

type MediaGeneration = Pick<Generation, "project_id" | "type" | "output_url">;

/** Proje başına son başarılı görseli (kapak) ve videoyu (önizleme) seçer. */
function buildShelfMedia(generations: MediaGeneration[]): Map<string, ShelfMedia> {
  const media = new Map<string, ShelfMedia>();

  for (const gen of generations) {
    const entry = media.get(gen.project_id) ?? {
      coverUrl: null,
      previewVideoUrl: null,
    };
    const next: ShelfMedia = {
      coverUrl:
        entry.coverUrl ?? (gen.type === "image" ? gen.output_url : null),
      previewVideoUrl:
        entry.previewVideoUrl ??
        (gen.type === "video" ? gen.output_url : null),
    };
    media.set(gen.project_id, next);
  }

  return media;
}

async function loadShelfMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[],
): Promise<Map<string, ShelfMedia>> {
  if (projectIds.length === 0) return new Map();

  const { data } = await supabase
    .from("generations")
    .select("project_id, type, output_url")
    .in("project_id", projectIds)
    .eq("status", "succeeded")
    .not("output_url", "is", null)
    .order("created_at", { ascending: false });

  return buildShelfMedia((data ?? []) as MediaGeneration[]);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];
  const shelfMedia = await loadShelfMedia(
    supabase,
    projects.map((project) => project.id),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.dashboard.projects}
        </h1>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <h2 className="text-lg font-semibold">{t.dashboard.emptyTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.dashboard.emptySubtitle}
          </p>
        </div>
      ) : (
        <section className="vhs-shelf" aria-label={t.dashboard.projects}>
          {projects.map((project) => {
            const media = shelfMedia.get(project.id);
            return (
              <VhsCassetteCard
                key={project.id}
                project={project}
                coverUrl={media?.coverUrl ?? null}
                previewVideoUrl={media?.previewVideoUrl ?? null}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
