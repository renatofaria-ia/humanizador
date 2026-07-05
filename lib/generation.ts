import "server-only";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

import { getAppEnv } from "@/lib/env";
import {
  buildDeveloperPrompt,
  buildUserPrompt,
  DEFAULT_MODEL,
  HUMANIZER_SYSTEM_PROMPT,
  PROMPT_VERSION,
} from "@/lib/humanizer-protocol";
import { ChannelPreset, GenerationAudit, GenerationOutput, Profile, TextControls } from "@/lib/types";

const metadataSchema = z.object({
  titulo: z.string().nullable(),
  subtitulo: z.string().nullable(),
  excerpt: z.string().nullable(),
  cta: z.string().nullable(),
  hashtags: z.array(z.string()).nullable(),
  alternativa_abertura: z.string().nullable(),
  hook: z.string().nullable(),
  assunto: z.string().nullable(),
  corpo_email: z.string().nullable(),
});

const outputSchema = z.object({
  padroes_detectados: z.array(z.string()),
  esboco: z.string(),
  texto_final: z.string(),
  resumo_das_alteracoes: z.string(),
  metadados_do_canal: metadataSchema,
});

export async function generateHumanizedOutput(input: {
  originalText: string;
  profile: Profile;
  preset: ChannelPreset;
  controls: TextControls;
}) {
  const env = getAppEnv();

  if (!env.hasOpenAi) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  const openai = createOpenAI({
    apiKey: env.openAiApiKey,
  });

  const startedAt = Date.now();
  const developerPrompt = buildDeveloperPrompt(input.profile);
  const userPrompt = buildUserPrompt(input.originalText, input.preset, input.controls);

  const result = await generateObject({
    model: openai(DEFAULT_MODEL),
    schema: outputSchema,
    temperature: 0.7,
    system: HUMANIZER_SYSTEM_PROMPT,
    prompt: `Camada de perfil:\n${developerPrompt}\n\nPedido do usuario:\n${userPrompt}`,
  });

  const audit: GenerationAudit = {
    model: DEFAULT_MODEL,
    promptVersion: PROMPT_VERSION,
    inputTokens: result.usage?.inputTokens ?? null,
    outputTokens: result.usage?.outputTokens ?? null,
    totalTokens: result.usage?.totalTokens ?? null,
    durationMs: Date.now() - startedAt,
  };

  const metadadosDoCanal = Object.fromEntries(
    Object.entries(result.object.metadados_do_canal).filter(([, value]) => value != null),
  ) as GenerationOutput["metadados_do_canal"];

  return {
    output: {
      ...result.object,
      metadados_do_canal: metadadosDoCanal,
    } as GenerationOutput,
    audit,
  };
}
