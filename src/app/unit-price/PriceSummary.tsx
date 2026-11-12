"use client";

import { PRODUCT, type PharmacyTier, type SimState } from "@/data/unit-price";
import { Fold, NumberInput, SortableStack, pct, won } from "./ui";

const VAT = 1.1;

function Stat({
  label,
  tag,
  value,
  children,
}: {
  label: string;
  tag?: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-muted/60 bg-surface px-4 py-3">
      <p className="text-xs text-muted">
        {label}
        {tag && <b className="ml-1.5 font-semibold text-sale">· {tag}</b>}
      </p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <div className="mt-1 space-y-1.5 text-[11px] text-muted">{children}</div>
    </div>
  );
}

const tierLabel = (t: PharmacyTier) => (t.to !== undefined ? `${won(t.from)}~${won(t.to)}개` : `${won(t.from)}개 이상`);

/** 페이지 맨 위 요약: 정가 · 상시 할인가 · 하한선, 그 아래 접는 패널들 */
export function PriceSummary({
  state,
  setState,
  unitCostTotal,
  sgaPerUnit,
  unitCostExVat,
  sgaExVat,
  detail,
  detailSummary,
  channelTable,
  channelSubtitle,
  channelSummary,
  exportPanel,
  exportSummary,
}: {
  state: SimState;
  setState: React.Dispatch<React.SetStateAction<SimState>>;
  unitCostTotal: number;
  sgaPerUnit: number;
  /** 부가세 뺀 개당 원가·판관비 (약국 유통 남는 금액 계산용) */
  unitCostExVat: number;
  sgaExVat: number;
  /** 펼치면 보이는 판매가 계산 디테일 (원가·판관비·가격 설정) */
  detail: React.ReactNode;
  detailSummary: React.ReactNode;
  /** 펼치면 보이는 채널별 개당 이익 표 */
  channelTable: React.ReactNode;
  channelSubtitle: string;
  /** 접혔을 때 보이는 주력 채널 개당 이익 */
  channelSummary: React.ReactNode;
  /** 펼치면 보이는 수출(FOB) 단가 산정 */
  exportPanel: React.ReactNode;
  exportSummary: React.ReactNode;
}) {
  const { price, everydayDiscount, floorDiscount, pharmacyTiers } = state;
  const everydayPrice = price * (1 - everydayDiscount / 100);
  const floorPrice = price * (1 - floorDiscount / 100);

  // 유통사 납품은 대량 입고라 개별 택배비 없이 원가 + 판관비만 들어가요.
  // 남는 금액은 부가세를 뺀 실제 금액: VAT 별도 공급가 − VAT 별도 원가·판관비 (인건비는 원래 부가세 없음)
  const cost = unitCostExVat + sgaExVat;
  const minRate = price > 0 ? Math.min(1, (cost * VAT) / price) : 0;

  const calc = (t: PharmacyTier) => {
    const supply = price * (t.rate / 100); // VAT 포함
    const profit = supply / VAT - cost; // 부가세 뺀 금액
    const orderQty = t.orderQty ?? t.from;
    const inRange = orderQty >= t.from && (t.to === undefined || orderQty <= t.to);
    return { supply, supplyEx: supply / VAT, share: price - supply, profit, orderQty, inRange };
  };
  const first = pharmacyTiers[0];
  const last = pharmacyTiers[pharmacyTiers.length - 1];

  const setEveryday = (v: number) =>
    setState((s) => ({
      ...s,
      everydayDiscount: v,
    }));
  const setTier = (id: string, patch: Partial<PharmacyTier>) =>
    setState((s) => ({ ...s, pharmacyTiers: s.pharmacyTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">한눈에 보기</h2>
        <span className="text-xs text-muted">VAT 포함 · 칸을 눌러 바로 고칠 수 있어요</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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

        <Stat label="상시 할인가" tag="실제 판매 금액" value={`${won(everydayPrice)}원`}>
          <NumberInput
            label="상시 할인율"
            value={everydayDiscount}
            onChange={(v) => setEveryday(Math.min(100, Math.max(0, v)))}
            suffix="%"
          />
          <p>
            정가에서 <b className="font-medium text-foreground">{won(price - everydayPrice)}원</b> 할인 · 판매가 계산
            디테일과 채널별 개당 이익이 이 금액 기준이에요
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
      </div>

      <div className="mt-4">
        <SortableStack
          order={state.panelOrder}
          onOrder={(panelOrder) => setState((s) => ({ ...s, panelOrder }))}
          items={{
            "price-detail": {
              label: "판매가 계산 디테일",
              render: (handle) => (
                <Fold
                  handle={handle}
                  id="price-detail"
                  title="판매가 계산 디테일"
                  subtitle="개당 원가 + 판관비 → 판매가·목표 이익률 · 모든 금액 VAT 포함"
                  summary={detailSummary}
                >
                  {detail}
                </Fold>
              ),
            },
            "distributor-sim": {
              label: "약국 유통",
              render: (handle) => (
                <Fold
                  handle={handle}
                  id="distributor-sim"
                  title="약국 유통"
                  subtitle="바로팜·편한가 등 매입 유통 · 수량별 공급가와 헤르바 남는 금액"
                  summary={
                    first &&
                    last && (
                      <>
                        {tierLabel(first)} {won(calc(first).supplyEx)}원 → {tierLabel(last)} {won(calc(last).supplyEx)}
                        원 (VAT 별도)
                      </>
                    )
                  }
                >
                  <p className="mb-2 px-1 text-xs leading-relaxed text-muted">
                    <b className="font-semibold text-sale">공급률</b> = 정가 중 헤르바가 받는 비율 · 공급가 = 정가 ×
                    공급률 · 나머지는 유통사와 약국 몫 ·{" "}
                    <b className="font-semibold text-sale">대량 입고라 택배비 제외</b> ·{" "}
                    <b className="font-semibold text-sale">미팅 때는 VAT 별도 공급가로 제시</b> ·{" "}
                    <b className="font-semibold text-sale">헤르바 남는 금액은 부가세 뺀 금액</b>
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
                          <th className="px-2 py-2 text-right font-normal">
                            헤르바 개당 남는 금액
                            <span className="block text-[11px] text-sale">VAT 별도</span>
                          </th>
                          <th className="px-2 py-2 text-right font-normal">
                            주문 시 헤르바 남는 금액
                            <span className="block text-[11px] text-sale">VAT 별도</span>
                          </th>
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
                              <td className="px-2 py-2 text-right text-base font-semibold tabular-nums">
                                {won(r.supplyEx)}원
                              </td>
                              <td className="px-2 py-2 text-right tabular-nums text-muted">{won(r.supply)}원</td>
                              <td className="px-2 py-2 text-right tabular-nums text-muted">
                                {won(r.share)}원 <span className="text-[11px]">({100 - t.rate}%)</span>
                              </td>
                              <td
                                className={`px-2 py-2 text-right font-semibold tabular-nums ${loss ? "text-sale" : "text-accent"}`}
                              >
                                {won(r.profit)}원
                                <span className="block text-[11px] font-normal text-muted">
                                  공급가의 {pct(r.supplyEx > 0 ? r.profit / r.supplyEx : 0)}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <div className="flex items-center justify-end gap-1 text-xs text-muted">
                                  <NumberInput
                                    label={`${tierLabel(t)} 주문 수량`}
                                    value={r.orderQty}
                                    onChange={(v) => setTier(t.id, { orderQty: Math.max(0, v) })}
                                    className="w-24"
                                  />
                                  개 주문 시
                                </div>
                                <p className={`mt-1 font-semibold tabular-nums ${loss ? "text-sale" : ""}`}>
                                  {won(r.profit * r.orderQty)}원
                                </p>
                                {!r.inRange && (
                                  <p className="text-[11px] text-warn">이 수량은 {tierLabel(t)} 구간 밖이에요</p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 rounded-lg bg-hero px-3 py-2.5 text-xs leading-relaxed">
                    <p className="font-medium underline decoration-sale decoration-2 underline-offset-4">
                      헤르바 개당 남는 금액 = 공급가(VAT 별도) − 제품 원가 {won(unitCostExVat)}원 − 판관비{" "}
                      {won(sgaExVat)}원 (= 공급가 − {won(cost)}원) · 판관비는 3PL 물류비 제외
                    </p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted">
                      <li>
                        공급가(VAT 별도)가{" "}
                        <b className="font-semibold text-sale">
                          {won(cost)}원(공급률 {pct(minRate)}) 밑이면 손해
                        </b>
                        예요
                      </li>
                      <li>주문 시 남는 금액 = 개당 남는 금액 × 주문 수량 (수량 칸에 직접 입력)</li>
                      <li>
                        남는 금액은 <b className="font-semibold text-sale">부가세를 뺀 실제 금액</b>이에요.
                        원가·판관비도 부가세를 뺐어요 (VAT 포함 {won(unitCostTotal)}원·{won(sgaPerUnit)}원 → 부가세 없는
                        인건비는 그대로)
                      </li>
                      <li>판관비는 판매가 계산 디테일의 판매 수량으로 나눈 개당 금액이에요</li>
                    </ul>
                  </div>
                </Fold>
              ),
            },
            "export-sim": {
              label: "수출",
              render: (handle) => (
                <Fold
                  handle={handle}
                  id="export-sim"
                  title="수출"
                  subtitle="인코텀즈 FOB · 수량별 수출 단가(USD)와 헤르바 남는 금액"
                  summary={exportSummary}
                  tone="blue"
                >
                  {exportPanel}
                </Fold>
              ),
            },
            "channel-table": {
              label: "채널별 개당 이익",
              render: (handle) => (
                <Fold
                  handle={handle}
                  id="channel-table"
                  title="채널별 개당 이익"
                  subtitle={channelSubtitle}
                  summary={channelSummary}
                >
                  {channelTable}
                </Fold>
              ),
            },
          }}
        />
      </div>
    </section>
  );
}
