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
import { DashboardShell } from "@/components/dashboard-shell";
import { GlossaryStrip } from "@/components/glossary-strip";
import { SetupCallout } from "@/components/setup-callout";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { getAppAccess } from "@/lib/app-context";
import { getTextDetail, listProfiles } from "@/lib/data";
import { demoProfiles, demoTextDetail } from "@/lib/demo-data";
import { HUMANIZER_MODE_LABELS, HUMANIZER_PRESET_LABELS } from "@/lib/humanizer-protocol";
import { getChannelLabel, getGlossaryItems, getStatusMeta } from "@/lib/ui";
import { HUMANIZER_OPERATION_MODES, HUMANIZER_VOICE_PRESETS, TEXT_STATUSES } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type TextDetailSearchParams = {
  tab?: string;
};

function buildTabHref(textId: string, tab: string) {
  return `/texts/${textId}?tab=${tab}`;
}

export default async function TextDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<TextDetailSearchParams>;
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

  const paramsData = await searchParams;
  const currentOutput = text.current_version?.output_payload_json;
  const hasOutput = Boolean(currentOutput);
  const statusMeta = getStatusMeta(text.status);
  const activeTab = (() => {
    if (paramsData.tab === "base") return "base";
    if (paramsData.tab === "publicacao") return "publicacao";
    if (paramsData.tab === "historico") return "historico";
    if (paramsData.tab === "texto-final") return "texto-final";
    return hasOutput ? "texto-final" : "base";
  })();
  const patternBadges =
    currentOutput?.padroes_detectados?.length
      ? currentOutput.padroes_detectados
      : currentOutput?.diagnostico?.map((item) => item.sinal) ?? [];
  const latestVersion = text.versions[0];
  const relatedOutputs = text.related_outputs;
  const existingChannelKeys = new Set(relatedOutputs.map((output) => output.channel_key));
  const missingChannelPresets = CHANNEL_PRESETS.filter(
    (preset) => !existingChannelKeys.has(preset.key),
  );

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Área de trabalho em modo demonstração" /> : null}

        <section className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Link href="/texts" className="text-sm font-medium text-[var(--accent)]">
                Voltar para a fila
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm font-medium text-[var(--ink-soft)]">
                  {getChannelLabel(text.channel_key)}
                </span>
                <StatusBadge status={text.status} />
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)] text-balance sm:text-4xl">
                {text.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] text-pretty">
                Perfil {text.profile?.nome ?? "-"} · Atualizado em {formatDate(text.updated_at)} ·
                {hasOutput
                  ? " O texto final já existe e pode seguir para revisão ou publicação."
                  : " A base ainda precisa gerar a primeira sugestão."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeTab === "base" ? (
                <form action={isDemo ? undefined : generateTextAction}>
                  <input type="hidden" name="text_id" value={text.id} />
                  <input type="hidden" name="notes" value="Geração direta pela área de trabalho." />
                  <SubmitButton
                    label={hasOutput ? "Gerar nova sugestão" : "Gerar sugestão"}
                    pendingLabel="Gerando..."
                  />
                </form>
              ) : (
                <Link href={buildTabHref(text.id, "base")} className="button-primary">
                  Abrir base
                </Link>
              )}
              <form action={isDemo ? undefined : duplicateTextAction}>
                <input type="hidden" name="text_id" value={text.id} />
                <SubmitButton
                  label="Duplicar texto"
                  pendingLabel="Duplicando..."
                  className="button-secondary"
                />
              </form>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[rgba(176,71,52,0.16)] bg-[linear-gradient(135deg,rgba(255,247,244,0.95),rgba(255,255,255,0.92))] p-5">
            <p className="text-sm font-semibold text-[var(--accent)]">Próximo passo</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{statusMeta.actionLabel}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              {hasOutput
                ? statusMeta.helper
                : "Revise a base, confirme o perfil e gere a primeira sugestão para abrir a etapa de revisão."}
            </p>
          </div>
        </section>

        <section className="surface-card rounded-[32px] px-6 py-4 sm:px-8">
          <div className="flex flex-wrap gap-6 border-b border-[var(--border)]">
            {[
              ["base", "Base"],
              ["texto-final", "Texto final"],
              ["publicacao", "Publicação"],
              ["historico", "Historico"],
            ].map(([tab, label]) => {
              const active = activeTab === tab;

              return (
                <Link
                  key={tab}
                  href={buildTabHref(text.id, tab)}
                  className={active ? "workspace-tab workspace-tab-active" : "workspace-tab"}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </section>

        <GlossaryStrip items={getGlossaryItems(["formato", "status", "estilo-de-voz"])} />

        {activeTab === "base" ? (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <article className="surface-card rounded-[32px] p-6 sm:p-8">
              <p className="text-sm font-semibold text-[var(--accent)]">Base do texto</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Ajuste apenas o que muda a prÃ³xima geraÃ§Ã£o
              </h2>
              <form action={isDemo ? undefined : updateTextDraftAction} className="mt-6">
                <input type="hidden" name="text_id" value={text.id} />
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="field-label">Nome interno</label>
                    <input name="title" defaultValue={text.title} required className="field" />
                  </div>
                  <div>
                    <label className="field-label">Perfil</label>
                    <select name="profile_id" defaultValue={text.profile_id} required className="field">
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Formato deste texto</label>
                    <div className="field flex items-center">{getChannelLabel(text.channel_key)}</div>
                    <input type="hidden" name="channel_key" value={text.channel_key} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="field-label">Texto base</label>
                  <textarea
                    name="original_text"
                    defaultValue={text.original_text}
                    required
                    className="field min-h-72"
                  />
                </div>

                <details className="mt-4 rounded-[28px] border border-[var(--border)] bg-white/78 p-5 sm:p-6">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                    Abrir ajustes avancados
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
                    <div>
                      <label className="field-label">Modo de humanizacao</label>
                      <select
                        name="modo_operacao"
                        defaultValue={text.modo_operacao}
                        className="field"
                      >
                        {HUMANIZER_OPERATION_MODES.map((mode) => (
                          <option key={mode} value={mode}>
                            {HUMANIZER_MODE_LABELS[mode]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Estilo de voz</label>
                      <select
                        name="preset_de_voz"
                        defaultValue={text.preset_de_voz}
                        className="field"
                      >
                        {HUMANIZER_VOICE_PRESETS.map((voicePreset) => (
                          <option key={voicePreset} value={voicePreset}>
                            {HUMANIZER_PRESET_LABELS[voicePreset]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                    <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)] md:col-span-2">
                      <input
                        type="checkbox"
                        name="primeira_pessoa"
                        defaultChecked={text.primeira_pessoa}
                      />
                      Preferir primeira pessoa
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="field-label">Instrucoes extras</label>
                    <textarea
                      name="instrucoes_extras"
                      defaultValue={text.instrucoes_extras}
                      className="field min-h-24"
                    />
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
            </article>

            <div className="space-y-6">
              <article className="surface-card rounded-[32px] p-6">
                <p className="text-sm font-semibold text-[var(--accent)]">Guia rapido</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  O que precisa estar certo aqui
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
                  <li>Titulo interno claro para localizar o texto depois.</li>
                  <li>Perfil alinhado com a voz que vocÃª quer reproduzir.</li>
                  <li>Texto base com contexto suficiente para a prÃ³xima geraÃ§Ã£o.</li>
                </ul>
              </article>

              <article className="surface-card rounded-[32px] p-6">
                <p className="text-sm font-semibold text-[var(--accent)]">Formatos relacionados</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedOutputs.map((output) => {
                    const isCurrent = output.id === text.id;

                    return (
                      <Link
                        key={output.id}
                        href={`/texts/${output.id}`}
                        className={isCurrent ? "button-ink" : "button-secondary"}
                      >
                        {getChannelLabel(output.channel_key)}
                      </Link>
                    );
                  })}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {activeTab === "texto-final" ? (
          hasOutput ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_320px]">
              <article className="surface-card rounded-[32px] p-6">
                <p className="text-sm font-semibold text-[var(--accent)]">Base</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  Texto original de referencia
                </h2>
                <div className="text-scroll-area text-scroll-area-compact mt-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                    {text.original_text}
                  </p>
                </div>
              </article>

              <article className="surface-card rounded-[32px] p-6">
                <p className="text-sm font-semibold text-[var(--accent)]">Texto final</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  Edite a versÃ£o que segue para aprovaÃ§Ã£o
                </h2>
                <form action={isDemo ? undefined : saveManualVersionAction} className="mt-6">
                  <input type="hidden" name="text_id" value={text.id} />
                  <div>
                    <label className="field-label">Texto final</label>
                    <textarea
                      name="texto_final"
                      defaultValue={currentOutput?.texto_final ?? ""}
                      className="field min-h-[28rem]"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="field-label">Notas desta versÃ£o</label>
                    <input
                      name="notes"
                      className="field"
                      placeholder="O que mudou nesta versÃ£o?"
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <SubmitButton
                      label="Salvar versÃ£o manual"
                      pendingLabel="Salvando..."
                    />
                  </div>
                </form>
              </article>

              <div className="space-y-6">
                <article className="surface-card rounded-[32px] p-6">
                  <p className="text-sm font-semibold text-[var(--accent)]">Resumo</p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
                    O que o motor mudou
                  </h2>
                  <div className="text-scroll-area mt-3">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                      {currentOutput?.resumo_das_alteracoes ?? "Sem resumo registrado."}
                    </p>
                  </div>
                </article>

                <article className="surface-card rounded-[32px] p-6">
                  <p className="text-sm font-semibold text-[var(--accent)]">Pistas de revisÃ£o</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {patternBadges.length ? (
                      patternBadges.map((pattern) => (
                        <span
                          key={pattern}
                          className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                        >
                          {pattern}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                        Nenhum destaque
                      </span>
                    )}
                  </div>
                  {currentOutput?.alertas?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentOutput.alertas.map((alerta) => (
                        <span
                          key={alerta}
                          className="rounded-[var(--radius-pill)] border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                        >
                          {alerta}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              </div>
            </section>
          ) : (
            <section className="surface-card rounded-[32px] p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">
                Ainda não existe texto final para revisar.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                O caminho natural é abrir a aba Base, revisar o contexto e usar a ação Gerar
                sugestão.
              </p>
              <Link href={buildTabHref(text.id, "base")} className="button-primary mt-5">
                Ir para a base
              </Link>
            </section>
          )
        ) : null}

        {activeTab === "publicacao" ? (
          <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <article className="surface-card rounded-[32px] p-6">
              <p className="text-sm font-semibold text-[var(--accent)]">PublicaÃ§Ã£o</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Atualize o status e registre o link final
              </h2>
              <form action={isDemo ? undefined : updateTextStatusAction} className="mt-6 space-y-4">
                <input type="hidden" name="text_id" value={text.id} />
                <div>
                  <label className="field-label">Status</label>
                  <select name="status" defaultValue={text.status} className="field">
                    {TEXT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getStatusMeta(status).label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">URL publicada</label>
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

            <div className="space-y-6">
              <article className="surface-card rounded-[32px] p-6">
                <p className="text-sm font-semibold text-[var(--accent)]">Formatos desta fonte</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  Abra outro formato sem perder a base original
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {relatedOutputs.map((output) => {
                    const isCurrent = output.id === text.id;

                    return (
                      <Link
                        key={output.id}
                        href={`/texts/${output.id}`}
                        className={isCurrent ? "button-ink" : "button-secondary"}
                      >
                        {getChannelLabel(output.channel_key)}
                      </Link>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  Cada formato tem historico e status proprios, mas todos continuam ligados a esta
                  mesma fonte.
                </p>
              </article>

              {missingChannelPresets.length ? (
                <article className="surface-card rounded-[32px] p-6">
                  <p className="text-sm font-semibold text-[var(--accent)]">Adicionar formatos</p>
                  <form
                    action={isDemo ? undefined : createAdditionalOutputsAction}
                    className="mt-5 space-y-4"
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
                      label="Criar novos formatos"
                      pendingLabel="Criando formatos..."
                    />
                  </form>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "historico" ? (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="surface-card rounded-[32px] p-6">
              <p className="text-sm font-semibold text-[var(--accent)]">Historico</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Versoes registradas deste texto
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Última versão: {latestVersion ? `v${latestVersion.version_number}` : "nenhuma"}.
              </p>
              <div className="mt-6 space-y-3">
                {text.versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-[22px] border border-[var(--border)] bg-white/78 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        VersÃ£o {version.version_number} / {version.source}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)]">{formatDate(version.created_at)}</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                      {version.error || version.notes || "Sem observacoes"}
                    </p>
                    {version.error ? (
                      <p className="mt-2 text-xs leading-6 text-rose-700">Erro: {version.error}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-card rounded-[32px] p-6">
              <p className="text-sm font-semibold text-[var(--accent)]">Histórico técnico</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Auditoria recolhida fora da área principal</h2>
              {currentOutput ? (
                <div className="mt-5 space-y-5">
                  {currentOutput.relatorio_curto ? (
                    <div className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5">
                      <p className="text-xs font-semibold text-[var(--ink-muted)]">
                        Relatorio curto
                      </p>
                      <div className="text-scroll-area mt-3">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                          {currentOutput.relatorio_curto}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5">
                    <p className="text-xs font-semibold text-[var(--ink-muted)]">
                      Modo e estilo aplicados
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentOutput.modo_operacao ? (
                        <span className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                          Modo {HUMANIZER_MODE_LABELS[currentOutput.modo_operacao]}
                        </span>
                      ) : null}
                      {currentOutput.preset_aplicado ? (
                        <span className="rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                          Estilo {HUMANIZER_PRESET_LABELS[currentOutput.preset_aplicado]}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {currentOutput.score_humanizacao ? (
                    <div className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5">
                      <p className="text-xs font-semibold text-[var(--ink-muted)]">
                        Score de humanizacao
                      </p>
                      <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[var(--ink-soft)]">
                        {JSON.stringify(currentOutput.score_humanizacao, null, 2)}
                      </pre>
                    </div>
                  ) : null}

                  {currentOutput.diagnostico?.length ? (
                    <div className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5">
                      <p className="text-xs font-semibold text-[var(--ink-muted)]">
                        Diagnostico estruturado
                      </p>
                      <pre className="text-scroll-area mt-3 overflow-x-auto text-xs leading-6 text-[var(--ink-soft)]">
                        {JSON.stringify(currentOutput.diagnostico, null, 2)}
                      </pre>
                    </div>
                  ) : null}

                  <details className="rounded-[24px] border border-[var(--border)] bg-white/78 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                      Ver esboco e metadados do canal
                    </summary>
                    <div className="mt-5 space-y-5">
                      <div>
                        <p className="text-xs font-semibold text-[var(--ink-muted)]">Esboco</p>
                        <div className="text-scroll-area mt-3">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                            {currentOutput.esboco}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--ink-muted)]">
                          Metadados do canal
                        </p>
                        <pre className="text-scroll-area mt-3 overflow-x-auto text-xs leading-6 text-[var(--ink-soft)]">
                          {JSON.stringify(currentOutput.metadados_do_canal, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/70 p-5">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    A auditoria técnica aparece aqui depois da primeira geração.</p>
                </div>
              )}
            </article>
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}
