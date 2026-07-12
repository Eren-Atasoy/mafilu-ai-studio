"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";

export interface ProjectFormState {
  error: string | null;
  success: boolean;
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || title.length > 120) {
    return { error: t.common.error, success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: t.common.error, success: false };
  }

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    title,
    description: description || null,
  });

  if (error) {
    return { error: t.common.error, success: false };
  }

  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function deleteProject(projectId: string): Promise<void> {
  if (!projectId) return;

  const supabase = await createClient();
  // RLS yalnızca sahibin silmesine izin verir
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/dashboard");
}
