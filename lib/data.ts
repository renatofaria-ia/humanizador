import "server-only";

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
    objetivo: record.objetivo,
    cta: record.cta,
    tom: record.tom,
    tamanho: record.tamanho,
    formalidade: record.formalidade,
    usarEmojis: record.usar_emojis,
    usarHashtags: record.usar_hashtags,
    primeiraPessoa: record.primeira_pessoa,
    nivelOusadia: record.nivel_ousadia,
    instrucoesExtras: record.instrucoes_extras,
  };
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
    .select("*, profiles(id, nome)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<TextSummary & { profiles?: { id: string; nome: string } }>).map(
    (item) => ({
      ...item,
      profile: item.profiles,
    }),
  );
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

  const { data: versions, error: versionError } = await supabase
    .from("text_versions")
    .select("*")
    .eq("text_id", textId)
    .eq("user_id", user.id)
    .order("version_number", { ascending: false });

  if (versionError) {
    throw new Error(versionError.message);
  }

  const relatedOutputs = await listRelatedOutputsForSource({
    title: text.title,
    originalText: text.original_text,
    profileId: text.profile_id,
  });

  const currentVersion =
    (versions ?? []).find((version) => version.id === text.current_version_id) ??
    (versions ?? [])[0] ??
    null;

  return {
    ...(text as TextRecord),
    profile: (text as { profiles?: Profile }).profiles ?? null,
    current_version: currentVersion as TextVersion | null,
    versions: (versions ?? []) as TextVersion[],
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
  const controls = { ...DEFAULT_TEXT_CONTROLS, ...(input.controls ?? {}) };

  const { data, error } = await supabase
    .from("texts")
    .insert({
      user_id: user.id,
      title: input.title,
      original_text: input.originalText,
      profile_id: input.profileId,
      channel_key: input.channelKey,
      status: "rascunho",
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
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function createTextBundle(input: {
  title: string;
  originalText: string;
  profileId: string;
  channelKeys: ChannelKey[];
  controls?: Partial<TextControls>;
}) {
  const { supabase, user } = await requireReadyUser();
  const controls = { ...DEFAULT_TEXT_CONTROLS, ...(input.controls ?? {}) };
  const channelKeys = normalizeChannelKeys(input.channelKeys);

  if (!channelKeys.length) {
    throw new Error("Selecione pelo menos um canal de output.");
  }
  const { data, error } = await supabase
    .from("texts")
    .insert(
      channelKeys.map((channelKey) => ({
        user_id: user.id,
        title: input.title,
        original_text: input.originalText,
        profile_id: input.profileId,
        channel_key: channelKey,
        status: "rascunho",
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
      })),
    )
    .select("id, channel_key");

  if (error) {
    throw new Error(error.message);
  }

  return {
    created: (data ?? []) as Array<{ id: string; channel_key: ChannelKey }>,
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
  const { error } = await supabase
    .from("texts")
    .update({
      title: input.title,
      original_text: input.originalText,
      profile_id: input.profileId,
      objetivo: input.controls.objetivo,
      cta: input.controls.cta,
      tom: input.controls.tom,
      tamanho: input.controls.tamanho,
      formalidade: input.controls.formalidade,
      usar_emojis: input.controls.usarEmojis,
      usar_hashtags: input.controls.usarHashtags,
      primeira_pessoa: input.controls.primeiraPessoa,
      nivel_ousadia: input.controls.nivelOusadia,
      instrucoes_extras: input.controls.instrucoesExtras,
    })
    .in("id", relatedOutputIds)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
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
  });
}

export async function saveManualVersion(textId: string, payload: { textoFinal: string; notes: string }) {
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

  const { error: textError } = await supabase
    .from("texts")
    .update({
      current_version_id: data.id,
      status: "em_revisao",
    })
    .eq("id", textId)
    .eq("user_id", user.id);

  if (textError) {
    throw new Error(textError.message);
  }
}

function assertTransition(current: TextStatus, next: TextStatus) {
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
