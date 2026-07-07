import Link from "next/link";
import { BarChart3, Bot, Gauge, Layers3, Sparkles } from "lucide-react";

import {
  DASHBOARD_PERIODS,
  DashboardBreakdownItem,
  DashboardCockpitData,
  DashboardInsight,
  DashboardPeriod,
} from "@/lib/dashboard-cockpit";
import { getStatusMeta } from "@/lib/ui";
import { TextStatus } from "@/lib/types";

const integerFormatter = new Intl.NumberFormat("pt-BR");

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function getPeriodHref(period: DashboardPeriod) {
  return period === "today" ? "/" : `/?period=${period}`;
}

function getPeriodLabel(period: DashboardPeriod) {
  switch (period) {
    case "today":
      return "Hoje";
    case "week":
      return "Semana";
    case "month":
      return "Mês";
    default:
      return "Total";
  }
}

function buildSeriesGeometry(points: DashboardCockpitData["series"]) {
  const width = 920;
  const height = 248;
  const paddingX = 26;
  const top = 24;
  const bottom = 32;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - top - bottom;
  const maxTokens = Math.max(...points.map((point) => point.tokens), 1);
  const maxVersions = Math.max(...points.map((point) => point.versions), 1);
  const step = points.length > 1 ? usableWidth / (points.length - 1) : usableWidth;
  const barWidth = Math.max(10, Math.min(28, usableWidth / Math.max(points.length, 1) - 8));

  const tokenPoints = points.map((point, index) => {
    const x = paddingX + index * step;
    const y = top + usableHeight - (point.tokens / maxTokens) * usableHeight;
    return { ...point, x, y };
  });

  const versionBars = points.map((point, index) => {
    const centerX = paddingX + index * step;
    const heightValue = (point.versions / maxVersions) * (usableHeight * 0.72);
    return {
      ...point,
      x: centerX - barWidth / 2,
      y: top + usableHeight - heightValue,
      width: barWidth,
      height: heightValue,
    };
  });

  const linePath = tokenPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const areaPath = tokenPoints.length
    ? `${linePath} L ${tokenPoints[tokenPoints.length - 1].x.toFixed(2)} ${(top + usableHeight).toFixed(2)} L ${tokenPoints[0].x.toFixed(2)} ${(top + usableHeight).toFixed(2)} Z`
    : "";

  return {
    width,
    height,
    top,
    bottom,
    paddingX,
    usableHeight,
    tokenPoints,
    versionBars,
    linePath,
    areaPath,
  };
}

function getPeakPoint(points: DashboardCockpitData["series"], key: "tokens" | "versions") {
  return points.reduce((currentPeak, point) => (point[key] > currentPeak[key] ? point : currentPeak), points[0]);
}

