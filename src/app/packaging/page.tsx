import type { Metadata } from "next";
import { categories, packagingTerms, PRICE_BASIS, type PackagingTerm } from "@/data/packaging-terms";
import { TermIllustration } from "./illustrations";

export const metadata: Metadata = {
  title: "부자재 용어",
};

function TermCard({ term }: { term: PackagingTerm }) {
  return (
    <article id={term.id} className="scroll-mt-20 rounded-xl border border-line bg-surface p-4">
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
          <p className="mt-2 text-sm font-medium leading-snug">{term.meaning}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{term.description}</p>

      {term.options && (
        <dl className="mt-3 divide-y divide-line rounded-lg border border-line">
          {term.options.map((o) => (
            <div key={o.name} className="px-3 py-2 text-sm">
              <dt className="flex items-baseline justify-between gap-2 font-medium">
                {o.name}
                {o.price && <span className="shrink-0 text-xs font-normal tabular-nums text-muted">{o.price}</span>}
              </dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-muted">{o.meaning}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm">
        <span className="mr-2 text-xs font-medium text-accent">통상 금액대</span>
        <span className="tabular-nums">{term.price}</span>
        {term.extraCost && <p className="mt-0.5 text-xs text-muted">별도 비용: {term.extraCost}</p>}
      </div>

      {term.needsCheck && <p className="mt-2 text-xs text-warn">⚠ {term.needsCheck}</p>}
    </article>
  );
}

export default function PackagingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">부자재 용어</h1>
        <p className="mt-1 text-sm text-muted">
          용기·단상자·아웃박스·라벨 등 화장품 부자재 용어 {packagingTerms.length}개 · 뜻과 업계 통상 금액대
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
          <li>금형비·목형비·디자인비처럼 처음 한 번 드는 비용은 &lsquo;별도 비용&rsquo;으로 따로 적었어요.</li>
          <li>그림은 실제 제품 사진이 아니라 모양을 알아보기 위한 도식이에요.</li>
        </ul>
      </section>
    </div>
  );
}
