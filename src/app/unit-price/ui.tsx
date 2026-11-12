"use client";

import { useRef, useState } from "react";

export const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
export const ceil100 = (n: number) => Math.ceil(n / 100) * 100;

export function NumberInput({
  value,
  onChange,
  suffix,
  label,
  className = "",
  required = false,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  label: string;
  className?: string;
  /** 계산에 꼭 필요한 칸: 비어 있거나 0이면 주황색으로 표시 */
  required?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const empty =
    draft !== null
      ? draft.trim() === "" || Number(draft.replace(/,/g, "")) === 0
      : !Number.isFinite(value) || value === 0;
  const missing = required && empty;
  return (
    <label
      title={missing ? "계산에 필요한 값이 비어 있어요" : undefined}
      className={`flex items-center rounded-md border focus-within:border-foreground ${missing ? "border-warn bg-warn-soft" : "border-line bg-surface"} ${className}`}
    >
      <span className="sr-only">{label}</span>
      <input
        inputMode="decimal"
        placeholder={required ? "입력 필요" : undefined}
        value={draft ?? (missing ? "" : value.toLocaleString("ko-KR", { maximumFractionDigits: 2 }))}
        onFocus={(e) => {
          setDraft(String(value));
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value.replace(/,/g, ""));
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => setDraft(null)}
        className="w-full min-w-0 bg-transparent px-2 py-1.5 text-right text-sm tabular-nums outline-none placeholder:text-warn"
      />
      {suffix && <span className={`pr-2 text-xs ${missing ? "text-warn" : "text-muted"}`}>{suffix}</span>}
    </label>
  );
}

const FOLD_TONE = {
  red: { line: "border-hero-line", bg: "bg-hero", hover: "hover:bg-hero", arrow: "text-sale" },
  blue: { line: "border-export-line", bg: "bg-export-soft", hover: "hover:bg-export-soft", arrow: "text-export" },
};

/** 제목 줄을 누르면 펼쳐지는 패널. 처음에는 접혀 있고, 접혔을 때는 summary를 한 줄로 보여줘요 */
export function Fold({
  id,
  title,
  subtitle,
  summary,
  tone = "red",
  handle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  summary?: React.ReactNode;
  tone?: keyof typeof FOLD_TONE;
  /** 제목 줄 왼쪽에 놓는 드래그 손잡이 */
  handle?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = FOLD_TONE[tone];
  return (
    <div className={`rounded-xl border bg-surface ${t.line}`}>
      <div
        className={`flex items-center ${open ? `rounded-t-xl border-b ${t.line} ${t.bg}` : `rounded-xl ${t.hover}`}`}
      >
        {handle}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 py-3 pr-4 text-left ${handle ? "pl-1" : "pl-4"}`}
        >
          <span className={`text-xs ${t.arrow} transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          <span className="text-sm font-semibold">{title}</span>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
          {!open && summary && <span className="ml-auto text-xs tabular-nums text-muted">{summary}</span>}
        </button>
      </div>
      {open && (
        <div id={id} className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * 손잡이(⋮⋮)를 잡고 위아래로 끌어 순서를 바꾸는 목록. 마우스·터치 모두 되고,
 * 손잡이에 포커스를 두고 ↑↓ 키로도 옮길 수 있어요. 순서는 onOrder로 넘겨 저장해요.
 */
export function SortableStack({
  order,
  onOrder,
  items,
}: {
  order: string[];
  onOrder: (order: string[]) => void;
  items: Record<string, { label: string; render: (handle: React.ReactNode) => React.ReactNode }>;
}) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const ids = [...order.filter((id) => items[id]), ...Object.keys(items).filter((id) => !order.includes(id))];

  const startDrag = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(id);
    let current = ids;
    const move = (ev: PointerEvent) => {
      const others = current.filter((x) => x !== id);
      let idx = others.length;
      for (let i = 0; i < others.length; i++) {
        const r = refs.current[others[i]]?.getBoundingClientRect();
        if (r && ev.clientY < r.top + r.height / 2) {
          idx = i;
          break;
        }
      }
      const next = [...others.slice(0, idx), id, ...others.slice(idx)];
      if (next.join() !== current.join()) {
        current = next;
        onOrder(next);
      }
    };
    const up = () => {
      setDragging(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const moveBy = (id: string, delta: number) => {
    const i = ids.indexOf(id);
    const j = i + delta;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    onOrder(next);
  };

  return (
    <div className="space-y-3">
      {ids.map((id) => (
        <div
          key={id}
          ref={(el) => {
            refs.current[id] = el;
          }}
          className={`rounded-xl transition-shadow ${dragging === id ? "relative z-10 shadow-lg ring-2 ring-muted/40" : ""}`}
        >
          {items[id].render(
            <button
              type="button"
              aria-label={`${items[id].label} 순서 옮기기 (끌거나 ↑↓ 키)`}
              title="끌어서 순서 바꾸기"
              onPointerDown={startDrag(id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  moveBy(id, e.key === "ArrowUp" ? -1 : 1);
                }
              }}
              className={`flex touch-none select-none items-center self-stretch rounded-l-xl pl-3 pr-1 text-muted/60 hover:text-foreground ${dragging === id ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <svg aria-hidden width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                <circle cx="2.5" cy="3" r="1.4" />
                <circle cx="7.5" cy="3" r="1.4" />
                <circle cx="2.5" cy="8" r="1.4" />
                <circle cx="7.5" cy="8" r="1.4" />
                <circle cx="2.5" cy="13" r="1.4" />
                <circle cx="7.5" cy="13" r="1.4" />
              </svg>
            </button>,
          )}
        </div>
      ))}
    </div>
  );
}
