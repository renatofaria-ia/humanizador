"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireReadyUser } from "@/lib/app-context";
import { getAppEnv } from "@/lib/env";
import {
  createAdditionalOutputs,
  createProfile,
  createTextBundle,
  duplicateText,
  generateVersionForText,
  insertGenerationError,
  saveManualVersion,
  setCurrentTextVersion,
  softDeleteTextVersion,
  updateTextGenerationSettings,
  updateSharedBase,
  updateProfile,
  updateTextDraft,
  updateTextStatus,
} from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readNumber(formData: FormData, key: string, fallback = 3) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function readChannelKeys(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function buildLoginErrorUrl(code: string) {
  const params = new URLSearchParams({ error: code });
  return `/login?${params.toString()}`;
}

function buildTextTabUrl(textId: string, tab: "base" | "texto-final" | "historico") {
  const params = new URLSearchParams({ tab });
  return `/texts/${textId}?${params.toString()}`;
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const env = getAppEnv();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildLoginErrorUrl("setup"));
  }

  if (!env.hasSupabase || !email || !password) {
    redirect(buildLoginErrorUrl("invalid_credentials"));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildLoginErrorUrl("invalid_credentials"));
  }

  redirect("/");
}

export async function signOutAction() {
  const { supabase } = await requireReadyUser();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createProfileAction(formData: FormData) {
  await createProfile({
    nome: String(formData.get("nome") ?? ""),
    descricao_curta: String(formData.get("descricao_curta") ?? ""),
    regras_de_voz: String(formData.get("regras_de_voz") ?? ""),
    evitar: String(formData.get("evitar") ?? ""),
    sempre_usar: String(formData.get("sempre_usar") ?? ""),
    amostra_de_escrita: String(formData.get("amostra_de_escrita") ?? ""),
    nivel_firmeza: readNumber(formData, "nivel_firmeza", 3),
    nivel_humor: readNumber(formData, "nivel_humor", 2),
    observacoes: String(formData.get("observacoes") ?? ""),
  });

  revalidatePath("/profiles");
  revalidatePath("/");
}

export async function updateProfileAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");

  await updateProfile(profileId, {
    nome: String(formData.get("nome") ?? ""),
    descricao_curta: String(formData.get("descricao_curta") ?? ""),
    regras_de_voz: String(formData.get("regras_de_voz") ?? ""),
    evitar: String(formData.get("evitar") ?? ""),
    sempre_usar: String(formData.get("sempre_usar") ?? ""),
    amostra_de_escrita: String(formData.get("amostra_de_escrita") ?? ""),
    nivel_firmeza: readNumber(formData, "nivel_firmeza", 3),
    nivel_humor: readNumber(formData, "nivel_humor", 2),
    observacoes: String(formData.get("observacoes") ?? ""),
  });

  revalidatePath("/profiles");
}

export async function createTextAction(formData: FormData) {
  const selectedChannels = readChannelKeys(formData, "output_channels");
  const { created } = await createTextBundle({
    title: String(formData.get("title") ?? ""),
    originalText: String(formData.get("original_text") ?? ""),
    profileId: String(formData.get("profile_id") ?? ""),
    channelKeys:
      (selectedChannels.length
        ? selectedChannels
        : [String(formData.get("channel_key") ?? "linkedin")]) as never,
    controls: {
      objetivo: String(formData.get("objetivo") ?? ""),
      cta: String(formData.get("cta") ?? ""),
      tom: String(formData.get("tom") ?? "consultivo") as never,
      tamanho: String(formData.get("tamanho") ?? "medio") as never,
      formalidade: String(formData.get("formalidade") ?? "media") as never,
      usarEmojis: readBoolean(formData, "usar_emojis"),
      usarHashtags: readBoolean(formData, "usar_hashtags"),
      primeiraPessoa: readBoolean(formData, "primeira_pessoa"),
      nivelOusadia: readNumber(formData, "nivel_ousadia", 3),
      instrucoesExtras: String(formData.get("instrucoes_extras") ?? ""),
      modoOperacao: String(formData.get("modo_operacao") ?? "completo") as never,
      presetDeVoz: String(formData.get("preset_de_voz") ?? "auto") as never,
    },
  });

  const redirectId = created[0]?.id;

  if (!redirectId) {
    throw new Error("Nenhum output foi criado para este texto.");
  }

  revalidatePath("/");
  revalidatePath("/texts");
  redirect(`/texts/${redirectId}`);
}

