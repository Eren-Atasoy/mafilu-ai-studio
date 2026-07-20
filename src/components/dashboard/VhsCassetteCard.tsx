"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: t.dashboard.statusDraft,
  editing: t.dashboard.statusEditing,
  published: t.dashboard.statusPublished,
};

export interface VhsCassetteCardProps {
  project: Project;
  /** Kılıf kapağı: projenin son başarılı görsel üretimi */
  coverUrl: string | null;
  /** Mod 3'te hover önizlemesi: son başarılı video üretimi */
  previewVideoUrl: string | null;
}

export function VhsCassetteCard({
  project,
  coverUrl,
  previewVideoUrl,
}: VhsCassetteCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(t.dashboard.deleteConfirm)) return;
    startTransition(() => deleteProject(project.id));
  }

  return (
    <article className="vhs-card" data-pending={isPending || undefined}>
      <Link
        href={`/projects/${project.id}`}
        className="vhs-sleeve"
        aria-label={project.title}
      >
        <div className="vhs-cassette" aria-hidden="true">
          {previewVideoUrl ? (
            <video
              className="vhs-cassette-preview"
              src={previewVideoUrl}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : null}
          <span className="vhs-cassette-spine">{project.title}</span>
        </div>

        <div className="vhs-sleeve-face">
          {coverUrl ? (
            <img
              className="vhs-cover"
              src={coverUrl}
              alt=""
              width={416}
              height={560}
              loading="lazy"
            />
          ) : (
            <div className="vhs-cover-empty">
              <span className="text-xs text-muted-foreground">
                {t.dashboard.emptyCassette}
              </span>
            </div>
          )}

          <div className="vhs-label">
            <span className="vhs-label-title text-sm">{project.title}</span>
            <div className="vhs-label-meta text-muted-foreground">
              <span>{STATUS_LABELS[project.status]}</span>
              <time dateTime={project.created_at}>
                {new Date(project.created_at).toLocaleDateString("tr-TR")}
              </time>
            </div>
          </div>
        </div>
      </Link>

      <Button
        className="vhs-delete"
        variant="ghost"
        size="icon"
        aria-label={t.common.delete}
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </article>
  );
}
