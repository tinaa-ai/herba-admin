// 제품단가금액 탭의 기본값. 화면에서 고친 값은 브라우저에만 저장되고, 여기 값은 "기본값으로" 버튼이 되돌리는 기준이에요.
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
  /** 고객에게 브랜드가 직접 택배를 보내는 채널이면 3PL 물류비를 원가에 넣음 */
  shipping: boolean;
  /** 정가 대비 상시 할인율 % — 실판매가 = 정가 × (1 − 할인율) */
  discount: number;
  /** 주력 채널: 표 맨 위에 따로 묶어 보여줌 */
  main?: boolean;
  /** 상시 할인율을 바꾸면 이 채널 할인율도 같이 바뀜 */
  everyday?: boolean;
};

/** 약국 유통사(매입 유통) 수량 구간. rate는 공급률: 정가의 몇 %를 받고 넘기는지 */
export type PharmacyTier = { id: string; from: number; to?: number; rate: number };

export type SimState = {
  unitCosts: CostItem[];
  shippingCost: number;
  fixedCosts: CostItem[];
  quantity: number;
  /** 정가 (VAT 포함) */
  price: number;
  /** 최저가 하한선: 정가 대비 최대 할인율 %. 실판매가가 이 할인가보다 낮으면 경고 */
  floorDiscount: number;
  /** 상시 할인율 % (자사몰·브랜드스토어 기본 판매가) */
  everydayDiscount: number;
  /** 약국 유통사(바로팜·편한가 등 매입 유통) 수량 구간별 공급률 */
  pharmacyTiers: PharmacyTier[];
  targetMargin: number;
  channels: Channel[];
};

export const DEFAULT_STATE: SimState = {
  unitCosts: [
    { id: "raw", label: "원료비", amount: 1034, note: "견적서 931원 · 공급가 2,840원에 맞춰 940원 + VAT" },
    { id: "labor", label: "제조 노무비", amount: 1045 },
    { id: "material", label: "부자재", amount: 1045, note: "튜브+단상자+봉합라벨+박스 · 용기 MOQ 10,000개" },
    { id: "assembly", label: "임가공비 (충진+포장)", amount: 66 },
    { id: "qc", label: "검사/품질 관리", amount: 1100 },
  ],
  shippingCost: 3300,
  fixedCosts: [
    { id: "rnd", label: "연구개발비", amount: 0 },
    { id: "storage", label: "창고 보관료", amount: 110000 },
    { id: "cs", label: "CS", amount: 2200000 },
    { id: "ads", label: "광고 판촉비 (마케팅)", amount: 5500000 },
    { id: "service", label: "지급 수수료", amount: 550000 },
    { id: "rent", label: "사무실 임대료", amount: 3300000 },
    { id: "payroll", label: "인건비", amount: 10000000, note: "부가세 없는 비용" },
    { id: "etc", label: "기타 운영관리비", amount: 11000000 },
  ],
  quantity: 10000,
  price: 25000,
  floorDiscount: 20,
  everydayDiscount: 10,
  pharmacyTiers: [
    { id: "t1", from: 1, to: 5000, rate: 55 },
    { id: "t2", from: 10000, rate: 52 },
    { id: "t3", from: 30000, rate: 50 },
    { id: "t4", from: 50000, rate: 48 },
  ],
  targetMargin: 20,
  channels: [
    { id: "own", name: "자사몰", fee: 0, card: 3, discount: 10, shipping: true, main: true, everyday: true },
    {
      id: "naver",
      name: "네이버 브랜드스토어",
      fee: 7,
      card: 0,
      discount: 10,
      shipping: true,
      main: true,
      everyday: true,
    },
    { id: "oliveyoung", name: "올리브영", fee: 60, card: 0, discount: 0, shipping: false },
    { id: "musinsa", name: "무신사", fee: 30, card: 0, discount: 0, shipping: true },
    { id: "kakao-store", name: "카카오톡 톡스토어", fee: 3.3, card: 0, discount: 0, shipping: true },
    { id: "kakao-gift", name: "카카오톡 선물하기", fee: 30, card: 0, discount: 0, shipping: true },
    { id: "kurly", name: "마켓컬리", fee: 40, card: 0, discount: 0, shipping: false },
    { id: "homeshopping", name: "홈쇼핑", fee: 40, card: 0, discount: 0, shipping: true },
    { id: "influencer", name: "인플루언서 공구", fee: 35, card: 0, discount: 0, shipping: true },
    { id: "coupang", name: "쿠팡 마켓플레이스", fee: 9.6, card: 0, discount: 0, shipping: true },
    { id: "gym", name: "헬스장·골프장", fee: 40, card: 0, discount: 0, shipping: false },
  ],
};
