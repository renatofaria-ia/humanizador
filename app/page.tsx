import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { GlossaryStrip } from "@/components/glossary-strip";
import { NextStepCard } from "@/components/next-step-card";
import { PageIntro } from "@/components/page-intro";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles, listTexts } from "@/lib/data";
import { demoProfiles, demoTextBundles } from "@/lib/demo-data";
import { getChannelLabel, getGlossaryItems, getStatusMeta } from "@/lib/ui";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();
  const texts = isDemo ? demoTextBundles : await listTexts();
  const activeTexts = texts.filter((text) => !["publicado", "arquivado"].includes(text.status));
  const completedTexts = texts.filter((text) => ["publicado", "arquivado"].includes(text.status));
  const nextText = activeTexts[0];

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Modo demonstracao ativo" /> : null}

        <PageIntro
          eyebrow="Hoje"
          title="O painel de hoje mostra o que pede acao agora."
          description="Retome um texto, acompanhe a fila ativa e volte a produzir sem procurar onde cada etapa ficou."
          actions={
            <>
              <Link href="/texts/new" className="button-primary">
                Novo texto
              </Link>
              <Link href="/texts" className="button-secondary">
                Abrir textos
              </Link>
            </>
          }
        />

        <NextStepCard
          title={
            nextText
              ? `${getStatusMeta(nextText.status).actionLabel}: ${nextText.title}`
              : "Nenhum texto ativo no momento"
          }
          description={
            nextText
              ? `${getStatusMeta(nextText.status).helper} Formato ${getChannelLabel(nextText.channel_key)}.`
              : "Quando a fila estiver vazia, abra um novo texto e escolha um perfil antes de gerar."
          }
          actions={
            nextText ? (
              <Link href={`/texts/${nextText.id}`} className="button-ink">
                Abrir texto
              </Link>
            ) : (
              <Link href="/texts/new" className="button-ink">
                Criar primeiro texto
              </Link>
            )
          }
        />

        <GlossaryStrip items={getGlossaryItems(["perfil", "formato", "status"])} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Perfis ativos",
              value: String(profiles.length),
              helper: "Vozes prontas para reutilizar sem recriar regras do zero.",
            },
            {
              label: "Textos em andamento",
              value: String(activeTexts.length),
              helper: "Itens que ainda pedem geracao, revisao, aprovacao ou publicacao.",
            },
            {
              label: "Concluidos",
              value: String(completedTexts.length),
              helper: "Textos ja publicados ou arquivados na biblioteca.",
            },
            {
              label: "Pronto para retomar",
              value: nextText ? formatDate(nextText.updated_at) : "-",
              helper: nextText
                ? `Ultima movimentacao em ${getChannelLabel(nextText.channel_key)}.`
                : "Sem item ativo para retomar agora.",
            },
          ].map((item) => (
            <article key={item.label} className="surface-card rounded-[28px] p-6">
              <p className="text-xs font-semibold text-[var(--ink-muted)]">
                {item.label}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <article className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">
                  Em andamento
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Textos que pedem atencao agora
                </h2>
              </div>
              <Link href="/texts" className="button-secondary">
                Abrir textos
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {activeTexts.length ? (
                activeTexts.slice(0, 4).map((text) => (
                  <Link
                    key={text.id}
                    href={`/texts/${text.id}`}
                    className="block rounded-[24px] border border-[var(--border)] bg-white/78 p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--ink-muted)]">
                          {getChannelLabel(text.channel_key)}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                          {text.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                          {getStatusMeta(text.status).helper}
                        </p>
                        <p className="mt-2 text-xs text-[var(--ink-muted)]">
                          Atualizado em {formatDate(text.updated_at)}
                        </p>
                      </div>
                      <StatusBadge status={text.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/70 p-5">
                  <h3 className="text-lg font-semibold text-[var(--ink)]">Fila vazia</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    Nao ha nenhum texto pedindo acao. Abra um novo e escolha o perfil antes de
                    gerar.
                  </p>
                  <Link href="/texts/new" className="button-primary mt-4">
                    Novo texto
                  </Link>
                </div>
              )}
            </div>
          </article>

          <div className="space-y-6">
            <article className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    Perfis
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                    Vozes prontas para reutilizar
                  </h2>
                </div>
                <Link href="/profiles" className="button-secondary">
                  Abrir perfis
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {profiles.slice(0, 3).map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{profile.nome}</h3>
                      <div className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">
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

            <article className="surface-card rounded-[32px] p-6">
              <p className="text-sm font-semibold text-[var(--accent)]">
                Concluidos
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Biblioteca recente
              </h2>
              <div className="mt-6 space-y-4">
                {completedTexts.length ? (
                  completedTexts.slice(0, 3).map((text) => (
                    <Link
                      key={text.id}
                      href={`/texts/${text.id}`}
                      className="block rounded-[24px] border border-[var(--border)] bg-white/78 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[var(--ink-muted)]">
                            {getChannelLabel(text.channel_key)}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                            {text.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                            {getStatusMeta(text.status).helper}
                          </p>
                        </div>
                        <StatusBadge status={text.status} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/70 p-5">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      Ainda nao existem textos concluidos.
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                      Assim que um texto for publicado ou arquivado, ele aparece aqui.
                    </p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
