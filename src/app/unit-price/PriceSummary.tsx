"use client";

import { PRODUCT, type PharmacyTier, type SimState } from "@/data/unit-price";
import { Fold, NumberInput, pct, won } from "./ui";

const VAT = 1.1;

function Stat({
  label,
  value,
  tag,
  children,
  highlight,
}: {
  label: string;
  value: string;
  tag?: string;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? "border-hero-line bg-hero" : "border-line bg-surface"}`}>
      <p className={`text-xs ${highlight ? "font-medium text-sale" : "text-muted"}`}>{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
        {tag && <span className="ml-1.5 align-middle text-[11px] font-normal text-muted">{tag}</span>}
      </p>
      <div className="mt-1 space-y-1.5 text-[11px] text-muted">{children}</div>
    </div>
  );
}

const tierLabel = (t: PharmacyTier) => (t.to !== undefined ? `${won(t.from)}~${won(t.to)}개` : `${won(t.from)}개 이상`);

/** 페이지 맨 위 요약: 정가 · 상시 할인가 · 하한선 · 약국 유통 수량별 공급가 */
export function PriceSummary({
  state,
  setState,
  unitCostTotal,
  sgaPerUnit,
  detail,
  detailSummary,
}: {
  state: SimState;
  setState: React.Dispatch<React.SetStateAction<SimState>>;
  unitCostTotal: number;
  sgaPerUnit: number;
  /** 펼치면 보이는 정가 계산 디테일 (원가·판관비·가격 설정) */
  detail: React.ReactNode;
  detailSummary: React.ReactNode;
}) {
  const { price, everydayDiscount, floorDiscount, pharmacyTiers } = state;
  const everydayPrice = price * (1 - everydayDiscount / 100);
  const floorPrice = price * (1 - floorDiscount / 100);

  // 유통사 납품은 대량 입고라 개별 택배비 없이 원가 + 판관비만 들어가요
  const cost = unitCostTotal + sgaPerUnit;
  const minRate = price > 0 ? Math.min(1, cost / price) : 0;

  const calc = (t: PharmacyTier) => {
    const supply = price * (t.rate / 100); // VAT 포함
    const profit = supply - cost;
    const exampleQty = t.to ?? t.from;
    return { supply, supplyEx: supply / VAT, share: price - supply, profit, exampleQty };
  };
  const first = pharmacyTiers[0];
  const last = pharmacyTiers[pharmacyTiers.length - 1];

  const setEveryday = (v: number) =>
    setState((s) => ({
      ...s,
      everydayDiscount: v,
      channels: s.channels.map((c) => (c.everyday ? { ...c, discount: v } : c)),
    }));
  const setTier = (id: string, patch: Partial<PharmacyTier>) =>
    setState((s) => ({ ...s, pharmacyTiers: s.pharmacyTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">한눈에 보기</h2>
        <span className="text-xs text-muted">
          VAT 포함 (약국 유통 공급가는 VAT 별도도 함께) · 칸을 눌러 바로 고칠 수 있어요
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="정가" value={`${won(price)}원`}>
          <NumberInput
            label="정가"
            value={price}
            onChange={(v) => setState((s) => ({ ...s, price: Math.max(0, v) }))}
            suffix="원"
          />
          <p>
            {PRODUCT.volumeMl}mL · 10mL당 {won((price / PRODUCT.volumeMl) * 10)}원 · 약국 판매 기준
          </p>
        </Stat>

        <Stat label="상시 할인가" value={`${won(everydayPrice)}원`}>
          <NumberInput
            label="상시 할인율"
            value={everydayDiscount}
            onChange={(v) => setEveryday(Math.min(100, Math.max(0, v)))}
            suffix="%"
          />
          <p>
            정가에서 <b className="font-medium text-foreground">{won(price - everydayPrice)}원</b> 할인 · 자사몰·네이버
            브랜드스토어 할인율도 같이 바뀌어요
          </p>
        </Stat>

        <Stat label="최저가 하한선" value={`${won(floorPrice)}원`}>
          <NumberInput
            label="최저가 하한선 할인율"
            value={floorDiscount}
            onChange={(v) => setState((s) => ({ ...s, floorDiscount: Math.min(100, Math.max(0, v)) }))}
            suffix="%"
          />
          <p>
            정가에서 최대 <b className="font-medium text-foreground">{won(price - floorPrice)}원</b> 할인 · 쿠폰·행사도
            이 밑으로는 안 내려가요
          </p>
        </Stat>

        {first && (
          <Stat
            label={`약국 유통 공급가 · ${tierLabel(first)}`}
            value={`${won(calc(first).supplyEx)}원`}
            tag="VAT 별도"
            highlight
          >
            <p className="text-foreground">
              공급률 {first.rate}% · VAT 포함 {won(calc(first).supply)}원
            </p>
            <p>
              헤르바 개당 남는 금액{" "}
              <b className={`font-semibold ${calc(first).profit < 0 ? "text-sale" : "text-accent"}`}>
                {won(calc(first).profit)}원
              </b>
            </p>
            {last && last !== first && (
              <p>
                {tierLabel(last)}는 공급률 {last.rate}% · {won(calc(last).supplyEx)}원
              </p>
            )}
          </Stat>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Fold
          id="price-detail"
          title="정가 계산 디테일"
          subtitle="개당 원가 + 판관비 → 정가·하한선·목표 이익률"
          summary={detailSummary}
        >
          {detail}
        </Fold>
        <Fold
          id="distributor-sim"
          title="약국 유통"
          subtitle="바로팜·편한가 등 매입 유통 · 수량별 공급가와 헤르바 남는 금액"
          summary={
            first &&
            last && (
              <>
                {tierLabel(first)} {won(calc(first).supplyEx)}원 → {tierLabel(last)} {won(calc(last).supplyEx)}원 (VAT
                별도)
              </>
            )
          }
        >
          <p className="mb-2 px-1 text-xs text-muted">
            공급률 = 정가 중 헤르바가 받는 비율 · 공급가 = 정가 × 공급률 · 나머지는 유통사와 약국 몫 · 대량 입고라
            택배비 제외
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-2 py-2 font-normal">주문 수량</th>
                  <th className="w-24 px-2 py-2 text-right font-normal">공급률</th>
                  <th className="px-2 py-2 text-right font-normal">공급가 (VAT 별도)</th>
                  <th className="px-2 py-2 text-right font-normal">공급가 (VAT 포함)</th>
                  <th className="px-2 py-2 text-right font-normal">유통·약국 몫</th>
                  <th className="px-2 py-2 text-right font-normal">헤르바 개당 남는 금액</th>
                  <th className="px-2 py-2 text-right font-normal">주문 시 헤르바 남는 금액</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyTiers.map((t) => {
                  const r = calc(t);
                  const loss = r.profit < 0;
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <NumberInput
                            label="구간 시작 수량"
                            value={t.from}
                            onChange={(v) => setTier(t.id, { from: Math.max(0, v) })}
                            className="w-24"
                          />
                          {t.to !== undefined ? (
                            <>
                              ~
                              <NumberInput
                                label="구간 끝 수량"
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
                          label={`${tierLabel(t)} 공급률`}
                          value={t.rate}
                          onChange={(v) => setTier(t.id, { rate: Math.min(100, Math.max(0, v)) })}
                          suffix="%"
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-base font-semibold tabular-nums">{won(r.supplyEx)}원</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted">{won(r.supply)}원</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted">
                        {won(r.share)}원 <span className="text-[11px]">({100 - t.rate}%)</span>
                      </td>
                      <td
                        className={`px-2 py-2 text-right font-semibold tabular-nums ${loss ? "text-sale" : "text-accent"}`}
                      >
                        {won(r.profit)}원
                        <span className="block text-[11px] font-normal text-muted">
                          공급가의 {pct(r.supply > 0 ? r.profit / r.supply : 0)}
                        </span>
                      </td>
                      <td className={`px-2 py-2 text-right tabular-nums ${loss ? "text-sale" : ""}`}>
                        {won(r.profit * r.exampleQty)}원
                        <span className="block text-[11px] text-muted">{won(r.exampleQty)}개 기준</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            헤르바 남는 금액 = 공급가(VAT 포함) − 개당 원가 {won(unitCostTotal)}원 − 개당 판관비 {won(sgaPerUnit)}원.
            다른 표와 같이 VAT 포함 기준이고 부가세 정산(약 1/11)은 빼지 않았어요. 공급률이{" "}
            <b className="font-medium text-foreground">{pct(minRate)}</b> 밑으로 내려가면 손해예요. 판관비는 정가 계산
            디테일의 판매 수량 기준이에요.
          </p>
        </Fold>
      </div>
    </section>
  );
}
