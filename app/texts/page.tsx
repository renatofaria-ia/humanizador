import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { TextBundleCard } from "@/components/text-bundle-card";
import { TextViewTabs } from "@/components/text-view-tabs";
import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles, listTexts } from "@/lib/data";
import { demoProfiles, demoTextBundles } from "@/lib/demo-data";
import type { TextSummary } from "@/lib/types";

type TextsPageSearchParams = {
  q?: string;
  status?: string;
  channel?: string;
};

type TextBundle = {
  id: string;
  title: string;
  originalText: string;
  profileName: string;
  createdAt: string;
  updatedAt: string;
  outputs: TextSummary[];
};

const CHANNEL_ORDER = new Map(CHANNEL_PRESETS.map((preset, index) => [preset.key, index]));

function groupTextBundles(texts: TextSummary[], profileNamesById: Map<string, string>) {
  const sourceBundleCounts = new Map<string, number>();

  texts.forEach((text) => {
    const sourceBundleId = text.source_bundle_id || text.id;
    sourceBundleCounts.set(sourceBundleId, (sourceBundleCounts.get(sourceBundleId) ?? 0) + 1);
  });

  const bundles = new Map<string, TextBundle>();

  texts.forEach((text) => {
    const sourceBundleId = text.source_bundle_id || text.id;
    const bundleId =
      (sourceBundleCounts.get(sourceBundleId) ?? 0) > 1
        ? sourceBundleId
        : JSON.stringify([text.profile_id, text.title, text.original_text]);
    const existing = bundles.get(bundleId);
    const profileName = profileNamesById.get(text.profile_id) ?? "Sem perfil";

    if (!existing) {
      bundles.set(bundleId, {
        id: bundleId,
        title: text.title,
        originalText: text.original_text,
        profileName,
        createdAt: text.created_at,
        updatedAt: text.updated_at,
        outputs: [text],
      });
      return;
    }

    existing.outputs.push(text);

    if (new Date(text.created_at).getTime() < new Date(existing.createdAt).getTime()) {
      existing.createdAt = text.created_at;
    }

    if (new Date(text.updated_at).getTime() > new Date(existing.updatedAt).getTime()) {
      existing.updatedAt = text.updated_at;
    }
  });

  return Array.from(bundles.values())
    .map((bundle) => ({
      ...bundle,
      outputs: [...bundle.outputs].sort((left, right) => {
        const channelDiff =
          (CHANNEL_ORDER.get(left.channel_key) ?? 999) - (CHANNEL_ORDER.get(right.channel_key) ?? 999);

        if (channelDiff !== 0) {
          return channelDiff;
        }

        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
      }),
    }))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export default async function TextsPage({
  searchParams,
}: {
  searchParams: Promise<TextsPageSearchParams>;
}) {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const params = await searchParams;
  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();
  const texts = isDemo ? demoTextBundles : await listTexts();
  const profileNamesById = new Map(profiles.map((profile) => [profile.id, profile.nome]));
  const query = params.q?.trim().toLowerCase() ?? "";
  const statusFilter = params.status?.trim() ?? "";
  const channelFilter = params.channel?.trim() ?? "";
  const bundles = groupTextBundles(texts, profileNamesById);

  const visibleBundles = bundles.filter((bundle) => {
    const matchesQuery =
      !query ||
      bundle.title.toLowerCase().includes(query) ||
      bundle.profileName.toLowerCase().includes(query) ||
      bundle.originalText.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || bundle.outputs.some((output) => output.status === statusFilter);
    const matchesChannel =
      !channelFilter || bundle.outputs.some((output) => output.channel_key === channelFilter);
    return matchesQuery && matchesStatus && matchesChannel;
  });

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="mx-auto max-w-6xl space-y-6">
        {isDemo ? <SetupCallout title="Textos em modo demonstracao" /> : null}

        <TextViewTabs
          activeView="biblioteca"
          query={params.q ?? ""}
          statusFilter={statusFilter}
          channelFilter={channelFilter}
        />

        <section className="space-y-4">
          {visibleBundles.length ? (
            visibleBundles.map((bundle) => (
              <TextBundleCard
                key={bundle.id}
                bundle={bundle}
                profiles={profiles}
                isDemo={isDemo}
              />
            ))
          ) : (
            <div className="surface-card rounded-[28px] p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Nenhum texto base encontrado na biblioteca.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Ajuste os filtros ou cadastre um novo texto para iniciar outro bundle de outputs.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/texts" className="button-secondary">
                  Limpar filtros
                </Link>
                <Link href="/texts/new" className="button-primary">
                  Novo texto
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
