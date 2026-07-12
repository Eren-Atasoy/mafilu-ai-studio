"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/(app)/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: t.dashboard.statusDraft,
  editing: t.dashboard.statusEditing,
  published: t.dashboard.statusPublished,
};

const STATUS_VARIANTS: Record<ProjectStatus, "secondary" | "default" | "outline"> = {
  draft: "secondary",
  editing: "default",
  published: "outline",
};

export function ProjectCard({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(t.dashboard.deleteConfirm)) return;
    startTransition(() => deleteProject(project.id));
  }

  return (
    <Card className={isPending ? "opacity-50" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
            <CardTitle className="truncate hover:underline">
              {project.title}
            </CardTitle>
          </Link>
          <Badge variant={STATUS_VARIANTS[project.status]}>
            {STATUS_LABELS[project.status]}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description ?? " "}
        </CardDescription>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(project.created_at).toLocaleDateString("tr-TR")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.common.delete}
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
