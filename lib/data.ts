import "server-only";
import { randomUUID } from "node:crypto";

import { getChannelPreset } from "@/lib/channel-presets";
import { requireReadyUser } from "@/lib/app-context";
import { generateHumanizedOutput } from "@/lib/generation";
import {
  ChannelKey,
  DEFAULT_TEXT_CONTROLS,
  Profile,
  TextControls,
  TextDetail,
  TextOutputVariant,
  TextRecord,
  TextStatus,
  TextSummary,
  TextVersion,
} from "@/lib/types";

function normalizeChannelKeys(channelKeys: ChannelKey[]) {
  return [...new Set(channelKeys)].filter(Boolean);
}

function isActiveVersion(version: Pick<TextVersion, "deleted_at"> | null | undefined) {
  return !version?.deleted_at;
}

function sortVersionsNewestFirst(left: TextVersion, right: TextVersion) {
  const timeDiff = new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

  if (timeDiff !== 0) {
    return timeDiff;
  }

  return right.version_number - left.version_number;
}

async function listRelatedOutputsForSource(input: {
  title: string;
  originalText: string;
  profileId: string;
}) {
  const { supabase, user } = await requireReadyUser();
  const { data, error } = await supabase
    .from("texts")
    .select("id, title, profile_id, channel_key, status, updated_at")
    .eq("user_id", user.id)
    .eq("title", input.title)
    .eq("original_text", input.originalText)
    .eq("profile_id", input.profileId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TextOutputVariant[];
}

function mapControls(record: TextRecord): TextControls {
  return {
    objetivo: record.objetivo ?? DEFAULT_TEXT_CONTROLS.objetivo,
    cta: record.cta ?? DEFAULT_TEXT_CONTROLS.cta,
    tom: record.tom ?? DEFAULT_TEXT_CONTROLS.tom,
    tamanho: record.tamanho ?? DEFAULT_TEXT_CONTROLS.tamanho,
    formalidade: record.formalidade ?? DEFAULT_TEXT_CONTROLS.formalidade,
    usarEmojis: record.usar_emojis ?? DEFAULT_TEXT_CONTROLS.usarEmojis,
    usarHashtags: record.usar_hashtags ?? DEFAULT_TEXT_CONTROLS.usarHashtags,
    primeiraPessoa: record.primeira_pessoa ?? DEFAULT_TEXT_CONTROLS.primeiraPessoa,
    nivelOusadia: record.nivel_ousadia ?? DEFAULT_TEXT_CONTROLS.nivelOusadia,
    instrucoesExtras: record.instrucoes_extras ?? DEFAULT_TEXT_CONTROLS.instrucoesExtras,
    modoOperacao: record.modo_operacao ?? DEFAULT_TEXT_CONTROLS.modoOperacao,
    presetDeVoz: record.preset_de_voz ?? DEFAULT_TEXT_CONTROLS.presetDeVoz,
  };
}

function getSupabaseErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return String(error ?? "");
}

function getSupabaseErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") {
      return code;
    }
  }

  return "";
}

function isMissingTextEditorialColumnError(error: unknown) {
  const message = getSupabaseErrorMessage(error);
  const code = getSupabaseErrorCode(error);
  return (
    code === "PGRST204" ||
    message.includes("modo_operacao") ||
    message.includes("preset_de_voz") ||
    message.includes("schema cache") ||
    message.includes("source_bundle_id")
  );
}

function isMissingSourceBundleIdColumnError(error: unknown) {
  const message = getSupabaseErrorMessage(error);
  const code = getSupabaseErrorCode(error);
  return code === "PGRST204" || message.includes("source_bundle_id");
}

function isMissingBaseActiveColumnError(error: unknown) {
  const message = getSupabaseErrorMessage(error);
  const code = getSupabaseErrorCode(error);
  return code === "PGRST204" || message.includes("base_active") || message.includes("schema cache");
}

function isMissingTextVersionSoftDeleteColumnError(error: unknown) {
  const message = getSupabaseErrorMessage(error);
  const code = getSupabaseErrorCode(error);
  return (
    code === "PGRST204" ||
    message.includes("deleted_at") ||
    message.includes("deleted_by") ||
    message.includes("deleted_reason") ||
    message.includes("schema cache")
  );
}

function mapTextRecordWithBaseActive<T extends { base_active?: boolean | null }>(record: T) {
  return {
    ...record,
    base_active: record.base_active ?? true,
  };
}

