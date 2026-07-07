import { redirect } from "next/navigation";

import {
  DASHBOARD_KPI_META,
  DashboardBreakdownPanel,
  DashboardInsightsPanel,
  DashboardKpiCard,
  DashboardPeriodFilter,
  DashboardSeriesPanel,
  DashboardStatusPanel,
} from "@/components/dashboard-cockpit";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCallout } from "@/components/setup-callout";
import {
  DASHBOARD_PERIODS,
  DashboardPeriod,
  buildDashboardCockpitData,
  getDashboardCockpit,
} from "@/lib/dashboard-cockpit";
import { getAppAccess } from "@/lib/app-context";
import { demoTextBundles } from "@/lib/demo-data";

type HomePageProps = {
  searchParams?: Promise<{
    period?: string | string[];
  }>;
};

function parseDashboardPeriod(value: string | string[] | undefined): DashboardPeriod {
  const candidate = Array.isArray(value) ? value[0] : value;

  return DASHBOARD_PERIODS.includes(candidate as DashboardPeriod)
    ? (candidate as DashboardPeriod)
    : "today";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const period = parseDashboardPeriod(params.period);
  const access = await getAppAccess();

  if (access.mode === "login-required") {
    redirect("/login");
  }

  const isDemo = access.mode === "setup";
  const cockpit = isDemo
    ? buildDashboardCockpitData({ texts: demoTextBundles, period })
    : await getDashboardCockpit(period);

  return (
    <DashboardShell email={access.mode === "ready" ? access.user.email : undefined}>
      <div className="space-y-6">
        {isDemo ? <SetupCallout title="Modo demonstração ativo" /> : null}

        <section className="panel relative overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(176,71,52,0.16),transparent_62%)]" />
          <div className="absolute left-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(205,227,255,0.72),transparent_72%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
                Painel
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-[var(--ink)] text-balance sm:text-4xl xl:text-5xl">
                Cockpit privado da operação editorial
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--ink-soft)] text-pretty sm:text-base">
                A home consolida produção, consumo de LLM e saúde editorial do usuário logado em uma leitura única e rápida.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="info-chip">Somente dados do usuário logado</span>
                <span className="info-chip info-chip-strong">{cockpit.rangeLabel}</span>
                {isDemo ? <span className="info-chip">Leitura demonstrativa</span> : null}
              </div>
            </div>
            <DashboardPeriodFilter currentPeriod={period} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-12 items-stretch">
          {DASHBOARD_KPI_META.map((item) => (
            <DashboardKpiCard
              key={item.key}
              label={item.label}
              value={cockpit.kpis[item.key]}
              helper={item.helper}
              icon={item.icon}
              spotlight={"spotlight" in item ? item.spotlight : false}
              className={item.className}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)] xl:items-start">
          <div className="space-y-6">
            <DashboardSeriesPanel data={cockpit} />
            <DashboardStatusPanel items={cockpit.statusBreakdown} href="/texts" hrefLabel="Abrir textos" />
          </div>

          <div className="space-y-6">
            <DashboardBreakdownPanel
              eyebrow="Produzido por saída"
              title="Distribuição por tipo de saída"
              description="Leitura do recorte atual para identificar quais formatos puxam mais volume de versões."
              items={cockpit.outputBreakdown}
              emptyLabel="Nenhuma saída apareceu neste período."
              href="/texts"
              hrefLabel="Abrir textos"
            />
            <DashboardBreakdownPanel
              eyebrow="Consumo por LLM"
              title="Distribuição por modelo"
              description="Mostra onde o consumo de tokens se concentrou entre os modelos com geração LLM no período."
              items={cockpit.llmBreakdown}
              emptyLabel="Nenhuma geração LLM ativa foi registrada neste período."
              href="/texts"
              hrefLabel="Abrir textos"
            />
            <DashboardInsightsPanel items={cockpit.insights} href="/profiles" hrefLabel="Abrir perfis" />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}