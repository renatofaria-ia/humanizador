"use client";

import Link from "next/link";
import { type ReactNode, useId, useMemo, useState } from "react";

import {
  approveTextVersionAction,
  createAndGenerateTextFromLibraryAction,
  deleteTextVersionAction,
  generateTextFromLibraryAction,
  saveManualVersionAction,
  updateSharedBaseAction,
} from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { CHANNEL_PRESETS, getChannelPreset } from "@/lib/channel-presets";
import { HUMANIZER_MODE_LABELS, HUMANIZER_PRESET_LABELS } from "@/lib/humanizer-protocol";
import {
  ChannelKey,
  HUMANIZER_OPERATION_MODES,
  HUMANIZER_VOICE_PRESETS,
  Profile,
  TextStatus,
  TextSummary,
  TextVersion,
} from "@/lib/types";
import { getChannelLabel, getStatusMeta } from "@/lib/ui";
import { formatDate } from "@/lib/utils";

type TextBundleCardProps = {
  bundle: {
    id: string;
    title: string;
    originalText: string;
    profileName: string;
    createdAt: string;
    updatedAt: string;
    outputs: TextSummary[];
  };
  profiles: Profile[];
  isDemo: boolean;
};

const EDITABLE_STATUS_OPTIONS: Record<TextStatus, TextStatus[]> = {
  rascunho: ["aprovado", "em_revisao", "gerado", "arquivado"],
  gerado: ["aprovado", "em_revisao", "gerado", "arquivado"],
  em_revisao: ["aprovado", "em_revisao", "arquivado"],
  aprovado: ["aprovado", "em_revisao", "arquivado"],
  publicado: ["aprovado", "em_revisao", "arquivado"],
  arquivado: ["em_revisao", "arquivado"],
};

function truncateText(text: string, limit = 220) {
  const compact = text.replace(/\s+/g, " ").trim();

  if (compact.length <= limit) {
    return compact;
  }

  return `${compact.slice(0, limit).trimEnd()}...`;
}

function hasVersionText(version: TextVersion | null | undefined) {
  return Boolean(version?.output_payload_json?.texto_final?.trim());
}

function sortVersionsNewestFirst(left: TextVersion, right: TextVersion) {
  const timeDiff = new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

  if (timeDiff !== 0) {
    return timeDiff;
  }

  return right.version_number - left.version_number;
}

function getAvailableVersions(output: TextSummary | null) {
  return [...(output?.versions ?? [])].filter(hasVersionText).sort(sortVersionsNewestFirst);
}

function hasGeneratedText(output: TextSummary) {
  if (hasVersionText(output.current_version)) {
    return true;
  }

  return getAvailableVersions(output).length > 0;
}

function getDefaultVersionId(output: TextSummary | null, versions: TextVersion[]) {
  const currentVersion = output?.current_version;

  if (currentVersion && hasVersionText(currentVersion)) {
    return currentVersion.id;
  }

  return versions[0]?.id ?? "";
}

function getInitialChannelKey(outputs: TextSummary[]) {
  return (
    outputs.find((output) => hasGeneratedText(output))?.channel_key ??
    outputs[0]?.channel_key ??
    CHANNEL_PRESETS[0]?.key ??
    "generico"
  );
}

function getVersionLabel(version: TextVersion) {
  return `v${version.version_number} . ${version.source === "llm" ? "IA" : "Manual"}`;
}

function formatTokenCount(totalTokens: number | null) {
  if (typeof totalTokens !== "number" || !Number.isFinite(totalTokens)) {
    return null;
  }

  return totalTokens.toLocaleString("pt-BR");
}

function formatCharacterCount(text: string) {
  return text.length.toLocaleString("pt-BR");
}

function getExpectedOutputLabel(item: string) {
  const labels: Record<string, string> = {
    titulo: "Título",
    subtitulo: "Subtítulo",
    excerpt: "Resumo curto",
    texto_final: "Texto final",
    cta: "CTA",
    hashtags: "Hashtags",
    alternativa_abertura: "Abertura alternativa",
    hook: "Gancho",
    assunto: "Assunto",
    corpo_email: "Corpo do e-mail",
    resumo_das_alteracoes: "Resumo das alterações",
  };

  return labels[item] ?? item;
}

function getDefaultEditStatus(status: TextStatus) {
  if (status === "gerado" || status === "rascunho") {
    return "aprovado" as const;
  }

  if (status === "arquivado" || status === "publicado") {
    return "em_revisao" as const;
  }

  return status;
}

