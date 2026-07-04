import { Profile, TextDetail, TextRecord, TextVersion } from "@/lib/types";

const now = new Date().toISOString();

export const demoProfiles: Profile[] = [
  {
    id: "demo-profile-renato",
    user_id: "demo-user",
    nome: "Renato Faria",
    descricao_curta: "Comunicador-executor com autoridade tecnica.",
    regras_de_voz:
      "Direto, pedagogico e com senso de urgencia. Sempre levar para acao concreta.",
    evitar: "cliches corporativos, floreio vazio, abertura teatral, moral da historia",
    sempre_usar:
      "clareza, impacto, contexto pratico, conclusao acionavel e exemplos concretos",
    amostra_de_escrita:
      "O leitor precisa sentir que esta falando com alguem que ja viveu aquilo.",
    nivel_firmeza: 4,
    nivel_humor: 2,
    observacoes: "Sarcasmo leve como ponte. Nunca como ataque.",
    created_at: now,
    updated_at: now,
  },
];

export const demoTextRecord: TextRecord = {
  id: "demo-text-1",
  user_id: "demo-user",
  title: "Legenda para Instagram sobre automacao de IA",
  original_text:
    "No cenario dinamico da transformacao digital, a inteligencia artificial surge como um divisor de aguas para empresas que buscam se destacar no mercado.",
  profile_id: "demo-profile-renato",
  channel_key: "instagram",
  status: "em_revisao",
  current_version_id: "demo-version-2",
  objetivo: "Gerar uma legenda com autoridade e CTA final.",
  cta: "Me chama no direct se quiser aplicar isso no seu negocio.",
  tom: "provocativo",
  tamanho: "curto",
  formalidade: "media",
  usar_emojis: false,
  usar_hashtags: true,
  primeira_pessoa: true,
  nivel_ousadia: 4,
  instrucoes_extras: "Nao usar linguagem de palestra.",
  published_url: null,
  published_at: null,
  created_at: now,
  updated_at: now,
};

export const demoVersions: TextVersion[] = [
  {
    id: "demo-version-2",
    text_id: "demo-text-1",
    user_id: "demo-user",
    source: "manual",
    version_number: 2,
    notes: "Ajuste manual antes da aprovacao.",
    prompt_version: "humanizador-v1",
    model: "gpt-4.1-mini",
    input_tokens: 412,
    output_tokens: 215,
    total_tokens: 627,
    duration_ms: 1820,
    error: null,
    created_at: now,
    output_payload_json: {
      padroes_detectados: ["#4 Linguagem promocional", "#7 Vocabulário de IA"],
      esboco:
        "Todo mundo fala de IA como se fosse uma revolucao pronta. Nao e. O problema sempre foi tirar a ideia bonita do slide e colocar para funcionar no processo real.",
      texto_final:
        "IA nao melhora empresa por discurso. Melhora quando entra no processo e para de parecer projeto de palco. Se voce ainda esta vendendo transformacao digital sem dizer onde o trabalho trava, esta falando bonito e resolvendo pouco. Me chama no direct se quiser aplicar isso no seu negocio.",
      resumo_das_alteracoes:
        "Cortei linguagem inflada, troquei abstrações por afirmações concretas e deixei o fechamento mais acionável.",
      metadados_do_canal: {
        cta: "Me chama no direct se quiser aplicar isso no seu negocio.",
        hashtags: ["#inteligenciaartificial", "#automacao", "#negocios"],
      },
    },
  },
];

export const demoTextDetail: TextDetail = {
  ...demoTextRecord,
  profile: demoProfiles[0],
  current_version: demoVersions[0],
  versions: demoVersions,
};

export const demoTexts = [demoTextRecord];
