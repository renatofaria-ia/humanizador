import { TextStatus } from "@/lib/types";

const STATUS_STYLES: Record<TextStatus, string> = {
  rascunho: "bg-slate-100 text-slate-700",
  gerado: "bg-amber-100 text-amber-800",
  em_revisao: "bg-sky-100 text-sky-800",
  aprovado: "bg-emerald-100 text-emerald-800",
  publicado: "bg-fuchsia-100 text-fuchsia-800",
  arquivado: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: TextStatus }) {
  return (
    <span
      className={`inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${STATUS_STYLES[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
