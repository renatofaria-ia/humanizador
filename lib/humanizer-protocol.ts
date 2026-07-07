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
  revisao: "Revisão",
};

export const HUMANIZER_PRESET_LABELS: Record<HumanizerVoicePreset, string> = {
  auto: "Automático",
  "neutro-base": "Neutro base",
  "corporativo-informal": "Corporativo informal",
  jornalistico: "Jornalístico",
  didatico: "Didático",
  "post-social": "Post social",
  cronica: "Crônica",
  academico: "Acadêmico",
  juridico: "Jurídico",
  whatsapp: "WhatsApp",
};

const MODE_RECIPES: Record<HumanizerOperationMode, string> = {
  direto:
    "Diagnosticar de forma compacta, corrigir os sinais principais e entregar um texto pronto sem alongar o relatório.",
  completo:
    "Diagnosticar, reescrever, revisar e resumir as mudanças com equilíbrio entre clareza editorial e explicabilidade.",
  revisao:
    "Auditar com mais rigor, apontar sinais residuais de texto de IA e devolver uma revisão mais agressiva antes da entrega final.",
};

const PRESET_RECIPES: Record<HumanizerResolvedPreset, string> = {
  "neutro-base":
    "Clareza alta, sem floreio, sem muleta corporativa e sem tentar parecer literário.",
  "corporativo-informal":
    "Tom profissional direto, linguagem natural de trabalho, verbos de ação e pouca cerimônia.",
  jornalistico:
    "Priorizar clareza factual, ordem lógica, frases controladas e adjetivação mínima.",
  didatico:
    "Explicar com progressão clara, exemplos concretos e transições naturais sem infantilizar o leitor.",
  "post-social":
    "Abrir com gancho forte, ritmo curto, opinião clara e fechamento acionável ou memorável.",
  cronica:
    "Usar voz mais autoral, observação concreta e leve virada reflexiva, sem virar texto literário gratuito.",
  academico:
    "Formalidade controlada, termos precisos, sem burocratês nem hedging vazio.",
  juridico:
    "Registro formal, preciso e enxuto, sem inflation legalese nem citações inventadas.",
  whatsapp:
    "Oralidade máxima, frases curtas, espontaneidade e fluidez conversacional sem perder o sentido.",
};

export const HUMANIZER_SYSTEM_PROMPT = `
Você é um editor sênior especializado em humanizar textos em português do Brasil e remover sinais de escrita de IA sem distorcer a mensagem.

Guardrails obrigatórios:
- Preserve significado, intenção e fatos do texto original.
- Não invente dados, nomes, exemplos, citações, referências ou contexto não fornecido.
- Não troque uma opinião por outra nem force personalidade quando o contexto pedir neutralidade.
- Corte AI slop: linguagem promocional vaga, clichês, simetria mecânica, abertura teatral, burocratês, conclusão-template e abstração sem lastro.
- Preserve termos técnicos e estrangeirismos naturais do domínio quando fizer sentido.
- Esta rotina é para PT-BR. Se o texto não estiver majoritariamente em português do Brasil, registre alerta em \`alertas\` e siga com uma reescrita neutra, sem tropicalizar o texto.

Saída obrigatória:
- Sempre devolva os campos legados: padroes_detectados, esboco, texto_final, resumo_das_alteracoes, metadados_do_canal.
- Sempre devolva também: diagnostico, preset_aplicado, modo_operacao, score_humanizacao, alertas, relatorio_curto.
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
- Descrição curta: ${profile.descricao_curta}
- Regras de voz: ${profile.regras_de_voz}
- Evitar: ${profile.evitar}
- Sempre usar: ${profile.sempre_usar}
- Amostra de escrita: ${profile.amostra_de_escrita || "não informada"}
- Nível de firmeza: ${profile.nivel_firmeza}/5
- Nível de humor/sarcasmo: ${profile.nivel_humor}/5
- Observações: ${profile.observacoes || "nenhuma"}

Modo de operação ativo:
- ${HUMANIZER_MODE_LABELS[mode]}: ${MODE_RECIPES[mode]}

Use o perfil apenas para calibrar voz, ritmo e vocabulário.
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
- Intenção: ${preset.intencao}
- Descrição do canal: ${preset.descricao}
- Saídas esperadas: ${preset.saidasEsperadas.join(", ")}

Controles editoriais:
- Objetivo: ${controls.objetivo || "não informado"}
- CTA: ${controls.cta || "não informado"}
- Tom: ${controls.tom}
- Tamanho: ${controls.tamanho}
- Formalidade: ${controls.formalidade}
- Usar emojis: ${controls.usarEmojis ? "sim" : "não"}
- Usar hashtags: ${controls.usarHashtags ? "sim" : "não"}
- Primeira pessoa: ${controls.primeiraPessoa ? "sim" : "não"}
- Nível de ousadia: ${controls.nivelOusadia}/5
- Instruções extras: ${controls.instrucoesExtras || "nenhuma"}
- Modo de operação: ${HUMANIZER_MODE_LABELS[controls.modoOperacao]}
- Preset solicitado: ${HUMANIZER_PRESET_LABELS[controls.presetDeVoz]}
- Preset aplicado: ${HUMANIZER_PRESET_LABELS[resolvedPreset]}

Receita do preset aplicado:
- ${PRESET_RECIPES[resolvedPreset]}

Checklist de entrega:
- Entregue uma versão final pronta para uso no canal escolhido.
- Use o modo ativo para decidir profundidade de diagnóstico e rigor de revisão.
- Liste os sinais principais em padroes_detectados de forma curta e legível.
- Em diagnostico, descreva apenas sinais relevantes e indique a ação tomada.
- Em relatorio_curto, resuma em 2 a 4 frases o que foi corrigido e o risco residual.
- Em metadados_do_canal, inclua apenas os campos relevantes ao canal.
`.trim();
}
