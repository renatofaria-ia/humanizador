import "server-only";

import { listTexts } from "@/lib/data";
import { getChannelLabel, getStatusMeta } from "@/lib/ui";
import { TextStatus, TextSummary } from "@/lib/types";

const DASHBOARD_TIME_ZONE = "America/Sao_Paulo";

export const DASHBOARD_PERIODS = ["today", "week", "month", "all"] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export type DashboardKpis = {
  totalTokens: number;
  textsCreated: number;
  versionsCreated: number;
  wordsCreated: number;
};

export type DashboardSeriesPoint = {
  key: string;
  label: string;
  tokens: number;
  versions: number;
};

export type DashboardBreakdownItem = {
  key: string;
  label: string;
  value: number;
  share: number;
  helper: string;
};

export type DashboardInsight = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

export type DashboardCockpitData = {
  period: DashboardPeriod;
  periodLabel: string;
  rangeLabel: string;
  hasActivity: boolean;
  kpis: DashboardKpis;
  series: DashboardSeriesPoint[];
  outputBreakdown: DashboardBreakdownItem[];
  llmBreakdown: DashboardBreakdownItem[];
  statusBreakdown: DashboardBreakdownItem[];
  insights: DashboardInsight[];
};

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type VersionMetric = {
  textId: string;
  channelKey: string;
  source: string;
  model: string | null;
  totalTokens: number;
  words: number;
  createdAt: Date;
};

type PeriodMeta = {
  start: Date | null;
  end: Date;
  periodLabel: string;
  rangeLabel: string;
};

type SeriesBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

const zonedDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const zonedOffsetFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DASHBOARD_TIME_ZONE,
  timeZoneName: "shortOffset",
  hour: "2-digit",
});

const shortDayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: DASHBOARD_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
});

const rangeDayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: DASHBOARD_TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: DASHBOARD_TIME_ZONE,
  month: "long",
  year: "numeric",
});

const allSeriesFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: DASHBOARD_TIME_ZONE,
  month: "short",
  year: "2-digit",
});

const integerFormatter = new Intl.NumberFormat("pt-BR");

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatDayLabel(date: Date) {
  return shortDayFormatter.format(date).replace(".", "");
}

function formatRangeDay(date: Date) {
  return rangeDayFormatter.format(date).replace(".", "");
}

function formatMonthLabel(date: Date) {
  const formatted = monthFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatAllSeriesLabel(date: Date) {
  return allSeriesFormatter.format(date).replace(".", "");
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value ?? 0);
}

function getZonedParts(date: Date): LocalDateParts {
  const parts = zonedDateTimeFormatter.formatToParts(date);

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
    hour: getPart(parts, "hour"),
    minute: getPart(parts, "minute"),
    second: getPart(parts, "second"),
  };
}

function getTimeZoneOffsetMinutes(date: Date) {
  const timeZoneName =
    zonedOffsetFormatter.formatToParts(date).find((part) => part.type === "timeZoneName")?.value ??
    "GMT+0";
  const match = timeZoneName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);

  if (!match) {
    return 0;
  }

  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const signal = match[1] === "-" ? -1 : 1;

  return signal * (hours * 60 + minutes);
}

function zonedTimeToUtc(input: LocalDateParts) {
  let utcTime = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);

  for (let index = 0; index < 2; index += 1) {
    const offset = getTimeZoneOffsetMinutes(new Date(utcTime));
    utcTime =
      Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second) -
      offset * 60_000;
  }

  return new Date(utcTime);
}

function getPeriodLabel(period: DashboardPeriod) {
  switch (period) {
    case "today":
      return "Hoje";
    case "week":
      return "Esta semana";
    case "month":
      return "Este mes";
    default:
      return "Total";
  }
}

function countWords(text: string | null | undefined) {
  if (!text?.trim()) {
    return 0;
  }

  return text.trim().split(/\s+/).length;
}

function addUtcDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function addUtcMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

function formatDayKey(parts: Pick<LocalDateParts, "year" | "month" | "day">) {
  return [parts.year, String(parts.month).padStart(2, "0"), String(parts.day).padStart(2, "0")].join("-");
}

function formatMonthKey(parts: Pick<LocalDateParts, "year" | "month">) {
  return [parts.year, String(parts.month).padStart(2, "0")].join("-");
}

