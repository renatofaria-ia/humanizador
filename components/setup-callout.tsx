type SetupCalloutProps = {
  title?: string;
};

export function SetupCallout({
  title = "Configuração pendente",
}: SetupCalloutProps) {
  return (
    <div
      id="setup-checklist"
      className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(26,32,44,0.08)]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Modo de configuração
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
        Antes de usar o app com dados reais, conclua a configuração técnica do Supabase e da
        chave da OpenAI. Enquanto isso não acontecer, a interface continua em modo demonstração.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          "1. Preencha as variáveis",
          "2. Rode o schema do banco",
          "3. Volte para testar o login",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--ink)]"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-white/75 p-5">
        <p className="text-sm font-semibold text-[var(--ink)]">Checklist técnico</p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink-soft)]">
          <li>
            Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
            (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
          </li>
          <li>Adicione `OPENAI_API_KEY` para liberar a geração real.</li>
          <li>Rode o schema em `supabase/schema.sql` para criar as tabelas do app.</li>
        </ul>
      </div>
    </div>
  );
}
