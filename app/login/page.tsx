import Link from "next/link";

import { signInWithPasswordAction } from "@/app/actions";
import { SetupCallout } from "@/components/setup-callout";
import { SubmitButton } from "@/components/submit-button";
import { getAppAccess } from "@/lib/app-context";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getAppAccess();
  const params = await searchParams;

  if (access.mode === "ready") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <div className="panel w-full rounded-[32px] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Acesso concluido
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">
            Voce ja esta com a sessao pronta.
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            Volte para a tela Hoje para retomar sua fila ou abrir um novo texto.
          </p>
          <Link href="/" className="button-ink mt-6">
            Abrir Hoje
          </Link>
        </div>
      </main>
    );
  }

  if (access.mode === "setup") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="panel rounded-[36px] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Humanizador App
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--ink)] text-balance">
              Transforme texto bruto em copy pronta com um fluxo claro.
            </h1>
            <p className="mt-5 text-base leading-8 text-[var(--ink-soft)] text-pretty">
              Antes do login, finalize a configuracao tecnica. Quando o setup estiver completo, a
              sessao passa a funcionar com Supabase real e geracao liberada.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Cole as variaveis",
                "Rode o schema",
                "Volte para entrar",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-[var(--border)] bg-white/70 p-4 text-sm font-medium text-[var(--ink)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <SetupCallout title="Finalize o setup antes do primeiro login" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="panel rounded-[36px] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            Humanizador App
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[var(--ink)] text-balance">
            Transforme texto bruto em copy pronta sem perder contexto editorial.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-soft)] text-pretty">
            O app organiza o trabalho em uma sequencia simples: escolher o perfil, definir o
            formato, gerar, revisar e marcar a publicacao.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Escolha o perfil"],
              ["2", "Gere a sugestao"],
              ["3", "Revise e publique"],
            ].map(([step, label]) => (
              <div
                key={step}
                className="rounded-[24px] border border-[var(--border)] bg-white/70 p-4"
              >
                <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink)]">
                  Etapa {step}
                </span>
                <p className="mt-3 text-sm font-medium text-[var(--ink)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rounded-[36px] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Acesso privado
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Entre com email e senha
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            O login abre a tela Hoje, onde o app mostra o proximo texto para retomar ou o CTA
            certo para criar um novo.
          </p>
          {params.error === "invalid_credentials" ? (
            <div className="mt-5 rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-900">
              Email ou senha invalidos. Verifique os dados e tente novamente.
            </div>
          ) : null}
          <form action={signInWithPasswordAction} className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="voce@empresa.com"
                autoComplete="username"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Sua senha"
                autoComplete="current-password"
                className="field"
              />
            </div>
            <SubmitButton label="Entrar" pendingLabel="Entrando..." />
          </form>
        </section>
      </div>
    </main>
  );
}
