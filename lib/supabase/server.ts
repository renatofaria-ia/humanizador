import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getAppEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const env = getAppEnv();

  if (!env.hasSupabase) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseClientKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components may be read-only; actions and handlers still set cookies.
          }
        });
      },
    },
  });
}
