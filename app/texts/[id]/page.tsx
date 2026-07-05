import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  createAdditionalOutputsAction,
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
  const hasOutput = Boolean(currentOutput);
  const nextStep = hasOutput
    ? "Revise o texto final, registre o ajuste manual se necessario e avance o status quando a peca estiver pronta."
    : "Confirme a base do job e gere a primeira sugestao para abrir o ciclo de revisao.";
  const latestVersion = text.versions[0];
  const relatedOutputs = text.related_outputs;
  const existingChannelKeys = new Set(relatedOutputs.map((output) => output.channel_key));
  const missingChannelPresets = CHANNEL_PRESETS.filter(
    (preset) => !existingChannelKeys.has(preset.key),
  );

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Workspace em modo demonstracao" /> : null}
        <section className="panel rounded-[32px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Link href="/texts" className="text-sm font-semibold text-[var(--ink-soft)]">
                Voltar para textos
              </Link>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Workspace do texto
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] text-balance">
                {text.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
                Perfil {text.profile?.nome ?? "-"} / Canal {text.channel_key} / Atualizado em{" "}
                {formatDate(text.updated_at)}
              </p>
            </div>
            <StatusBadge status={text.status} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                Proximo passo
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{nextStep}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                Outputs desta fonte
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {relatedOutputs.map((output) => {
                  const isCurrent = output.id === text.id;

                  return (
                    <Link
                      key={output.id}
                      href={`/texts/${output.id}`}
                      className={
                        isCurrent
                          ? "button-ink"
                          : "button-secondary"
                      }
                    >
                      {CHANNEL_PRESETS.find((preset) => preset.key === output.channel_key)?.label ??
                        output.channel_key}
                    </Link>
                  );
                })}
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                Cada canal vira um texto proprio dentro da mesma fonte. Voce pode abrir outros
                formatos ou criar novos sem perder o contexto original.
              </p>
              {missingChannelPresets.length ? (
                <details className="mt-4 rounded-[20px] border border-[var(--border)] bg-white/70 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                    Adicionar novos formatos de output
                  </summary>
                  <form
                    action={isDemo ? undefined : createAdditionalOutputsAction}
                    className="mt-4 space-y-4"
                  >
                    <input type="hidden" name="text_id" value={text.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {missingChannelPresets.map((preset) => (
                        <label
                          key={preset.key}
                          className="flex items-start gap-3 rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)]"
                        >
                          <input
                            type="checkbox"
                            name="output_channels"
                            value={preset.key}
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
                    <SubmitButton
                      label="Criar novos outputs"
                      pendingLabel="Criando outputs..."
                    />
                  </form>
                </details>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="min-w-0 space-y-6">
            {hasOutput ? (
              <article className="panel min-w-0 rounded-[32px] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Revisao final
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Edite a versao que vai para publicacao
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  Esta e a area principal da tela. Se o texto estiver quase pronto, ajuste aqui e
                  salve uma nova versao manual.
                </p>
                <form action={isDemo ? undefined : saveManualVersionAction} className="mt-5">
                  <input type="hidden" name="text_id" value={text.id} />
                  <div>
                    <label className="field-label">Texto final editado</label>
                    <textarea
                      name="texto_final"
                      defaultValue={currentOutput?.texto_final ?? ""}
                      className="field min-h-72"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="field-label">Notas desta versao</label>
                    <input
                      name="notes"
                      className="field"
                      placeholder="O que mudou nesta versao?"
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <SubmitButton
                      label="Salvar versao manual"
                      pendingLabel="Salvando..."
                    />
                  </div>
                </form>
              </article>
            ) : null}

            <details open={!hasOutput} className="panel min-w-0 rounded-[32px] p-6">
              <summary className="cursor-pointer list-none">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Base do job
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {hasOutput ? "Reabrir contexto e gerar nova sugestao" : "Ajuste o essencial antes de gerar"}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  {hasOutput
                    ? "Use esta secao apenas quando a base mudou, o canal mudou ou voce precisa reprocessar o texto."
                    : "Deixe visivel apenas o que decide o primeiro rascunho: titulo, perfil, canal e texto original."}
                </p>
              </summary>
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
                    <label className="field-label">Output deste texto</label>
                    <div className="field flex items-center">
                      {CHANNEL_PRESETS.find((preset) => preset.key === text.channel_key)?.label ??
                        text.channel_key}
                    </div>
                    <input type="hidden" name="channel_key" value={text.channel_key} />
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
                <details className="mt-4 rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                    Abrir ajustes avancados de canal, tom e instrucoes
                  </summary>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                      <select
                        name="formalidade"
                        defaultValue={text.formalidade}
                        className="field"
                      >
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
                      <input
                        type="checkbox"
                        name="usar_emojis"
                        defaultChecked={text.usar_emojis}
                      />
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
                </details>
                <div className="mt-6 flex flex-wrap gap-3">
                  <SubmitButton
                    label="Salvar base"
                    pendingLabel="Salvando..."
                    className="button-secondary"
                  />
                </div>
              </form>
              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <p className="text-sm font-semibold text-[var(--ink)]">Acoes desta base</p>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  {hasOutput
                    ? "Se o contexto mudou o suficiente para invalidar a versao atual, gere uma nova sugestao."
                    : "Quando a base estiver coerente, gere a primeira sugestao para abrir a revisao."}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={isDemo ? undefined : generateTextAction}>
                  <input type="hidden" name="text_id" value={text.id} />
                  <input type="hidden" name="notes" value="Geracao direta pelo workspace." />
                  <SubmitButton
                    label={hasOutput ? "Gerar nova sugestao" : "Gerar sugestao"}
                    pendingLabel="Gerando..."
                  />
                </form>
                <form action={isDemo ? undefined : duplicateTextAction}>
                  <input type="hidden" name="text_id" value={text.id} />
                  <SubmitButton
                    label="Duplicar texto"
                    pendingLabel="Duplicando..."
                    className="button-secondary"
                  />
                </form>
              </div>
            </details>
          </section>

          <section className="min-w-0 space-y-6">
            <article id="workflow" className="panel min-w-0 rounded-[32px] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Workflow
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Controle editorial e publicacao
              </h3>
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

            <article id="saida-atual" className="panel min-w-0 rounded-[32px] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                Saida atual
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Leitura de apoio do motor
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
                          className="rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Resumo das alteracoes
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                      {currentOutput.resumo_das_alteracoes}
                    </p>
                  </div>
                  <details className="rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                      Ver esboco e metadados tecnicos
                    </summary>
                    <div className="mt-5 space-y-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                          Esboco
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                          {currentOutput.esboco}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                          Metadados do canal
                        </p>
                        <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[var(--ink-soft)]">
                          {JSON.stringify(currentOutput.metadados_do_canal, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/70 p-5">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Ainda nao existe versao gerada para este texto.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    O caminho natural e revisar a base do job e usar a acao `Gerar sugestao`.
                  </p>
                </div>
              )}
            </article>

            <details id="historico" className="panel min-w-0 rounded-[32px] p-6">
              <summary className="cursor-pointer list-none">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                  Historico
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Versoes e observacoes registradas
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  Ultima versao: {latestVersion ? `v${latestVersion.version_number}` : "nenhuma"}.
                </p>
              </summary>
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
                      {version.error || version.notes || "Sem observacoes"}
                    </p>
                    {version.error ? (
                      <p className="mt-2 text-xs leading-6 text-rose-700">
                        Erro: {version.error}
                      </p>
                    ) : null}
                    {version.error && version.notes ? (
                      <p className="mt-1 text-xs leading-6 text-[var(--ink-muted)]">
                        Nota: {version.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
