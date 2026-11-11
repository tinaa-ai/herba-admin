import type { Metadata } from "next";
import Image from "next/image";
import {
  competitors,
  EXCLUDED_FROM_LOWEST,
  SURVEY_DATE,
  type ChannelPrice,
  type CompetitorProduct,
  type PriceTag,
} from "@/data/competitor-prices";

export const metadata: Metadata = {
  title: "경쟁사 제품 비교",
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

const listPer10 = (p: CompetitorProduct) =>
  p.volumeMl ? `${won((p.listPrice / p.volumeMl) * 10)}원` : "—";

type Row = ChannelPrice & {
  unitPrice: number;
  discount: number;
  discountPct: number;
  per10: number | null;
  isKrw: boolean;
  excluded: boolean;
};

function buildRows(product: CompetitorProduct): Row[] {
  const rows = product.prices.map((p) => {
    const isKrw = (p.currency ?? "KRW") === "KRW";
    const unitPrice = p.price / (p.units ?? 1);
    const discount = product.listPrice - unitPrice;
    return {
      ...p,
      unitPrice,
      discount,
      discountPct: (discount / product.listPrice) * 100,
      per10: product.volumeMl ? (unitPrice / product.volumeMl) * 10 : null,
      isKrw,
      excluded: (p.tags ?? []).some((t) => EXCLUDED_FROM_LOWEST.includes(t)),
    };
  });
  // 정가에 가까운(비싼) 가격부터 할인 폭이 큰 순서로. 외화는 맨 아래.
  return rows.sort((a, b) => {
    if (a.isKrw !== b.isKrw) return a.isKrw ? -1 : 1;
    return b.unitPrice - a.unitPrice;
  });
}

function lowestOf(rows: Row[]) {
  return rows
    .filter((r) => r.isKrw && !r.excluded)
    .reduce<Row | undefined>((min, r) => (!min || r.unitPrice < min.unitPrice ? r : min), undefined);
}

const WARN_TAGS: PriceTag[] = ["비교 제외", "과거 가격", "품절", "동일성 잠정"];

function Tag({ tag }: { tag: PriceTag }) {
  const warn = WARN_TAGS.includes(tag);
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap ${
        warn ? "bg-warn-soft text-warn" : "bg-subtle text-muted"
      }`}
    >
      {tag}
    </span>
  );
}

function ProductPhoto({ product, size }: { product: CompetitorProduct; size: number }) {
  if (!product.image) return null;
  return (
    <Image
      src={product.image}
      alt={`${product.brandKo} ${product.name}`}
      width={size}
      height={size}
      className="shrink-0 rounded-lg border border-line bg-white object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function DiscountBar({ pct }: { pct: number }) {
  const width = Math.max(0, Math.min(pct, 100));
  return (
    <span className="ml-2 hidden h-1.5 w-16 overflow-hidden rounded-full bg-subtle sm:inline-block">
      <span className="block h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
    </span>
  );
}

export default function CompetitorsPage() {
  const products = competitors.map((product) => {
    const rows = buildRows(product);
    return { product, rows, lowest: lowestOf(rows) };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">경쟁사 제품 비교</h1>
        <p className="mt-1 text-sm text-muted">
          바디 컨디셔닝 크림 경쟁 제품 {competitors.length}종 · {SURVEY_DATE} 조사 · 할인율은 모두 각 제품 정가 대비
        </p>
      </div>

      {/* 요약 */}
      <section className="mb-10 overflow-x-auto rounded-xl border border-hero-line bg-hero">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-hero-line text-left text-xs text-muted">
              <th className="whitespace-nowrap px-4 py-2.5 font-medium">제품</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">용량</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">정가</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">10mL당 정가</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">최저 확인가</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">최대 할인율</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">채널 가격 수</th>
            </tr>
          </thead>
          <tbody>
            {products.map(({ product, rows, lowest }) => (
              <tr key={product.id} className="border-b border-hero-line last:border-0">
                <td className="px-4 py-3">
                  <a href={`#${product.id}`} className="group flex items-center gap-3">
                    <ProductPhoto product={product} size={40} />
                    <span className="group-hover:underline">
                      <span className="font-medium">{product.brandKo}</span>{" "}
                      <span className="text-muted">{product.name}</span>
                    </span>
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {product.volumeMl ? `${product.volumeMl}mL` : "미확인"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{won(product.listPrice)}원</td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                  {listPer10(product)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {lowest ? (
                    <>
                      {won(lowest.unitPrice)}원
                      <span className="block text-xs text-muted">{lowest.channel}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-sale">
                  {lowest ? `${lowest.discountPct.toFixed(1)}%` : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">{rows.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-hero-line px-4 py-2.5 text-xs text-muted">
          최저 확인가는 국내 일반 판매가 기준입니다. 면세점, 과거 가격, 품절, 비교 제외 표시 가격은 빼고 계산했어요.
        </p>
      </section>

      {/* 제품별 상세 */}
      <div className="space-y-10">
        {products.map(({ product, rows, lowest }) => (
          <section key={product.id} id={product.id} className="scroll-mt-16">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="flex items-center gap-4">
                <ProductPhoto product={product} size={72} />
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted">
                    {product.brand} · {product.brandKo}
                  </p>
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted">
                    {product.form} · {product.volumeMl ? `${product.volumeMl}mL` : "용량 미확인"}
                  </p>
                </div>
              </div>
              {product.productNote && (
                <p className="max-w-md text-xs text-muted sm:text-right">{product.productNote}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-line bg-surface">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="whitespace-nowrap px-4 py-2.5 font-medium">채널</th>
                    <th className="whitespace-nowrap px-4 py-2.5 font-medium">가격 구분</th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">판매가 (개당)</th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">할인금액</th>
                    <th className="whitespace-nowrap px-4 py-2.5 font-medium">할인율 (정가 대비)</th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-right font-medium">10mL당</th>
                    <th className="whitespace-nowrap px-4 py-2.5 font-medium">시점 · 메모</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 정가 */}
                  <tr className="border-b border-line bg-subtle/60">
                    <td className="px-4 py-3 font-semibold">정가</td>
                    <td className="px-4 py-3 text-muted">{product.listPriceNote}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                      {won(product.listPrice)}원
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-muted">—</td>
                    <td className="px-4 py-3 text-muted">기준</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                      {listPer10(product)}
                    </td>
                    <td className="px-4 py-3" />
                  </tr>

                  {rows.map((r, i) => {
                    const isLowest = r === lowest;
                    const above = r.isKrw && r.discount < 0;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-line last:border-0 ${
                          r.excluded ? "text-muted" : ""
                        } ${isLowest ? "bg-accent-soft/60" : ""}`}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1.5">
                            {r.url ? (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium hover:underline"
                              >
                                {r.channel}
                              </a>
                            ) : (
                              <span className="font-medium">{r.channel}</span>
                            )}
                            {isLowest && (
                              <span className="whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[11px] leading-none text-surface">
                                최저
                              </span>
                            )}
                          </div>
                          {r.seller && <div className="text-xs text-muted">{r.seller}</div>}
                        </td>
                        <td className="px-4 py-3 align-top">{r.priceType}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums">
                          {r.isKrw ? (
                            <>
                              <span className="font-medium">{won(r.unitPrice)}원</span>
                              {r.units && r.units > 1 && (
                                <span className="block text-xs text-muted">
                                  {r.units}개 {won(r.price)}원
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-medium">USD {r.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right align-top tabular-nums ${
                            above ? "text-warn" : ""
                          }`}
                        >
                          {!r.isKrw
                            ? "—"
                            : r.discount === 0
                              ? "0원"
                              : above
                                ? `+${won(-r.discount)}원`
                                : `−${won(r.discount)}원`}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums whitespace-nowrap">
                          {!r.isKrw ? (
                            <span className="text-muted">환율 미적용</span>
                          ) : above ? (
                            <span className="text-warn">
                              정가보다 {Math.abs(r.discountPct).toFixed(1)}% 비쌈
                            </span>
                          ) : (
                            <span className="inline-flex items-center">
                              <span
                                className={`w-12 font-medium ${
                                  r.excluded ? "" : "text-accent"
                                }`}
                              >
                                {r.discountPct.toFixed(1)}%
                              </span>
                              <DiscountBar pct={r.discountPct} />
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums text-muted">
                          {r.isKrw && r.per10 !== null ? `${won(r.per10)}원` : "—"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-xs text-muted">{r.seenAt}</div>
                          {r.note && <div className="text-xs">{r.note}</div>}
                          {r.tags && r.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {r.tags.map((t) => (
                                <Tag key={t} tag={t} />
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 py-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-foreground">가격 읽는 법</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>할인금액과 할인율은 개당 판매가를 각 제품의 정가와 비교한 값이에요. 묶음 상품은 개당 가격으로 나눴어요.</li>
          <li>가격은 조사 당일부터 수개월 전 저장자료까지 섞여 있어요. 실제 결제 가격이나 재고를 확정하지 않아요.</li>
          <li>아로마티카와 파워풀엑스는 별도 정가 표기가 없어 공식몰 기본 판매가를 정가로 썼어요.</li>
          <li>표에 없는 채널은 가격을 확인하지 못한 곳이에요. 가격이 0원이라는 뜻이 아니에요.</li>
        </ul>
      </section>
    </div>
  );
}
