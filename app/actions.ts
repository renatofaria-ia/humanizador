"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRedirectUrl, requireReadyUser } from "@/lib/app-context";
import { getAppEnv } from "@/lib/env";
import {
  createProfile,
  createText,
  duplicateText,
  generateVersionForText,
  insertGenerationError,
  saveManualVersion,
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

export async function requestMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const env = getAppEnv();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  if (env.ownerEmail && email !== env.ownerEmail) {
    throw new Error("Este app aceita apenas o email do owner configurado.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/login?sent=1");
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
  const textId = await createText({
    title: String(formData.get("title") ?? ""),
    originalText: String(formData.get("original_text") ?? ""),
    profileId: String(formData.get("profile_id") ?? ""),
    channelKey: String(formData.get("channel_key") ?? "generico") as never,
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
    },
  });

  revalidatePath("/");
  revalidatePath("/texts");
  redirect(`/texts/${textId}`);
}

export async function updateTextDraftAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  await updateTextDraft(textId, {
    title: String(formData.get("title") ?? ""),
    originalText: String(formData.get("original_text") ?? ""),
    profileId: String(formData.get("profile_id") ?? ""),
    channelKey: String(formData.get("channel_key") ?? "generico") as never,
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
    },
  });

  revalidatePath(`/texts/${textId}`);
  revalidatePath("/texts");
}

export async function duplicateTextAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  const duplicatedId = await duplicateText(textId);
  revalidatePath("/texts");
  redirect(`/texts/${duplicatedId}`);
}

export async function saveManualVersionAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");
  await saveManualVersion(textId, {
    textoFinal: String(formData.get("texto_final") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  revalidatePath(`/texts/${textId}`);
}

export async function generateTextAction(formData: FormData) {
  const textId = String(formData.get("text_id") ?? "");

  try {
    await generateVersionForText(textId, String(formData.get("notes") ?? ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida";
    await insertGenerationError(textId, message);
  }

  revalidatePath(`/texts/${textId}`);
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
