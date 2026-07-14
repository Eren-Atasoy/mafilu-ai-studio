"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { GenerationType } from "@/lib/types";

export function GenerationForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<GenerationType>("video");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt: prompt.trim(), type }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error ?? t.common.error);
        return;
      }
      setPrompt("");
      router.refresh();
    } catch {
      setError(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">{t.studio.promptLabel}</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.studio.promptPlaceholder}
          rows={3}
          maxLength={2000}
          required
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Label>{t.studio.typeLabel}</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as GenerationType)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">{t.studio.typeVideo}</SelectItem>
              <SelectItem value="image">{t.studio.typeImage}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSubmitting || !prompt.trim()}>
          <Sparkles className="size-4" />
          {isSubmitting ? t.studio.generating : t.studio.generate}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
