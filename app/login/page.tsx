import Link from "next/link";

import { requestMagicLinkAction } from "@/app/actions";
import { getAppAccess } from "@/lib/app-context";
import { SetupCallout } from "@/components/setup-callout";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const access = await getAppAccess();
  const params = await searchParams;

  if (access.mode === "ready") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
        <div className="panel w-full rounded-[32px] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h1 className="text-3xl font-semibold text-[var(--ink)]">
            Voce ja esta logado
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            Entre no painel principal para continuar gerando e revisando seus textos.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
          >
            Abrir painel
          </Link>
        </div>
      </main>
    );
  }

  if (access.mode === "setup") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <SetupCallout title="Antes do login, finalize o setup do Supabase" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel rounded-[36px] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            Humanizador App
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[var(--ink)]">
            Central privada para transformar texto bruto em copy pronta.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            O app combina o protocolo fixo do Humanizador com perfis comportamentais
            reutilizaveis, controles editoriais e historico de versoes para organizar
            o seu fluxo de publicacao.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "Perfis de voz",
              "Canal e intencao",
              "Versoes e status",
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

        <section className="panel rounded-[36px] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Login unico
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Receba um magic link no email autorizado
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            O MVP foi desenhado para uso interno. Apenas o email configurado em
            `APP_OWNER_EMAIL` conseguira entrar.
          </p>
          {params.sent === "1" ? (
            <div className="mt-5 rounded-[22px] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Link enviado. Abra seu email e use o acesso magico para concluir o login.
            </div>
          ) : null}
          <form action={requestMagicLinkAction} className="mt-6 space-y-4">
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
                className="field"
              />
            </div>
            <SubmitButton label="Enviar magic link" pendingLabel="Enviando..." />
          </form>
        </section>
      </div>
    </main>
  );
}
