import type { Metadata } from "next";
import {
  categories,
  packagingTerms,
  PRICE_BASIS,
  type Layer,
  type PackagingTerm,
  type QuoteCase,
} from "@/data/packaging-terms";
import { TermIllustration } from "./illustrations";

export const metadata: Metadata = {
  title: "부자재 용어",
};

const layerColor: Record<Layer["kind"], string> = {
  pe: "bg-subtle",
  glue: "bg-best-soft",
  nylon: "bg-cat-wellness-soft",
  foil: "bg-line",
};

function Layers({ layers }: { layers: NonNullable<PackagingTerm["layers"]> }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium">{layers.title}</p>
      <ol className="overflow-hidden rounded-lg border border-line text-xs">
        {layers.rows.map((r, i) => (
          <li
            key={i}
            className={`flex items-baseline gap-2 px-2.5 py-1.5 ${layerColor[r.kind]}`}
          >
            <span className="w-3 shrink-0 tabular-nums text-muted">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-medium">{r.material}</span>
              <span className="text-muted"> · {r.role}</span>
            </span>
            <span className="shrink-0 tabular-nums">{r.thickness}</span>
          </li>
        ))}
        <li className="flex justify-between bg-surface px-2.5 py-1.5 font-medium">
          <span>합계</span>
          <span className="tabular-nums">{layers.total}</span>
        </li>
      </ol>
    </div>
  );
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function Quote({ quote }: { quote: QuoteCase }) {
  const total = quote.lines.reduce((sum, l) => sum + l.price, 0);
  return (
    <div className="rounded-lg border border-export-line bg-export-soft p-3">
      <p className="text-sm font-semibold text-export">{quote.title}</p>
      <div className="mt-2 flex gap-3">
        {quote.photo && (
          // 견적 사진은 로그인 뒤에만 보이도록 next/image 최적화기를 거치지 않아요
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={quote.photo.src}
            width={quote.photo.width}
            height={quote.photo.height}
            alt={`${quote.title} 사진`}
            className="h-28 w-auto shrink-0 rounded bg-surface object-contain"
          />
        )}
        <div className="min-w-0 flex-1 text-xs">
          <ul className="space-y-0.5">
            {quote.spec.map((sp) => (
              <li key={sp}>{sp}</li>
            ))}
          </ul>
          <table className="mt-2 w-full max-w-xs">
            <tbody>
              {quote.lines.map((l) => (
                <tr key={l.label}>
                  <td className="py-0.5 text-muted">
                    {l.group} · {l.label}
                  </td>
                  <td className="py-0.5 text-right tabular-nums">
                    {won(l.price)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-export-line font-semibold">
                <td className="pt-1">합계</td>
                <td className="pt-1 text-right tabular-nums text-export">
                  {won(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted">{quote.notes.join(" · ")}</p>
      <dl className="mt-3 space-y-2 border-t border-export-line pt-2 text-xs">
        {quote.qa.map((x) => (
          <div key={x.q}>
            <dt className="text-muted">Q. {x.q}</dt>
            <dd className="mt-0.5">A. {x.a}</dd>
          </div>
        ))}
      </dl>
      {quote.needsCheck && (
        <p className="mt-2 text-xs text-warn">⚠ {quote.needsCheck}</p>
      )}
    </div>
  );
}

function TermCard({ term }: { term: PackagingTerm }) {
  return (
    <article
      id={term.id}
      className={`scroll-mt-20 rounded-xl border border-line bg-surface p-4 ${term.quote ? "md:col-span-2" : ""}`}
    >
      <div className="flex gap-4">
        <div className="size-24 shrink-0 rounded-lg bg-subtle p-1 sm:size-28">
          <TermIllustration id={term.id} label={term.name} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">
            {term.name}
            {term.needsCheck && (
              <span className="ml-2 rounded bg-warn-soft px-1.5 py-0.5 align-middle text-[11px] font-medium text-warn">
                확인 필요
              </span>
            )}
          </h3>
          {term.aka && <p className="mt-0.5 text-xs text-muted">{term.aka}</p>}
          <p className="mt-2 text-sm font-medium leading-snug">
            {term.meaning}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {term.description}
      </p>

      <div
        className={
          term.layers || term.photos ? "md:grid md:grid-cols-2 md:gap-4" : ""
        }
      >
        {term.options && (
          <dl className="mt-3 divide-y divide-line rounded-lg border border-line">
            {term.options.map((o) => (
              <div key={o.name} className="px-3 py-2 text-sm">
                <dt className="flex items-baseline justify-between gap-2 font-medium">
                  {o.name}
                  {o.price && (
                    <span className="shrink-0 text-xs font-normal tabular-nums text-muted">
                      {o.price}
                    </span>
                  )}
                </dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                  {o.meaning}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {(term.layers || term.photos) && (
          <div className="mt-3 space-y-3">
            {term.layers && <Layers layers={term.layers} />}
            {term.photos?.map((ph) => (
              <figure key={ph.src}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 로그인 뒤에서만 보이게 원본 그대로 써요 */}
                <img
                  src={ph.src}
                  width={ph.width}
                  height={ph.height}
                  alt={ph.caption}
                  className="h-auto w-full rounded-lg"
                />
                <figcaption className="mt-1 text-xs text-muted">
                  {ph.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {term.quote && (
        <div className="mt-3">
          <Quote quote={term.quote} />
        </div>
      )}

      <div className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm">
        <span className="mr-2 text-xs font-medium text-accent">
          통상 금액대
        </span>
        <span className="tabular-nums">{term.price}</span>
        {term.extraCost && (
          <p className="mt-0.5 text-xs text-muted">
            별도 비용: {term.extraCost}
          </p>
        )}
      </div>

      {term.needsCheck && (
        <p className="mt-2 text-xs text-warn">⚠ {term.needsCheck}</p>
      )}
    </article>
  );
}

export default function PackagingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">부자재 용어</h1>
        <p className="mt-1 text-sm text-muted">
          용기·단상자·아웃박스·라벨 등 화장품 부자재 용어{" "}
          {packagingTerms.length}개 · 뜻과 업계 통상 금액대
        </p>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a
            key={c}
            href={`#cat-${c}`}
            className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted hover:text-foreground"
          >
            {c}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        {categories.map((c) => (
          <section key={c} id={`cat-${c}`} className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold">{c}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {packagingTerms
                .filter((t) => t.category === c)
                .map((t) => (
                  <TermCard key={t.id} term={t} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 py-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-foreground">금액 읽는 법</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>{PRICE_BASIS}</li>
          <li>
            금형비·목형비·디자인비처럼 처음 한 번 드는 비용은 &lsquo;별도
            비용&rsquo;으로 따로 적었어요.
          </li>
          <li>
            그림은 실제 제품 사진이 아니라 모양을 알아보기 위한 도식이에요.
          </li>
        </ul>
      </section>
    </div>
  );
}
