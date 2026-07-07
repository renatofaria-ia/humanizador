import { getStatusMeta } from "@/lib/ui";
import { TextStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TextStatus }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold ${meta.tone}`}
    >
      {meta.label}
    </span>
  );
}
