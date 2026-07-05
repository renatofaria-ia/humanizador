import Link from "next/link";
import { redirect } from "next/navigation";

import { createTextAction } from "@/app/actions";
import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { demoProfiles, demoTexts } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles, listTexts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function TextsPage() {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();
  const texts = isDemo ? demoTexts : await listTexts();
  const activeTexts = texts.filter((text) => !["publicado", "arquivado"].includes(text.status));
  const inactiveTexts = texts.filter((text) => ["publicado", "arquivado"].includes(text.status));

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Textos em modo demonstracao" /> : null}
        <section className="panel rounded-[32px] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Hub editorial
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] text-balance">
                Continue o que ja esta em fila antes de abrir um novo job.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
                Esta tela responde duas perguntas em ordem: qual texto precisa de acao agora e, so
                depois, se faz sentido criar mais um.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#new-text" className="button-primary">
                Novo job
              </a>
            </div>
          </div>
        </section>

        <section className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Em andamento
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Textos que pedem proximo passo
              </h2>
            </div>
            <div className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
              {activeTexts.length} ativos
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {activeTexts.length ? (
              activeTexts.map((text) => (
                <Link
                  key={text.id}
                  href={`/texts/${text.id}`}
                  className="panel block rounded-[28px] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--ink)]">{text.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        Canal {text.channel_key} / Atualizado em {formatDate(text.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={text.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                <h3 className="text-lg font-semibold text-[var(--ink)]">Nenhum texto em aberto</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  Se voce ainda nao tem um job em rascunho, abra um novo texto logo abaixo.
                </p>
                <a href="#new-text" className="button-primary mt-4">
                  Criar novo texto
                </a>
              </div>
            )}
          </div>
        </section>

        {inactiveTexts.length ? (
          <section className="panel rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Biblioteca recente
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Publicados e arquivados
                </h2>
              </div>
              <div className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                {inactiveTexts.length} concluidos
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {inactiveTexts.slice(0, 4).map((text) => (
                <Link
                  key={text.id}
                  href={`/texts/${text.id}`}
                  className="block rounded-[24px] border border-[var(--border)] bg-white/70 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{text.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        Canal {text.channel_key} / Atualizado em {formatDate(text.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={text.status} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section id="new-text" className="panel rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Novo texto
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Abrir um job de humanizacao
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Use esta etapa quando ainda nao existir um texto aberto para esse assunto. Primeiro
            defina o perfil, depois escolha os canais de output que devem nascer da mesma fonte.
          </p>
          <form action={isDemo ? undefined : createTextAction} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">Titulo interno</label>
                <input name="title" required className="field" />
              </div>
              <div>
                <label className="field-label">Perfil</label>
                <select name="profile_id" required className="field">
                  <option value="">Selecione</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">Outputs desejados</label>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {CHANNEL_PRESETS.map((preset) => (
                  <label
                    key={preset.key}
                    className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-4 text-sm text-[var(--ink)]"
                  >
                    <input
                      type="checkbox"
                      name="output_channels"
                      value={preset.key}
                      defaultChecked={preset.key === "linkedin"}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-semibold">{preset.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--ink-soft)]">
                        {preset.descricao}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                Cada canal sera criado como um output separado, com status e historico proprios,
                mas ligado a mesma fonte.
              </p>
            </div>
            <div className="mt-4">
              <label className="field-label">Texto de entrada</label>
              <textarea name="original_text" required className="field min-h-36" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="field-label">Objetivo</label>
                <input name="objetivo" className="field" />
              </div>
              <div>
                <label className="field-label">CTA</label>
                <input name="cta" className="field" />
              </div>
              <div>
                <label className="field-label">Tom</label>
                <select name="tom" className="field">
                  {["consultivo", "didatico", "provocativo", "institucional", "neutro"].map(
                    (tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="field-label">Tamanho</label>
                <select name="tamanho" className="field">
                  {["curto", "medio", "longo"].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="field-label">Formalidade</label>
                <select name="formalidade" className="field">
                  {["baixa", "media", "alta"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Nivel de ousadia</label>
                <input
                  name="nivel_ousadia"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="field"
                />
              </div>
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                <input type="checkbox" name="usar_emojis" />
                Usar emojis
              </label>
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                <input type="checkbox" name="usar_hashtags" />
                Usar hashtags
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.7fr]">
              <div>
                <label className="field-label">Instrucoes extras</label>
                <textarea name="instrucoes_extras" className="field min-h-24" />
              </div>
              <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                <input type="checkbox" name="primeira_pessoa" defaultChecked />
                Preferir primeira pessoa
              </label>
            </div>
            <div className="mt-6">
              <SubmitButton label="Criar texto" pendingLabel="Criando..." />
            </div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
