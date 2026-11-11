// 경쟁 제품 채널별 가격
// 출처: 경쟁제품_판매채널별_가로비교.xlsx (2026-11-11 조사)
// 가격은 원(KRW). 묶음 상품은 개당 가격으로 환산해서 비교한다.

export type PriceTag =
  | "회원 조건"
  | "신규가입"
  | "쿠폰·혜택 적용"
  | "묶음"
  | "배송포함"
  | "배송비 별도"
  | "면세"
  | "품절"
  | "가격비교 집계"
  | "동일성 잠정"
  | "과거 가격"
  | "비교 제외";

export type ChannelPrice = {
  channel: string;
  /** 판매자·세부 경로 (있을 때만) */
  seller?: string;
  /** 할인가, 회원가, 쿠폰가 등 */
  priceType: string;
  /** 결제 금액 (묶음이면 묶음 전체 금액) */
  price: number;
  /** 묶음 수량. 기본 1 */
  units?: number;
  currency?: "KRW" | "USD";
  /** 자료 시점 */
  seenAt: string;
  note?: string;
  tags?: PriceTag[];
  url?: string;
};

export type CompetitorProduct = {
  id: string;
  brand: string;
  brandKo: string;
  name: string;
  form: string;
  /** 모르면 비워둔다. 비우면 10mL당 가격을 계산하지 않는다 */
  volumeMl?: number;
  /** public/ 기준 제품 사진 경로 */
  image?: string;
  listPrice: number;
  listPriceNote?: string;
  productNote?: string;
  prices: ChannelPrice[];
};

export const SURVEY_DATE = "2026-11-11";

/** 최저가 계산에서 빼는 태그 */
export const EXCLUDED_FROM_LOWEST: PriceTag[] = ["면세", "과거 가격", "비교 제외", "품절"];

