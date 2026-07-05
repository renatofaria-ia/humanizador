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

export type GenerationOutput = {
  padroes_detectados: string[];
  esboco: string;
  texto_final: string;
  resumo_das_alteracoes: string;
  metadados_do_canal: GenerationMetadata;
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
  created_at: string;
};

export type TextRecord = {
  id: string;
  user_id: string;
  title: string;
  original_text: string;
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
  published_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TextSummary = TextRecord & {
  profile?: Pick<Profile, "id" | "nome">;
  current_version?: TextVersion | null;
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
  | { mode: "forbidden"; email: string | null }
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
};
