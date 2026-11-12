"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CALENDAR_YEAR, REGIONS, type FitCategory, type Region, type ShowPlan, type ShowScope, type TradeShow } from "@/data/trade-shows";

const FITS: FitCategory[] = ["화장품", "바디케어", "웰니스"];
const UNDATED = "undated";

const FIT_STYLE: Record<FitCategory, string> = {
  화장품: "bg-cat-cosmetic-soft text-cat-cosmetic",
  바디케어: "bg-cat-body-soft text-cat-body",
  웰니스: "bg-cat-wellness-soft text-cat-wellness",
};

const PLAN_STYLE: Record<ShowPlan, string> = {
  "부스 후보": "bg-foreground text-background",
  "참관 → 부스": "bg-accent-soft text-accent",
  참관: "bg-subtle text-foreground",
  "선택 참관": "border border-line text-muted",
};

function monthKey(s: TradeShow): string {
  return s.start?.slice(0, 7) ?? s.month ?? UNDATED;
}

function monthLabel(key: string, withYear = true): string {
  if (key === UNDATED) return withYear ? "일정 미정" : "미정";
  const [y, m] = key.split("-");
  return withYear ? `${y}년 ${Number(m)}월` : `${Number(m)}월`;
}

function dateRange(s: TradeShow): string {
  if (!s.start) return s.month ? `${Number(s.month.slice(5))}월 중` : "미정";
  const [, sm, sd] = s.start.split("-").map(Number);
  if (!s.end || s.end === s.start) return `${sm}.${sd}`;
  const [, em, ed] = s.end.split("-").map(Number);
  return em === sm ? `${sm}.${sd}–${ed}` : `${sm}.${sd}–${em}.${ed}`;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => `${CALENDAR_YEAR}-${String(i + 1).padStart(2, "0")}`);

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-line bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] leading-none ${className}`}>
      {children}
    </span>
  );
}

/** 이름 앞 표시: 글로벌형·지역 국제형은 강조, 현지형은 옅게 */
function ReachBadge({ scope }: { scope: ShowScope }) {
  if (scope === "글로벌형")
    return (
      <span title="여러 대륙의 브랜드·바이어가 국제 거래를 하러 오는 전시">
        <Badge className="bg-reach-global font-medium text-surface">🌐 글로벌</Badge>
      </span>
    );
  if (scope === "지역 국제형")
    return (
      <span title="해외 업체도 오지만, 개최국이나 주변 권역 시장에 들어가려는 거래가 중심인 전시">
        <Badge className="border border-reach-global font-medium text-reach-global">권역 국제</Badge>
      </span>
    );
  return (
    <span title="그 나라 약국·살롱·리테일 채널 사람들이 주로 오는 전시">
      <Badge className="border border-line text-muted">로컬</Badge>
    </span>
  );
}

function ShowRow({ show }: { show: TradeShow }) {
  return (
    <details className="group border-b border-line last:border-0 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none gap-4 px-4 py-4 transition-colors hover:bg-subtle/60 sm:gap-6">
        <div className="w-16 shrink-0 sm:w-24">
          <div className="text-base font-semibold tabular-nums">{dateRange(show)}</div>
          {show.dateNote && !show.dateVerified && (
            <div className="mt-0.5 text-[11px] text-warn" title={show.dateNote}>
              ⚠ {show.start ? "확인 필요" : "미확정"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted">
            {show.flag} {show.country} · {show.city}
            {show.venue && ` · ${show.venue}`}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <ReachBadge scope={show.scope} />
            {show.url ? (
              <a
                href={show.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-medium underline decoration-line underline-offset-4 hover:decoration-foreground"
              >
                {show.name}
                <span className="ml-0.5 text-xs text-muted">↗</span>
              </a>
            ) : (
              <span className="font-medium">{show.name}</span>
            )}
            {show.rank && (
              <Badge className="bg-best-soft font-medium text-best">추천 {show.rank}위</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{show.focus}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge className={`font-medium sm:hidden ${PLAN_STYLE[show.plan]}`}>{show.plan}</Badge>
            {show.fit.map((f) => (
              <Badge key={f} className={FIT_STYLE[f]}>
                {f}
              </Badge>
            ))}
            {show.channels.map((c) => (
              <Badge key={c} className="bg-subtle text-muted">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          <Badge className={`px-2 py-1 text-xs font-medium ${PLAN_STYLE[show.plan]}`}>{show.plan}</Badge>
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180"
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </summary>

      <div className="grid gap-3 bg-panel px-4 pb-4 pt-3 text-sm sm:grid-cols-2 sm:pl-[8.5rem]">
        <div>
          <div className="mb-0.5 text-xs font-medium text-accent">장점</div>
          <p>{show.pros}</p>
        </div>
        <div>
          <div className="mb-0.5 text-xs font-medium text-warn">단점·한계</div>
          <p>{show.cons}</p>
        </div>
        {(show.dateNote || show.url) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted sm:col-span-2">
            {show.dateNote && <span>일정 메모: {show.dateNote}</span>}
            {show.url && (
              <a href={show.url} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                공식 사이트 ↗
              </a>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

export function TradeShowCalendar({ shows }: { shows: TradeShow[] }) {
  const [regions, setRegions] = useState<Set<Region>>(() => new Set());
  const [fits, setFits] = useState<Set<FitCategory>>(() => new Set());
  const [boothOnly, setBoothOnly] = useState(false);
  const [globalOnly, setGlobalOnly] = useState(false);

  const toggle = <T,>(set: Set<T>, value: T, update: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    update(next);
  };

  const filtered = useMemo(
    () =>
      shows.filter(
        (s) =>
          (regions.size === 0 || regions.has(s.region)) &&
          (fits.size === 0 || s.fit.some((f) => fits.has(f))) &&
          (!boothOnly || s.plan === "부스 후보" || s.plan === "참관 → 부스") &&
          (!globalOnly || s.scope === "글로벌형" || s.scope === "지역 국제형"),
      ),
    [shows, regions, fits, boothOnly, globalOnly],
  );

  const months = MONTHS;
  const byMonth = useMemo(() => {
    const map = new Map<string, TradeShow[]>();
    for (const s of filtered) {
      const k = monthKey(s);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    for (const list of map.values()) list.sort((a, b) => (a.start ?? "9").localeCompare(b.start ?? "9"));
    return map;
  }, [filtered]);

  const sections = [...months, UNDATED].filter((k) => byMonth.has(k));
  const sectionKey = sections.join(",");

  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const clickLock = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 스크롤 위치에 따라 지금 보고 있는 달을 표시
  useEffect(() => {
    const els = sectionKey
      .split(",")
      .filter(Boolean)
      .map((k) => document.getElementById(`m-${k}`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const onScroll = () => {
      if (clickLock.current) return;
      const offset = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let current = els[0].id.slice(2);
      for (const el of els) {
        if (el.getBoundingClientRect().top <= offset) current = el.id.slice(2);
      }
      setActiveMonth(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionKey]);

  // 활성 달 버튼이 가로 스크롤 영역 밖이면 보이게
  useEffect(() => {
    if (!activeMonth) return;
    // scrollIntoView는 페이지 스크롤까지 건드려 진행 중인 이동을 끊으므로 가로 스크롤만 직접 조정
    const strip = barRef.current?.firstElementChild as HTMLElement | null;
    const btn = strip?.querySelector<HTMLElement>(`[data-month="${activeMonth}"]`);
    if (!strip || !btn || strip.scrollWidth <= strip.clientWidth) return;
    const left = btn.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + btn.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: left - (strip.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [activeMonth]);

  const goToMonth = (k: string) => {
    const el = document.getElementById(`m-${k}`);
    if (!el) return;
    setActiveMonth(k);
    if (clickLock.current) clearTimeout(clickLock.current);
    clickLock.current = setTimeout(() => {
      clickLock.current = null;
    }, 800);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#m-${k}`);
  };
  const filtering = regions.size > 0 || fits.size > 0 || boothOnly || globalOnly;

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="space-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-10 shrink-0 text-xs text-muted">지역</span>
          <Chip active={regions.size === 0} onClick={() => setRegions(new Set())}>
            전체
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={regions.has(r)} onClick={() => toggle(regions, r, setRegions)}>
              {r}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-10 shrink-0 text-xs text-muted">분류</span>
          <Chip active={fits.size === 0} onClick={() => setFits(new Set())}>
            전체
          </Chip>
          {FITS.map((f) => (
            <Chip key={f} active={fits.has(f)} onClick={() => toggle(fits, f, setFits)}>
              {f}
            </Chip>
          ))}
          <span className="mx-1 h-4 w-px bg-line" />
          <Chip active={boothOnly} onClick={() => setBoothOnly((v) => !v)}>
            부스 검토 대상만
          </Chip>
          <Chip active={globalOnly} onClick={() => setGlobalOnly((v) => !v)}>
            글로벌·권역 국제만
          </Chip>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setRegions(new Set());
                setFits(new Set());
                setBoothOnly(false);
                setGlobalOnly(false);
              }}
              className="ml-auto text-xs text-muted hover:text-foreground"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 월 이동 바: 스크롤해도 위에 붙어 있고, 누르면 그 달로 부드럽게 이동 */}
      <div
        ref={barRef}
        className="sticky top-[45px] z-[5] -mx-4 border-b border-line bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] lg:grid lg:grid-cols-[repeat(13,minmax(0,1fr))] lg:overflow-visible">
          {[...months, UNDATED].map((k) => {
            const list = byMonth.get(k) ?? [];
            const active = activeMonth === k;
            return (
              <button
                key={k}
                type="button"
                data-month={k}
                disabled={list.length === 0}
                aria-current={active ? "true" : undefined}
                onClick={() => goToMonth(k)}
                className={`min-w-14 shrink-0 rounded-lg border px-2 py-1.5 text-center transition-colors lg:min-w-0 ${
                  list.length === 0
                    ? "cursor-default border-line text-muted/50"
                    : active
                      ? "border-foreground bg-foreground text-background"
                      : "border-hero-line bg-hero hover:border-foreground/40"
                }`}
              >
                <div className="text-xs font-medium">{monthLabel(k, false)}</div>
                <div className="mt-0.5 flex min-h-3 flex-wrap justify-center gap-0.5">
                  {list.map((s) => (
                    <span key={s.id} title={s.name} className="text-[11px] leading-none">
                      {s.flag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 월별 목록 */}
      {sections.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-10 text-center text-sm text-muted">
          조건에 맞는 박람회가 없어요.
        </p>
      ) : (
        sections.map((k) => {
          const list = byMonth.get(k)!;
          return (
            <section key={k} id={`m-${k}`} className="scroll-mt-36">
              <h2 className="mb-2 flex items-baseline gap-2 px-1">
                <span className="text-lg font-semibold tracking-tight">{monthLabel(k)}</span>
                <span className="text-xs text-muted">{list.length}곳</span>
              </h2>
              <div className="overflow-hidden rounded-xl border border-line bg-surface">
                {list.map((s) => (
                  <ShowRow key={s.id} show={s} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
