import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { NewTextForm } from "@/components/new-text-form";
import { SetupCallout } from "@/components/setup-callout";
import { TextViewTabs } from "@/components/text-view-tabs";
import { demoProfiles } from "@/lib/demo-data";
import { getAppAccess } from "@/lib/app-context";
import { listProfiles } from "@/lib/data";

export default async function NewTextPage() {
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const profiles = isDemo ? demoProfiles : await listProfiles();

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="mx-auto max-w-5xl space-y-6">
        {isDemo ? <SetupCallout title="Modo demonstração ativo" /> : null}

        <TextViewTabs activeView="novo" />

        <section className="surface-card rounded-[32px] p-6 sm:p-8">
          <p className="text-sm font-semibold text-[var(--accent)]">Novo texto</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Abra um novo texto base e escolha as saídas que vão nascer dele
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
            Use esta área quando quiser cadastrar uma nova base. Depois, qualquer ajuste na base
            compartilhada pode ser retomado pela área de trabalho de uma das saídas criadas.
          </p>
        </section>

        <NewTextForm isDemo={isDemo} profiles={profiles} />
      </div>
    </DashboardShell>
  );
}