function getPeriodMeta(period: DashboardPeriod, now: Date): PeriodMeta {
  const localNow = getZonedParts(now);
  const end = now;

  if (period === "today") {
    const start = zonedTimeToUtc({ ...localNow, hour: 0, minute: 0, second: 0 });
    return {
      start,
      end,
      periodLabel: getPeriodLabel(period),
      rangeLabel: `Hoje, ${formatRangeDay(start)}`,
    };
  }

  if (period === "week") {
    const localCalendarDay = new Date(Date.UTC(localNow.year, localNow.month - 1, localNow.day));
    const weekDay = localCalendarDay.getUTCDay();
    const diffToMonday = weekDay === 0 ? 6 : weekDay - 1;
    localCalendarDay.setUTCDate(localCalendarDay.getUTCDate() - diffToMonday);

    const start = zonedTimeToUtc({
      year: localCalendarDay.getUTCFullYear(),
      month: localCalendarDay.getUTCMonth() + 1,
      day: localCalendarDay.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    });

    return {
      start,
      end,
      periodLabel: getPeriodLabel(period),
      rangeLabel: `${formatRangeDay(start)} - ${formatRangeDay(addUtcDays(start, 6))}`,
    };
  }

  if (period === "month") {
    const start = zonedTimeToUtc({
      year: localNow.year,
      month: localNow.month,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });

    return {
      start,
      end,
      periodLabel: getPeriodLabel(period),
      rangeLabel: formatMonthLabel(start),
    };
  }

  return {
    start: null,
    end,
    periodLabel: getPeriodLabel(period),
    rangeLabel: "Historico completo",
  };
}

function isWithinPeriod(date: Date, meta: PeriodMeta) {
  if (meta.start && date < meta.start) {
    return false;
  }

  return date <= meta.end;
}

function collectVersionMetrics(texts: TextSummary[]) {
  return texts.flatMap((text) =>
    (text.versions ?? []).map((version) => ({
      textId: text.id,
      channelKey: text.channel_key,
      source: version.source,
      model: version.model,
      totalTokens: version.total_tokens ?? 0,
      words: countWords(version.output_payload_json?.texto_final),
      createdAt: new Date(version.created_at),
    })),
  );
}

