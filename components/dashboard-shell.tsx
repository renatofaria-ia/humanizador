import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { DashboardNav } from "@/components/dashboard-nav";
import { HEADER_META_TEXT } from "@/lib/ui";

type DashboardShellProps = {
  children: React.ReactNode;
  email?: string;
};

export function DashboardShell({ children, email }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <header className="sticky top-0 z-20 border-b border-[rgba(73,97,119,0.12)] bg-white/78 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link href="/" className="text-base font-semibold text-[var(--ink)] sm:text-lg">
              Humanizador
            </Link>
            <p className="mt-0.5 text-xs text-[var(--ink-muted)] sm:hidden">
              Proximo passo editorial
            </p>
          </div>
          <DashboardNav />
          <div className="hidden items-center gap-3 md:flex">
            {email ? (
              <>
                <div className={HEADER_META_TEXT}>{email}</div>
                <form action={signOutAction}>
                  <button type="submit" className="button-secondary">
                    Sair
                  </button>
                </form>
              </>
            ) : null}
          </div>
          {email ? (
            <div className="flex items-center gap-2 md:hidden">
              <form action={signOutAction}>
                <button type="submit" className="button-ghost px-3 py-2 text-sm">
                  Sair
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-[1240px] px-4 pb-32 pt-6 sm:px-6 lg:px-8 md:pb-10">
        {children}
      </main>
    </div>
  );
}
