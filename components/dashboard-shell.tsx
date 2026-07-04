import Link from "next/link";

import { signOutAction } from "@/app/actions";

type DashboardShellProps = {
  children: React.ReactNode;
  email?: string;
};

const links = [
  { href: "/", label: "Painel" },
  { href: "/profiles", label: "Perfis" },
  { href: "/texts", label: "Textos" },
];

export function DashboardShell({ children, email }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-white/60 bg-white/85 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                Humanizador App
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
                Copys humanizadas com perfil comportamental
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <nav className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {email ? (
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Sair
                  </button>
                </form>
              ) : null}
            </div>
          </div>
          {email ? (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Logado como {email}</p>
          ) : null}
        </header>
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
