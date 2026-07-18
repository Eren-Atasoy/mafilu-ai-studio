"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { Generation } from "@/lib/types";

interface ImageToVideoDialogProps {
  source: Generation;
}

/**
 * Başarılı bir görsel üretimini videoya çevirir — kullanıcı hareket
 * açıklaması girer, video kaynak görselin ilk karesinden üretilir.
 */
export function ImageToVideoDialog({ source }: ImageToVideoDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [motionPrompt, setMotionPrompt] = useState("");
  const [orientation, setOrientation] = useState("landscape");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth === naturalHeight) setOrientation("square");
    else setOrientation(naturalWidth > naturalHeight ? "landscape" : "portrait");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!motionPrompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: source.project_id,
          prompt: motionPrompt.trim(),
          type: "video",
          sourceGenerationId: source.id,
          orientation,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error ?? t.common.error);
        return;
      }
      setIsOpen(false);
      setMotionPrompt("");
      router.refresh();
    } catch {
      setError(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Clapperboard className="size-4" />
          {t.studio.toVideo}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t.studio.toVideoTitle}</DialogTitle>
            <DialogDescription>{t.studio.toVideoDescription}</DialogDescription>
          </DialogHeader>
          {source.output_url && (
            /* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage dış kaynağı */
            <img
              src={source.output_url}
              alt={source.prompt}
              onLoad={handleImageLoad}
              className="max-h-48 w-full rounded-md object-cover"
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="motion-prompt">{t.studio.motionPromptLabel}</Label>
            <Textarea
              id="motion-prompt"
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              placeholder={t.studio.motionPromptPlaceholder}
              rows={3}
              maxLength={2000}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !motionPrompt.trim()}>
              {isSubmitting ? t.studio.generating : t.studio.toVideoConfirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