function getBaseStateTone(baseActive: boolean) {
  return baseActive
    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border border-zinc-200 bg-zinc-100/80 text-zinc-700";
}

function getBaseStateLabel(baseActive: boolean) {
  return baseActive ? "Ativo" : "Inativo";
}

function getDateMeta(createdAt: string, updatedAt: string) {
  if (createdAt === updatedAt) {
    return `Criado em ${formatDate(createdAt)}`;
  }

  return `Atualizado em ${formatDate(updatedAt)}`;
}

type GenerationFormProps = {
  action?: (formData: FormData) => void | Promise<void>;
  defaultOutput: TextSummary;
  hiddenFields: Array<{
    name: string;
    value: string;
  }>;
  onCancel: () => void;
  profiles: Profile[];
};

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  compact?: boolean;
  variant?: "card" | "soft";
};

function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
  compact = false,
  variant = "card",
}: CollapsibleSectionProps) {
  const shellClass =
    variant === "soft"
      ? `rounded-[18px] border border-[var(--border)]/70 bg-white/58 ${
          compact ? "px-3 py-3" : "px-4 py-4"
        }`
      : `rounded-[20px] border border-[var(--border)] bg-white/82 ${
          compact ? "px-4 py-3" : "px-4 py-4"
        }`;

  return (
    <details className={`collapsible-section ${shellClass}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-[var(--ink)]">{title}</span>
          {description ? (
            <span className="mt-1 block text-xs leading-6 text-[var(--ink-muted)]">
              {description}
            </span>
          ) : null}
        </div>
        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center text-[var(--ink-muted)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="collapsible-icon collapsible-icon-closed h-4 w-4"
          >
            <path
              d="M5.5 7.75 10 12.25l4.5-4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="collapsible-icon collapsible-icon-open h-4 w-4"
          >
            <path
              d="M5.5 12.25 10 7.75l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className={compact ? "mt-3" : "mt-5"}>{children}</div>
    </details>
  );
}

function GenerationForm({
  action,
  defaultOutput,
  hiddenFields,
  onCancel,
  profiles,
}: GenerationFormProps) {
  const [selectedProfileId, setSelectedProfileId] = useState(defaultOutput.profile_id);
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null;

  return (
    <form action={action} className="mt-4 rounded-[24px] border border-[var(--border)] bg-white/88 p-4 sm:p-5">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}

      <div className="space-y-5">
        <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)]/55 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              Configuração inicial
            </p>
            {selectedProfile ? (
              <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-muted)]">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Firmeza {selectedProfile.nivel_firmeza}/5
                </span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Humor {selectedProfile.nivel_humor}/5
                </span>
              </div>
            ) : null}
          </div>
          <div className="mt-3">
            <label className="field-label">Perfil</label>
            <select
              name="profile_id"
              defaultValue={defaultOutput.profile_id}
              required
              className="field"
              onChange={(event) => setSelectedProfileId(event.target.value)}
            >
              <option value="">Selecione um perfil</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 border-t border-[var(--border)]/70 pt-4">
            <div className="space-y-3">
              {selectedProfile ? (
                <CollapsibleSection
                  title="Características do perfil"
                  description="Expanda apenas os sinais que você quer revisar antes de enviar para a IA."
                  variant="soft"
                >
                  <div className="space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {selectedProfile.descricao_curta ? (
                      <CollapsibleSection title="Como soa" compact variant="soft">
                        <p className="whitespace-pre-wrap">{selectedProfile.descricao_curta}</p>
                      </CollapsibleSection>
                    ) : null}

                    {selectedProfile.regras_de_voz ? (
                      <CollapsibleSection title="Regras de voz" compact variant="soft">
                        <p className="whitespace-pre-wrap">{selectedProfile.regras_de_voz}</p>
                      </CollapsibleSection>
                    ) : null}

                    <div className="space-y-3">
                      {selectedProfile.sempre_usar ? (
                        <CollapsibleSection title="Sempre usar" compact variant="soft">
                          <p className="whitespace-pre-wrap">{selectedProfile.sempre_usar}</p>
                        </CollapsibleSection>
                      ) : null}

                      {selectedProfile.evitar ? (
                        <CollapsibleSection title="Evitar" compact variant="soft">
                          <p className="whitespace-pre-wrap">{selectedProfile.evitar}</p>
                        </CollapsibleSection>
                      ) : null}
                    </div>
                  </div>
                </CollapsibleSection>
              ) : null}

              <CollapsibleSection
                title="Ajustes avançados"
                description="Ajuste objetivo, tom, formato e instruções antes de gerar a nova versão."
                variant="soft"
              >
                <div className="space-y-4">
            <CollapsibleSection
              title="Direcionamento"
              description="Defina a intenção principal e a chamada para ação."
              compact
              variant="soft"
            >
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Objetivo</label>
                  <input
                    name="objetivo"
                    defaultValue={defaultOutput.objetivo}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label">CTA</label>
                  <input name="cta" defaultValue={defaultOutput.cta} className="field" />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Estilo de saída"
              description="Controle tom, extensão, humanização e preset de voz."
              compact
              variant="soft"
            >
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Tom</label>
                  <select name="tom" defaultValue={defaultOutput.tom} className="field">
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
                  <select name="tamanho" defaultValue={defaultOutput.tamanho} className="field">
                    {["curto", "medio", "longo"].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Formalidade</label>
                  <select
                    name="formalidade"
                    defaultValue={defaultOutput.formalidade}
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
                  <label className="field-label">Nível de ousadia</label>
                  <input
                    name="nivel_ousadia"
                    type="number"
                    min="1"
                    max="5"
                    defaultValue={defaultOutput.nivel_ousadia}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label">Modo de humanização</label>
                  <select
                    name="modo_operacao"
                    defaultValue={defaultOutput.modo_operacao}
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
                    defaultValue={defaultOutput.preset_de_voz}
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
            </CollapsibleSection>

            <CollapsibleSection
              title="Recursos de linguagem"
              description="Ative ou remova componentes de estilo e formato."
              compact
              variant="soft"
            >
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex min-h-[4.25rem] items-start gap-3 rounded-[18px] border border-[var(--border)] bg-white/78 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                  <input
                    type="checkbox"
                    name="usar_emojis"
                    defaultChecked={defaultOutput.usar_emojis}
                    className="mt-1"
                  />
                  <span>Usar emojis</span>
                </label>
                <label className="flex min-h-[4.25rem] items-start gap-3 rounded-[18px] border border-[var(--border)] bg-white/78 px-4 py-3 text-sm font-medium text-[var(--ink)]">
                  <input
                    type="checkbox"
                    name="usar_hashtags"
                    defaultChecked={defaultOutput.usar_hashtags}
                    className="mt-1"
                  />
                  <span>Usar hashtags</span>
                </label>
                <label className="flex min-h-[4.25rem] items-start gap-3 rounded-[18px] border border-[var(--border)] bg-white/78 px-4 py-3 text-sm font-medium text-[var(--ink)] sm:col-span-2">
                  <input
                    type="checkbox"
                    name="primeira_pessoa"
                    defaultChecked={defaultOutput.primeira_pessoa}
                    className="mt-1"
                  />
                  <span>Preferir primeira pessoa</span>
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Instruções extras"
              description="Use este campo apenas quando precisar orientar a geração com mais detalhe."
              compact
              variant="soft"
            >
              <label className="field-label">Instruções extras</label>
              <textarea
                name="instrucoes_extras"
                defaultValue={defaultOutput.instrucoes_extras}
                className="field min-h-28"
              />
            </CollapsibleSection>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <SubmitButton label="Gerar" pendingLabel="Gerando..." />
          <button type="button" onClick={onCancel} className="button-secondary sm:w-auto">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

export function TextBundleCard({ bundle, profiles, isDemo }: TextBundleCardProps) {
  const bodyId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChannelKey, setSelectedChannelKey] = useState<ChannelKey>(() =>
    getInitialChannelKey(bundle.outputs),
  );
  const [selectedVersionIdsByChannel, setSelectedVersionIdsByChannel] = useState<
    Partial<Record<ChannelKey, string>>
  >({});
  const [editingChannelKey, setEditingChannelKey] = useState<ChannelKey | null>(null);
  const [isBaseEditing, setIsBaseEditing] = useState(false);
  const [generatingChannelKey, setGeneratingChannelKey] = useState<ChannelKey | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftStatus, setDraftStatus] = useState<TextStatus>("aprovado");
  const [draftBaseText, setDraftBaseText] = useState("");
  const [draftBaseState, setDraftBaseState] = useState<"ativo" | "inativo">("ativo");

  const createdOutputsByChannel = new Map(bundle.outputs.map((output) => [output.channel_key, output]));
  const fallbackSourceOutput = bundle.outputs[0] ?? null;
  const generatedOutputs = bundle.outputs.filter((output) => hasGeneratedText(output));
  const generatedOutputsByChannel = new Map(
    generatedOutputs.map((output) => [output.channel_key, output]),
  );
  const selectedOutput = createdOutputsByChannel.get(selectedChannelKey) ?? null;
  const selectableVersions = useMemo(() => getAvailableVersions(selectedOutput), [selectedOutput]);
  const selectedVersionId =
    selectedVersionIdsByChannel[selectedChannelKey] ??
    getDefaultVersionId(selectedOutput, selectableVersions);
  const selectedVersion =
    selectableVersions.find((version) => version.id === selectedVersionId) ?? selectableVersions[0] ?? null;
  const selectedVersionOutput = selectedVersion?.output_payload_json ?? null;
  const generatedText = selectedVersion?.output_payload_json?.texto_final?.trim() ?? "";
  const selectedVersionLabel = selectedVersion ? getVersionLabel(selectedVersion) : null;
  const selectedVersionModel = selectedVersion?.model?.trim() ?? "";
  const selectedVersionTotalTokens = formatTokenCount(selectedVersion?.total_tokens ?? null);
  const selectedChannelPreset = getChannelPreset(selectedChannelKey);
  const baseCharacterCount = formatCharacterCount(bundle.originalText);
  const selectedOutputSummary =
    selectedVersionOutput?.resumo_das_alteracoes?.trim() ?? "Sem resumo registrado.";
  const selectedReviewClues =
    selectedVersionOutput?.padroes_detectados?.length
      ? selectedVersionOutput.padroes_detectados
      : selectedVersionOutput?.diagnostico?.map((item) => item.sinal) ?? [];
  const selectedAlerts = selectedVersionOutput?.alertas ?? [];
  const isEditing = editingChannelKey === selectedChannelKey;
  const isGenerating = generatingChannelKey === selectedChannelKey;
  const isInteractionLocked = isEditing || isBaseEditing || isGenerating;
  const hasSelection = Boolean(selectedOutput && selectedVersion && generatedText);
  const selectedVersionIsCurrent = selectedVersion?.id === selectedOutput?.current_version?.id;
  const baseIsActive = selectedOutput?.base_active ?? bundle.outputs[0]?.base_active ?? true;
  const approveDisabled =
    !selectedOutput ||
    !selectedVersion ||
    (selectedVersionIsCurrent && selectedOutput.status === "aprovado");
  const regenerateDisabled = !selectedOutput || selectedOutput.status === "aprovado";

  function handleStartEdit() {
    if (!selectedOutput) {
      return;
    }

    setEditingChannelKey(selectedChannelKey);
    setDraftText(generatedText);
    setDraftStatus(getDefaultEditStatus(selectedOutput.status));
  }

  function handleCancelEdit() {
    setEditingChannelKey(null);
  }

  function handleStartBaseEdit() {
    setIsBaseEditing(true);
    setDraftBaseText(bundle.originalText);
    setDraftBaseState(baseIsActive ? "ativo" : "inativo");
  }

  function handleCancelBaseEdit() {
    setIsBaseEditing(false);
  }

  function handleStartGenerate() {
    if (!selectedOutput && !fallbackSourceOutput) {
      return;
    }

    setGeneratingChannelKey(selectedChannelKey);
  }

  function handleCancelGenerate() {
    setGeneratingChannelKey(null);
  }

  return (
    <section className="surface-card rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold text-[var(--ink-muted)]">Texto base</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{bundle.title}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            {truncateText(bundle.originalText)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-muted)]">
            <span className="info-chip">
              Perfil {bundle.profileName}
            </span>
            <span className="info-chip">
              {bundle.outputs.length} output{bundle.outputs.length > 1 ? "s" : ""}
            </span>
            <span className="info-chip">
              Atualizado em {formatDate(bundle.updatedAt)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {generatedOutputs.map((output) => (
              <span
                key={output.id}
                className="info-chip info-chip-strong"
              >
                {getChannelLabel(output.channel_key)}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          onClick={() => setIsExpanded((current) => !current)}
          className="button-secondary"
        >
          {isExpanded ? "Recolher detalhes" : "Ver detalhes"}
        </button>
      </div>

      {isExpanded ? (
        <div id={bodyId} className="mt-6 border-t border-[var(--border)] pt-6">
        <div className="flex flex-wrap gap-2">
          {CHANNEL_PRESETS.map((preset) => {
            const active = preset.key === selectedChannelKey;
            const generatedOutput = generatedOutputsByChannel.get(preset.key);

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  if (editingChannelKey) {
                    return;
                  }

                  setSelectedChannelKey(preset.key);
                }}
                aria-pressed={active}
                disabled={isInteractionLocked}
                className={`selection-pill ${active ? "selection-pill-active" : ""}`}
                style={{
                  borderColor: generatedOutput ? "#B04734" : "var(--border)",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <article className="rounded-[24px] border border-[var(--border)] bg-white/82 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">Texto Base</h3>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">
                  {getDateMeta(bundle.createdAt, bundle.updatedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-muted)]">
                  <span className="info-chip">
                    {baseCharacterCount} caracteres
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBaseStateTone(baseIsActive)}`}
              >
                {getBaseStateLabel(baseIsActive)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStartBaseEdit}
                disabled={isInteractionLocked}
                className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Editar
              </button>
            </div>

            {isBaseEditing ? (
              <form action={updateSharedBaseAction} className="mt-4 space-y-4">
                <input type="hidden" name="text_id" value={selectedOutput?.id ?? bundle.outputs[0]?.id ?? ""} />
                <div>
                  <label className="field-label">Status da base</label>
                  <select
                    name="base_active"
                    value={draftBaseState}
                    onChange={(event) =>
                      setDraftBaseState(event.target.value as "ativo" | "inativo")
                    }
                    className="field"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Texto</label>
                  <textarea
                    name="original_text"
                    value={draftBaseText}
                    onChange={(event) => setDraftBaseText(event.target.value)}
                    className="field min-h-[18rem]"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <SubmitButton label="Salvar" pendingLabel="Salvando..." />
                  <button
                    type="button"
                    onClick={handleCancelBaseEdit}
                    className="button-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)]/70 p-4">
                <p className="text-xs font-semibold text-[var(--ink-muted)]">{bundle.title}</p>
                <div className="text-scroll-area text-scroll-area-compact mt-3">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                    {bundle.originalText}
                  </p>
                </div>
              </div>
            )}
          </article>

          {selectedOutput ? (
            <article className="rounded-[24px] border border-[var(--border)] bg-white/82 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    {getChannelLabel(selectedOutput.channel_key)}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    Atualizado em {formatDate(selectedVersion?.created_at ?? selectedOutput.updated_at)}
                  </p>
                  {selectedVersionModel || selectedVersionTotalTokens ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-muted)]">
                      {selectedVersionModel ? (
                        <span className="info-chip">
                          LLM {selectedVersionModel}
                        </span>
                      ) : null}
                      {selectedVersionTotalTokens ? (
                        <span className="info-chip">
                          {selectedVersionTotalTokens} tokens
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <StatusBadge status={selectedOutput.status} />
              </div>

              {hasSelection ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      disabled={isInteractionLocked}
                      className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Editar
                    </button>

                    <form action={approveTextVersionAction}>
                      <input type="hidden" name="text_id" value={selectedOutput.id} />
                      <input type="hidden" name="version_id" value={selectedVersion.id} />
                      <button
                        type="submit"
                        disabled={approveDisabled || isInteractionLocked}
                        className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aprovar
                      </button>
                    </form>

                    <form
                      action={deleteTextVersionAction}
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            `Apagar a ${selectedVersionLabel?.toLowerCase() ?? "versao selecionada"} deste output?`,
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="text_id" value={selectedOutput.id} />
                      <input type="hidden" name="version_id" value={selectedVersion.id} />
                      <input
                        type="hidden"
                        name="reason"
                        value={`Soft delete da ${selectedVersionLabel ?? "versao"} pela biblioteca.`}
                      />
                      <button
                        type="submit"
                        disabled={isInteractionLocked}
                        className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Apagar
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={handleStartGenerate}
                      disabled={regenerateDisabled || isInteractionLocked}
                      className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Regerar
                    </button>
                  </div>

                  {selectableVersions.length > 1 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectableVersions.map((version) => {
                        const active = version.id === selectedVersion?.id;

                        return (
                          <button
                            key={version.id}
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                return;
                              }

                              setSelectedVersionIdsByChannel((current) => ({
                                ...current,
                                [selectedChannelKey]: version.id,
                              }));
                            }}
                            aria-pressed={active}
                            disabled={isInteractionLocked}
                            className={`selection-pill ${active ? "selection-pill-active" : ""}`}
                          >
                            {getVersionLabel(version)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {isEditing ? (
                    <form action={saveManualVersionAction} className="mt-4 space-y-4">
                      <input type="hidden" name="text_id" value={selectedOutput.id} />
                      <input type="hidden" name="notes" value="Edicao manual salva pela biblioteca." />
                      <div>
                        <label className="field-label">Status desta versão ativa</label>
                        <select
                          name="status"
                          value={draftStatus}
                          onChange={(event) => setDraftStatus(event.target.value as TextStatus)}
                          className="field"
                        >
                          {EDITABLE_STATUS_OPTIONS[selectedOutput.status].map((status) => (
                            <option key={status} value={status}>
                              {getStatusMeta(status).label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Texto</label>
                        <textarea
                          name="texto_final"
                          value={draftText}
                          onChange={(event) => setDraftText(event.target.value)}
                          className="field min-h-[18rem]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <SubmitButton label="Salvar" pendingLabel="Salvando..." />
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="button-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : isGenerating ? (
                    <GenerationForm
                      action={isDemo ? undefined : generateTextFromLibraryAction}
                      defaultOutput={selectedOutput}
                      hiddenFields={[
                        { name: "text_id", value: selectedOutput.id },
                        {
                          name: "notes",
                          value: `Regerado pela biblioteca a partir de ${selectedVersionLabel ?? "uma versao anterior"} com perfil e ajustes revisados.`,
                        },
                      ]}
                      onCancel={handleCancelGenerate}
                      profiles={profiles}
                    />
                  ) : (
                    <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)]/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--ink-muted)]">
                          {selectedVersionLabel}
                        </p>
                        {selectedVersion ? (
                          <span className="text-xs text-[var(--ink-muted)]">
                            {formatDate(selectedVersion.created_at)}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-scroll-area mt-3">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                          {generatedText}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleStartGenerate}
                      disabled={isInteractionLocked}
                      className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Gerar com IA
                    </button>
                  </div>

                  {isGenerating ? (
                    <GenerationForm
                      action={isDemo ? undefined : generateTextFromLibraryAction}
                      defaultOutput={selectedOutput}
                      hiddenFields={[{ name: "text_id", value: selectedOutput.id }]}
                      onCancel={handleCancelGenerate}
                      profiles={profiles}
                    />
                  ) : (
                    <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)]/70 p-4">
                        <p className="text-sm leading-7 text-[var(--ink-soft)]">
                          Ainda não existe uma versão gerada para este output.
                        </p>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4">
                <Link href={`/texts/${selectedOutput.id}`} className="button-ink">
                  Abrir workspace
                </Link>
              </div>
            </article>
          ) : (
            <article className="rounded-[24px] border border-[var(--border)] bg-white/82 p-5">
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                {getChannelLabel(selectedChannelKey)}
              </h3>
              <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)]/70 p-4">
                {selectedChannelPreset ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                        Características
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        {selectedChannelPreset.descricao}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                        Intenção
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        {selectedChannelPreset.intencao}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                        Principais entregas
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedChannelPreset.saidasEsperadas.map((item) => (
                          <span
                            key={item}
                            className="info-chip info-chip-strong"
                          >
                            {getExpectedOutputLabel(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartGenerate}
                  disabled={isInteractionLocked || !fallbackSourceOutput}
                  className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gerar com IA
                </button>
              </div>

              {isGenerating && fallbackSourceOutput ? (
                <GenerationForm
                  action={isDemo ? undefined : createAndGenerateTextFromLibraryAction}
                  defaultOutput={fallbackSourceOutput}
                  hiddenFields={[
                    { name: "source_text_id", value: fallbackSourceOutput.id },
                    { name: "channel_key", value: selectedChannelKey },
                  ]}
                  onCancel={handleCancelGenerate}
                  profiles={profiles}
                />
              ) : null}
            </article>
          )}
        </div>

        {hasSelection ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <article className="rounded-[24px] border border-[var(--border)] bg-white/82 p-5">
              <p className="text-sm font-semibold text-[var(--accent)]">Resumo</p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">O que o motor mudou</h3>
              <div className="text-scroll-area text-scroll-area-compact mt-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">
                  {selectedOutputSummary}
                </p>
              </div>
            </article>

            <article className="rounded-[24px] border border-[var(--border)] bg-white/82 p-5">
              <p className="text-sm font-semibold text-[var(--accent)]">Pistas de revisao</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedReviewClues.length ? (
                  selectedReviewClues.map((pattern) => (
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

              {selectedAlerts.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedAlerts.map((alerta) => (
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
        ) : null}
        </div>
      ) : null}
    </section>
  );
}
