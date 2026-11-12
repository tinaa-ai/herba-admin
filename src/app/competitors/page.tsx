import type { Metadata } from "next";
import { competitors, SURVEY_DATE } from "@/data/competitor-prices";
import { summarize } from "@/lib/competitors";
import { CompetitorTable } from "./CompetitorTable";

export const metadata: Metadata = {
  title: "경쟁사 제품 비교",
};

export default function CompetitorsPage() {
  const items = competitors.map(summarize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">경쟁사 제품 비교</h1>
        <p className="mt-1 text-sm text-muted">
          바디 컨디셔닝 크림 경쟁 제품 {competitors.length}종 · {SURVEY_DATE} 조사 · 할인율은 모두 각 제품 정가 대비
        </p>
      </div>

      <CompetitorTable items={items} />

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 py-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-foreground">가격 읽는 법</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>할인금액과 할인율은 개당 판매가를 각 제품의 정가와 비교한 값이에요. 묶음 상품은 개당 가격으로 나눴어요.</li>
          <li>가격은 조사 당일부터 수개월 전 저장자료까지 섞여 있어요. 실제 결제 가격이나 재고를 확정하지 않아요.</li>
          <li>정가 표기가 없는 제품은 공식몰이나 스토어 판매가를 정가로 썼어요.</li>
          <li>표에 없는 채널은 가격을 확인하지 못한 곳이에요. 가격이 0원이라는 뜻이 아니에요.</li>
        </ul>
      </section>
    </div>
  );
}
