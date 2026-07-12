import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { t } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export const metadata: Metadata = {
  title: `${t.dashboard.projects} | ${t.common.appName}`,
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