function buildMinimalTextInsertPayload(input: {
  title: string;
  originalText: string;
  profileId: string;
  channelKey: ChannelKey;
  sourceBundleId?: string;
}) {
  return {
    ...(input.sourceBundleId ? { source_bundle_id: input.sourceBundleId } : {}),
    title: input.title,
    original_text: input.originalText,
    profile_id: input.profileId,
    channel_key: input.channelKey,
    status: "rascunho" as const,
  };
}

function buildTextControlsPatch(input: { controls: Partial<TextControls> }) {
  const controls = { ...DEFAULT_TEXT_CONTROLS, ...input.controls };

  return {
    objetivo: controls.objetivo,
    cta: controls.cta,
    tom: controls.tom,
    tamanho: controls.tamanho,
    formalidade: controls.formalidade,
    usar_emojis: controls.usarEmojis,
    usar_hashtags: controls.usarHashtags,
    primeira_pessoa: controls.primeiraPessoa,
    nivel_ousadia: controls.nivelOusadia,
    instrucoes_extras: controls.instrucoesExtras,
    modo_operacao: controls.modoOperacao,
    preset_de_voz: controls.presetDeVoz,
  };
}

function buildSafeTextControlsPatch(input: { controls: Partial<TextControls> }) {
  const controls = { ...DEFAULT_TEXT_CONTROLS, ...input.controls };

  return {
    objetivo: controls.objetivo,
    cta: controls.cta,
    tom: controls.tom,
    tamanho: controls.tamanho,
    formalidade: controls.formalidade,
    usar_emojis: controls.usarEmojis,
    usar_hashtags: controls.usarHashtags,
    primeira_pessoa: controls.primeiraPessoa,
    nivel_ousadia: controls.nivelOusadia,
    instrucoes_extras: controls.instrucoesExtras,
  };
}

