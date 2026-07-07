export const TEXT_STATUSES = [
  "rascunho",
  "gerado",
  "em_revisao",
  "aprovado",
  "publicado",
  "arquivado",
] as const;

export type TextStatus = (typeof TEXT_STATUSES)[number];

export const CHANNEL_KEYS = [
  "blog",
  "instagram",
  "x",
  "linkedin",
  "email",
  "generico",
] as const;

export type ChannelKey = (typeof CHANNEL_KEYS)[number];
export type VersionSource = "llm" | "manual";
export type TextSize = "curto" | "medio" | "longo";
export type TextTone =
  | "neutro"
  | "consultivo"
  | "didatico"
  | "provocativo"
  | "institucional";
export type TextFormality = "baixa" | "media" | "alta";
export const HUMANIZER_OPERATION_MODES = ["direto", "completo", "revisao"] as const;
export const HUMANIZER_VOICE_PRESETS = [
  "auto",
  "neutro-base",
  "corporativo-informal",
  "jornalistico",
  "didatico",
  "post-social",
  "cronica",
  "academico",
  "juridico",
  "whatsapp",
] as const;

export type HumanizerOperationMode = (typeof HUMANIZER_OPERATION_MODES)[number];
export type HumanizerVoicePreset = (typeof HUMANIZER_VOICE_PRESETS)[number];
export type HumanizerResolvedPreset = Exclude<HumanizerVoicePreset, "auto">;

export type TextControls = {
  objetivo: string;
  cta: string;
  tom: TextTone;
  tamanho: TextSize;
  formalidade: TextFormality;
  usarEmojis: boolean;
  usarHashtags: boolean;
  primeiraPessoa: boolean;
  nivelOusadia: number;
  instrucoesExtras: string;
  modoOperacao: HumanizerOperationMode;
  presetDeVoz: HumanizerVoicePreset;
};

export type Profile = {
  id: string;
  user_id: string;
  nome: string;
  descricao_curta: string;
  regras_de_voz: string;
  evitar: string;
  sempre_usar: string;
  amostra_de_escrita: string;
  nivel_firmeza: number;
  nivel_humor: number;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

export type ChannelPreset = {
  key: ChannelKey;
  label: string;
  descricao: string;
  intencao: string;
  saidasEsperadas: string[];
};

export type GenerationMetadata = {
  titulo?: string;
  subtitulo?: string;
  excerpt?: string;
  cta?: string;
  hashtags?: string[];
  alternativa_abertura?: string;
  hook?: string;
  assunto?: string;
  corpo_email?: string;
};

export type GenerationDiagnosticCategory =
  | "conteudo"
  | "linguagem"
  | "tom"
  | "composicao"
  | "estilo"
  | "pt-br"
  | "estrangeirismos";

export type GenerationDiagnosticItem = {
  categoria: GenerationDiagnosticCategory;
  sinal: string;
  peso: 1 | 2 | 3;
  corrigido: boolean;
  acao: string;
};

export type GenerationScore = {
  remocao_ia: number;
  naturalidade: number;
  fidelidade: number;
  consistencia: number;
  legibilidade: number;
  total: number;
};

export type GenerationOutput = {
  padroes_detectados: string[];
  esboco: string;
  texto_final: string;
  resumo_das_alteracoes: string;
  metadados_do_canal: GenerationMetadata;
  diagnostico?: GenerationDiagnosticItem[];
  preset_aplicado?: HumanizerResolvedPreset;
  modo_operacao?: HumanizerOperationMode;
  score_humanizacao?: GenerationScore;
  alertas?: string[];
  relatorio_curto?: string;
};

export type GenerationAudit = {
  model: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  durationMs: number;
};

export type TextVersion = {
  id: string;
  text_id: string;
  user_id: string;
  source: VersionSource;
  version_number: number;
  notes: string | null;
  output_payload_json: GenerationOutput | null;
  prompt_version: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  duration_ms: number | null;
  error: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  deleted_reason: string | null;
  created_at: string;
};

export type TextRecord = {
  id: string;
  user_id: string;
  source_bundle_id?: string | null;
  title: string;
  original_text: string;
  base_active: boolean;
  profile_id: string;
  channel_key: ChannelKey;
  status: TextStatus;
  current_version_id: string | null;
  objetivo: string;
  cta: string;
  tom: TextTone;
  tamanho: TextSize;
  formalidade: TextFormality;
  usar_emojis: boolean;
  usar_hashtags: boolean;
  primeira_pessoa: boolean;
  nivel_ousadia: number;
  instrucoes_extras: string;
  modo_operacao: HumanizerOperationMode;
  preset_de_voz: HumanizerVoicePreset;
  published_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TextSummary = TextRecord & {
  profile?: Pick<Profile, "id" | "nome">;
  current_version?: TextVersion | null;
  versions?: TextVersion[];
};

export type TextOutputVariant = Pick<
  TextRecord,
  "id" | "title" | "channel_key" | "status" | "updated_at"
> & {
  profile_id: string;
};

export type TextDetail = TextSummary & {
  profile: Profile | null;
  versions: TextVersion[];
  related_outputs: TextOutputVariant[];
};

export type AppViewer = {
  id: string;
  email: string;
};

export type AppAccess =
  | { mode: "setup" }
  | { mode: "login-required" }
  | { mode: "ready"; user: AppViewer };

export const DEFAULT_TEXT_CONTROLS: TextControls = {
  objetivo: "",
  cta: "",
  tom: "consultivo",
  tamanho: "medio",
  formalidade: "media",
  usarEmojis: false,
  usarHashtags: false,
  primeiraPessoa: true,
  nivelOusadia: 3,
  instrucoesExtras: "",
  modoOperacao: "completo",
  presetDeVoz: "auto",
};
