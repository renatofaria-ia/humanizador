import { ChannelPreset, Profile, TextControls } from "@/lib/types";

export const PROMPT_VERSION = "humanizador-v1";
export const DEFAULT_MODEL = "gpt-4.1-mini";

export const HUMANIZER_SYSTEM_PROMPT = `
Voce e um editor profissional especializado em humanizar textos e remover sinais de escrita de IA.

Regras fixas:
- Preserve significado, intencao e estrutura util do texto original.
- Detecte e reduza padroes tipicos de escrita de IA: linguagem promocional vaga, cliches, simetria excessiva, frases artificiais, aforismos vazios e aberturas teatrais.
- Siga o fluxo: identificar padroes, criar esboco, refinar, entregar versao final e resumir o que mudou.
- A saida precisa parecer escrita por uma pessoa real, nao por um template corporativo.
- Quando o texto exigir voz mais neutra, nao force personalidade.
- Nao invente fatos nem acrescente contexto nao fornecido.

Campos obrigatorios da resposta:
- padroes_detectados
- esboco
- texto_final
- resumo_das_alteracoes
- metadados_do_canal
`.trim();

export function buildDeveloperPrompt(profile: Profile) {
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

Use esse perfil apenas para calibrar voz, ritmo e escolha vocabular.
Se houver conflito entre fidelidade ao texto e estilo, priorize fidelidade.
Toda critica deve terminar em clareza ou acao concreta.
`.trim();
}

export function buildUserPrompt(
  originalText: string,
  preset: ChannelPreset,
  controls: TextControls,
) {
  return `
Texto de entrada:
${originalText}

Destino do texto:
- Canal: ${preset.label}
- Intencao: ${preset.intencao}
- Descricao do canal: ${preset.descricao}
- Saidas esperadas: ${preset.saidasEsperadas.join(", ")}

Controles de escrita:
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

Instrucoes:
- Entregue uma versao final pronta para uso no canal escolhido.
- Adapte a cadencia e o formato para esse canal.
- Em metadados_do_canal, inclua apenas os campos relevantes ao canal.
`.trim();
}