export async function updateTextDraftAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  await updateTextDraft(textId, {
    title: String(formData.get("title") ?? ""),
    originalText: String(formData.get("original_text") ?? ""),
    profileId: String(formData.get("profile_id") ?? ""),
    controls: {
      objetivo: String(formData.get("objetivo") ?? ""),
      cta: String(formData.get("cta") ?? ""),
      tom: String(formData.get("tom") ?? "consultivo") as never,
      tamanho: String(formData.get("tamanho") ?? "medio") as never,
      formalidade: String(formData.get("formalidade") ?? "media") as never,
      usarEmojis: readBoolean(formData, "usar_emojis"),
      usarHashtags: readBoolean(formData, "usar_hashtags"),
      primeiraPessoa: readBoolean(formData, "primeira_pessoa"),
      nivelOusadia: readNumber(formData, "nivel_ousadia", 3),
      instrucoesExtras: String(formData.get("instrucoes_extras") ?? ""),
      modoOperacao: String(formData.get("modo_operacao") ?? "completo") as never,
      presetDeVoz: String(formData.get("preset_de_voz") ?? "auto") as never,
    },
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
}

export async function updateSharedBaseAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");

  await updateSharedBase(textId, {
    originalText: String(formData.get("original_text") ?? ""),
    baseActive: String(formData.get("base_active") ?? "ativo") !== "inativo",
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
}

export async function duplicateTextAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const duplicatedId = await duplicateText(textId);
  revalidatePath("/texts");
  redirect(`/texts/${duplicatedId}`);
}

export async function createAdditionalOutputsAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const selectedChannels = readChannelKeys(formData, "output_channels");
  const { created } = await createAdditionalOutputs(textId, selectedChannels as never);
  const redirectId = created[0]?.id ?? textId;

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
  redirect(`/texts/${redirectId}`);
}

export async function saveManualVersionAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  await saveManualVersion(textId, {
    textoFinal: String(formData.get("texto_final") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    nextStatus: (String(formData.get("status") ?? "").trim() || undefined) as never,
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
}

export async function generateTextAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  let didGenerate = false;

  try {
    await generateVersionForText(textId, String(formData.get("notes") ?? ""));
    didGenerate = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida";
    await insertGenerationError(textId, message);
  }

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  redirect(buildTextTabUrl(textId, didGenerate ? "texto-final" : "historico"));
}

export async function generateTextFromLibraryAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const notes =
    String(formData.get("notes") ?? "").trim() ||
    "Geracao iniciada pela biblioteca com ajustes definidos.";
  let didGenerate = false;

  await updateTextGenerationSettings(textId, {
    profileId: String(formData.get("profile_id") ?? ""),
    controls: {
      objetivo: String(formData.get("objetivo") ?? ""),
      cta: String(formData.get("cta") ?? ""),
      tom: String(formData.get("tom") ?? "consultivo") as never,
      tamanho: String(formData.get("tamanho") ?? "medio") as never,
      formalidade: String(formData.get("formalidade") ?? "media") as never,
      usarEmojis: readBoolean(formData, "usar_emojis"),
      usarHashtags: readBoolean(formData, "usar_hashtags"),
      primeiraPessoa: readBoolean(formData, "primeira_pessoa"),
      nivelOusadia: readNumber(formData, "nivel_ousadia", 3),
      instrucoesExtras: String(formData.get("instrucoes_extras") ?? ""),
      modoOperacao: String(formData.get("modo_operacao") ?? "completo") as never,
      presetDeVoz: String(formData.get("preset_de_voz") ?? "auto") as never,
    },
  });

  try {
    await generateVersionForText(textId, notes);
    didGenerate = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida";
    await insertGenerationError(textId, message);
  }

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
  redirect(buildTextTabUrl(textId, didGenerate ? "texto-final" : "historico"));
}

export async function createAndGenerateTextFromLibraryAction(formData: FormData) {
  const sourceTextId = String(formData.get("source_text_id") ?? "");
  const channelKey = String(formData.get("channel_key") ?? "").trim();
  const notes =
    String(formData.get("notes") ?? "").trim() ||
    "Output criado e gerado pela biblioteca com ajustes definidos.";

  const { created } = await createAdditionalOutputs(sourceTextId, [channelKey] as never);
  const textId = created[0]?.id;

  if (!textId) {
    throw new Error("Nao foi possivel criar o output selecionado.");
  }

  let didGenerate = false;

  await updateTextGenerationSettings(textId, {
    profileId: String(formData.get("profile_id") ?? ""),
    controls: {
      objetivo: String(formData.get("objetivo") ?? ""),
      cta: String(formData.get("cta") ?? ""),
      tom: String(formData.get("tom") ?? "consultivo") as never,
      tamanho: String(formData.get("tamanho") ?? "medio") as never,
      formalidade: String(formData.get("formalidade") ?? "media") as never,
      usarEmojis: readBoolean(formData, "usar_emojis"),
      usarHashtags: readBoolean(formData, "usar_hashtags"),
      primeiraPessoa: readBoolean(formData, "primeira_pessoa"),
      nivelOusadia: readNumber(formData, "nivel_ousadia", 3),
      instrucoesExtras: String(formData.get("instrucoes_extras") ?? ""),
      modoOperacao: String(formData.get("modo_operacao") ?? "completo") as never,
      presetDeVoz: String(formData.get("preset_de_voz") ?? "auto") as never,
    },
  });

  try {
    await generateVersionForText(textId, notes);
    didGenerate = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida";
    await insertGenerationError(textId, message);
  }

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
  redirect(buildTextTabUrl(textId, didGenerate ? "texto-final" : "historico"));
}

export async function updateTextStatusAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  await updateTextStatus(textId, {
    nextStatus: String(formData.get("status") ?? "rascunho") as never,
    publishedUrl: String(formData.get("published_url") ?? ""),
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
}

export async function approveTextVersionAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const versionId = String(formData.get("version_id") ?? "");

  await setCurrentTextVersion(textId, versionId, {
    nextStatus: "aprovado",
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
}

export async function deleteTextVersionAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const versionId = String(formData.get("version_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  await softDeleteTextVersion(versionId, reason || "Versao removida da biblioteca.");

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
  revalidatePath("/");
}
