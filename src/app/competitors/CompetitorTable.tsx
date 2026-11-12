"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import type { CompetitorProduct, PriceTag } from "@/data/competitor-prices";
import { listPer10, won, type PriceRow, type ProductSummary } from "@/lib/competitors";

const WARN_TAGS: PriceTag[] = ["비교 제외", "과거 가격", "품절", "동일성 잠정"];

function Tag({ tag }: { tag: PriceTag }) {
  const warn = WARN_TAGS.includes(tag);
  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] leading-none ${
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
      <span className="block h-full rounded-full bg-sale" style={{ width: `${width}%` }} />
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TH = "whitespace-nowrap px-4 py-2.5 font-medium";
const NUM = "whitespace-nowrap px-4 py-3 text-right tabular-nums";

function PriceDetail({ product, rows, lowestIndex }: ProductSummary) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-xs text-muted">
        <span>
          {product.form} · {product.volumeMl ? `${product.volumeMl}mL` : "용량 미확인"}
        </span>
        {product.productNote && <span className="max-w-xl sm:text-right">{product.productNote}</span>}
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className={TH}>채널</th>
              <th className={TH}>가격 구분</th>
              <th className={`${TH} text-right`}>판매가 (개당)</th>
              <th className={`${TH} text-right`}>할인금액</th>
              <th className={TH}>할인율 (정가 대비)</th>
              <th className={`${TH} text-right`}>10mL당</th>
              <th className={TH}>시점 · 메모</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line bg-subtle/60">
              <td className="px-4 py-3 font-semibold">정가</td>
              <td className="px-4 py-3 text-muted">{product.listPriceNote}</td>
              <td className={`${NUM} font-semibold`}>{won(product.listPrice)}원</td>
              <td className={`${NUM} text-muted`}>—</td>
              <td className="px-4 py-3 text-muted">기준</td>
              <td className={`${NUM} text-muted`}>{listPer10(product)}</td>
              <td className="px-4 py-3" />
            </tr>
            {rows.map((r, i) => (
              <PriceLine key={i} r={r} isLowest={i === lowestIndex} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriceLine({ r, isLowest }: { r: PriceRow; isLowest: boolean }) {
  const above = r.isKrw && r.discount < 0;
  return (
    <tr
      className={`border-b border-line last:border-0 ${r.excluded ? "text-muted" : ""} ${
        isLowest ? "bg-hero" : ""
      }`}
    >
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1.5">
          {r.url ? (
            <a href={r.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
              {r.channel}
            </a>
          ) : (
            <span className="font-medium">{r.channel}</span>
          )}
          {isLowest && (
            <span className="whitespace-nowrap rounded bg-sale px-1.5 py-0.5 text-[11px] leading-none text-surface">
              최저
            </span>
          )}
        </div>
        {r.seller && <div className="text-xs text-muted">{r.seller}</div>}
      </td>
      <td className="px-4 py-3 align-top">{r.priceType}</td>
      <td className={`${NUM} align-top`}>
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
      <td className={`${NUM} align-top ${above ? "text-warn" : ""}`}>
        {!r.isKrw
          ? "—"
          : r.discount === 0
            ? "0원"
            : above
              ? `+${won(-r.discount)}원`
              : `−${won(r.discount)}원`}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top tabular-nums">
        {!r.isKrw ? (
          <span className="text-muted">환율 미적용</span>
        ) : above ? (
          <span className="text-warn">정가보다 {Math.abs(r.discountPct).toFixed(1)}% 비쌈</span>
        ) : (
          <span className="inline-flex items-center">
            <span className={`w-12 font-medium ${r.excluded ? "" : "text-sale"}`}>
              {r.discountPct.toFixed(1)}%
            </span>
            <DiscountBar pct={r.discountPct} />
          </span>
        )}
      </td>
      <td className={`${NUM} align-top text-muted`}>
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
}

export function CompetitorTable({ items }: { items: ProductSummary[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const allOpen = open.size === items.length;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="rounded-xl border border-hero-line bg-hero">
      <div className="flex items-center justify-between gap-4 border-b border-hero-line px-4 py-2.5">
        <p className="text-xs text-muted">제품을 누르면 채널별 할인 내역이 펼쳐져요.</p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(items.map((i) => i.product.id)))}
          className="whitespace-nowrap text-xs font-medium text-muted hover:text-foreground"
        >
          {allOpen ? "모두 접기" : "모두 펼치기"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-hero-line text-left text-xs text-muted">
              <th className={TH}>제품</th>
              <th className={`${TH} text-right`}>용량</th>
              <th className={`${TH} text-right`}>정가</th>
              <th className={`${TH} text-right`}>10mL당 정가</th>
              <th className={`${TH} text-right`}>최저 확인가</th>
              <th className={`${TH} text-right`}>최대 할인율</th>
              <th className={`${TH} text-right`}>채널 가격 수</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const { product, rows, lowestIndex } = item;
              const lowest = lowestIndex >= 0 ? rows[lowestIndex] : undefined;
              const isOpen = open.has(product.id);
              const panelId = `detail-${product.id}`;
              return (
                <Fragment key={product.id}>
                  <tr
                    onClick={() => toggle(product.id)}
                    className={`cursor-pointer border-b border-hero-line transition-colors hover:bg-surface/60 ${
                      isOpen ? "bg-surface/60" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(product.id);
                        }}
                        className="flex items-center gap-3 text-left"
                      >
                        <Chevron open={isOpen} />
                        <ProductPhoto product={product} size={40} />
                        <span>
                          <span className="font-medium">{product.brandKo}</span>{" "}
                          <span className="text-muted">{product.name}</span>
                        </span>
                      </button>
                    </td>
                    <td className={NUM}>{product.volumeMl ? `${product.volumeMl}mL` : "미확인"}</td>
                    <td className={NUM}>{won(product.listPrice)}원</td>
                    <td className={`${NUM} text-muted`}>{listPer10(product)}</td>
                    <td className={NUM}>
                      {lowest ? (
                        <>
                          {won(lowest.unitPrice)}원
                          <span className="block text-xs text-muted">{lowest.channel}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${NUM} font-medium text-sale`}>
                      {lowest ? `${lowest.discountPct.toFixed(1)}%` : "—"}
                    </td>
                    <td className={`${NUM} text-muted`}>{rows.length}</td>
                  </tr>
                  {isOpen && (
                    <tr id={panelId} className="border-b border-hero-line">
                      <td colSpan={7} className="bg-surface/40 px-4 pb-5 pt-3">
                        <PriceDetail {...item} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="px-4 py-2.5 text-xs text-muted">
        최저 확인가는 국내 일반 판매가 기준입니다. 면세점, 과거 가격, 품절, 비교 제외 표시 가격은 빼고 계산했어요.
      </p>
    </section>
  );
}

