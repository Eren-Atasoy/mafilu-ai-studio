import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GenerationForm } from "@/components/studio/GenerationForm";
import { GenerationGrid } from "@/components/studio/GenerationGrid";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Generation, Project } from "@/lib/types";

export const metadata: Metadata = {
  title: `${t.studio.galleryTitle} | ${t.common.appName}`,
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: projectData } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  const project = projectData as Project | null;

  if (!project) {
    notFound();
  }

  const { data: generationData } = await supabase
    .from("generations")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });
  const generations = (generationData ?? []) as Generation[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label={t.common.back}>
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="truncate text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <GenerationForm projectId={project.id} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.studio.galleryTitle}</h2>
        <GenerationGrid initial={generations} />
      </section>
    </div>
  );
}