export function DashboardPeriodFilter({ currentPeriod }: { currentPeriod: DashboardPeriod }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[28px] border border-[var(--border)] bg-white/72 p-2 shadow-[var(--shadow-soft)] backdrop-blur">
      {DASHBOARD_PERIODS.map((period) => {
        const active = period === currentPeriod;

        return (
          <Link
            key={period}
            href={getPeriodHref(period)}
            aria-current={active ? "page" : undefined}
            className={`selection-pill ${active ? "selection-pill-active" : ""}`}
          >
            {getPeriodLabel(period)}
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardKpiCard(props: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  spotlight?: boolean;
  className?: string;
}) {
  return (
    <article
      className={`relative h-full overflow-hidden rounded-[30px] border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] backdrop-blur sm:p-6 ${
        props.spotlight
          ? "bg-[linear-gradient(145deg,rgba(255,242,238,0.96),rgba(255,255,255,0.98))]"
          : "bg-white/92"
      } ${props.className ?? ""}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(176,71,52,0),rgba(176,71,52,0.45),rgba(176,71,52,0))]" />
      <div className="relative flex h-full min-h-[176px] flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              {props.label}
            </p>
            <p
              className={`mt-4 tabular-nums font-semibold leading-none tracking-tight text-[var(--ink)] ${
                props.spotlight ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {formatInteger(props.value)}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[22px] border ${
              props.spotlight
                ? "border-[rgba(176,71,52,0.16)] bg-white/72 text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--ink-soft)]"
            }`}
          >
            {props.icon}
          </div>
        </div>
        <p className={`max-w-xs text-sm leading-7 ${props.spotlight ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}>
          {props.helper}
        </p>
      </div>
    </article>
  );
}

export function DashboardSeriesPanel({ data }: { data: DashboardCockpitData }) {
  const geometry = buildSeriesGeometry(data.series);
  const peakTokens = data.series.length ? getPeakPoint(data.series, "tokens") : null;
  const peakVersions = data.series.length ? getPeakPoint(data.series, "versions") : null;

  const summaryTiles = [
    {
      label: "Total de tokens",
      value: formatInteger(data.kpis.totalTokens),
      helper: "Somatório do período filtrado.",
    },
    {
      label: "Pico de tokens",
      value: peakTokens ? formatInteger(peakTokens.tokens) : "0",
      helper: peakTokens ? peakTokens.label : "Sem atividade no recorte.",
    },
    {
      label: "Pico de versões",
      value: peakVersions ? formatInteger(peakVersions.versions) : "0",
      helper: peakVersions ? peakVersions.label : "Sem atividade no recorte.",
    },
    {
      label: "Total de versões",
      value: formatInteger(data.kpis.versionsCreated),
      helper: "Quantidade de versões ativas no período.",
    },
  ];

  return (
    <section className="panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(176,71,52,0.12),transparent_62%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--accent)]">Série do período</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)] sm:text-[2rem] text-balance">
              Tokens e versões distribuídos ao longo do recorte
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)] text-pretty">
              Barras mostram o volume de versões. A linha mostra o consumo de tokens no mesmo eixo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-muted)]">
            <span className="info-chip">{data.periodLabel}</span>
            <span className="info-chip info-chip-strong">{data.rangeLabel}</span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,246,255,0.88))] p-4 sm:p-5">
          {data.hasActivity ? (
            <>
              <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="h-[230px] w-full" role="img" aria-label="Gráfico de tokens e versões do período">
                <defs>
                  <linearGradient id="dashboard-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(176,71,52,0.22)" />
                    <stop offset="100%" stopColor="rgba(176,71,52,0.02)" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((step) => {
                  const y = geometry.top + (geometry.usableHeight / 3) * step;
                  return (
                    <line
                      key={step}
                      x1={geometry.paddingX}
                      y1={y}
                      x2={geometry.width - geometry.paddingX}
                      y2={y}
                      stroke="rgba(73,97,119,0.10)"
                      strokeDasharray="4 8"
                    />
                  );
                })}
                <path d={geometry.areaPath} fill="url(#dashboard-area)" />
                {geometry.versionBars.map((bar) => (
                  <rect
                    key={bar.key}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={Math.max(bar.height, 3)}
                    rx="10"
                    fill="rgba(53,80,109,0.22)"
                  />
                ))}
                <path d={geometry.linePath} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {geometry.tokenPoints.map((point) => (
                  <circle key={point.key} cx={point.x} cy={point.y} r="4.5" fill="white" stroke="var(--accent)" strokeWidth="3" />
                ))}
              </svg>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryTiles.map((tile) => (
                  <div key={tile.label} className="rounded-[20px] border border-[var(--border)] bg-white/72 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">{tile.label}</p>
                    <p className="mt-2 text-base font-semibold text-[var(--ink)]">{tile.value}</p>
                    <p className="text-xs text-[var(--ink-soft)]">{tile.helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-[var(--ink-soft)]">
                <span className="rounded-full border border-[var(--border)] bg-white/72 px-3 py-2">
                  <span className="font-semibold text-[var(--accent)]">Linha</span> = tokens
                </span>
                <span className="rounded-full border border-[var(--border)] bg-white/72 px-3 py-2">
                  <span className="font-semibold text-[var(--ink)]">Barras</span> = versões
                </span>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-white/70 p-6 text-sm leading-7 text-[var(--ink-soft)]">
              Não houve atividade neste período. O cockpit continua mostrando a saúde editorial atual nas seções abaixo.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function DashboardBreakdownPanel(props: {
  title: string;
  eyebrow: string;
  description: string;
  items: DashboardBreakdownItem[];
  emptyLabel: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[var(--accent)]">{props.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{props.title}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{props.description}</p>
        </div>
        <Link href={props.href} className="pill-action">
          {props.hrefLabel}
        </Link>
      </div>
      <div className="mt-5 space-y-3">
        {props.items.length ? (
          props.items.map((item) => (
            <article key={item.key} className="rounded-[22px] border border-[var(--border)] bg-white/82 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{item.label}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">{item.helper}</p>
                </div>
                <p className="text-right text-xl font-semibold tracking-tight text-[var(--ink)]">{formatInteger(item.value)}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[rgba(73,97,119,0.08)]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent),#d67661)]"
                  style={{ width: `${Math.max(item.share * 100, item.value > 0 ? 6 : 0)}%` }}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink-soft)]">
            {props.emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

export function DashboardStatusPanel(props: {
  items: DashboardBreakdownItem[];
  href: string;
  hrefLabel: string;
}) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[var(--accent)]">Saúde editorial</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Distribuição atual dos textos</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            Este bloco lê a base atual do usuário logado, independente do período filtrado acima.
          </p>
        </div>
        <Link href={props.href} className="pill-action">
          {props.hrefLabel}
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {props.items.length ? (
          props.items.map((item) => {
            const tone = getStatusMeta(item.key as TextStatus).tone;
            return (
              <article key={item.key} className="rounded-[22px] border border-[var(--border)] bg-white/82 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
                      {item.label}
                    </div>
                    <p className="mt-3 text-xs leading-6 text-[var(--ink-soft)]">{item.helper}</p>
                  </div>
                  <p className="text-right text-xl font-semibold tracking-tight text-[var(--ink)]">{formatInteger(item.value)}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[rgba(73,97,119,0.08)]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(53,80,109,0.72),rgba(53,80,109,0.28))]"
                    style={{ width: `${Math.max(item.share * 100, item.value > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink-soft)]">
            Ainda não existem textos para compor a saúde editorial.
          </div>
        )}
      </div>
    </section>
  );
}

export function DashboardInsightsPanel(props: {
  items: DashboardInsight[];
  href: string;
  hrefLabel: string;
}) {
  return (
    <section className="panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(176,71,52,0.12),transparent_68%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-[var(--accent)]">Resumo do período</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Leitura curta para bater o olho</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Um resumo rápido para entender onde o volume está, como o consumo se distribui e qual é a carga editorial atual.
            </p>
          </div>
          <Link href={props.href} className="pill-action">
            {props.hrefLabel}
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {props.items.map((item, index) => {
            const icon =
              index === 0 ? <Gauge className="h-5 w-5" /> : index === 1 ? <Layers3 className="h-5 w-5" /> : index === 2 ? <Bot className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />;

            return (
              <article key={item.id} className="rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,246,255,0.90))] p-4">
                <div className="flex items-center justify-between gap-3 text-[var(--accent)]">
                  {icon}
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
                    {item.label}
                  </span>
                </div>
                <p className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]">{item.value}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--ink-soft)]">{item.helper}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const DASHBOARD_KPI_META = [
  {
    key: "totalTokens",
    label: "Tokens gastos",
    helper: "Consumo total no período selecionado.",
    icon: <Gauge className="h-6 w-6" />,
    spotlight: true,
    className: "xl:col-span-5",
  },
  {
    key: "textsCreated",
    label: "Textos criados",
    helper: "Textos iniciados por este usuário.",
    icon: <Layers3 className="h-6 w-6" />,
    className: "xl:col-span-2",
  },
  {
    key: "versionsCreated",
    label: "Versões geradas",
    helper: "Versões ativas no período.",
    icon: <BarChart3 className="h-6 w-6" />,
    className: "xl:col-span-2",
  },
  {
    key: "wordsCreated",
    label: "Palavras produzidas",
    helper: "Volume do texto final.",
    icon: <Sparkles className="h-6 w-6" />,
    className: "xl:col-span-3",
  },
] as const;