"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_STATE, PRODUCT, QUOTE, type Channel, type CostItem, type SimState } from "@/data/unit-price";
import { ExportPanel, exportSummary, makeExportCalc } from "./ExportPanel";
import { PriceSummary } from "./PriceSummary";
import { NumberInput, ceil100, pct, won } from "./ui";

// v2: 모든 금액을 VAT 포함으로 바꾸면서 예전(VAT 별도) 저장값은 버려요
const STORAGE_KEY = "herba.unit-price.v2";

const newId = () => Math.random().toString(36).slice(2, 9);

function loadState(): SimState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SimState>;
    const merged = { ...DEFAULT_STATE, ...parsed };
    // 정가 기본값이 24,900 → 25,000으로 바뀌었어요. 손대지 않은 옛 기본값이면 새 값으로 바꿔요
    if (merged.price === 24900) merged.price = DEFAULT_STATE.price;
    // 하한선을 금액(floorPrice)에서 할인율(floorDiscount)로 바꿨어요. 옛 저장값의 floorPrice는 버려요
    delete (merged as Partial<SimState> & { floorPrice?: number }).floorPrice;
    // 약국 유통 1·2·3안(distributorPlans)을 수량 구간별 공급률(pharmacyTiers) 하나로 바꿨어요
    for (const key of ["distributorTiers", "distributorPlans", "selectedPlan"])
      delete (merged as Record<string, unknown>)[key];
    // 주력 채널 표시가 생기기 전에 저장된 값이면 기본값의 주력 여부와 새 이름을 이어받아요
    // 약국 유통 첫 구간을 1~5,000개 → 1,000~9,999개로 바꿨어요 (옛 기본값 그대로면 새 값으로)
    merged.pharmacyTiers = merged.pharmacyTiers.map((t) =>
      t.id === "t1" && t.to === 5000 ? { ...t, from: t.from === 1 ? 1000 : t.from, to: 9999 } : t,
    );
    // 공급률 기본값을 55/52/50/48% → 50/48/46/44%로 바꿨어요. 옛 기본값 그대로면 새 값으로
    const OLD_RATES = [55, 52, 50, 48];
    if (
      merged.pharmacyTiers.length === OLD_RATES.length &&
      merged.pharmacyTiers.every((t, i) => t.rate === OLD_RATES[i])
    ) {
      merged.pharmacyTiers = merged.pharmacyTiers.map((t, i) => ({
        ...t,
        rate: DEFAULT_STATE.pharmacyTiers[i]?.rate ?? t.rate,
      }));
    }
    // 환율 기본값을 1,400 → 1,340원으로 바꿨어요. 옛 기본값 그대로면 새 값으로
    if (merged.exportSim.fxRate === 1400)
      merged.exportSim = { ...merged.exportSim, fxRate: DEFAULT_STATE.exportSim.fxRate };
    // 약국은 '약국 유통' 패널에서 따로 계산해서 채널 표에서는 뺐어요
    merged.channels = merged.channels.filter((c) => c.id !== "pharmacy");
    merged.channels = merged.channels.map((c) => {
      const def = DEFAULT_STATE.channels.find((d) => d.id === c.id);
      return {
        ...c,
        main: c.main ?? def?.main ?? false,
        discount: c.discount ?? def?.discount ?? 0,
        everyday: c.everyday ?? def?.everyday ?? false,
        name: c.id === "naver" && c.name === "네이버 스마트스토어" ? (def?.name ?? c.name) : c.name,
      };
    });
    return merged;
  } catch {
    return null;
  }
}

const CARD_TONE = {
  cost: { box: "border-cost-line bg-cost-bg", title: "" },
  price: { box: "border-hero-line bg-hero", title: "text-sale" },
};

