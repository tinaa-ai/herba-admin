"use client";

import type { CostItem, ExportSim, ExportTier } from "@/data/unit-price";
import { NumberInput, pct, won } from "./ui";

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ceilCent = (n: number) => Math.ceil(n * 100) / 100;
const tierLabel = (t: ExportTier) => (t.to !== undefined ? `${won(t.from)}~${won(t.to)}개` : `${won(t.from)}개 이상`);

const Key = ({ children }: { children: React.ReactNode }) => <b className="font-semibold text-export">{children}</b>;

export function makeExportCalc(sim: ExportSim, unitCostExVat: number, sgaExVat: number, listPrice: number) {
  const shipment = sim.shipmentCosts.reduce((s, c) => s + c.amount, 0);
  const extras = sim.unitExtras.reduce((s, c) => s + c.amount, 0);
  const sga = sim.includeSga ? sgaExVat : 0;
  return (t: ExportTier) => {
    const qty = t.orderQty ?? t.from;
    const shipPerUnit = qty > 0 ? shipment / qty : 0;
    const cost = unitCostExVat + sga + extras + shipPerUnit;
    const denom = 1 - t.margin / 100 - sim.payFee / 100;
    const fobUsd = denom > 0 && sim.fxRate > 0 ? ceilCent(cost / denom / sim.fxRate) : null;
    const fobKrw = fobUsd !== null ? fobUsd * sim.fxRate : null;
    const profit = fobKrw !== null ? fobKrw * (1 - sim.payFee / 100) - cost : null;
    const inRange = qty >= t.from && (t.to === undefined || qty <= t.to);
    return {
      qty,
      inRange,
      shipPerUnit,
      cost,
      fobUsd,
      fobKrw,
      profit,
      ofList: fobKrw !== null && listPrice > 0 ? fobKrw / listPrice : null,
    };
  };
}

export function exportSummary(sim: ExportSim, calc: ReturnType<typeof makeExportCalc>) {
  const first = sim.tiers[0];
  const last = sim.tiers[sim.tiers.length - 1];
  if (!first || !last) return null;
  const a = calc(first).fobUsd;
  const b = calc(last).fobUsd;
  return `${tierLabel(first)} ${a === null ? "불가" : usd(a)} → ${tierLabel(last)} ${b === null ? "불가" : usd(b)} (FOB)`;
}

function ItemInputs({
  items,
  onChange,
  suffix,
}: {
  items: CostItem[];
  onChange: (items: CostItem[]) => void;
  suffix: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.id}>
          <div className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1">{it.label}</span>
            <NumberInput
              label={it.label}
              required
              value={it.amount}
              onChange={(v) => onChange(items.map((x) => (x.id === it.id ? { ...x, amount: Math.max(0, v) } : x)))}
              suffix={suffix}
              className="w-32 shrink-0"
            />
          </div>
          {it.note && <p className="text-[11px] text-muted">{it.note}</p>}
        </div>
      ))}
    </div>
  );
}

