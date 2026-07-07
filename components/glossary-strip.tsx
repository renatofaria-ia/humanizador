type GlossaryStripProps = {
  items: Array<{
    term: string;
    description: string;
  }>;
};

export function GlossaryStrip({ items }: GlossaryStripProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.term}
          className="rounded-[24px] border border-[var(--border)] bg-white/72 p-5"
        >
          <p className="text-xs font-semibold text-[var(--ink-muted)]">Guia rapido</p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">{item.term}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.description}</p>
        </article>
      ))}
    </section>
  );
}
