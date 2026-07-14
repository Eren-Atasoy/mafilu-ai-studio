"use client";

import { useEffect, useState } from "react";
import { Loader2, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { Generation, GenerationStatus } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

const STATUS_LABELS: Record<GenerationStatus, string> = {
  pending: t.studio.statusPending,
  processing: t.studio.statusProcessing,
  succeeded: t.studio.statusSucceeded,
  failed: t.studio.statusFailed,
};

function isRunning(status: GenerationStatus): boolean {
  return status === "pending" || status === "processing";
}

export function GenerationGrid({ initial }: { initial: Generation[] }) {
  const [generations, setGenerations] = useState<Generation[]>(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  // Sunucu verisi değişince state'i render sırasında senkronla (effect'siz)
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setGenerations(initial);
  }

  useEffect(() => {
    const runningIds = generations.filter((g) => isRunning(g.status)).map((g) => g.id);
    if (runningIds.length === 0) return;

    const timer = setInterval(async () => {
      const updates = await Promise.all(
        runningIds.map(async (id) => {
          try {
            const response = await fetch(`/api/generations/${id}`);
            const result = await response.json();
            return result.success ? (result.data as Generation) : null;
          } catch {
            return null;
          }
        })
      );

      const byId = new Map(
        updates.filter((g): g is Generation => g !== null).map((g) => [g.id, g])
      );
      if (byId.size > 0) {
        setGenerations((current) =>
          current.map((g) => byId.get(g.id) ?? g)
        );
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [generations]);

  if (generations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        {t.studio.galleryEmpty}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {generations.map((generation) => (
        <GenerationCard key={generation.id} generation={generation} />
      ))}
    </div>
  );
}

function GenerationCard({ generation }: { generation: Generation }) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="relative aspect-video bg-muted">
        {generation.status === "succeeded" && generation.output_url ? (
          generation.type === "video" ? (
            <video
              src={generation.output_url}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage dış kaynağı */
            <img
              src={generation.output_url}
              alt={generation.prompt}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            {isRunning(generation.status) ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <ImageOff className="size-6 text-destructive" />
            )}
          </div>
        )}
        <Badge
          variant={generation.status === "failed" ? "destructive" : "secondary"}
          className="absolute top-2 right-2"
        >
          {STATUS_LABELS[generation.status]}
        </Badge>
      </div>
      <CardContent className="pb-4">
        <p className="line-clamp-2 text-sm text-muted-foreground" title={generation.prompt}>
          {generation.prompt}
        </p>
        {generation.status === "failed" && generation.error_message && (
          <p className="mt-1 line-clamp-2 text-xs text-destructive">
            {generation.error_message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