function Card({
  title,
  aside,
  tone,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  tone: keyof typeof CARD_TONE;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border p-4 ${CARD_TONE[tone].box}`}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className={`text-sm font-semibold ${CARD_TONE[tone].title}`}>{title}</h2>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function CostList({
  items,
  onChange,
  addLabel,
}: {
  items: CostItem[];
  onChange: (items: CostItem[]) => void;
  addLabel: string;
}) {
  const update = (id: string, patch: Partial<CostItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.id} className="group">
          <div className="flex items-center gap-2">
            <input
              value={it.label}
              aria-label="항목 이름"
              onChange={(e) => update(it.id, { label: e.target.value })}
              className="min-w-0 flex-1 rounded px-1 py-1 text-sm outline-none hover:bg-subtle focus:bg-subtle"
            />
            <NumberInput
              label={`${it.label} 금액`}
              value={it.amount}
              onChange={(amount) => update(it.id, { amount })}
              suffix="원"
              className="w-32 shrink-0"
            />
            <button
              type="button"
              aria-label={`${it.label} 삭제`}
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}
              className="w-5 shrink-0 text-muted opacity-40 hover:text-sale hover:opacity-100 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
          {it.note && <p className="pl-1 text-[11px] text-muted">{it.note}</p>}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { id: newId(), label: "새 항목", amount: 0 }])}
        className="mt-1 text-xs text-muted hover:text-foreground"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function Connector({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="flex items-center justify-center">
      <span className="flex size-6 items-center justify-center rounded-full border border-line bg-surface text-xs text-muted">
        <span className="lg:hidden">{children === "→" ? "↓" : children}</span>
        <span className="hidden lg:inline">{children}</span>
      </span>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-2 text-sm ${strong ? "font-semibold" : "text-muted"}`}>
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

type ChannelResult = {
  channel: Channel;
  sale: number;
  fee: number;
  cogs: number;
  sga: number;
  profit: number;
  margin: number;
  breakEven: number | null;
  target: number | null;
};

const SEGMENTS = [
  { key: "fee", label: "채널 수수료", className: "bg-seg-fee" },
  { key: "cogs", label: "원가", className: "bg-seg-cost" },
  { key: "sga", label: "판관비", className: "bg-seg-sga" },
] as const;

function PriceBar({ r }: { r: ChannelResult }) {
  const price = r.sale;
  const costs = r.fee + r.cogs + r.sga;
  const base = Math.max(price, costs, 1);
  const w = (n: number) => `${(Math.max(n, 0) / base) * 100}%`;
  return (
    <div
      className="relative flex h-3 w-full overflow-hidden rounded-sm bg-subtle"
      title={`수수료 ${won(r.fee)} · 원가 ${won(r.cogs)} · 판관비 ${won(r.sga)} · 이익 ${won(r.profit)}`}
    >
      {SEGMENTS.map((s) => (
        <div key={s.key} className={s.className} style={{ width: w(r[s.key]) }} />
      ))}
      {r.profit > 0 && <div className="bg-accent" style={{ width: w(r.profit) }} />}
      {r.profit < 0 && (
        <div className="absolute inset-y-0 w-0.5 bg-sale" style={{ left: w(price) }} aria-label="판매가 위치" />
      )}
    </div>
  );
}

export function UnitPriceSimulator() {
  const [state, setState] = useState<SimState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadState();
    // 저장값은 브라우저에만 있어서 마운트 후에 읽어요 (서버 렌더와 어긋나지 않게).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setState(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장이 막힌 브라우저에서도 계산은 그대로 */
    }
  }, [state, loaded]);

  const set = <K extends keyof SimState>(key: K, value: SimState[K]) => setState((s) => ({ ...s, [key]: value }));
  const updateChannel = (id: string, patch: Partial<Channel>) =>
    set(
      "channels",
      state.channels.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );

  const { unitCosts, shippingCost, fixedCosts, quantity, price, floorDiscount, targetMargin, channels } = state;
  const floorPrice = price * (1 - floorDiscount / 100);

  const supply = unitCosts.filter((c) => ["raw", "labor", "material"].includes(c.id)).reduce((s, c) => s + c.amount, 0);
  const unitCostTotal = unitCosts.reduce((s, c) => s + c.amount, 0);
  const fixedTotal = fixedCosts.reduce((s, c) => s + c.amount, 0);
  const sgaPerUnit = quantity > 0 ? fixedTotal / quantity : 0;
  // 수출은 영세율이라 원가를 VAT 뺀 금액으로 봐요. 인건비는 원래 부가세가 없어서 그대로
  const unitCostExVat = unitCostTotal / 1.1;
  const sgaExVat =
    quantity > 0 ? fixedCosts.reduce((s, c) => s + (c.id === "payroll" ? c.amount : c.amount / 1.1), 0) / quantity : 0;
  const exportCalc = makeExportCalc(state.exportSim, unitCostExVat, sgaExVat, price);

  const results: ChannelResult[] = useMemo(
    () =>
      channels.map((channel) => {
        const rate = (channel.fee + channel.card) / 100;
        const cogs = unitCostTotal + (channel.shipping ? shippingCost : 0);
        const sale = price * (1 - channel.discount / 100);
        const fee = sale * rate;
        const profit = sale - fee - cogs - sgaPerUnit;
        const cost = cogs + sgaPerUnit;
        const beDenom = 1 - rate;
        const tDenom = 1 - targetMargin / 100 - rate;
        return {
          channel,
          sale,
          fee,
          cogs,
          sga: sgaPerUnit,
          profit,
          margin: sale > 0 ? profit / sale : 0,
          breakEven: beDenom > 0 ? ceil100(cost / beDenom) : null,
          target: tDenom > 0 ? ceil100(cost / tDenom) : null,
        };
      }),
    [channels, unitCostTotal, shippingCost, price, sgaPerUnit, targetMargin],
  );

  const belowMoq = quantity > 0 && quantity < QUOTE.containerMoq;

  return (
    <div className="space-y-6">
      <PriceSummary
        state={state}
        setState={setState}
        unitCostTotal={unitCostTotal}
        sgaPerUnit={sgaPerUnit}
        unitCostExVat={unitCostExVat}
        sgaExVat={sgaExVat}
        detailSummary={`개당 총원가 ${won(unitCostTotal + sgaPerUnit)}원 · 개별 배송 시 ${won(unitCostTotal + shippingCost + sgaPerUnit)}원`}
        detail={
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Tile
                label="제조 공급가 (견적)"
                value={`${won(supply)}원`}
                sub={`원료비 + 제조 노무비 + 부자재 · 견적 ${won(QUOTE.supply)}원 + VAT`}
              />
              <Tile
                label="개당 원가"
                value={`${won(unitCostTotal)}원`}
                sub={`개별 배송 채널은 +${won(shippingCost)}원 = ${won(unitCostTotal + shippingCost)}원`}
              />
              <Tile
                label="개당 판관비"
                value={`${won(sgaPerUnit)}원`}
                sub={`${won(fixedTotal)}원 ÷ ${won(quantity)}개`}
              />
              <Tile
                label="개당 총원가"
                value={`${won(unitCostTotal + sgaPerUnit)}원`}
                sub={`개별 배송 시 ${won(unitCostTotal + shippingCost + sgaPerUnit)}원 · 채널 수수료 제외`}
              />
            </div>

            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 px-1 text-xs text-muted">개당 원가 + 판관비를 바탕으로 정가와 할인 하한선을 정해요</p>
              <div className="grid items-stretch gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <Card title="개당 원가" aside="VAT 포함" tone="cost">
                  <CostList items={unitCosts} onChange={(v) => set("unitCosts", v)} addLabel="원가 항목 추가" />
                  <div className="mt-3 border-t border-line pt-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 px-1 text-sm">3PL 물류비 (택배박스, 충전재)</span>
                      <NumberInput
                        label="3PL 물류비"
                        value={shippingCost}
                        onChange={(v) => set("shippingCost", v)}
                        suffix="원"
                        className="w-32 shrink-0"
                      />
                      <span className="w-5 shrink-0" />
                    </div>
                    <p className="pl-1 text-[11px] text-muted">
                      아래 채널 표에서 &lsquo;개별 배송&rsquo;에 체크한 채널에만 들어가요
                    </p>
                  </div>
                  <div className="mt-3 space-y-1 border-t border-line pt-3">
                    <Row label="원가 소계" value={`${won(unitCostTotal)}원`} />
                    <Row label="개별 배송 포함" value={`${won(unitCostTotal + shippingCost)}원`} strong />
                  </div>
                </Card>

                <Connector>+</Connector>

                <Card title="판관비" aside="VAT 포함 · 판매 수량 전체 기간 합계" tone="cost">
                  <CostList items={fixedCosts} onChange={(v) => set("fixedCosts", v)} addLabel="판관비 항목 추가" />
                  <div className="mt-3 space-y-1 border-t border-line pt-3">
                    <Row label="판관비 합계" value={`${won(fixedTotal)}원`} />
                    <div className="flex items-center justify-between gap-2 py-1 text-sm">
                      <span className="text-muted">판매 수량 (배분 기준)</span>
                      <NumberInput
                        label="판매 수량"
                        value={quantity}
                        onChange={(v) => set("quantity", Math.max(0, v))}
                        suffix="개"
                        className="w-32"
                      />
                    </div>
                    <Row label="개당 판관비" value={`${won(sgaPerUnit)}원`} strong />
                    {belowMoq && (
                      <p className="rounded bg-warn-soft px-2 py-1 text-[11px] text-warn">
                        용기 MOQ가 {QUOTE.containerMoq.toLocaleString("ko-KR")}개라 이보다 적게 팔면 남는 용기 비용이
                        생길 수 있어요
                      </p>
                    )}
                  </div>
                </Card>

                <Connector>→</Connector>

                <Card title="가격 설정" tone="price">
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm">정가 (VAT 포함)</p>
                      <NumberInput
                        label="정가"
                        value={price}
                        onChange={(v) => set("price", Math.max(0, v))}
                        suffix="원"
                        className="[&_input]:py-2 [&_input]:text-lg [&_input]:font-semibold"
                      />
                      <p className="mt-1 text-[11px] text-muted">
                        10mL당 {won((price / PRODUCT.volumeMl) * 10)}원 · 채널별 실판매가는 표에서 할인율로 정해요
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm">최저가 하한선</p>
                      <NumberInput
                        label="최저가 하한선 할인율"
                        value={floorDiscount}
                        onChange={(v) => set("floorDiscount", Math.min(100, Math.max(0, v)))}
                        suffix="%"
                      />
                      <p className="mt-1 text-[11px] text-muted">
                        정가 대비 최대 할인율 → {won(floorPrice)}원. 실판매가가 이보다 낮은 채널은 표에서 빨간색으로
                        표시해요
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm">목표 이익률</p>
                      <NumberInput
                        label="목표 이익률"
                        value={targetMargin}
                        onChange={(v) => set("targetMargin", Math.min(99, Math.max(0, v)))}
                        suffix="%"
                      />
                      <p className="mt-1 text-[11px] text-muted">
                        실판매가 대비. 채널 표의 &lsquo;목표가&rsquo; 계산에 써요
                      </p>
                    </div>
                    <div className="border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
                      <p className="mb-1.5 font-medium text-foreground">판매가 구성</p>
                      <ul className="flex flex-wrap gap-x-3 gap-y-1">
                        {SEGMENTS.map((s) => (
                          <li key={s.key} className="flex items-center gap-1">
                            <span className={`inline-block size-2.5 rounded-sm ${s.className}`} />
                            {s.label}
                          </li>
                        ))}
                        <li className="flex items-center gap-1">
                          <span className="inline-block size-2.5 rounded-sm bg-accent" />
                          이익
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("고친 값을 모두 지우고 기본값으로 되돌릴까요?")) setState(DEFAULT_STATE);
                      }}
                      className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
                    >
                      기본값으로 되돌리기
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        }
        exportSummary={exportSummary(state.exportSim, exportCalc)}
        exportPanel={
          <ExportPanel
            sim={state.exportSim}
            onChange={(fn) => setState((s) => ({ ...s, exportSim: fn(s.exportSim) }))}
            unitCostExVat={unitCostExVat}
            sgaExVat={sgaExVat}
            listPrice={price}
          />
        }
        channelSubtitle={`정가 ${won(price)}원에서 채널별 할인율 반영`}
        channelSummary={results
          .filter((r) => r.channel.main)
          .map((r) => `${r.channel.name} ${won(r.profit)}원`)
          .join(" · ")}
        channelTable={
          <>
            <p className="px-1 text-xs text-muted">수수료율은 예상치예요. 칸을 눌러 고치고, ★로 주력 채널을 정해요</p>
            <div className="overflow-x-auto pt-2">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-2 py-2 font-normal">채널</th>
                    <th className="w-24 px-2 py-2 text-right font-normal">할인율</th>
                    <th className="px-2 py-2 text-right font-normal">실판매가</th>
                    <th className="w-24 px-2 py-2 text-right font-normal">판매 수수료</th>
                    <th className="w-24 px-2 py-2 text-right font-normal">결제 수수료</th>
                    <th className="px-2 py-2 text-center font-normal">개별 배송</th>
                    <th className="px-2 py-2 text-right font-normal">수수료</th>
                    <th className="px-2 py-2 text-right font-normal">개당 이익</th>
                    <th className="px-2 py-2 text-right font-normal">이익률</th>
                    <th className="w-36 px-2 py-2 font-normal">판매가 구성</th>
                    <th className="px-2 py-2 text-right font-normal">손익분기가</th>
                    <th className="px-2 py-2 text-right font-normal">목표가 ({targetMargin}%)</th>
                    <th className="px-2 py-2 text-right font-normal">{won(quantity)}개 이익</th>
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "주력 채널", rows: results.filter((r) => r.channel.main) },
                    { label: "기타 채널", rows: results.filter((r) => !r.channel.main) },
                  ].map((group) => [
                    group.rows.length > 0 && (
                      <tr key={group.label} className="border-b border-line bg-subtle/60">
                        <td colSpan={14} className="px-3 py-1.5 text-xs font-medium text-muted">
                          {group.label} <span className="font-normal">· {group.rows.length}곳</span>
                        </td>
                      </tr>
                    ),
                    ...group.rows.map((r) => {
                      const c = r.channel;
                      const loss = r.profit < 0;
                      const underTarget = r.target !== null && r.sale < r.target;
                      const belowFloor = r.sale < floorPrice;
                      return (
                        <tr key={c.id} className="group border-b border-line last:border-0">
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-pressed={!!c.main}
                                aria-label={c.main ? `${c.name} 주력 채널에서 빼기` : `${c.name} 주력 채널로 올리기`}
                                title={c.main ? "주력 채널에서 빼기" : "주력 채널로 올리기"}
                                onClick={() => updateChannel(c.id, { main: !c.main })}
                                className={`shrink-0 text-base leading-none ${c.main ? "text-best" : "text-line hover:text-best"}`}
                              >
                                ★
                              </button>
                              <input
                                value={c.name}
                                aria-label="채널 이름"
                                onChange={(e) => updateChannel(c.id, { name: e.target.value })}
                                className={`w-full min-w-28 rounded px-1 py-1 outline-none hover:bg-subtle focus:bg-subtle ${c.main ? "font-medium" : ""}`}
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <NumberInput
                              label={`${c.name} 할인율`}
                              value={c.discount}
                              onChange={(v) => updateChannel(c.id, { discount: Math.min(100, Math.max(0, v)) })}
                              suffix="%"
                            />
                          </td>
                          <td
                            className={`px-2 py-1.5 text-right tabular-nums ${belowFloor ? "font-medium text-sale" : "font-medium"}`}
                            title={belowFloor ? `최저가 하한선 ${won(floorPrice)}원보다 낮아요` : undefined}
                          >
                            {won(r.sale)}
                            {belowFloor && <span className="block text-[10px] font-normal">하한선 아래</span>}
                          </td>
                          <td className="px-2 py-1.5">
                            <NumberInput
                              label={`${c.name} 판매 수수료`}
                              value={c.fee}
                              onChange={(v) => updateChannel(c.id, { fee: Math.max(0, v) })}
                              suffix="%"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <NumberInput
                              label={`${c.name} 결제 수수료`}
                              value={c.card}
                              onChange={(v) => updateChannel(c.id, { card: Math.max(0, v) })}
                              suffix="%"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              aria-label={`${c.name} 개별 배송`}
                              checked={c.shipping}
                              onChange={(e) => updateChannel(c.id, { shipping: e.target.checked })}
                              className="size-4 accent-[var(--accent)]"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-muted">{won(r.fee)}</td>
                          <td
                            className={`px-2 py-1.5 text-right font-semibold tabular-nums ${loss ? "text-sale" : "text-accent"}`}
                          >
                            {won(r.profit)}
                          </td>
                          <td className={`px-2 py-1.5 text-right tabular-nums ${loss ? "text-sale" : ""}`}>
                            {pct(r.margin)}
                          </td>
                          <td className="px-2 py-1.5">
                            <PriceBar r={r} />
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {r.breakEven === null ? <span className="text-sale">불가</span> : won(r.breakEven)}
                          </td>
                          <td
                            className={`px-2 py-1.5 text-right tabular-nums ${underTarget ? "font-medium text-warn" : ""}`}
                          >
                            {r.target === null ? <span className="text-sale">불가</span> : won(r.target)}
                          </td>
                          <td className={`px-2 py-1.5 text-right tabular-nums ${loss ? "text-sale" : "text-muted"}`}>
                            {won(r.profit * quantity)}
                          </td>
                          <td className="px-1 py-1.5">
                            <button
                              type="button"
                              aria-label={`${c.name} 삭제`}
                              onClick={() =>
                                set(
                                  "channels",
                                  channels.filter((x) => x.id !== c.id),
                                )
                              }
                              className="text-muted opacity-40 hover:text-sale hover:opacity-100 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    }),
                  ])}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs text-muted">
              <button
                type="button"
                onClick={() =>
                  set("channels", [
                    ...channels,
                    {
                      id: newId(),
                      name: "새 채널",
                      discount: 0,
                      fee: 0,
                      card: 0,
                      shipping: true,
                    },
                  ])
                }
                className="hover:text-foreground"
              >
                + 채널 추가
              </button>
              <span>
                목표가가 <span className="font-medium text-warn">주황색</span>이면 지금 실판매가로는 목표 이익률에 못
                미쳐요
              </span>
            </div>
          </>
        }
      />
    </div>
  );
}
