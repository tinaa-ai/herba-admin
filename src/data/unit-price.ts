// 제품단가금액 탭의 기본값 (2026-11-12 사용자가 화면에서 맞춘 값으로 고정). 화면에서 고친 값은 브라우저에만 저장되고, 여기 값은 "기본값으로" 버튼이 되돌리는 기준이에요.
// 금액은 모두 VAT 포함(원)이에요. 견적서(QUOTE)만 원본 그대로 VAT 별도예요. 인건비는 부가세가 없는 비용이라 그대로 둬요.

export const PRODUCT = {
  name: "REUVIS CORE Daily Body Conditioning Cream",
  volumeMl: 70,
  packaging: "튜브 + 단상자 + 봉합라벨 + 아웃박스",
};

/** 제조사 견적서 원본 (2026-10-14 기준, MOQ 5,000개, VAT 별도) */
export const QUOTE = {
  date: "2026-10-14",
  moq: 5000,
  containerMoq: 10000,
  raw: 931,
  material: 950,
  labor: 950,
  supply: 2840,
};

export type CostItem = { id: string; label: string; amount: number; note?: string };

export type Channel = {
  id: string;
  name: string;
  /** 판매 수수료(유통 마진) % — 실판매가 기준 */
  fee: number;
  /** 결제(카드) 수수료 % — 채널 수수료에 포함돼 있으면 0 */
  card: number;
  /** 판매가에서 추가로 깎는 할인율 % — 실판매가 = 판매가 × (1 − 할인율) */
  discount: number;
  /** 주력 채널: 표 맨 위에 따로 묶어 보여줌 */
  main?: boolean;
};

/** 약국 유통사(매입 유통) 수량 구간. rate는 공급률: 정가의 몇 %를 받고 넘기는지 */
export type PharmacyTier = {
  id: string;
  from: number;
  to?: number;
  rate: number;
  /** '주문 시 남는 금액'을 계산할 주문 수량. 없으면 구간 시작 수량 */
  orderQty?: number;
};

/** 수출(FOB) 수량 구간. margin은 FOB 단가 중 헤르바 이익 비율 % */
export type ExportTier = { id: string; from: number; to?: number; margin: number; orderQty?: number };

/** 수출(FOB) 단가 산정 입력값. 금액은 수출 영세율이라 VAT 별도(원) */
export type ExportSim = {
  /** 원/USD 환율 */
  fxRate: number;
  /** 1달러당 멕시코 페소 */
  mxnRate: number;
  /** 1달러당 일본 엔 */
  jpyRate: number;
  /** 선적 1회당 드는 비용 (주문 수량으로 나눠 개당에 반영) */
  shipmentCosts: CostItem[];
  /** 수출 때만 개당 더 드는 비용 */
  unitExtras: CostItem[];
  /** 해외 송금 수수료 등 결제 비용 % (FOB 단가 기준) */
  payFee: number;
  /** 판관비를 개당 원가에 넣을지 */
  includeSga: boolean;
  tiers: ExportTier[];
};

export type SimState = {
  unitCosts: CostItem[];
  /** 로스율 % (불량·파손·샘플·유통기한). 개당 원가 항목 합계에 더해요 */
  lossRate: number;
  fixedCosts: CostItem[];
  quantity: number;
  /** 정가 (VAT 포함). 보여주는 숫자이고, 약국 공급률·수출 정가 대비의 기준 */
  price: number;
  /** 최저가 하한선: 정가 대비 최대 할인율 %. 실판매가가 이 할인가보다 낮으면 경고 */
  floorDiscount: number;
  /** 상시 할인율 %. 정가 × (1 − 상시 할인율) = 실제 판매 금액(판매가), 채널별 이익 계산의 기준 */
  everydayDiscount: number;
  /** 약국 유통사(바로팜·편한가 등 매입 유통) 수량 구간별 공급률 */
  pharmacyTiers: PharmacyTier[];
  exportSim: ExportSim;
  /** 접는 패널 순서 (드래그로 바꿈) */
  panelOrder: string[];
  targetMargin: number;
  channels: Channel[];
};

