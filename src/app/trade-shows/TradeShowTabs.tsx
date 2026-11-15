"use client";

import { useState } from "react";
import type { ShowSeries, TradeShow } from "@/data/trade-shows";
import { Badge, dateRange, monthKey, PLAN_STYLE, ReachBadge, TradeShowCalendar } from "./TradeShowCalendar";

type View = "global" | "calendar";

const TABS: { id: View; label: string }[] = [
  { id: "global", label: "글로벌 전시 요약" },
  { id: "calendar", label: "월별 전체 일정" },
];

function GlobalSummary({
  series,
  shows,
  onOpenMonth,
}: {
  series: ShowSeries[];
  shows: TradeShow[];
  onOpenMonth: (key: string) => void;
}) {
  const byId = new Map(shows.map((s) => [s.id, s]));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {series.map((sr) => {
        const list = sr.showIds
          .map((id) => byId.get(id))
          .filter((s): s is TradeShow => !!s)
          .sort((a, b) => (a.start ?? "9").localeCompare(b.start ?? "9"));
        return (
          <section key={sr.id} className="flex flex-col rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="text-lg font-semibold tracking-tight">{sr.name}</h2>
                <span className="text-xs text-muted">{sr.organizer}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{sr.about}</p>
              <p className="mt-2 rounded-lg bg-hero px-3 py-2 text-sm">
                <span className="mr-1 text-xs font-medium text-cat-cosmetic">레우비스</span>
                {sr.forReuvis}
              </p>
            </div>
            <ul className="flex-1">
              {list.map((s) => (
                <li key={s.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0">
                  <div className="w-16 shrink-0 text-sm font-semibold tabular-nums">
                    {dateRange(s)}
                    {s.dateNote && !s.dateVerified && <span className="ml-0.5 text-[11px] text-warn">⚠</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <ReachBadge scope={s.scope} />
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-foreground"
                        >
                          {s.name}
                          <span className="ml-0.5 text-xs text-muted">↗</span>
                        </a>
                      ) : (
                        <span className="text-sm font-medium">{s.name}</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {s.flag} {s.country} · {s.city}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge className={`font-medium ${PLAN_STYLE[s.plan]}`}>{s.plan}</Badge>
                    <button
                      type="button"
                      onClick={() => onOpenMonth(monthKey(s))}
                      className="text-[11px] text-muted hover:text-foreground"
                    >
                      월별에서 보기 →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function TradeShowTabs({ shows, series }: { shows: TradeShow[]; series: ShowSeries[] }) {
  const [view, setView] = useState<View>("global");

  const openMonth = (key: string) => {
    setView("calendar");
    // 탭이 화면에 나타난 뒤 그 달로 이동
    // 탭 전환 직후라 부드러운 스크롤 대신 바로 이동 (scroll-mt로 월 이동 바 아래에 맞춰짐)
    setTimeout(() => {
      document.getElementById(`m-${key}`)?.scrollIntoView({ block: "start" });
      history.replaceState(null, "", `#m-${key}`);
    }, 50);
  };

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={view === t.id}
            onClick={() => setView(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
              view === t.id
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" hidden={view !== "global"}>
        <GlobalSummary series={series} shows={shows} onOpenMonth={openMonth} />
      </div>
      <div role="tabpanel" hidden={view !== "calendar"}>
        <TradeShowCalendar shows={shows} />
      </div>
    </div>
  );
}
