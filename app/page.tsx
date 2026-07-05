import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { demoProfiles, demoTexts } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles, listTexts } from "@/lib/data";

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
  const activeTexts = texts.filter((text) => !["publicado", "arquivado"].includes(text.status));
  const recentTexts = activeTexts.slice(0, 3);
  const recentProfiles = profiles.slice(0, 3);

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout /> : null}
        <section className="panel rounded-[32px] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Fluxo principal
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] text-balance">
                Escolha entre continuar um texto em andamento ou abrir um novo job.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
                O painel agora funciona como hub. Ele mostra o que pede acao agora e deixa as
                tarefas de configuracao em segundo plano.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/texts" className="button-ink">
                Continuar textos
              </Link>
              <Link href="/texts#new-text" className="button-secondary">
                Novo texto
              </Link>
              <Link href="/profiles#new-profile" className="button-secondary">
                Novo perfil
              </Link>
            </div>
          </div>
        </section>

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
            <article key={item.label} className="panel metric-card rounded-[28px] p-6">
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

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Em andamento
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  O que vale retomar agora
                </h2>
              </div>
              <Link
                href="/texts"
                className="button-ink"
              >
                Abrir fila
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {recentTexts.length ? (
                recentTexts.map((text) => (
                  <Link
                    key={text.id}
                    href={`/texts/${text.id}`}
                    className="block rounded-[24px] border border-[var(--border)] bg-white/70 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--ink)]">{text.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                          Perfil em uso, canal e status ja definidos. Abra para revisar, gerar ou
                          publicar.
                        </p>
                      </div>
                      <StatusBadge status={text.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                  <h3 className="text-lg font-semibold text-[var(--ink)]">Nenhum texto em fila</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    Seu proximo passo natural e abrir um novo job com base bruta e contexto de
                    canal.
                  </p>
                  <Link href="/texts#new-text" className="button-primary mt-4">
                    Criar primeiro texto
                  </Link>
                </div>
              )}
            </div>
          </article>

          <article className="panel rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Biblioteca de perfis
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Vozes prontas para reutilizar
                </h2>
              </div>
              <Link
                href="/profiles"
                className="button-secondary"
              >
                Gerenciar
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {recentProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{profile.nome}</h3>
                    <div className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Firmeza {profile.nivel_firmeza}/5
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    {profile.descricao_curta}
                  </p>
                </div>
              ))}
              <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/60 p-5">
                <p className="text-sm font-semibold text-[var(--ink)]">Quando criar um perfil novo</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  Crie um perfil apenas quando a voz, o nivel de firmeza ou as regras de escrita
                  forem realmente diferentes das vozes que voce ja tem.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
