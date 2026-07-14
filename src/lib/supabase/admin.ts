import { createClient } from "@supabase/supabase-js";

// Service-role istemcisi — RLS'i atlar, YALNIZCA sunucu tarafında
// (webhook/finalize gibi kullanıcı oturumu olmayan bağlamlarda) kullanılır.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
