import { notFound, redirect } from "next/navigation";

import {
  duplicateTextAction,
  generateTextAction,
  saveManualVersionAction,
  updateTextDraftAction,
  updateTextStatusAction,
} from "@/app/actions";
import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { demoTextDetail, demoProfiles } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { getTextDetail, listProfiles } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function TextDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const text = isDemo ? demoTextDetail : await getTextDetail(id);
  const profiles = isDemo ? demoProfiles : await listProfiles();

  if (!text) {
    notFound();
  }

  const currentOutput = text.current_version?.output_payload_json;

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Workspace em modo demonstracao" /> : null}
        <section className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Workspace do texto
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">{text.title}</h2>
            </div>
            <StatusBadge status={text.status} />
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            Perfil {text.profile?.nome ?? "-"} / Canal {text.channel_key} / Atualizado em{" "}
            {formatDate(text.updated_at)}
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-6">
            <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Base do job
              </p>
              <form action={isDemo ? undefined : updateTextDraftAction} className="mt-5">
                <input type="hidden" name="text_id" value={text.id} />
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="field-label">Titulo</label>
                    <input name="title" defaultValue={text.title} required className="field" />
                  </div>
                  <div>
                    <label className="field-label">Perfil</label>
                    <select
                      name="profile_id"
                      defaultValue={text.profile_id}
                      required
                      className="field"
                    >
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Canal</label>
                    <select
                      name="channel_key"
                      defaultValue={text.channel_key}
                      required
                      className="field"
                    >
                      {CHANNEL_PRESETS.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="field-label">Texto original</label>
                  <textarea
                    name="original_text"
                    defaultValue={text.original_text}
                    required
                    className="field min-h-44"
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="field-label">Objetivo</label>
                    <input name="objetivo" defaultValue={text.objetivo} className="field" />
                  </div>
                  <div>
                    <label className="field-label">CTA</label>
                    <input name="cta" defaultValue={text.cta} className="field" />
                  </div>
                  <div>
                    <label className="field-label">Tom</label>
                    <select name="tom" defaultValue={text.tom} className="field">
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
                    <select name="tamanho" defaultValue={text.tamanho} className="field">
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
                    <select name="formalidade" defaultValue={text.formalidade} className="field">
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
                      defaultValue={text.nivel_ousadia}
                      className="field"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                    <input type="checkbox" name="usar_emojis" defaultChecked={text.usar_emojis} />
                    Usar emojis
                  </label>
                  <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                    <input
                      type="checkbox"
                      name="usar_hashtags"
                      defaultChecked={text.usar_hashtags}
                    />
                    Usar hashtags
                  </label>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.7fr]">
                  <div>
                    <label className="field-label">Instrucoes extras</label>
                    <textarea
                      name="instrucoes_extras"
                      defaultValue={text.instrucoes_extras}
                      className="field min-h-24"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                    <input
                      type="checkbox"
                      name="primeira_pessoa"
                      defaultChecked={text.primeira_pessoa}
                    />
                    Preferir primeira pessoa
                  </label>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <SubmitButton label="Salvar base" pendingLabel="Salvando..." />
                </div>
              </form>
              <div className="mt-6 flex flex-wrap gap-3">
                <form action={isDemo ? undefined : generateTextAction}>
                  <input type="hidden" name="text_id" value={text.id} />
                  <input type="hidden" name="notes" value="Geracao direta pelo workspace." />
                  <SubmitButton label="Gerar sugestao" pendingLabel="Gerando..." />
                </form>
                <form action={isDemo ? undefined : duplicateTextAction}>
                  <input type="hidden" name="text_id" value={text.id} />
                  <SubmitButton
                    label="Duplicar texto"
                    pendingLabel="Duplicando..."
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                  />
                </form>
              </div>
            </article>

            <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Ajuste manual
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Salvar nova versao manual
              </h3>
              <form action={isDemo ? undefined : saveManualVersionAction} className="mt-5">
                <input type="hidden" name="text_id" value={text.id} />
                <div>
                  <label className="field-label">Texto final editado</label>
                  <textarea
                    name="texto_final"
                    defaultValue={currentOutput?.texto_final ?? ""}
                    className="field min-h-44"
                  />
                </div>
                <div className="mt-4">
                  <label className="field-label">Notas desta versao</label>
                  <input name="notes" className="field" placeholder="O que mudou nesta versao?" />
                </div>
                <div className="mt-6">
                  <SubmitButton label="Salvar versao manual" pendingLabel="Salvando..." />
                </div>
              </form>
            </article>
          </section>

          <section className="space-y-6">
            <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Saida estruturada
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Visualizacao detalhada do motor
              </h3>
              {currentOutput ? (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Padroes detectados
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentOutput.padroes_detectados.map((pattern) => (
                        <span
                          key={pattern}
                          className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Esboco
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                      {currentOutput.esboco}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Texto final
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
                      {currentOutput.texto_final}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Resumo das alteracoes
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                      {currentOutput.resumo_das_alteracoes}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Metadados do canal
                    </p>
                    <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[var(--ink-soft)]">
                      {JSON.stringify(currentOutput.metadados_do_canal, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                  Ainda nao existe versao gerada para este texto.
                </p>
              )}
            </article>

            <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Workflow
              </p>
              <form action={isDemo ? undefined : updateTextStatusAction} className="mt-5 space-y-4">
                <input type="hidden" name="text_id" value={text.id} />
                <div>
                  <label className="field-label">Status</label>
                  <select name="status" defaultValue={text.status} className="field">
                    {[
                      "rascunho",
                      "gerado",
                      "em_revisao",
                      "aprovado",
                      "publicado",
                      "arquivado",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">URL publicada (opcional)</label>
                  <input
                    name="published_url"
                    defaultValue={text.published_url ?? ""}
                    placeholder="https://..."
                    className="field"
                  />
                </div>
                <SubmitButton label="Atualizar status" pendingLabel="Atualizando..." />
              </form>
            </article>

            <article className="panel rounded-[32px] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Historico
              </p>
              <div className="mt-5 space-y-3">
                {text.versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-[22px] border border-[var(--border)] bg-white/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        Versao {version.version_number} / {version.source}
                      </p>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                        {formatDate(version.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                      {version.notes || version.error || "Sem observacoes"}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
