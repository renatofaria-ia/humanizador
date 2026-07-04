import { ChannelKey, ChannelPreset } from "@/lib/types";

export const CHANNEL_PRESETS: ChannelPreset[] = [
  {
    key: "blog",
    label: "Blog",
    descricao: "Texto mais aprofundado, com estrutura clara e leitura fluida.",
    intencao: "Publicar artigo ou post de blog com autoridade e clareza.",
    saidasEsperadas: ["titulo", "subtitulo", "excerpt", "texto_final", "cta"],
  },
  {
    key: "instagram",
    label: "Instagram",
    descricao: "Legenda com ritmo mais forte, CTA curto e hashtags opcionais.",
    intencao: "Publicar legenda de Instagram com gancho inicial e fechamento acionavel.",
    saidasEsperadas: ["texto_final", "cta", "hashtags"],
  },
  {
    key: "x",
    label: "X",
    descricao: "Versao curta, direta e com possibilidade de abertura alternativa.",
    intencao: "Publicar no X com impacto rapido e pouco desperdicio de caracteres.",
    saidasEsperadas: ["texto_final", "alternativa_abertura"],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    descricao: "Tom mais profissional, com hook inicial e argumento claro.",
    intencao: "Publicar no LinkedIn com credibilidade e narrativa profissional.",
    saidasEsperadas: ["hook", "texto_final", "cta"],
  },
  {
    key: "email",
    label: "Email",
    descricao: "Assunto e corpo orientados a resposta ou acao.",
    intencao: "Enviar email com assunto forte e corpo direto.",
    saidasEsperadas: ["assunto", "corpo_email", "cta"],
  },
  {
    key: "generico",
    label: "Generico",
    descricao: "Reescrita neutra para uso amplo, sem formato de canal restrito.",
    intencao: "Humanizar um texto sem destinacao fechada.",
    saidasEsperadas: ["texto_final", "resumo_das_alteracoes"],
  },
];

export function getChannelPreset(channel: ChannelKey) {
  return CHANNEL_PRESETS.find((preset) => preset.key === channel);
}
