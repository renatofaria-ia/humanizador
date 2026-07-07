type NextStepCardProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function NextStepCard({ title, description, actions }: NextStepCardProps) {
  return (
    <section className="rounded-[32px] border border-[rgba(176,71,52,0.16)] bg-[linear-gradient(135deg,rgba(255,247,244,0.95),rgba(255,255,255,0.92))] p-6 shadow-[0_14px_36px_rgba(176,71,52,0.08)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[var(--accent)]">
            Proximo passo
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)] text-balance">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
