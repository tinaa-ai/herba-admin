import type { Metadata } from "next";
import { CALENDAR_YEAR, SURVEY_DATE, tradeShows } from "@/data/trade-shows";
import { TradeShowCalendar } from "./TradeShowCalendar";

export const metadata: Metadata = {
  title: "박람회 일정",
};

export default function TradeShowsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{CALENDAR_YEAR}년 박람회 일정</h1>
        <p className="mt-1 text-sm text-muted">
          레우비스 바디 컨디셔닝 크림 기준 국내·해외 뷰티 박람회 {tradeShows.length}곳 · {SURVEY_DATE} 기준 ·
          화장품 / 바디케어 / 웰니스로 분류
        </p>
      </div>

      <TradeShowCalendar shows={tradeShows} />

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 py-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-foreground">확인 방법</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            <b className="font-medium text-foreground">글로벌형</b>은 여러 대륙의 브랜드·바이어가 오는 국제 거래 전시,{" "}
            <b className="font-medium text-foreground">지역 국제형</b>은 특정 국가·권역 시장 개척 중심,{" "}
            <b className="font-medium text-foreground">현지 전문형</b>은 그 나라의 약국·미용·리테일 채널 특화 전시예요. 주최사 공식
            구분이 아니라 사업 목적에 따른 분류예요.
          </li>
          <li>참가 방식과 순위는 전국 독점총판·수입유통사 발굴 목적에 맞춘 판단이에요. 주최사 평가가 아니에요.</li>
          <li>
            박람회 이름 앞 <b className="font-medium text-foreground">🌐 글로벌</b>은 글로벌형,{" "}
            <b className="font-medium text-foreground">권역 국제</b>는 지역 국제형,{" "}
            <b className="font-medium text-foreground">로컬</b>은 현지 전문형·현지 중심 국제전이에요.
          </li>
          <li>
            일정은 {SURVEY_DATE}에 각 주최사 공식 사이트에서 다시 확인했어요. ⚠ 표시는 공식 확인이 안 됐거나 출처끼리
            날짜가 다른 행사예요. 펼치면 이유가 나와요.
          </li>
        </ul>
      </section>
    </div>
  );
}
