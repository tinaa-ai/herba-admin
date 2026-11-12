"use client";

import { PRODUCT, type SimState } from "@/data/unit-price";
import { Fold, NumberInput, pct, won } from "./ui";

const VAT = 1.1;

function Stat({
  label,
  value,
  children,
  highlight,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? "border-hero-line bg-hero" : "border-line bg-surface"}`}>
      <p className={`text-xs ${highlight ? "font-medium text-sale" : "text-muted"}`}>{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <div className="mt-1 space-y-1.5 text-[11px] text-muted">{children}</div>
    </div>
  );
}

/** 페이지 맨 위 요약: 정가 · 상시 할인가 · 하한선 · 약국 유통사 수량별 제안 단가 */
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
  const { price, everydayDiscount, floorDiscount, distributorTiers, distributorPlans, selectedPlan } = state;
  const everydayPrice = price * (1 - everydayDiscount / 100);
  const floorPrice = price * (1 - floorDiscount / 100);

  // 유통사 납품은 대량 입고라 개별 택배비 없이 원가 + 판관비만 들어가요
  const cost = unitCostTotal + sgaPerUnit;
  const maxDiscount = price > 0 ? Math.max(0, 1 - cost / price) : 0;

  const plan = distributorPlans.find((p) => p.id === selectedPlan) ?? distributorPlans[0];
  const supplyAt = (d: number) => price * (1 - d / 100);
  const proposal = plan ? supplyAt(plan.discounts[0] ?? 0) : 0;
  const proposalLast = plan ? supplyAt(plan.discounts[plan.discounts.length - 1] ?? 0) : 0;

  const setEveryday = (v: number) =>
    setState((s) => ({
      ...s,
      everydayDiscount: v,
      channels: s.channels.map((c) => (c.everyday ? { ...c, discount: v } : c)),
    }));
  const setTier = (i: number, v: number) =>
    setState((s) => ({ ...s, distributorTiers: s.distributorTiers.map((q, j) => (j === i ? v : q)) }));
  const setDiscount = (planId: string, i: number, v: number) =>
    setState((s) => ({
      ...s,
      distributorPlans: s.distributorPlans.map((p) =>
        p.id === planId ? { ...p, discounts: p.discounts.map((d, j) => (j === i ? v : d)) } : p,
      ),
    }));

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">한눈에 보기</h2>
        <span className="text-xs text-muted">VAT 포함 · 칸을 눌러 바로 고칠 수 있어요</span>
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

        <Stat label={`약국 유통사 제안가 · ${plan?.name ?? ""}`} value={`${won(proposal)}원`} highlight>
          <p className="text-foreground">
            VAT 별도 <b className="font-semibold">{won(proposal / VAT)}원</b> · 정가 대비 {plan?.discounts[0] ?? 0}%
            할인
          </p>
          <p>
            {won(distributorTiers[0] ?? 0)}개부터 · {won(distributorTiers[distributorTiers.length - 1] ?? 0)}개면{" "}
            {won(proposalLast)}원까지
          </p>
          <p>
            개당 이익 {won(proposal - cost)}원 ({pct(proposal > 0 ? (proposal - cost) / proposal : 0)})
          </p>
        </Stat>
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
          subtitle="바로팜·편한가 등 매입 유통 · 수량별 제안 단가 1·2·3안"
          summary={
            plan && (
              <>
                {plan.name} · {won(distributorTiers[0] ?? 0)}개 {won(proposal)}원 →{" "}
                {won(distributorTiers[distributorTiers.length - 1] ?? 0)}개 {won(proposalLast)}원
              </>
            )
          }
        >
          <div>
            <p className="mb-2 px-1 text-xs text-muted">
              공급가 = 정가 × (1 − 할인율) · 대량 입고라 택배비 제외 · 안 제목을 눌러 미팅 제안안을 골라요
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="w-32 border-b border-line px-2 py-2 font-normal">주문 수량</th>
                    {distributorPlans.map((p) => {
                      const active = p.id === plan?.id;
                      return (
                        <th
                          key={p.id}
                          className={`border-b px-2 py-2 font-normal ${active ? "rounded-t-lg border-hero-line bg-hero" : "border-line"}`}
                        >
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => setState((s) => ({ ...s, selectedPlan: p.id }))}
                            className="flex w-full items-center gap-2 text-left"
                          >
                            <span
                              className={`inline-block size-3 rounded-full border ${active ? "border-sale bg-sale" : "border-line"}`}
                            />
                            <span className={`text-sm ${active ? "font-semibold text-sale" : "text-foreground"}`}>
                              {p.name}
                            </span>
                            <span>{p.note}</span>
                            {active && <span className="ml-auto text-[11px] text-sale">미팅 제안안</span>}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {distributorTiers.map((qty, i) => (
                    <tr key={i}>
                      <td className="border-b border-line px-2 py-2 align-top">
                        <NumberInput
                          label={`${i + 1}구간 수량`}
                          value={qty}
                          onChange={(v) => setTier(i, Math.max(0, v))}
                          suffix="개"
                        />
                        {i === 0 && <p className="mt-1 text-[11px] text-muted">최소 주문 수량</p>}
                      </td>
                      {distributorPlans.map((p) => {
                        const d = p.discounts[i] ?? 0;
                        const supply = supplyAt(d);
                        const profit = supply - cost;
                        const active = p.id === plan?.id;
                        return (
                          <td
                            key={p.id}
                            className={`border-b px-2 py-2 align-top ${active ? "border-hero-line bg-hero" : "border-line"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <NumberInput
                                label={`${p.name} ${won(qty)}개 할인율`}
                                value={d}
                                onChange={(v) => setDiscount(p.id, i, Math.min(100, Math.max(0, v)))}
                                suffix="%"
                                className="w-20 shrink-0"
                              />
                              <div className="text-right">
                                <p className="font-semibold tabular-nums">{won(supply)}원</p>
                                <p className="text-[11px] tabular-nums text-muted">VAT 별도 {won(supply / VAT)}원</p>
                              </div>
                            </div>
                            <p
                              className={`mt-1 text-right text-[11px] tabular-nums ${profit < 0 ? "text-sale" : "text-accent"}`}
                            >
                              개당 이익 {won(profit)}원 ({pct(supply > 0 ? profit / supply : 0)})
                            </p>
                            <p className="text-right text-[11px] tabular-nums text-muted">
                              주문 금액 {won(supply * qty)}원
                            </p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              개당 원가 {won(unitCostTotal)}원 + 판관비 {won(sgaPerUnit)}원 = {won(cost)}원이라, 정가 대비{" "}
              <b className="font-medium text-foreground">{pct(maxDiscount)}</b> 할인(공급가 {won(cost)}원)까지가
              손익분기예요. 판관비는 아래 판관비 칸의 판매 수량 기준이에요.
            </p>
          </div>
        </Fold>
      </div>
    </section>
  );
}
