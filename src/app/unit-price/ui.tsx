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