function createSeriesBuckets(period: DashboardPeriod, now: Date, versions: VersionMetric[]) {
  const localNow = getZonedParts(now);
  const buckets: SeriesBucket[] = [];

  if (period === "today") {
    for (let hour = 0; hour < 24; hour += 1) {
      const start = zonedTimeToUtc({ ...localNow, hour, minute: 0, second: 0 });
      const nextHourParts = hour === 23
        ? {
            year: localNow.year,
            month: localNow.month,
            day: localNow.day + 1,
            hour: 0,
            minute: 0,
            second: 0,
          }
        : { ...localNow, hour: hour + 1, minute: 0, second: 0 };

      buckets.push({
        key: String(hour).padStart(2, "0"),
        label: `${String(hour).padStart(2, "0")}h`,
        start,
        end: zonedTimeToUtc(nextHourParts),
      });
    }

    return buckets;
  }

  if (period === "week") {
    const meta = getPeriodMeta(period, now);
    const start = meta.start ?? now;

    for (let index = 0; index < 7; index += 1) {
      const bucketStart = addUtcDays(start, index);
      const bucketEnd = addUtcDays(start, index + 1);
      const key = formatDayKey(getZonedParts(bucketStart));

      buckets.push({
        key,
        label: formatDayLabel(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      });
    }

    return buckets;
  }

  if (period === "month") {
    const meta = getPeriodMeta(period, now);
    const start = meta.start ?? now;
    const totalDays = new Date(Date.UTC(localNow.year, localNow.month, 0)).getUTCDate();

    for (let day = 0; day < totalDays; day += 1) {
      const bucketStart = addUtcDays(start, day);
      const bucketEnd = addUtcDays(start, day + 1);
      const zoned = getZonedParts(bucketStart);

      buckets.push({
        key: formatDayKey(zoned),
        label: String(zoned.day).padStart(2, "0"),
        start: bucketStart,
        end: bucketEnd,
      });
    }

    return buckets;
  }

  if (!versions.length) {
    const currentMonth = zonedTimeToUtc({
      year: localNow.year,
      month: localNow.month,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });

    return [
      {
        key: formatMonthKey(getZonedParts(currentMonth)),
        label: formatAllSeriesLabel(currentMonth),
        start: currentMonth,
        end: addUtcMonths(currentMonth, 1),
      },
    ];
  }

  const firstVersion = versions
    .map((version) => version.createdAt)
    .sort((left, right) => left.getTime() - right.getTime())[0];
  const firstLocal = getZonedParts(firstVersion);
  const lastLocal = getZonedParts(now);
  const current = new Date(Date.UTC(firstLocal.year, firstLocal.month - 1, 1));
  const final = new Date(Date.UTC(lastLocal.year, lastLocal.month - 1, 1));

  while (current <= final) {
    const bucketStart = zonedTimeToUtc({
      year: current.getUTCFullYear(),
      month: current.getUTCMonth() + 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });

    buckets.push({
      key: formatMonthKey(getZonedParts(bucketStart)),
      label: formatAllSeriesLabel(bucketStart),
      start: bucketStart,
      end: addUtcMonths(bucketStart, 1),
    });

    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return buckets;
}

function buildSeries(period: DashboardPeriod, now: Date, versions: VersionMetric[], meta: PeriodMeta) {
  const buckets = createSeriesBuckets(period, now, versions);
  const map = new Map(
    buckets.map((bucket) => [bucket.key, { key: bucket.key, label: bucket.label, tokens: 0, versions: 0 }]),
  );

  for (const version of versions) {
    if (!isWithinPeriod(version.createdAt, meta)) {
      continue;
    }

    const zoned = getZonedParts(version.createdAt);
    const key =
      period === "today"
        ? String(zoned.hour).padStart(2, "0")
        : period === "all"
          ? formatMonthKey(zoned)
          : formatDayKey(zoned);
    const current = map.get(key);

    if (!current) {
      continue;
    }

    current.tokens += version.totalTokens;
    current.versions += 1;
  }

  return buckets.map((bucket) => map.get(bucket.key) ?? { key: bucket.key, label: bucket.label, tokens: 0, versions: 0 });
}

function buildOutputBreakdown(versions: VersionMetric[]) {
  const totalVersions = versions.length;
  const aggregate = new Map<string, { label: string; count: number; tokens: number; words: number }>();

  for (const version of versions) {
    const existing = aggregate.get(version.channelKey) ?? {
      label: getChannelLabel(version.channelKey as TextSummary["channel_key"]),
      count: 0,
      tokens: 0,
      words: 0,
    };

    existing.count += 1;
    existing.tokens += version.totalTokens;
    existing.words += version.words;
    aggregate.set(version.channelKey, existing);
  }

  return [...aggregate.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      value: value.count,
      share: totalVersions > 0 ? value.count / totalVersions : 0,
      helper: `${formatInteger(value.tokens)} tokens · ${formatInteger(value.words)} palavras`,
    }))
    .sort((left, right) => right.value - left.value || right.share - left.share);
}

function buildLlmBreakdown(versions: VersionMetric[]) {
  const llmVersions = versions.filter((version) => version.source === "llm");
  const totalTokens = llmVersions.reduce((sum, version) => sum + version.totalTokens, 0);
  const aggregate = new Map<string, { label: string; versions: number; tokens: number }>();

  for (const version of llmVersions) {
    const key = version.model?.trim() || "modelo-nao-informado";
    const existing = aggregate.get(key) ?? {
      label: version.model?.trim() || "Modelo nao informado",
      versions: 0,
      tokens: 0,
    };

    existing.versions += 1;
    existing.tokens += version.totalTokens;
    aggregate.set(key, existing);
  }

  return [...aggregate.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      value: value.tokens,
      share: totalTokens > 0 ? value.tokens / totalTokens : 0,
      helper: `${formatInteger(value.versions)} versoes llm`,
    }))
    .sort((left, right) => right.value - left.value || right.share - left.share);
}

