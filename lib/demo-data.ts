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
  source_bundle_id: "demo-bundle-1",
  title: "Legenda para Instagram sobre automacao de IA",
  original_text:
    "No cenario dinamico da transformacao digital, a inteligencia artificial surge como um divisor de aguas para empresas que buscam se destacar no mercado.",
  base_active: true,
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
  modo_operacao: "completo",
  preset_de_voz: "auto",
  published_url: null,
  published_at: null,
  created_at: now,
  updated_at: now,
};

export const demoTextLinkedinRecord: TextRecord = {
  id: "demo-text-2",
  user_id: "demo-user",
  source_bundle_id: "demo-bundle-1",
  title: "Legenda para Instagram sobre automacao de IA",
  original_text: demoTextRecord.original_text,
  base_active: true,
  profile_id: "demo-profile-renato",
  channel_key: "linkedin",
  status: "gerado",
  current_version_id: "demo-version-linkedin-1",
  objetivo: demoTextRecord.objetivo,
  cta: demoTextRecord.cta,
  tom: demoTextRecord.tom,
  tamanho: demoTextRecord.tamanho,
  formalidade: demoTextRecord.formalidade,
  usar_emojis: false,
  usar_hashtags: true,
  primeira_pessoa: true,
  nivel_ousadia: 4,
  instrucoes_extras: "Abrir com gancho mais executivo e menos promocional.",
  modo_operacao: "completo",
  preset_de_voz: "auto",
  published_url: null,
  published_at: null,
  created_at: now,
  updated_at: now,
};

export const demoVersions: TextVersion[] = [
  {
    id: "demo-version-linkedin-1",
    text_id: "demo-text-2",
    user_id: "demo-user",
    source: "llm",
    version_number: 1,
    notes: "Primeira sugestao para comparacao na biblioteca.",
    prompt_version: "humanizador-v2",
    model: "gpt-4.1-mini",
    input_tokens: 406,
    output_tokens: 233,
    total_tokens: 639,
    duration_ms: 1760,
    error: null,
    deleted_at: null,
    deleted_by: null,
    deleted_reason: null,
    created_at: now,
    output_payload_json: {
      padroes_detectados: ["Abertura abstrata", "Excesso de explicacao"],
      esboco:
        "Assistente de codigo nao e mais detalhe de stack. Ja esta mudando como software nasce, testa e evolui no dia a dia das equipes.",
      texto_final:
        "Assistente de codigo deixou de ser curiosidade de stack. Virou peca pratica de produtividade para quem escreve, revisa e testa software todos os dias. O ponto nao e usar mais IA. E saber onde ela realmente acelera, onde erra contexto e como encaixar isso no fluxo sem criar dependencia cega. E e exatamente aqui que a Graphify entra com clareza.",
      resumo_das_alteracoes:
        "Abertura mais direta, menos abstrata e com foco no impacto operacional do produto.",
      metadados_do_canal: {
        hook: "Assistente de codigo deixou de ser curiosidade de stack.",
        cta: "Vale comparar esse ganho com o fluxo atual do seu time.",
      },
      preset_aplicado: "corporativo-informal",
      modo_operacao: "completo",
      alertas: [],
      relatorio_curto: "Versao pronta para leitura comparativa ao lado da base.",
    },
  },
  {
    id: "demo-version-2",
    text_id: "demo-text-1",
    user_id: "demo-user",
    source: "manual",
    version_number: 2,
    notes: "Ajuste manual antes da aprovacao.",
    prompt_version: "humanizador-v2",
    model: "gpt-4.1-mini",
    input_tokens: 412,
    output_tokens: 215,
    total_tokens: 627,
    duration_ms: 1820,
    error: null,
    deleted_at: null,
    deleted_by: null,
    deleted_reason: null,
    created_at: now,
    output_payload_json: {
      padroes_detectados: ["Linguagem promocional vaga", "Vocabulário de IA"],
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
      diagnostico: [
        {
          categoria: "linguagem",
          sinal: "Linguagem promocional vaga",
          peso: 3,
          corrigido: true,
          acao: "Trocar abstrações por afirmações concretas e observáveis.",
        },
        {
          categoria: "tom",
          sinal: "Tom de palco corporativo",
          peso: 2,
          corrigido: true,
          acao: "Reduzir grandiosidade e aproximar a fala do contexto real de operação.",
        },
      ],
      preset_aplicado: "post-social",
      modo_operacao: "completo",
      score_humanizacao: {
        remocao_ia: 88,
        naturalidade: 84,
        fidelidade: 91,
        consistencia: 86,
        legibilidade: 89,
        total: 87,
      },
      alertas: [],
      relatorio_curto:
        "A versao final ficou mais humana ao sair do discurso genérico e assumir uma posição mais concreta. O risco residual é apenas de soar firme demais em contextos muito institucionais.",
    },
  },
  {
    id: "demo-version-1",
    text_id: "demo-text-1",
    user_id: "demo-user",
    source: "llm",
    version_number: 1,
    notes: "Versao legado para validar retrocompatibilidade.",
    prompt_version: "humanizador-v1",
    model: "gpt-4.1-mini",
    input_tokens: 388,
    output_tokens: 196,
    total_tokens: 584,
    duration_ms: 1710,
    error: null,
    deleted_at: null,
    deleted_by: null,
    deleted_reason: null,
    created_at: now,
    output_payload_json: {
      padroes_detectados: ["Linguagem promocional vaga", "Abertura teatral"],
      esboco:
        "IA ajuda quando sai do discurso abstrato e entra no processo real com clareza.",
      texto_final:
        "IA nao vira resultado so porque entrou no slide. Ela melhora o negocio quando entra no processo certo, com gargalo claro e dono definido.",
      resumo_das_alteracoes:
        "Removi exagero, troquei abstracao por linguagem mais concreta e deixei a frase principal mais direta.",
      metadados_do_canal: {
        cta: "Me chama no direct se quiser aplicar isso no seu negocio.",
      },
    },
  },
];

export const demoTextDetail: TextDetail = {
  ...demoTextRecord,
  profile: demoProfiles[0],
  current_version: demoVersions[0],
  versions: demoVersions,
  related_outputs: [
    {
      id: "demo-text-1",
      title: "Legenda para Instagram sobre automacao de IA",
      profile_id: "demo-profile-renato",
      channel_key: "instagram",
      status: "em_revisao",
      updated_at: now,
    },
    {
      id: "demo-text-2",
      title: "Legenda para Instagram sobre automacao de IA",
      profile_id: "demo-profile-renato",
      channel_key: "linkedin",
      status: "rascunho",
      updated_at: now,
    },
  ],
};

export const demoTexts = [
  {
    ...demoTextRecord,
    current_version: demoVersions[1],
    versions: [demoVersions[1], demoVersions[2]],
  },
  {
    ...demoTextLinkedinRecord,
    current_version: demoVersions[0],
    versions: [demoVersions[0]],
  },
];
export const demoTextBundles = demoTexts;
