import {
  ChannelPreset,
  HumanizerOperationMode,
  HumanizerResolvedPreset,
  HumanizerVoicePreset,
  Profile,
  TextControls,
} from "@/lib/types";

export const PROMPT_VERSION = "humanizador-v2";
export const DEFAULT_MODEL = "gpt-4.1-mini";

export const HUMANIZER_MODE_LABELS: Record<HumanizerOperationMode, string> = {
  direto: "Direto",
  completo: "Completo",
  revisao: "Revisao",
};

export const HUMANIZER_PRESET_LABELS: Record<HumanizerVoicePreset, string> = {
  auto: "Auto",
  "neutro-base": "Neutro base",
  "corporativo-informal": "Corporativo informal",
  jornalistico: "Jornalistico",
  didatico: "Didatico",
  "post-social": "Post social",
  cronica: "Cronica",
  academico: "Academico",
  juridico: "Juridico",
  whatsapp: "WhatsApp",
};

const MODE_RECIPES: Record<HumanizerOperationMode, string> = {
  direto:
    "Diagnosticar de forma compacta, corrigir os sinais principais e entregar um texto pronto sem alongar o relatorio.",
  completo:
    "Diagnosticar, reescrever, revisar e resumir as mudancas com equilibrio entre clareza editorial e explicabilidade.",
  revisao:
    "Auditar com mais rigor, apontar sinais residuais de texto de IA e devolver uma revisao mais agressiva antes da entrega final.",
};

const PRESET_RECIPES: Record<HumanizerResolvedPreset, string> = {
  "neutro-base":
    "Clareza alta, sem floreio, sem muleta corporativa e sem tentar parecer literario.",
  "corporativo-informal":
    "Tom profissional direto, linguagem natural de trabalho, verbos de acao e pouca cerimonia.",
  jornalistico:
    "Priorizar clareza factual, ordem logica, frases controladas e adjetivacao minima.",
  didatico:
    "Explicar com progressao clara, exemplos concretos e transicoes naturais sem infantilizar o leitor.",
  "post-social":
    "Abrir com gancho forte, ritmo curto, opiniao clara e fechamento acionavel ou memoravel.",
  cronica:
    "Usar voz mais autoral, observacao concreta e leve virada reflexiva, sem virar texto literario gratuito.",
  academico:
    "Formalidade controlada, termos precisos, sem burocrates nem hedging vazio.",
  juridico:
    "Registro formal, preciso e enxuto, sem inflation legalese nem citacoes inventadas.",
  whatsapp:
    "Oralidade maxima, frases curtas, espontaneidade e fluidez conversacional sem perder o sentido.",
};

export const HUMANIZER_SYSTEM_PROMPT = `
Voce e um editor senior especializado em humanizar textos em portugues do Brasil e remover sinais de escrita de IA sem distorcer a mensagem.

Guardrails obrigatorios:
- Preserve significado, intencao e fatos do texto original.
- Nao invente dados, nomes, exemplos, citacoes, referencias ou contexto nao fornecido.
- Nao troque uma opiniao por outra nem force personalidade quando o contexto pedir neutralidade.
- Corte AI slop: linguagem promocional vaga, cliches, simetria mecanica, abertura teatral, burocrates, conclusao-template e abstracao sem lastro.
- Preserve termos tecnicos e estrangeirismos naturais do dominio quando fizer sentido.
- Esta rotina e para PT-BR. Se o texto nao estiver majoritariamente em portugues do Brasil, registre alerta em \`alertas\` e siga com uma reescrita neutra, sem tropicalizar o texto.

Saida obrigatoria:
- Sempre devolva os campos legados: padroes_detectados, esboco, texto_final, resumo_das_alteracoes, metadados_do_canal.
- Sempre devolva tambem: diagnostico, preset_aplicado, modo_operacao, score_humanizacao, alertas, relatorio_curto.
- Em diagnostico, use apenas categorias: conteudo, linguagem, tom, composicao, estilo, pt-br, estrangeirismos.
- Em score_humanizacao, use notas inteiras de 0 a 100 para remocao_ia, naturalidade, fidelidade, consistencia, legibilidade e total.
`.trim();

export function resolveHumanizerPreset(
  preset: ChannelPreset,
  controls: TextControls,
): HumanizerResolvedPreset {
  if (controls.presetDeVoz !== "auto") {
    return controls.presetDeVoz;
  }

  switch (preset.key) {
    case "instagram":
    case "x":
      return "post-social";
    case "linkedin":
    case "email":
      return "corporativo-informal";
    case "blog":
      return controls.tom === "didatico" ? "didatico" : "jornalistico";
    case "generico":
    default:
      return "neutro-base";
  }
}

export function buildDeveloperPrompt(profile: Profile, mode: HumanizerOperationMode) {
  return `
Perfil comportamental selecionado:
- Nome: ${profile.nome}
- Descricao curta: ${profile.descricao_curta}
- Regras de voz: ${profile.regras_de_voz}
- Evitar: ${profile.evitar}
- Sempre usar: ${profile.sempre_usar}
- Amostra de escrita: ${profile.amostra_de_escrita || "nao informada"}
- Nivel de firmeza: ${profile.nivel_firmeza}/5
- Nivel de humor/sarcasmo: ${profile.nivel_humor}/5
- Observacoes: ${profile.observacoes || "nenhuma"}

Modo de operacao ativo:
- ${HUMANIZER_MODE_LABELS[mode]}: ${MODE_RECIPES[mode]}

Use o perfil apenas para calibrar voz, ritmo e vocabulario.
Se houver conflito entre estilo e fidelidade, priorize fidelidade.
`.trim();
}

export function buildUserPrompt(
  originalText: string,
  preset: ChannelPreset,
  controls: TextControls,
  resolvedPreset: HumanizerResolvedPreset,
) {
  return `
Texto de entrada:
${originalText}

Destino do texto:
- Canal: ${preset.label}
- Intencao: ${preset.intencao}
- Descricao do canal: ${preset.descricao}
- Saidas esperadas: ${preset.saidasEsperadas.join(", ")}

Controles editoriais:
- Objetivo: ${controls.objetivo || "nao informado"}
- CTA: ${controls.cta || "nao informado"}
- Tom: ${controls.tom}
- Tamanho: ${controls.tamanho}
- Formalidade: ${controls.formalidade}
- Usar emojis: ${controls.usarEmojis ? "sim" : "nao"}
- Usar hashtags: ${controls.usarHashtags ? "sim" : "nao"}
- Primeira pessoa: ${controls.primeiraPessoa ? "sim" : "nao"}
- Nivel de ousadia: ${controls.nivelOusadia}/5
- Instrucoes extras: ${controls.instrucoesExtras || "nenhuma"}
- Modo de operacao: ${HUMANIZER_MODE_LABELS[controls.modoOperacao]}
- Preset solicitado: ${HUMANIZER_PRESET_LABELS[controls.presetDeVoz]}
- Preset aplicado: ${HUMANIZER_PRESET_LABELS[resolvedPreset]}

Receita do preset aplicado:
- ${PRESET_RECIPES[resolvedPreset]}

Checklist de entrega:
- Entregue uma versao final pronta para uso no canal escolhido.
- Use o modo ativo para decidir profundidade de diagnostico e rigor de revisao.
- Liste os sinais principais em padroes_detectados de forma curta e legivel.
- Em diagnostico, descreva apenas sinais relevantes e indique a acao tomada.
- Em relatorio_curto, resuma em 2 a 4 frases o que foi corrigido e o risco residual.
- Em metadados_do_canal, inclua apenas os campos relevantes ao canal.
`.trim();
}