export const DEFAULT_STATE: SimState = {
  unitCosts: [
    { id: "raw", label: "원료비", amount: 1034, note: "견적서 931원 · 공급가 2,840원에 맞춰 940원 + VAT" },
    { id: "labor", label: "제조 노무비", amount: 1045 },
    { id: "material", label: "부자재", amount: 1045, note: "튜브+단상자+봉합라벨+박스 · 용기 MOQ 10,000개" },
  ],
  lossRate: 3,
  fixedCosts: [
    { id: "rnd", label: "연구개발비", amount: 11000000, note: "임상·개발·품질검사" },
    { id: "storage", label: "창고 보관료", amount: 110000 },
    { id: "3pl", label: "3PL 물류비", amount: 33000000, note: "택배·보관·충전재 · 개당 3,000원 × 1만 개 + VAT" },
    { id: "cs", label: "CS", amount: 2200000 },
    { id: "ads", label: "광고 판촉비 (마케팅)", amount: 11000000 },
    { id: "service", label: "지급 수수료", amount: 550000 },
    { id: "rent", label: "사무실 임대료", amount: 3300000 },
    { id: "payroll", label: "인건비", amount: 10000000, note: "부가세 없는 비용" },
    { id: "etc", label: "기타 운영관리비", amount: 11000000 },
  ],
  quantity: 10000,
  price: 27000, // 2026-11-12 정가 27,000원 확정 (판매가 = 상시 할인 10% → 24,300원)
  floorDiscount: 20,
  everydayDiscount: 10,
  pharmacyTiers: [
    { id: "t1", from: 1000, to: 9999, rate: 50 },
    { id: "t2", from: 10000, rate: 48 },
    { id: "t3", from: 30000, rate: 46 },
    { id: "t4", from: 50000, rate: 44 },
  ],
  panelOrder: ["price-detail", "distributor-sim", "export-sim", "channel-table"],
  exportSim: {
    fxRate: 1350, // 2026-11-12 직접 입력 (11-11 종가 약 1,340원)
    mxnRate: 18.62, // 2026-11-11 XE 중간값 약 18.62
    jpyRate: 159.8, // 2026-11-12 Trading Economics 약 159.80
    shipmentCosts: [
      { id: "inland", label: "내륙 운송·선적항 반입", amount: 300000 },
      { id: "clearance", label: "수출 통관·포워딩·서류", amount: 400000, note: "THC·서류 발급비 포함" },
    ],
    unitExtras: [
      { id: "packing", label: "수출 포장 (카톤·팔레트)", amount: 100 },
      { id: "label", label: "현지 라벨·스티커", amount: 50 },
    ],
    payFee: 1,
    includeSga: true,
    tiers: [
      { id: "e1", from: 1000, to: 9999, margin: 30 },
      { id: "e2", from: 10000, margin: 27 },
      { id: "e3", from: 30000, margin: 24 },
      { id: "e4", from: 50000, margin: 20 },
    ],
  },
  targetMargin: 20,
  channels: [
    { id: "own", name: "자사몰", fee: 0, card: 3, discount: 0, main: true },
    { id: "naver", name: "네이버 브랜드스토어", fee: 7, card: 0, discount: 0, main: true },
    { id: "oliveyoung", name: "올리브영", fee: 60, card: 0, discount: 0 },
    { id: "musinsa", name: "무신사", fee: 30, card: 0, discount: 0 },
    { id: "kakao-store", name: "카카오톡 톡스토어", fee: 3.3, card: 0, discount: 0 },
    { id: "kakao-gift", name: "카카오톡 선물하기", fee: 30, card: 0, discount: 0 },
    { id: "kurly", name: "마켓컬리", fee: 40, card: 0, discount: 0 },
    { id: "homeshopping", name: "홈쇼핑", fee: 40, card: 0, discount: 0 },
    { id: "influencer", name: "인플루언서 공구", fee: 35, card: 0, discount: 0 },
    { id: "coupang", name: "쿠팡 마켓플레이스", fee: 9.6, card: 0, discount: 0 },
    { id: "gym", name: "헬스장·골프장", fee: 40, card: 0, discount: 0 },
  ],
};
