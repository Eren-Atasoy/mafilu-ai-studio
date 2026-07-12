"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";

export interface AuthFormState {
  error: string | null;
}

function parseCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@") || password.length < 6) {
    return null;
  }
  return { email, password };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);
  if (!credentials) {
    return { error: t.auth.invalidCredentials };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: t.auth.invalidCredentials };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!credentials || !fullName) {
    return { error: t.common.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...credentials,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/giris");
}
