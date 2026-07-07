import { CHANNEL_PRESETS } from "@/lib/channel-presets";
import { ChannelKey, TextStatus } from "@/lib/types";

export const APP_NAV_LINKS = [
  { href: "/", label: "Painel" },
  { href: "/texts", label: "Textos" },
  { href: "/profiles", label: "Perfis" },
] as const;

export const APP_MOBILE_NAV_LINKS = [
  ...APP_NAV_LINKS,
  { href: "/texts/new", label: "Novo" },
] as const;

export const HEADER_NAV_BASE =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors";
export const HEADER_NAV_ACTIVE =
  "bg-[var(--accent)] text-white shadow-sm";
export const HEADER_NAV_INACTIVE =
  "border border-[var(--border)] bg-white/80 text-[var(--ink-soft)]";
export const HEADER_ACTION_PRIMARY =
  "inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm";
export const HEADER_META_TEXT = "text-sm text-[var(--ink-muted)]";
export const HEADER_TAB_BASE =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors";
export const HEADER_TAB_ACTIVE =
  "bg-[var(--accent)] text-white shadow-sm";
export const HEADER_TAB_INACTIVE =
  "border border-[var(--border)] bg-white/80 text-[var(--ink-soft)]";

export type GlossaryKey = "perfil" | "formato" | "status" | "estilo-de-voz";

const GLOSSARY_MAP: Record<GlossaryKey, { term: string; description: string }> = {
  perfil: {
    term: "Perfil",
    description: "Define a voz reutilizável do texto: tom, regras e calibragem.",
  },
  formato: {
    term: "Formato",
    description: "Cada formato representa um canal de saída criado a partir da mesma base.",
  },
  status: {
    term: "Status",
    description: "Mostra em que etapa editorial o texto está e qual é o próximo passo.",
  },
  "estilo-de-voz": {
    term: "Estilo de voz",
    description: "Ajuste avançado que orienta a forma final do texto antes da geração.",
  },
};

export const STATUS_META: Record<
  TextStatus,
  {
    label: string;
    helper: string;
    actionLabel: string;
    tone: string;
  }
> = {
  rascunho: {
    label: "Rascunho",
    helper: "Base pronta; falta gerar a primeira sugestão.",
    actionLabel: "Falta gerar",
    tone: "border border-slate-200 bg-white/80 text-slate-700",
  },
  gerado: {
    label: "Gerado",
    helper: "Já existe uma sugestão; falta revisar o texto final.",
    actionLabel: "Falta revisar",
    tone: "border border-amber-200 bg-amber-50 text-amber-800",
  },
  em_revisao: {
    label: "Em revisão",
    helper: "Texto em ajuste manual; falta aprovar ou publicar.",
    actionLabel: "Falta aprovar",
    tone: "border border-sky-200 bg-sky-50 text-sky-800",
  },
  aprovado: {
    label: "Aprovado",
    helper: "Texto aprovado internamente; falta registrar a publicação.",
    actionLabel: "Falta publicar",
    tone: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  publicado: {
    label: "Publicado",
    helper: "Texto concluído e marcado como publicado.",
    actionLabel: "Concluído",
    tone: "border border-violet-200 bg-violet-50 text-violet-800",
  },
  arquivado: {
    label: "Arquivado",
    helper: "Texto encerrado e fora da fila ativa.",
    actionLabel: "Encerrado",
    tone: "border border-zinc-200 bg-zinc-100/80 text-zinc-700",
  },
};

export function getGlossaryItems(keys: GlossaryKey[]) {
  return keys.map((key) => GLOSSARY_MAP[key]);
}

export function getStatusMeta(status: TextStatus) {
  return STATUS_META[status];
}

export function getChannelLabel(channelKey: ChannelKey) {
  return CHANNEL_PRESETS.find((preset) => preset.key === channelKey)?.label ?? channelKey;
}

export function getCurrentAreaLabel(pathname: string) {
  if (pathname === "/texts/new") {
    return "Novo texto";
  }

  if (pathname.startsWith("/texts/")) {
    return "Área de trabalho";
  }

  return APP_NAV_LINKS.find((link) =>
    link.href === "/"
      ? pathname === "/"
      : pathname === link.href || pathname.startsWith(`${link.href}/`),
  )?.label ?? "Painel";
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/texts/new") {
    return pathname === "/texts/new";
  }

  if (href === "/texts") {
    return pathname === "/texts" || (pathname.startsWith("/texts/") && pathname !== "/texts/new");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
