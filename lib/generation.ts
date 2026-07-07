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
  resolveHumanizerPreset,
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
  diagnostico: z.array(
    z.object({
      categoria: z.enum([
        "conteudo",
        "linguagem",
        "tom",
        "composicao",
        "estilo",
        "pt-br",
        "estrangeirismos",
      ]),
      sinal: z.string(),
      peso: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      corrigido: z.boolean(),
      acao: z.string(),
    }),
  ),
  preset_aplicado: z.enum([
    "neutro-base",
    "corporativo-informal",
    "jornalistico",
    "didatico",
    "post-social",
    "cronica",
    "academico",
    "juridico",
    "whatsapp",
  ]),
  modo_operacao: z.enum(["direto", "completo", "revisao"]),
  score_humanizacao: z.object({
    remocao_ia: z.number().int().min(0).max(100),
    naturalidade: z.number().int().min(0).max(100),
    fidelidade: z.number().int().min(0).max(100),
    consistencia: z.number().int().min(0).max(100),
    legibilidade: z.number().int().min(0).max(100),
    total: z.number().int().min(0).max(100),
  }),
  alertas: z.array(z.string()),
  relatorio_curto: z.string(),
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
  const resolvedPreset = resolveHumanizerPreset(input.preset, input.controls);
  const developerPrompt = buildDeveloperPrompt(input.profile, input.controls.modoOperacao);
  const userPrompt = buildUserPrompt(
    input.originalText,
    input.preset,
    input.controls,
    resolvedPreset,
  );

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
      diagnostico: result.object.diagnostico ?? [],
      alertas: result.object.alertas ?? [],
      preset_aplicado: result.object.preset_aplicado ?? resolvedPreset,
      modo_operacao: result.object.modo_operacao ?? input.controls.modoOperacao,
    } as GenerationOutput,
    audit,
  };
}
