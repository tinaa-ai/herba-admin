import type { Metadata } from "next";
import { PRODUCT, QUOTE } from "@/data/unit-price";
import { UnitPriceSimulator } from "./UnitPriceSimulator";

export const metadata: Metadata = {
  title: "제품단가금액",
};

export default function UnitPricePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">제품 단가 산정</h1>
        <p className="mt-1 text-sm text-muted">
          {PRODUCT.name} · {PRODUCT.volumeMl}mL · 제조 견적 {QUOTE.date} 기준 (MOQ {QUOTE.moq.toLocaleString("ko-KR")}
          개) · 모든 금액 VAT 포함
        </p>
      </div>

      <UnitPriceSimulator />

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 py-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-foreground">계산 방법</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            모든 금액은 VAT 포함이에요. 제조 견적(VAT 별도)과 판관비 표의 금액에 10%를 더해 넣었고, 부가세가 붙지 않는
            인건비만 그대로 뒀어요.
          </li>
          <li>
            실판매가 = 정가 × (1 − 할인율). 채널 수수료 = 실판매가 × (판매 수수료 % + 결제 수수료 %). 실판매가가 최저가
            하한선보다 낮으면 빨간색으로 표시해요.
          </li>
          <li>
            개당 이익 = 실판매가 − 채널 수수료 − 개당 원가 − 개당 판관비. 이익률은 실판매가 대비예요. 3PL 물류비는
            &lsquo;개별 배송&rsquo;에 체크한 채널에만 들어가요.
          </li>
          <li>
            부가세 신고 때 낼 금액(매출 부가세 − 매입 부가세)은 따로 빼지 않았어요. 실제로 남는 이익은 표의 이익보다
            대략 1/11 적어요.
          </li>
          <li>개당 판관비 = 판관비 합계 ÷ 판매 수량. 수량을 바꾸면 모든 채널의 이익이 함께 바뀌어요.</li>
          <li>
            손익분기가는 이익이 0이 되는 실판매가, 목표가는 목표 이익률을 맞추는 실판매가예요. 둘 다 100원 단위로
            올려요. 수수료가 너무 높아 어떤 가격으로도 맞출 수 없으면 &lsquo;불가&rsquo;로 표시해요.
          </li>
          <li>고친 값은 이 브라우저에만 저장돼요. 다른 기기나 다른 사람 화면에는 기본값이 보여요.</li>
        </ul>
      </section>
    </div>
  );
}
