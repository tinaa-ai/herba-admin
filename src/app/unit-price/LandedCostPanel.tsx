"use client";

import type { ExportSim, ImportTax, LandedSim } from "@/data/unit-price";
import type { ExportCalc } from "./ExportPanel";
import { NumberInput, tierLabel, won } from "./ui";

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const mxn = (n: number) => `MX$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const newId = () => Math.random().toString(36).slice(2, 9);

/**
 * 바이어 쪽 금액 계산 (모두 개당 USD)
 * CIF = FOB + 운임·보험 → CIF 기준 비용(관세·수수료) → 부가세 = (CIF + 앞 비용) × 세율
 */
export function landedCalc(l: LandedSim, fob: number) {
  const cif = fob + l.freight;
  const cifItems = l.taxes.filter((t) => t.kind === "cif").map((t) => ({ tax: t, amount: (cif * t.rate) / 100 }));
  const cifTaxTotal = cifItems.reduce((s, x) => s + x.amount, 0);
  const vatBase = cif + cifTaxTotal;
  const vatItems = l.taxes.filter((t) => t.kind === "vat").map((t) => ({ tax: t, amount: (vatBase * t.rate) / 100 }));
  const vatTotal = vatItems.reduce((s, x) => s + x.amount, 0);
  const vatRate = l.taxes.filter((t) => t.kind === "vat").reduce((s, t) => s + t.rate, 0);
  // 통관 때 내는 현금(부가세 포함)과, 부가세는 판매 때 돌려받으니 뺀 실제 원가
  const landedCash = vatBase + vatTotal + l.localCost;
  const landedCost = vatBase + l.localCost;
  const denom = 1 - l.resaleMargin / 100;
  const shelfExVat = denom > 0 ? landedCost / denom : null;
  const shelf = shelfExVat !== null ? shelfExVat * (1 + vatRate / 100) : null;
  return { cif, cifItems, vatBase, vatItems, vatTotal, vatRate, landedCash, landedCost, shelfExVat, shelf };
}

function Line({
  label,
  value,
  sub,
  strong,
  sim,
}: {
  label: React.ReactNode;
  value: number;
  sub?: string;
  strong?: boolean;
  sim: ExportSim;
}) {
  return (
    <div className={`flex items-baseline gap-2 py-1 ${strong ? "font-semibold" : ""}`}>
      <span className="min-w-0 flex-1">
        {label}
        {sub && <span className="block text-[11px] font-normal text-muted">{sub}</span>}
      </span>
      <span className="text-right tabular-nums">
        {usd(value)}
        <span className="block text-[11px] font-normal text-muted">
          {mxn(value * sim.mxnRate)} · {won(value * sim.fxRate)}원
        </span>
      </span>
    </div>
  );
}

/** FOB 단가에 바이어가 내는 운임·관세·수수료·부가세를 붙여 현지 도착가와 예상 소비자가를 봐요 */
export function LandedCostPanel({
  sim,
  calc,
  onChange,
  listPrice,
}: {
  sim: ExportSim;
  calc: ExportCalc;
  onChange: (fn: (l: LandedSim) => LandedSim) => void;
  listPrice: number;
}) {
  const l = sim.landed;
  const tier = sim.tiers.find((t) => t.id === l.tierId) ?? sim.tiers[0];
  const fob = tier ? calc(tier).fobUsd : null;
  const setTax = (id: string, patch: Partial<ImportTax>) =>
    onChange((s) => ({ ...s, taxes: s.taxes.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  const r = fob !== null ? landedCalc(l, fob) : null;

  return (
    <div className="mt-6 border-t border-line pt-4">
      <p className="mb-1 px-1 text-sm font-semibold text-export">현지 금액 시뮬레이터</p>
      <p className="mb-3 px-1 text-xs leading-relaxed text-muted">
        FOB 단가에 <b className="font-semibold text-export">바이어가 내는 운임·관세·수수료·부가세</b>를 붙여, 현지 도착
        원가와 예상 소비자가를 봐요 · 기본 세율은 멕시코 예시라 나라에 맞게 바꿔 주세요
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-export-line bg-export-soft p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex-1">FOB 단가 기준 구간</span>
            <select
              aria-label="FOB 단가 기준 구간"
              value={tier?.id ?? ""}
              onChange={(e) => onChange((s) => ({ ...s, tierId: e.target.value }))}
              className="w-40 rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
            >
              {sim.tiers.map((t) => {
                const f = calc(t).fobUsd;
                return (
                  <option key={t.id} value={t.id}>
                    {tierLabel(t)} · {f === null ? "불가" : usd(f)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1">
              해상 운임·보험 <span className="text-[11px] text-muted">개당</span>
            </span>
            <NumberInput
              label="개당 해상 운임·보험"
              value={l.freight}
              onChange={(v) => onChange((s) => ({ ...s, freight: Math.max(0, v) }))}
              suffix="$"
              className="w-32"
            />
          </div>

          <div>
            <p className="mb-1 text-xs text-muted">수입 세금·수수료</p>
            <div className="space-y-1.5">
              {l.taxes.map((t) => (
                <div key={t.id}>
                  <div className="flex items-center gap-2">
                    <input
                      aria-label="항목 이름"
                      value={t.label}
                      onChange={(e) => setTax(t.id, { label: e.target.value })}
                      className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1.5"
                    />
                    <select
                      aria-label={`${t.label} 계산 기준`}
                      value={t.kind}
                      onChange={(e) => setTax(t.id, { kind: e.target.value as ImportTax["kind"] })}
                      className="w-28 shrink-0 rounded-md border border-line bg-surface px-1 py-1.5 text-xs"
                    >
                      <option value="cif">CIF 기준</option>
                      <option value="vat">부가세</option>
                    </select>
                    <NumberInput
                      label={`${t.label} 세율`}
                      value={t.rate}
                      onChange={(v) => setTax(t.id, { rate: Math.max(0, v) })}
                      suffix="%"
                      className="w-24 shrink-0"
                    />
                    <button
                      type="button"
                      aria-label={`${t.label} 삭제`}
                      onClick={() => onChange((s) => ({ ...s, taxes: s.taxes.filter((x) => x.id !== t.id) }))}
                      className="shrink-0 px-1 text-muted hover:text-sale"
                    >
                      ×
                    </button>
                  </div>
                  {t.note && <p className="text-[11px] text-muted">{t.note}</p>}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                onChange((s) => ({
                  ...s,
                  taxes: [...s.taxes, { id: newId(), label: "새 항목", rate: 0, kind: "cif" }],
                }))
              }
              className="mt-1.5 text-xs text-export hover:underline"
            >
              + 세금·수수료 추가
            </button>
            <p className="mt-1 text-[11px] text-muted">
              CIF 기준 = (FOB + 운임·보험) × 세율 · 부가세 = (CIF + CIF 기준 항목 합계) × 세율
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex-1">
              현지 비용 <span className="text-[11px] text-muted">개당 · 관세사·내륙 운송 등</span>
            </span>
            <NumberInput
              label="개당 현지 비용"
              value={l.localCost}
              onChange={(v) => onChange((s) => ({ ...s, localCost: Math.max(0, v) }))}
              suffix="$"
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1">
              현지 유통 마진 <span className="text-[11px] text-muted">부가세 뺀 판매가 기준</span>
            </span>
            <NumberInput
              label="현지 유통 마진"
              value={l.resaleMargin}
              onChange={(v) => onChange((s) => ({ ...s, resaleMargin: Math.min(99, Math.max(0, v)) }))}
              suffix="%"
              className="w-32"
            />
          </div>
        </div>

        <div className="rounded-lg border border-export-line p-3 text-sm">
          {r === null || fob === null ? (
            <p className="text-sale">이 구간은 FOB 단가를 계산할 수 없어요 (마진 + 송금 수수료가 100% 이상)</p>
          ) : (
            <>
              <div className="divide-y divide-line">
                <Line sim={sim} label="FOB 단가" value={fob} sub={tier ? tierLabel(tier) : undefined} />
                <Line sim={sim} label="+ 해상 운임·보험" value={l.freight} />
                <Line sim={sim} label="= CIF (과세 가격)" value={r.cif} strong />
                {r.cifItems.map((x) => (
                  <Line key={x.tax.id} sim={sim} label={`+ ${x.tax.label} ${x.tax.rate}%`} value={x.amount} />
                ))}
                {r.vatItems.map((x) => (
                  <Line
                    key={x.tax.id}
                    sim={sim}
                    label={`+ ${x.tax.label} ${x.tax.rate}%`}
                    value={x.amount}
                    sub={`${usd(r.vatBase)} 기준 · 현지 판매 때 돌려받아요`}
                  />
                ))}
                <Line sim={sim} label="+ 현지 비용" value={l.localCost} />
                <Line
                  sim={sim}
                  label="바이어 통관 때 내는 금액"
                  value={r.landedCash}
                  sub={`FOB의 ${(r.landedCash / fob).toFixed(2)}배 · 부가세 포함`}
                  strong
                />
                <Line
                  sim={sim}
                  label="바이어 실제 수입 원가"
                  value={r.landedCost}
                  sub={`FOB의 ${(r.landedCost / fob).toFixed(2)}배 · 부가세 뺀 금액`}
                  strong
                />
              </div>
              <div className="mt-3 rounded-lg bg-export-soft px-3 py-2.5">
                {r.shelf === null || r.shelfExVat === null ? (
                  <p className="text-sale">현지 유통 마진이 100% 이상이라 계산할 수 없어요</p>
                ) : (
                  <>
                    <p className="text-xs text-muted">
                      예상 현지 소비자가 ·{" "}
                      <b className="font-semibold text-export">유통 마진 {l.resaleMargin}% 적용</b> · 부가세{" "}
                      {r.vatRate}% 포함
                    </p>
                    <p className="text-xl font-semibold tabular-nums text-export">{mxn(r.shelf * sim.mxnRate)}</p>
                    <p className="text-xs tabular-nums text-muted">
                      {usd(r.shelf)} · {won(r.shelf * sim.fxRate)}원 · 한국 정가 {won(listPrice)}원의{" "}
                      {listPrice > 0 ? Math.round(((r.shelf * sim.fxRate) / listPrice) * 100) : "—"}%
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      실제 수입 원가 {usd(r.landedCost)} ÷ (1 − 유통 마진 {l.resaleMargin}%) × (1 + 부가세{" "}
                      {r.vatRate}%)
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
