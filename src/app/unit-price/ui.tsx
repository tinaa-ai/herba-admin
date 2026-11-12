"use client";

import { useState } from "react";

export const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
export const ceil100 = (n: number) => Math.ceil(n / 100) * 100;

export function NumberInput({
  value,
  onChange,
  suffix,
  label,
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  label: string;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label
      className={`flex items-center rounded-md border border-line bg-surface focus-within:border-foreground ${className}`}
    >
      <span className="sr-only">{label}</span>
      <input
        inputMode="decimal"
        value={draft ?? value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
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
        className="w-full min-w-0 bg-transparent px-2 py-1.5 text-right text-sm tabular-nums outline-none"
      />
      {suffix && <span className="pr-2 text-xs text-muted">{suffix}</span>}
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
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  summary?: React.ReactNode;
  tone?: keyof typeof FOLD_TONE;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = FOLD_TONE[tone];
  return (
    <div className={`rounded-xl border ${t.line}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left ${open ? `rounded-t-xl border-b ${t.line} ${t.bg}` : `rounded-xl ${t.hover}`}`}
      >
        <span className={`text-xs ${t.arrow} transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        <span className="text-sm font-semibold">{title}</span>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        {!open && summary && <span className="ml-auto text-xs tabular-nums text-muted">{summary}</span>}
      </button>
      {open && (
        <div id={id} className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}