/** 수출(FOB) 단가 산정: 설정값 + 수량 구간별 FOB 단가와 헤르바 남는 금액 */
export function ExportPanel({
  sim,
  onChange,
  unitCostExVat,
  sgaExVat,
  listPrice,
}: {
  sim: ExportSim;
  onChange: (fn: (s: ExportSim) => ExportSim) => void;
  unitCostExVat: number;
  sgaExVat: number;
  listPrice: number;
}) {
  const calc = makeExportCalc(sim, unitCostExVat, sgaExVat, listPrice);
  const shipment = sim.shipmentCosts.reduce((s, c) => s + c.amount, 0);
  const extras = sim.unitExtras.reduce((s, c) => s + c.amount, 0);
  const setTier = (id: string, patch: Partial<ExportTier>) =>
    onChange((s) => ({ ...s, tiers: s.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  return (
    <div>
      <p className="mb-3 px-1 text-xs leading-relaxed text-muted">
        <Key>FOB 조건</Key>: 한국 선적항에서 배에 싣는 데까지 헤르바 부담 ·{" "}
        <Key>해상 운임·보험·현지 관세는 바이어 부담</Key> · <Key>수출은 영세율이라 원가를 VAT 별도로 계산</Key> · 단가는
        USD, 센트 단위로 올림
      </p>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-export-line bg-export-soft p-3">
          <p className="mb-2 text-sm font-semibold text-export">기본 설정</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex-1">환율</span>
              <NumberInput
                label="원/USD 환율"
                required
                value={sim.fxRate}
                onChange={(v) => onChange((s) => ({ ...s, fxRate: Math.max(0, v) }))}
                suffix="원/$"
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1">해외 송금 수수료</span>
              <NumberInput
                label="해외 송금 수수료"
                value={sim.payFee}
                onChange={(v) => onChange((s) => ({ ...s, payFee: Math.min(100, Math.max(0, v)) }))}
                suffix="%"
                className="w-32"
              />
            </div>
            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={sim.includeSga}
                onChange={(e) => onChange((s) => ({ ...s, includeSga: e.target.checked }))}
                className="size-4 accent-[var(--export)]"
              />
              <span>판관비 개당 {won(sgaExVat)}원 포함 (3PL 물류비 제외)</span>
            </label>
            <p className="text-[11px] text-muted">2026-11-12 기준 · 미팅 전에 그날 환율로 다시 넣어 주세요</p>
          </div>
        </div>
        <div className="rounded-lg border border-export-line bg-export-soft p-3">
          <p className="mb-2 text-sm font-semibold text-export">선적 1회당 비용</p>
          <ItemInputs
            items={sim.shipmentCosts}
            onChange={(v) => onChange((s) => ({ ...s, shipmentCosts: v }))}
            suffix="원"
          />
          <p className="mt-2 text-[11px] text-muted">
            합계 {won(shipment)}원 → <Key>주문 수량으로 나눠</Key> 개당에 들어가요
          </p>
        </div>
        <div className="rounded-lg border border-export-line bg-export-soft p-3">
          <p className="mb-2 text-sm font-semibold text-export">수출 때 개당 추가 비용</p>
          <ItemInputs items={sim.unitExtras} onChange={(v) => onChange((s) => ({ ...s, unitExtras: v }))} suffix="원" />
          <p className="mt-2 text-[11px] text-muted">개당 {won(extras)}원</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-2 py-2 font-normal">주문 수량</th>
              <th className="w-24 px-2 py-2 text-right font-normal">목표 마진</th>
              <th className="px-2 py-2 text-right font-normal">FOB 단가 (USD)</th>
              <th className="px-2 py-2 text-right font-normal">원화 환산</th>
              <th className="px-2 py-2 text-right font-normal">국내 정가 대비</th>
              <th className="px-2 py-2 text-right font-normal">개당 원가 합계</th>
              <th className="px-2 py-2 text-right font-normal">헤르바 개당 남는 금액</th>
              <th className="px-2 py-2 text-right font-normal">주문 시 헤르바 남는 금액</th>
            </tr>
          </thead>
          <tbody>
            {sim.tiers.map((t) => {
              const r = calc(t);
              const loss = r.profit !== null && r.profit < 0;
              return (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <NumberInput
                        label="구간 시작 수량"
                        required
                        value={t.from}
                        onChange={(v) => setTier(t.id, { from: Math.max(0, v) })}
                        className="w-24"
                      />
                      {t.to !== undefined ? (
                        <>
                          ~
                          <NumberInput
                            label="구간 끝 수량"
                            required
                            value={t.to}
                            onChange={(v) => setTier(t.id, { to: Math.max(0, v) })}
                            className="w-24"
                          />
                          개
                        </>
                      ) : (
                        <span className="whitespace-nowrap">개 이상</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <NumberInput
                      label={`${tierLabel(t)} 목표 마진`}
                      value={t.margin}
                      onChange={(v) => setTier(t.id, { margin: Math.min(99, Math.max(0, v)) })}
                      suffix="%"
                    />
                  </td>
                  <td className="px-2 py-2 text-right text-base font-semibold tabular-nums text-export">
                    {r.fobUsd === null ? <span className="text-sale">불가</span> : usd(r.fobUsd)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    {r.fobKrw === null ? "—" : `${won(r.fobKrw)}원`}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    {r.ofList === null ? "—" : pct(r.ofList)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    {won(r.cost)}원<span className="block text-[11px]">선적비 개당 {won(r.shipPerUnit)}원 포함</span>
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-semibold tabular-nums ${loss ? "text-sale" : "text-accent"}`}
                  >
                    {r.profit === null ? "—" : `${won(r.profit)}원`}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex items-center justify-end gap-1 text-xs text-muted">
                      <NumberInput
                        label={`${tierLabel(t)} 주문 수량`}
                        required
                        value={r.qty}
                        onChange={(v) => setTier(t.id, { orderQty: Math.max(0, v) })}
                        className="w-24"
                      />
                      개 주문 시
                    </div>
                    <p className={`mt-1 font-semibold tabular-nums ${loss ? "text-sale" : ""}`}>
                      {r.profit === null ? "—" : `${won(r.profit * r.qty)}원`}
                    </p>
                    {r.fobUsd !== null && (
                      <p className="text-[11px] tabular-nums text-muted">주문 금액 {usd(r.fobUsd * r.qty)}</p>
                    )}
                    {!r.inRange && <p className="text-[11px] text-warn">이 수량은 {tierLabel(t)} 구간 밖이에요</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg bg-export-soft px-3 py-2.5 text-xs leading-relaxed">
        <p className="font-medium underline decoration-export decoration-2 underline-offset-4">
          FOB 단가 = 개당 원가 합계 ÷ (1 − 목표 마진 − 송금 수수료 {sim.payFee}%) ÷ 환율 {won(sim.fxRate)}원
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted">
          <li>
            개당 원가 합계 = 제품 원가 {won(unitCostExVat)}원{sim.includeSga && <> + 판관비 {won(sgaExVat)}원</>} + 수출
            포장·라벨 {won(extras)}원 + 선적 비용 {won(shipment)}원 ÷ 주문 수량
          </li>
          <li>
            원가는 <Key>VAT 뺀 금액</Key>이에요 (국내 원가 ÷ 1.1, 부가세 없는 인건비는 그대로)
          </li>
          <li>헤르바 개당 남는 금액 = FOB 단가(원화) − 송금 수수료 − 개당 원가 합계</li>
          <li>국내 정가 대비 = FOB 단가(원화) ÷ 국내 정가. 바이어의 운임·관세·유통 마진이 그 위에 붙어요</li>
        </ul>
      </div>
    </div>
  );
}
