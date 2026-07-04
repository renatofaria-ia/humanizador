export function getAppEnv() {
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabaseClientKey = supabasePublishableKey || supabaseAnonKey;
  const inferredSiteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabasePublishableKey,
    supabaseAnonKey,
    supabaseClientKey,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? inferredSiteUrl,
    ownerEmail: process.env.APP_OWNER_EMAIL ?? "",
    openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  };

  return {
    ...env,
    hasSupabase: Boolean(env.supabaseUrl && env.supabaseClientKey),
    hasOpenAi: Boolean(env.openAiApiKey),
    isConfigured: Boolean(
      env.supabaseUrl && env.supabaseClientKey && env.openAiApiKey && env.ownerEmail,
    ),
  };
}
