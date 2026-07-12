import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Geçici kök yönlendirmesi — gerçek landing page Sprint 4'te (S4-T5)
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/giris");
}
