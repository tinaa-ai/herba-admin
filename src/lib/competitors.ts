import {
  EXCLUDED_FROM_LOWEST,
  type ChannelPrice,
  type CompetitorProduct,
} from "@/data/competitor-prices";

export const won = (n: number) => Math.round(n).toLocaleString("ko-KR");

export const listPer10 = (p: CompetitorProduct) =>
  p.volumeMl ? `${won((p.listPrice / p.volumeMl) * 10)}원` : "—";

export type PriceRow = ChannelPrice & {
  unitPrice: number;
  discount: number;
  discountPct: number;
  per10: number | null;
  isKrw: boolean;
  excluded: boolean;
};

export type ProductSummary = {
  product: CompetitorProduct;
  rows: PriceRow[];
  /** rows 안에서 최저 확인가 위치. 없으면 -1 */
  lowestIndex: number;
};

function buildRows(product: CompetitorProduct): PriceRow[] {
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

function lowestIndexOf(rows: PriceRow[]) {
  let best = -1;
  rows.forEach((r, i) => {
    if (r.isKrw && !r.excluded && (best < 0 || r.unitPrice < rows[best].unitPrice)) best = i;
  });
  return best;
}

export function summarize(product: CompetitorProduct): ProductSummary {
  const rows = buildRows(product);
  return { product, rows, lowestIndex: lowestIndexOf(rows) };
}