function buildStatusBreakdown(texts: TextSummary[]) {
  const totalTexts = texts.length;

  return (["rascunho", "gerado", "em_revisao", "aprovado", "publicado", "arquivado"] as TextStatus[])
    .map((status) => {
      const count = texts.filter((text) => text.status === status).length;
      return {
        key: status,
        label: getStatusMeta(status).label,
        value: count,
        share: totalTexts > 0 ? count / totalTexts : 0,
        helper: `${Math.round((totalTexts > 0 ? count / totalTexts : 0) * 100)}% da base atual`,
      } satisfies DashboardBreakdownItem;
    })
    .filter((item) => item.value > 0);
}

function buildInsights(
  kpis: DashboardKpis,
  outputBreakdown: DashboardBreakdownItem[],
  llmBreakdown: DashboardBreakdownItem[],
  statusBreakdown: DashboardBreakdownItem[],
) {
  const topOutput = outputBreakdown[0];
  const topModel = llmBreakdown[0];
  const activeCount = statusBreakdown
    .filter((item) => !["publicado", "arquivado"].includes(item.key))
    .reduce((sum, item) => sum + item.value, 0);
  const completedCount = statusBreakdown
    .filter((item) => ["publicado", "arquivado"].includes(item.key))
    .reduce((sum, item) => sum + item.value, 0);
  const averageTokensPerVersion = kpis.versionsCreated > 0 ? Math.round(kpis.totalTokens / kpis.versionsCreated) : 0;

  return [
    {
      id: "ritmo",
      label: "Media por versao",
      value: averageTokensPerVersion > 0 ? `${formatInteger(averageTokensPerVersion)} tokens` : "Sem atividade",
      helper:
        kpis.versionsCreated > 0
          ? `${formatInteger(kpis.versionsCreated)} versoes compoem a media do periodo.`
          : "Nenhuma versao ativa registrada neste recorte.",
    },
    {
      id: "canal",
      label: "Output dominante",
      value: topOutput ? topOutput.label : "Sem producao",
      helper: topOutput
        ? `${formatInteger(topOutput.value)} versoes no periodo.`
        : "Nenhum tipo de output apareceu neste recorte.",
    },
    {
      id: "llm",
      label: "LLM mais usado",
      value: topModel ? topModel.label : "Sem geracao llm",
      helper: topModel
        ? `${formatInteger(topModel.value)} tokens consumidos por esse modelo.`
        : "As geracoes do periodo sao manuais ou inexistentes.",
    },
    {
      id: "saude",
      label: "Saude editorial",
      value: `${formatInteger(activeCount)} em andamento`,
      helper: `${formatInteger(completedCount)} itens publicados ou arquivados fora da fila ativa.`,
    },
  ];
}

export function buildDashboardCockpitData(input: {
  texts: TextSummary[];
  period: DashboardPeriod;
  now?: Date;
}): DashboardCockpitData {
  const now = input.now ?? new Date();
  const meta = getPeriodMeta(input.period, now);
  const versions = collectVersionMetrics(input.texts);
  const versionsInPeriod = versions.filter((version) => isWithinPeriod(version.createdAt, meta));
  const textsInPeriod = input.texts.filter((text) => isWithinPeriod(new Date(text.created_at), meta));
  const kpis: DashboardKpis = {
    totalTokens: versionsInPeriod.reduce((sum, version) => sum + version.totalTokens, 0),
    textsCreated: textsInPeriod.length,
    versionsCreated: versionsInPeriod.length,
    wordsCreated: versionsInPeriod.reduce((sum, version) => sum + version.words, 0),
  };
  const outputBreakdown = buildOutputBreakdown(versionsInPeriod);
  const llmBreakdown = buildLlmBreakdown(versionsInPeriod);
  const statusBreakdown = buildStatusBreakdown(input.texts);

  return {
    period: input.period,
    periodLabel: meta.periodLabel,
    rangeLabel: meta.rangeLabel,
    hasActivity: Object.values(kpis).some((value) => value > 0),
    kpis,
    series: buildSeries(input.period, now, versions, meta),
    outputBreakdown,
    llmBreakdown,
    statusBreakdown,
    insights: buildInsights(kpis, outputBreakdown, llmBreakdown, statusBreakdown),
  };
}

export async function getDashboardCockpit(period: DashboardPeriod) {
  const texts = await listTexts();
  return buildDashboardCockpitData({ texts, period });
}