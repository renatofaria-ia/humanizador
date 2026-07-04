import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { demoProfiles, demoTexts } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles, listTexts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  if (access.mode === "forbidden") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <div className="panel rounded-[28px] p-8 text-center">
          <h1 className="text-3xl font-semibold text-[var(--ink)]">Acesso negado</h1>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            Este app esta restrito ao email configurado como owner.
          </p>
        </div>
      </main>
    );
  }

  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();
  const texts = isDemo ? demoTexts : await listTexts();

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout /> : null}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Perfis ativos",
              value: String(profiles.length),
              helper: "Perfis comportamentais reutilizaveis.",
            },
            {
              label: "Textos em andamento",
              value: String(texts.filter((text) => text.status !== "publicado").length),
              helper: "Itens ainda em rascunho, geracao ou revisao.",
            },
            {
              label: "Publicados",
              value: String(texts.filter((text) => text.status === "publicado").length),
              helper: "Marcados manualmente como publicados.",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="panel metric-card rounded-[28px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                {item.label}
              </p>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-[var(--ink)]">
                {item.value}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-7 text-[var(--ink-soft)]">
                {item.helper}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Perfis
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Vozes prontas para reaproveitar
                </h2>
              </div>
              <Link
                href="/profiles"
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
              >
                Gerenciar
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{profile.nome}</h3>
                    <div className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Firmeza {profile.nivel_firmeza}/5
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    {profile.descricao_curta}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Textos
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Pipeline editorial do MVP
                </h2>
              </div>
              <Link
                href="/texts"
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
              >
                Abrir textos
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {texts.map((text) => (
                <Link
                  key={text.id}
                  href={`/texts/${text.id}`}
                  className="block rounded-[24px] border border-[var(--border)] bg-white/70 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{text.title}</h3>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">
                        Canal {text.channel_key} / Atualizado em {formatDate(text.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={text.status} />
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
