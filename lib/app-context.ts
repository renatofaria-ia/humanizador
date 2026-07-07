import "server-only";

import { getAppEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppAccess } from "@/lib/types";

export async function getAppAccess(): Promise<AppAccess> {
  const env = getAppEnv();

  if (!env.hasSupabase) {
    return { mode: "setup" };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { mode: "setup" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { mode: "login-required" };
  }

  return {
    mode: "ready",
    user: {
      id: user.id,
      email: user.email ?? "",
    },
  };
}

export async function requireReadyUser() {
  const access = await getAppAccess();

  if (access.mode !== "ready") {
    throw new Error(
      access.mode === "login-required"
        ? "Login obrigatorio."
        : "Supabase nao configurado.",
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Cliente do Supabase indisponivel.");
  }

  return {
    env: getAppEnv(),
    user: access.user,
    supabase,
  };
}
