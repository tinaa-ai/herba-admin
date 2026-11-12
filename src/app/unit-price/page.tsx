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
    </div>
  );
}
