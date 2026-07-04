type SetupCalloutProps = {
  title?: string;
};

export function SetupCallout({
  title = "Configuracao pendente",
}: SetupCalloutProps) {
  return (
    <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(26,32,44,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Setup mode
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
        O app ja foi estruturado para Vercel + Supabase + OpenAI, mas este ambiente
        ainda nao recebeu as variaveis e o banco do projeto novo. Configure
        `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
        (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `APP_OWNER_EMAIL`, `OPENAI_API_KEY`
        e rode o schema em `supabase/schema.sql` para sair do modo demonstracao.
      </p>
    </div>
  );
}