async function patchTextControls(
  supabase: Awaited<ReturnType<typeof requireReadyUser>>["supabase"],
  userId: string,
  textId: string,
  controls: Partial<TextControls>,
) {
  let result = await supabase
    .from("texts")
    .update(buildTextControlsPatch({ controls }))
    .eq("id", textId)
    .eq("user_id", userId);

  if (result.error && isMissingTextEditorialColumnError(result.error)) {
    result = await supabase
      .from("texts")
      .update(buildSafeTextControlsPatch({ controls }))
      .eq("id", textId)
      .eq("user_id", userId);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function getNextVersionNumber(textId: string) {
  const { supabase } = await requireReadyUser();
  const { data } = await supabase
    .from("text_versions")
    .select("version_number")
    .eq("text_id", textId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.version_number ?? 0) + 1;
}

async function listTextVersionsByTextIds(input: { textIds: string[]; userId: string }) {
  const { supabase } = await requireReadyUser();
  let result = await supabase
    .from("text_versions")
    .select("*")
    .in("text_id", input.textIds)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (result.error && isMissingTextVersionSoftDeleteColumnError(result.error)) {
    result = await supabase
      .from("text_versions")
      .select("*")
      .in("text_id", input.textIds)
      .eq("user_id", input.userId)
      .order("created_at", { ascending: false });
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as TextVersion[];
}

async function listTextVersionsByTextId(input: { textId: string; userId: string }) {
  const { supabase } = await requireReadyUser();
  let result = await supabase
    .from("text_versions")
    .select("*")
    .eq("text_id", input.textId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (result.error && isMissingTextVersionSoftDeleteColumnError(result.error)) {
    result = await supabase
      .from("text_versions")
      .select("*")
      .eq("text_id", input.textId)
      .eq("user_id", input.userId)
      .order("created_at", { ascending: false });
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as TextVersion[];
}

export async function listProfiles() {
  const { supabase, user } = await requireReadyUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Profile[];
}

export async function getProfile(profileId: string) {
  const { supabase, user } = await requireReadyUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as Profile | null;
}

export async function listTexts() {
  const { supabase, user } = await requireReadyUser();
  const { data, error } = await supabase
    .from("texts")
    .select("*, profiles(id, nome), current_version:text_versions!texts_current_version_id_fkey(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const textIds = (data ?? []).map((item) => item.id as string);
  let versionsByTextId = new Map<string, TextVersion[]>();

  if (textIds.length) {
    const versions = await listTextVersionsByTextIds({
      textIds,
      userId: user.id,
    });

    versionsByTextId = versions.reduce((acc, version) => {
      const textId = String(version.text_id);
      const current = acc.get(textId) ?? [];
      current.push(version);
      acc.set(textId, current);
      return acc;
    }, new Map<string, TextVersion[]>());
  }

  return (
    (data ?? []) as Array<
      TextSummary & {
        profiles?: { id: string; nome: string };
        current_version?: TextVersion | null;
      }
    >
  ).map((item) => ({
    ...mapTextRecordWithBaseActive(item),
    profile: item.profiles,
    current_version: isActiveVersion(item.current_version) ? item.current_version ?? null : null,
    versions: (versionsByTextId.get(String(item.id)) ?? []).sort(sortVersionsNewestFirst),
  }));
}

export async function getTextDetail(textId: string) {
  const { supabase, user } = await requireReadyUser();
  const { data: text, error: textError } = await supabase
    .from("texts")
    .select("*, profiles(*)")
    .eq("id", textId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (textError) {
    throw new Error(textError.message);
  }

  if (!text) {
    return null;
  }

  const versions = await listTextVersionsByTextId({
    textId,
    userId: user.id,
  });

  const relatedOutputs = await listRelatedOutputsForSource({
    title: text.title,
    originalText: text.original_text,
    profileId: text.profile_id,
  });

  const activeVersions = versions.sort(sortVersionsNewestFirst);
  const currentVersion =
    activeVersions.find((version) => version.id === text.current_version_id) ??
    activeVersions[0] ??
    null;

  return {
    ...mapTextRecordWithBaseActive(text as TextRecord),
    profile: (text as { profiles?: Profile }).profiles ?? null,
    current_version: currentVersion as TextVersion | null,
    versions: activeVersions,
    related_outputs: (relatedOutputs ?? []) as TextOutputVariant[],
  } as TextDetail;
}

export async function createProfile(input: Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">) {
  const { supabase, user } = await requireReadyUser();
  const { error } = await supabase.from("profiles").insert({
    ...input,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProfile(
  profileId: string,
  input: Partial<Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">>,
) {
  const { supabase, user } = await requireReadyUser();
  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", profileId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createText(input: {
  title: string;
  originalText: string;
  profileId: string;
  channelKey: ChannelKey;
  controls?: Partial<TextControls>;
}) {
  const { supabase, user } = await requireReadyUser();
  const result = await supabase
    .from("texts")
    .insert({
      user_id: user.id,
      ...buildMinimalTextInsertPayload(input),
    })
    .select("id")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  await patchTextControls(supabase, user.id, result.data.id as string, input.controls ?? {});

  return result.data.id as string;
}

export async function createTextBundle(input: {
  title: string;
  originalText: string;
  profileId: string;
  channelKeys: ChannelKey[];
  controls?: Partial<TextControls>;
  sourceBundleId?: string;
}) {
  const { supabase, user } = await requireReadyUser();
  const channelKeys = normalizeChannelKeys(input.channelKeys);
  const sourceBundleId = input.sourceBundleId ?? randomUUID();

  if (!channelKeys.length) {
    throw new Error("Selecione pelo menos um canal de output.");
  }

  const buildInsertRows = (includeSourceBundleId: boolean) =>
    channelKeys.map((channelKey) => ({
      user_id: user.id,
      ...buildMinimalTextInsertPayload({
        title: input.title,
        originalText: input.originalText,
        profileId: input.profileId,
        channelKey,
        sourceBundleId: includeSourceBundleId ? sourceBundleId : undefined,
      }),
    }));

  let result = await supabase
    .from("texts")
    .insert(buildInsertRows(true))
    .select("id, channel_key");

  if (result.error && isMissingSourceBundleIdColumnError(result.error)) {
    result = await supabase
      .from("texts")
      .insert(buildInsertRows(false))
      .select("id, channel_key");
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  await Promise.all(
    (result.data ?? []).map((row) =>
      patchTextControls(supabase, user.id, row.id, input.controls ?? {}),
    ),
  );

  return {
    created: (result.data ?? []) as Array<{ id: string; channel_key: ChannelKey }>,
  };
}

export async function updateTextDraft(
  textId: string,
  input: {
    title: string;
    originalText: string;
    profileId: string;
    controls: TextControls;
  },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const { supabase, user } = await requireReadyUser();
  const relatedOutputIds = detail.related_outputs.map((output) => output.id);
  const baseUpdate = {
    title: input.title,
    original_text: input.originalText,
    profile_id: input.profileId,
  };

  const result = await supabase
    .from("texts")
    .update(baseUpdate)
    .in("id", relatedOutputIds)
    .eq("user_id", user.id);

  if (result.error) {
    throw new Error(result.error.message);
  }

  await Promise.all(
    relatedOutputIds.map((textId) => patchTextControls(supabase, user.id, textId, input.controls)),
  );
}

export async function updateSharedBase(
  textId: string,
  input: {
    originalText: string;
    baseActive: boolean;
  },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const { supabase, user } = await requireReadyUser();
  const relatedOutputIds = detail.related_outputs.map((output) => output.id);

  let result = await supabase
    .from("texts")
    .update({
      original_text: input.originalText,
      base_active: input.baseActive,
    })
    .in("id", relatedOutputIds)
    .eq("user_id", user.id);

  if (result.error && isMissingBaseActiveColumnError(result.error)) {
    result = await supabase
      .from("texts")
      .update({
        original_text: input.originalText,
      })
      .in("id", relatedOutputIds)
      .eq("user_id", user.id);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function updateTextGenerationSettings(
  textId: string,
  input: {
    profileId: string;
    controls: Partial<TextControls>;
  },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const { supabase, user } = await requireReadyUser();
  const { error } = await supabase
    .from("texts")
    .update({
      profile_id: input.profileId,
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  await patchTextControls(supabase, user.id, textId, input.controls);
}

export async function duplicateText(textId: string) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  return createText({
    title: `${detail.title} (copia)`,
    originalText: detail.original_text,
    profileId: detail.profile_id,
    channelKey: detail.channel_key,
    controls: mapControls(detail),
  });
}

export async function createAdditionalOutputs(textId: string, channelKeys: ChannelKey[]) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const existingChannels = new Set(detail.related_outputs.map((output) => output.channel_key));
  const missingChannels = normalizeChannelKeys(channelKeys).filter(
    (channelKey) => !existingChannels.has(channelKey),
  );

  if (!missingChannels.length) {
    return {
      created: [] as Array<{ id: string; channel_key: ChannelKey }>,
    };
  }

  return createTextBundle({
    title: detail.title,
    originalText: detail.original_text,
    profileId: detail.profile_id,
    channelKeys: missingChannels,
    controls: mapControls(detail),
    sourceBundleId: detail.source_bundle_id ?? undefined,
  });
}

export async function saveManualVersion(
  textId: string,
  payload: { textoFinal: string; notes: string; nextStatus?: TextStatus },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const { supabase, user } = await requireReadyUser();
  const versionNumber = await getNextVersionNumber(textId);
  const currentOutput = detail.current_version?.output_payload_json;

  const output = {
    padroes_detectados: currentOutput?.padroes_detectados ?? [],
    esboco: currentOutput?.esboco ?? payload.textoFinal,
    texto_final: payload.textoFinal,
    resumo_das_alteracoes:
      currentOutput?.resumo_das_alteracoes ?? "Versao manual salva no app.",
    metadados_do_canal: currentOutput?.metadados_do_canal ?? {},
    diagnostico: currentOutput?.diagnostico,
    preset_aplicado: currentOutput?.preset_aplicado,
    modo_operacao: currentOutput?.modo_operacao,
    score_humanizacao: currentOutput?.score_humanizacao,
    alertas: currentOutput?.alertas,
    relatorio_curto: currentOutput?.relatorio_curto,
  };

  const { data, error } = await supabase
    .from("text_versions")
    .insert({
      text_id: textId,
      user_id: user.id,
      source: "manual",
      version_number: versionNumber,
      notes: payload.notes,
      output_payload_json: output,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const nextStatus = payload.nextStatus ?? "em_revisao";
  assertTransition(detail.status, nextStatus);

  const { error: textError } = await supabase
    .from("texts")
    .update({
      current_version_id: data.id,
      status: nextStatus,
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (textError) {
    throw new Error(textError.message);
  }
}

function assertTransition(current: TextStatus, next: TextStatus) {
  if (current === next) {
    return;
  }

  const validTransitions: Record<TextStatus, TextStatus[]> = {
    rascunho: ["gerado", "arquivado"],
    gerado: ["em_revisao", "aprovado", "arquivado"],
    em_revisao: ["aprovado", "arquivado"],
    aprovado: ["publicado", "em_revisao", "arquivado"],
    publicado: ["arquivado"],
    arquivado: [],
  };

  if (!validTransitions[current].includes(next)) {
    throw new Error(`Transicao invalida: ${current} -> ${next}.`);
  }
}

export async function updateTextStatus(
  textId: string,
  payload: { nextStatus: TextStatus; publishedUrl?: string },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  assertTransition(detail.status, payload.nextStatus);

  const { supabase, user } = await requireReadyUser();
  const { error } = await supabase
    .from("texts")
    .update({
      status: payload.nextStatus,
      published_url: payload.nextStatus === "publicado" ? payload.publishedUrl ?? null : null,
      published_at: payload.nextStatus === "publicado" ? new Date().toISOString() : null,
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setCurrentTextVersion(
  textId: string,
  versionId: string,
  payload: { nextStatus: TextStatus; publishedUrl?: string },
) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const targetVersion = detail.versions.find((version) => version.id === versionId);

  if (!targetVersion) {
    throw new Error("Versao nao encontrada.");
  }

  assertTransition(detail.status, payload.nextStatus);

  const { supabase, user } = await requireReadyUser();
  const { error } = await supabase
    .from("texts")
    .update({
      current_version_id: versionId,
      status: payload.nextStatus,
      published_url: payload.nextStatus === "publicado" ? payload.publishedUrl ?? null : null,
      published_at: payload.nextStatus === "publicado" ? new Date().toISOString() : null,
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function generateVersionForText(textId: string, notes?: string) {
  const detail = await getTextDetail(textId);

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  if (!detail.profile) {
    throw new Error("Perfil do texto nao encontrado.");
  }

  const preset = getChannelPreset(detail.channel_key);

  if (!preset) {
    throw new Error("Preset de canal nao encontrado.");
  }

  const { output, audit } = await generateHumanizedOutput({
    originalText: detail.original_text,
    profile: detail.profile,
    preset,
    controls: mapControls(detail),
  });

  const { supabase, user } = await requireReadyUser();
  const versionNumber = await getNextVersionNumber(textId);

  const { data, error } = await supabase
    .from("text_versions")
    .insert({
      text_id: textId,
      user_id: user.id,
      source: "llm",
      version_number: versionNumber,
      notes: notes ?? null,
      output_payload_json: output,
      prompt_version: audit.promptVersion,
      model: audit.model,
      input_tokens: audit.inputTokens,
      output_tokens: audit.outputTokens,
      total_tokens: audit.totalTokens,
      duration_ms: audit.durationMs,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const nextStatus = detail.status === "rascunho" ? "gerado" : "em_revisao";
  const { error: textError } = await supabase
    .from("texts")
    .update({
      current_version_id: data.id,
      status: nextStatus,
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (textError) {
    throw new Error(textError.message);
  }

  return output;
}

export async function insertGenerationError(textId: string, message: string) {
  const { supabase, user } = await requireReadyUser();
  const versionNumber = await getNextVersionNumber(textId);

  const { error } = await supabase.from("text_versions").insert({
    text_id: textId,
    user_id: user.id,
    source: "llm",
    version_number: versionNumber,
    notes: `Falha na geracao: ${message}`,
    error: message,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function softDeleteTextVersion(
  versionId: string,
  reason = "Versao removida da biblioteca.",
) {
  const { supabase, user } = await requireReadyUser();
  const { data: version, error: versionError } = await supabase
    .from("text_versions")
    .select("*")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (versionError) {
    throw new Error(versionError.message);
  }

  if (!version) {
    throw new Error("Versao nao encontrada.");
  }

  if ("deleted_at" in version && version.deleted_at) {
    return;
  }

  if (!("deleted_at" in version)) {
    throw new Error(
      "O banco ainda nao suporta apagar versoes pela biblioteca. Aplique a migracao de soft delete primeiro.",
    );
  }

  const detail = await getTextDetail(String(version.text_id));

  if (!detail) {
    throw new Error("Texto nao encontrado.");
  }

  const { error } = await supabase
    .from("text_versions")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
      deleted_reason: reason,
    })
    .eq("id", versionId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (detail.current_version_id !== versionId) {
    return;
  }

  const remainingVersions = await listTextVersionsByTextId({
    textId: String(version.text_id),
    userId: user.id,
  });

  const nextVersion = remainingVersions.sort(sortVersionsNewestFirst)[0] ?? null;
  const nextStatus = nextVersion
    ? detail.status === "arquivado"
      ? "arquivado"
      : nextVersion.source === "manual"
        ? "em_revisao"
        : "gerado"
    : "rascunho";

  const { error: textError } = await supabase
    .from("texts")
    .update({
      current_version_id: nextVersion?.id ?? null,
      status: nextStatus,
    })
    .eq("id", version.text_id)
    .eq("user_id", user.id);

  if (textError) {
    throw new Error(textError.message);
  }
}