export const competitors: CompetitorProduct[] = [
  {
    id: "just",
    image: "/products/just.jpg",
    brand: "JUST",
    brandKo: "유스트",
    name: "노간주 크림 (Wacholder Kräutercreme)",
    form: "허브 마사지 크림 · 온감",
    volumeMl: 100,
    listPrice: 49000,
    listPriceNote: "공식몰 정가",
    productNote: "온감 제품이라 쿨링 제품과는 간접 비교. 100mL 용량은 이번 조사에서 재확인 못 함.",
    prices: [
      {
        channel: "쿠팡",
        seller: "DK Digital Marketing (해외)",
        priceType: "단품 판매가",
        price: 88050,
        seenAt: "약 4개월 전",
        note: "해외 판매자, 배송비 7,900원",
        tags: ["배송비 별도"],
        url: "https://www.coupang.com/vp/products/7870439815",
      },
      {
        channel: "11번가",
        priceType: "집계가",
        price: 69580,
        seenAt: "약 3개월 전",
        note: "다나와 집계",
        tags: ["가격비교 집계"],
        url: "https://prod.danawa.com/info/?pcode=31667297",
      },
      {
        channel: "컬리",
        priceType: "단품 판매가",
        price: 49000,
        seenAt: "약 2개월 전",
        note: "무료배송",
        url: "https://www.kurly.com/goods/5077418",
      },
      {
        channel: "롯데ON",
        seller: "롯데백화점",
        priceType: "단품 목록가",
        price: 49000,
        seenAt: "약 4개월 전",
        note: "카카오페이 5% 할인 별도",
        url: "https://www.lotteon.com/m/display/shop/seltBrdShop/2/P2353/LE10010",
      },
      {
        channel: "G마켓",
        priceType: "집계가",
        price: 45900,
        seenAt: "약 3개월 전",
        note: "다나와 집계, 무료배송",
        tags: ["가격비교 집계"],
        url: "https://prod.danawa.com/info/?pcode=31667297",
      },
      {
        channel: "CJ온스타일",
        priceType: "일반가",
        price: 44100,
        seenAt: "약 1주 전",
        url: "https://item.cjonstyle.com/nfront/item/2070178874?channelCode=30002002",
      },
      {
        channel: "옥션",
        priceType: "집계가",
        price: 44000,
        seenAt: "약 3개월 전",
        note: "다나와 집계, 무료배송",
        tags: ["가격비교 집계"],
        url: "https://prod.danawa.com/info/?pcode=31667297",
      },
      {
        channel: "롯데ON",
        priceType: "집계가",
        price: 43350,
        seenAt: "약 3개월 전",
        note: "다나와 집계, 무료배송",
        tags: ["가격비교 집계"],
        url: "https://prod.danawa.com/info/?pcode=31667297",
      },
      {
        channel: "CJ온스타일",
        priceType: "로그인 혜택가",
        price: 41900,
        seenAt: "약 1주 전",
        tags: ["회원 조건"],
        url: "https://item.cjonstyle.com/nfront/item/2070178874?channelCode=30002002",
      },
      {
        channel: "올리브영",
        priceType: "단품 할인가",
        price: 41650,
        seenAt: "약 1개월 전",
        note: "무료배송",
        url: "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000232907",
      },
      {
        channel: "SSG.COM",
        priceType: "단품 할인가",
        price: 41650,
        seenAt: "조사 당일",
        note: "무료배송",
        url: "https://m.ssg.com/ssgLive/detail.ssg?scomBrocOrgaId=ch_31wUAKeYOt0fdxLh8OFazqwuglc",
      },
      {
        channel: "공식몰",
        priceType: "할인가",
        price: 41600,
        seenAt: "약 1일 전",
        note: "4만원 이상 무료배송",
        url: "https://justkorea.co.kr/goods/goods_view.php?goodsNo=224",
      },
      {
        channel: "롯데홈쇼핑",
        priceType: "할인가",
        price: 39200,
        seenAt: "약 1개월 전",
        note: "배송비 3,000원 (4만원 이상 무료)",
        tags: ["배송비 별도"],
        url: "https://m.lotteimall.com/goods/viewGoodsDetail.lotte?goods_no=2932589098",
      },
      {
        channel: "쿠팡",
        priceType: "집계가",
        price: 38000,
        seenAt: "약 3개월 전",
        note: "다나와 집계, 판매자 미확인",
        tags: ["가격비교 집계"],
        url: "https://prod.danawa.com/info/?pcode=31667297",
      },
      {
        channel: "네이버 브랜드스토어",
        priceType: "할인가",
        price: 41600,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 유통기한 이슈로 교환·반품 불가 안내",
      },
      {
        channel: "네이버 브랜드스토어",
        priceType: "최대할인가",
        price: 38600,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 적용 조건은 화면에서 미확인",
        tags: ["쿠폰·혜택 적용"],
      },
    ],
  },
  {
    id: "just-bodyfresh",
    image: "/products/just-bodyfresh.jpg",
    brand: "JUST",
    brandKo: "유스트",
    name: "바디 프레쉬 젤 (Salbei Bodyfresh)",
    form: "세이지 바디 젤",
    volumeMl: 100,
    listPrice: 45000,
    listPriceNote: "네이버 브랜드스토어 판매가 (별도 정가 표기 없음)",
    productNote: "네이버 브랜드스토어 가격만 확인.",
    prices: [
      {
        channel: "네이버 브랜드스토어",
        priceType: "판매가",
        price: 45000,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 정가와 같은 가격. 유통기한 이슈로 교환·반품 불가 안내",
      },
      {
        channel: "네이버 브랜드스토어",
        priceType: "최대할인가",
        price: 42000,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 적용 조건은 화면에서 미확인",
        tags: ["쿠폰·혜택 적용"],
      },
    ],
  },
  {
    id: "aromatica",
    image: "/products/aromatica.jpg",
    brand: "AROMATICA",
    brandKo: "아로마티카",
    name: "서큘레이팅 마사지 크림 주니퍼베리&레몬",
    form: "마사지 크림 · 쿨링",
    volumeMl: 100,
    listPrice: 24000,
    listPriceNote: "공식몰 기본 판매가 (별도 정가 표기 없음)",
    productNote: "공식몰 저장자료 기준 품절.",
    prices: [
      {
        channel: "SSG.COM",
        priceType: "쿠폰가",
        price: 21297,
        seenAt: "조사 당일",
        note: "22,900원에서 7% 쿠폰. 배송비 3,000원 조건부",
        tags: ["배송비 별도"],
        url: "https://shinsegaemall.ssg.com/disp/brandShop.ssg?brandId=2000017211&ctgId=6000193745",
      },
      {
        channel: "SSF SHOP",
        seller: "별도 URL",
        priceType: "회원 쿠폰가",
        price: 20400,
        seenAt: "약 1개월 전",
        note: "15% 회원 쿠폰, 배송비 2,500원",
        tags: ["회원 조건", "배송비 별도"],
        url: "https://www.ssfshop.com/AROMATICA/GQ9X24071185636/good?brandShopNo=BDMA28AKP&brndShopId=RTARA&dspCtgryNo=SFMG41",
      },
      {
        channel: "올리브영",
        priceType: "할인가",
        price: 18000,
        seenAt: "약 3주 전",
        note: "무료배송",
        url: "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000208326",
      },
      {
        channel: "GS SHOP",
        priceType: "임박 특가",
        price: 16800,
        seenAt: "약 1개월 전",
        note: "사용기한 임박(26.08.01) 상품이라 비교에서 뺌",
        tags: ["비교 제외"],
        url: "https://price.enuri.com/catalog/126575930",
      },
      {
        channel: "옥션",
        seller: "현대Hmall 표기",
        priceType: "단품 목록가",
        price: 16800,
        seenAt: "약 3주 전",
        note: "검색 목록가, 배송비 미확인",
        url: "https://www.auction.co.kr/n/search?keyword=%EB%A7%88%EC%82%AC%EC%A7%80%EC%98%A4%EC%9D%BC&t=p",
      },
      {
        channel: "SSF SHOP",
        priceType: "회원 쿠폰가",
        price: 16320,
        seenAt: "약 2개월 전",
        note: "즉시할인 쿠폰 포함",
        tags: ["회원 조건"],
        url: "https://www.ssfshop.com/AROMATICA/GQ9X24071185636/good",
      },
      {
        channel: "쿠팡",
        seller: "판매자 미확인",
        priceType: "단품 표시가",
        price: 16080,
        seenAt: "약 3개월 전",
        note: "‘쿨링 릴리프’ 명칭으로 등록",
        tags: ["동일성 잠정"],
        url: "https://www.coupang.com/vp/products/8224713300",
      },
      {
        channel: "쿠팡",
        seller: "스킨앤뷰티",
        priceType: "한시 행사가",
        price: 13500,
        seenAt: "약 3개월 전",
        note: "무료배송, 당시 한시 할인",
        tags: ["동일성 잠정"],
        url: "https://www.coupang.com/vp/products/9459182924",
      },
      {
        channel: "네이버 스마트스토어",
        priceType: "과거 추적가",
        price: 13200,
        seenAt: "2026-09-30",
        note: "제3자 가격추적 자료",
        tags: ["과거 가격"],
        url: "https://www.nstoreprice.co.kr/products/aromatica-juniper-lemon-massage-cream-10562181025",
      },
      {
        channel: "네이버 스마트스토어",
        priceType: "추적가",
        price: 12000,
        seenAt: "조사 당일",
        note: "제3자 가격추적 자료, 스토어 직접 가격은 미검증",
        url: "https://www.nstoreprice.co.kr/category/beauty-cosmetics",
      },
      {
        channel: "네이버 브랜드스토어",
        seller: "아로마티카 공식스토어",
        priceType: "할인가",
        price: 9900,
        seenAt: "11/11 화면 캡처",
        note: "배송비 2,500원. 리뷰 937개",
        tags: ["배송비 별도"],
      },
    ],
  },
  {
    id: "nutseline",
    image: "/products/nutseline.jpg",
    brand: "NUTSELINE",
    brandKo: "넛세린",
    name: "액티핏 쿨링 괄사 세럼",
    form: "괄사 결합형 세럼 · 쿨링",
    volumeMl: 60,
    listPrice: 35000,
    listPriceNote: "공식몰 소비자가",
    productNote: "60mL 제품이라 100mL 제품과는 10mL당 가격으로 비교.",
    prices: [
      {
        channel: "11번가",
        seller: "케이쇼핑",
        priceType: "목록가",
        price: 41000,
        seenAt: "약 4개월 전",
        note: "무료배송",
        url: "https://catalog.11st.co.kr/mw/507067623",
      },
      {
        channel: "G마켓",
        seller: "chodream",
        priceType: "단품 목록가",
        price: 40750,
        seenAt: "조사 당일",
        note: "무료배송",
        url: "https://m.gmarket.co.kr/n/minishop/chodream/list?isShopCategory=false&lcode=100000005&p=2",
      },
      {
        channel: "G마켓",
        seller: "chodream",
        priceType: "2개 묶음",
        price: 78670,
        units: 2,
        seenAt: "조사 당일",
        note: "무료배송",
        tags: ["묶음"],
        url: "https://m.gmarket.co.kr/n/minishop/chodream/list?isShopCategory=false&lcode=100000005&p=2",
      },
      {
        channel: "쿠팡",
        seller: "검색 목록",
        priceType: "단품 표시가",
        price: 37900,
        seenAt: "약 4개월 전",
        note: "배송비 3,000원",
        tags: ["배송비 별도"],
        url: "https://www.coupang.com/np/search?q=%EB%84%9B%EC%84%B8%EB%A6%B0",
      },
      {
        channel: "11번가",
        seller: "검색 목록",
        priceType: "할인 모음가",
        price: 34500,
        seenAt: "약 1개월 전",
        note: "무료배송, 판매자 미확인",
        url: "https://search.11st.co.kr/MW/search?searchKeyword=%EB%84%9B%EC%84%B8%EB%A6%B0",
      },
      {
        channel: "11번가",
        seller: "제이유통공식",
        priceType: "단품 판매가",
        price: 32900,
        seenAt: "약 2개월 전",
        note: "배송비 3,500원",
        tags: ["배송비 별도"],
        url: "https://www.11st.co.kr/products/9551630951",
      },
      {
        channel: "쿠팡",
        seller: "티엔티케이",
        priceType: "1개 옵션",
        price: 30080,
        seenAt: "약 3개월 전",
        note: "배송비가 포함된 가격",
        tags: ["배송포함"],
        url: "https://www.coupang.com/vp/products/9475749356",
      },
      {
        channel: "공식몰",
        priceType: "할인가",
        price: 29900,
        seenAt: "조사 당일",
        note: "무료배송",
        url: "https://www.nutseline.com/product/detail.html?product_no=638",
      },
      {
        channel: "공식몰",
        seller: "별도 도메인 nutseline.co.kr",
        priceType: "단품 표시가",
        price: 29500,
        seenAt: "약 6일 전",
        url: "https://nutseline.co.kr/",
      },
      {
        channel: "올리브영",
        priceType: "할인가",
        price: 29500,
        seenAt: "약 5일 전",
        note: "무료배송",
        url: "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000252045",
      },
      {
        channel: "쿠팡",
        seller: "티엔티케이",
        priceType: "2개 묶음",
        price: 55890,
        units: 2,
        seenAt: "약 3개월 전",
        note: "배송비 3,000원",
        tags: ["묶음", "배송비 별도"],
        url: "https://www.coupang.com/vp/products/9475749356",
      },
      {
        channel: "공식몰",
        priceType: "신규가입 혜택가",
        price: 26900,
        seenAt: "조사 당일",
        tags: ["신규가입"],
        url: "https://www.nutseline.com/product/detail.html?product_no=638",
      },
      {
        channel: "신라아이파크면세점",
        priceType: "인터넷 회원가",
        price: 20062,
        seenAt: "약 4일 전",
        note: "USD 14.95를 사이트가 원화로 환산 (정상가 USD 23)",
        tags: ["면세", "회원 조건"],
        url: "https://www.shillaipark.com/estore/kr/ko/Skin-Care/Cleansing/Cleansing-Cream-Oil/p/4897829",
      },
      {
        channel: "신세계면세점",
        priceType: "면세 표시가",
        price: 13.2,
        currency: "USD",
        seenAt: "약 5일 전",
        note: "정상가 USD 24 대비 45% 할인. 환율 미적용",
        tags: ["면세"],
        url: "https://www.ssgdfs.com/kr/main/initMain?brandId=6240",
      },
      {
        channel: "네이버 브랜드스토어",
        seller: "넛세린 공식스토어",
        priceType: "할인가",
        price: 29500,
        seenAt: "11/11 화면 캡처",
        note: "배송비 3,000원",
        tags: ["배송비 별도"],
      },
      {
        channel: "네이버 브랜드스토어",
        seller: "넛세린 공식스토어",
        priceType: "최대할인가",
        price: 26550,
        seenAt: "11/11 화면 캡처",
        note: "배송비 3,000원. 적용 조건은 화면에서 미확인",
        tags: ["쿠폰·혜택 적용", "배송비 별도"],
      },
    ],
  },
  {
    id: "powerfulx",
    image: "/products/powerfulx.jpg",
    brand: "POWERFUL X",
    brandKo: "파워풀엑스",
    name: "아이씨크림",
    form: "쿨링 크림",
    volumeMl: 100,
    listPrice: 30000,
    listPriceNote: "공식몰 비회원 기본가",
    productNote: "공식몰과 네이버 브랜드스토어 외 채널에서는 가격이 확인되지 않음. 별도 공식 도메인은 품절 표시.",
    prices: [
      {
        channel: "공식몰",
        priceType: "일반회원가",
        price: 29400,
        seenAt: "약 2주 전",
        tags: ["회원 조건"],
        url: "https://powerfulx.com/product/detail.html?product_no=2454",
      },
      {
        channel: "공식몰",
        priceType: "VIP 회원가",
        price: 28800,
        seenAt: "약 2주 전",
        tags: ["회원 조건"],
        url: "https://powerfulx.com/product/detail.html?product_no=2454",
      },
      {
        channel: "공식몰",
        priceType: "VVIP 회원가",
        price: 28200,
        seenAt: "약 2주 전",
        tags: ["회원 조건"],
        url: "https://powerfulx.com/product/detail.html?product_no=2454",
      },
      {
        channel: "공식몰",
        seller: "런칭특가 행사 상품",
        priceType: "런칭특가",
        price: 25500,
        seenAt: "약 1개월 전",
        note: "ID당 3개, 쿠폰·등급할인 중복 불가. 용량 옵션 미확인",
        tags: ["품절", "회원 조건"],
        url: "https://www.powerfulx.co.kr/product/detail.html?product_no=2467",
      },
      {
        channel: "네이버 브랜드스토어",
        priceType: "판매가",
        price: 30000,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 정가와 같은 가격",
      },
      {
        channel: "네이버 브랜드스토어",
        priceType: "최대할인가",
        price: 27000,
        seenAt: "11/11 화면 캡처",
        note: "무료배송. 적용 조건은 화면에서 미확인",
        tags: ["쿠폰·혜택 적용"],
      },
    ],
  },
  {
    id: "pranarom",
    image: "/products/pranarom.jpg",
    brand: "PRANAROM",
    brandKo: "프라나롬",
    name: "씨큐라롬 젤 (Circularom Gel Crème)",
    form: "다리 마사지 쿨링 젤 크림",
    volumeMl: 100,
    listPrice: 29000,
    listPriceNote: "공식몰 판매가 (올리브영 정가와 같음)",
    prices: [
      {
        channel: "공식몰",
        priceType: "판매가",
        price: 29000,
        seenAt: "11/11 화면 캡처",
        note: "정가와 같은 가격",
      },
      {
        channel: "네이버 스토어",
        priceType: "판매가",
        price: 29000,
        seenAt: "11/11 화면 캡처",
        note: "배송비 3,000원. 리뷰 547개",
        tags: ["배송비 별도"],
      },
      {
        channel: "올리브영",
        priceType: "세일가",
        price: 26100,
        seenAt: "11/11 화면 캡처",
        note: "오늘드림 가능. 리뷰 714개",
      },
      {
        channel: "네이버 스토어",
        priceType: "최대할인가",
        price: 25100,
        seenAt: "11/11 화면 캡처",
        note: "배송비 3,000원. 적용 조건은 화면에서 미확인",
        tags: ["쿠폰·혜택 적용", "배송비 별도"],
      },
    ],
  },
];
