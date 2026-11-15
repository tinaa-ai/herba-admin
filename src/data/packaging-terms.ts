/** 부자재 용어집. /packaging 페이지는 이 파일만 보고 그려요 */

export const PRICE_BASIS =
  "국내 OEM·부자재 업체 기준 개당 단가(VAT 별도), MOQ 3,000~10,000개 기준의 대략적인 범위예요. 사양·수량·후가공·시기에 따라 크게 달라지니 발주 전에는 꼭 견적을 받아야 해요.";

export type TermOption = { name: string; meaning: string; price?: string };

export type PackagingTerm = {
  id: string;
  category: string;
  name: string;
  /** 영문·다른 이름 */
  aka?: string;
  /** 한 줄 뜻 */
  meaning: string;
  description: string;
  /** 업계 통상 금액대 */
  price: string;
  /** 금형·디자인비처럼 개당 단가와 따로 드는 돈 */
  extraCost?: string;
  options?: TermOption[];
  /** 용어 뜻을 확정하지 못했을 때 */
  needsCheck?: string;
  /** 거래처에서 실제로 받은 견적 */
  quote?: QuoteCase;
  /** 여러 겹으로 된 재질의 층 구성 (바깥 → 안쪽) */
  layers?: { title: string; total: string; rows: Layer[] };
  photos?: { src: string; width: number; height: number; caption: string }[];
};

export type Layer = {
  material: string;
  role: string;
  thickness: string;
  kind: "pe" | "glue" | "nylon" | "foil";
};

export type QuoteCase = {
  title: string;
  photo?: { src: string; width: number; height: number };
  spec: string[];
  lines: { label: string; price: number; group: "자재" | "후가공" }[];
  /** 견적서 아래 단서 조항 */
  notes: string[];
  /** 거래처와 주고받은 질문과 답 */
  qa: { q: string; a: string }[];
  needsCheck?: string;
};

export const categories = [
  "용기 재질",
  "용기 타입",
  "단상자",
  "아웃박스",
  "씰·라벨·필름",
  "마케팅",
] as const;

export const packagingTerms: PackagingTerm[] = [
  {
    id: "blow",
    category: "용기 재질",
    name: "블로우 용기",
    aka: "Blow molding bottle · PE/PET 블로우",
    meaning: "녹인 플라스틱에 바람을 불어넣어 부풀려 만든 플라스틱 병",
    description:
      "가장 흔하고 저렴한 플라스틱 용기예요. 벽이 얇고 가벼워서 바디로션·샴푸처럼 용량이 큰 제품에 많이 써요. PE는 말랑해서 눌러 짜기 좋고, PET는 단단하고 투명해요. 기성 금형이 많아 금형비 없이 바로 쓸 수 있는 경우가 많아요.",
    price: "본체 80~250원 · 캡 포함 150~400원",
    extraCost: "신규 금형을 만들면 300만~1,000만 원",
  },
  {
    id: "heavy-blow",
    category: "용기 재질",
    name: "헤비블로우 용기",
    aka: "Heavy-wall · 후육 용기 (주로 PETG)",
    meaning:
      "벽을 아주 두껍게 만들어 유리처럼 묵직하고 투명해 보이는 플라스틱 용기",
    description:
      "PETG 같은 투명 수지를 두껍게 성형해서 유리병처럼 고급스러워 보이지만 깨지지 않고 가벼워요. 스킨케어 프리미엄 라인에서 유리 대신 많이 써요. 일반 블로우보다 성형 시간이 길어 단가가 높아요.",
    price: "400~1,200원",
    extraCost: "신규 금형 1,000만~3,000만 원",
  },
  {
    id: "glass",
    category: "용기 재질",
    name: "유리 용기",
    aka: "Glass bottle",
    meaning: "유리로 만든 병·자",
    description:
      "내용물과 반응이 적고 무게감이 있어 고급스러워요. 앰플·세럼·오일에 많이 써요. 깨질 수 있어 포장재가 더 들고 배송비도 올라가요. 컬러 코팅, 증착, 프로스트(반투명) 같은 후가공을 하면 단가가 더 붙어요.",
    price: "기성 300~1,500원 · 코팅·증착 시 +100~500원",
  },
  {
    id: "aluminum",
    category: "용기 재질",
    name: "알루미늄 용기",
    aka: "Aluminum bottle / can",
    meaning: "알루미늄으로 만든 병·캔 형태 용기",
    description:
      "빛과 공기를 잘 막아 내용물 변질을 줄이고, 재활용성이 좋아 친환경 이미지에 유리해요. 메탈 느낌의 미니멀한 디자인에 어울려요. 안쪽에 내부 코팅이 들어가야 내용물과 반응하지 않아요.",
    price: "용기+캡 400~1,200원",
  },
  {
    id: "dropper",
    category: "용기 타입",
    name: "스포이드",
    aka: "Dropper",
    meaning: "고무 꼭지를 눌렀다 놓아 내용물을 빨아올려 떨어뜨리는 캡",
    description:
      "고무(또는 실리콘) 벌브와 유리관으로 된 캡이에요. 앰플·세럼·페이스오일처럼 몇 방울씩 쓰는 제품에 써요. 보통 유리병과 세트로 발주해요. 버튼식(푸시 스포이드)은 단가가 더 높아요.",
    price: "스포이드 캡 150~400원 · 유리병 세트 600~1,500원",
  },
  {
    id: "pump",
    category: "용기 타입",
    name: "펌프형",
    aka: "Lotion pump · Airless pump",
    meaning: "머리를 눌러 정량씩 짜내는 펌프가 달린 용기",
    description:
      "로션·바디크림·샴푸에 가장 흔한 형태예요. 일반 펌프는 빨대(딥튜브)로 내용물을 빨아올리고, 에어리스는 바닥 판이 올라오며 공기 접촉 없이 끝까지 짜낼 수 있어요. 한 번 누를 때 나오는 양(토출량)과 잠금 방식(좌우 돌림, 클립)을 함께 정해요.",
    price: "일반 펌프 120~350원 · 에어리스 용기 세트 800~2,000원",
  },
  {
    id: "tube",
    category: "용기 타입",
    name: "튜브",
    aka: "Tube",
    meaning: "손으로 눌러 짜서 쓰는 말랑한 관 모양 용기",
    description:
      "핸드크림·클렌저·선크림·바디크림에 많이 써요. 끝을 열로 붙여(실링) 막고 반대쪽에 캡을 달아요. 몸통 재질, 굵기(파이), 캡 종류, 입구 막, 인쇄 방식, 표면 마감에 따라 단가가 달라져요.",
    price: "PE 튜브(50~200mL, 인쇄·캡 포함) 150~450원 · ABL 튜브 400~700원",
    options: [
      {
        name: "ABL",
        meaning:
          "Aluminum Barrier Laminate. 얇은 알루미늄 호일을 PE·나일론 필름 사이에 겹친 튜브 재질이에요. 공기·빛·수분 차단이 좋아 선크림처럼 성분이 변하기 쉬운 제품에 써요. 짜면 눌린 형태가 그대로 남아요.",
        price: "실제 견적 520원 (35파이, 원터치캡·리드씰·옵셋 3도 포함)",
      },
      {
        name: "파이 (Ø)",
        meaning:
          "튜브 지름을 mm로 부르는 말이에요. 35파이 = 지름 35mm. 같은 파이에서 길이를 바꿔 용량을 맞춰요.",
      },
      {
        name: "원터치캡",
        meaning:
          "엄지로 뚜껑을 젖혀 여는 일체형 캡(플립탑). 돌려 여는 스크류캡보다 편해요. '색상사출'은 캡을 원하는 색 플라스틱으로 바로 사출해 만든다는 뜻이에요.",
        price: "튜브 단가에 포함되는 경우가 많아요 · 무광코팅 +50원",
      },
      {
        name: "토출구",
        meaning:
          "내용물이 나오는 구멍 지름. 튜브는 3mm, 5mm가 흔하고, 크림처럼 되직하면 5mm, 묽으면 3mm를 써요.",
      },
      {
        name: "리드씰",
        meaning:
          "튜브 입구를 막는 얇은 알루미늄 막. 처음 쓸 때 뜯어서 개봉 여부와 위생을 보장해요.",
        price: "튜브 단가에 포함되는 경우가 많아요 · 별도면 +10~40원",
      },
      {
        name: "옵셋 인쇄",
        meaning:
          "판에 묻힌 잉크를 고무 롤러로 옮겨 찍는 인쇄. 여러 색(도수)을 한 번에 찍기 좋아 튜브 몸통 기본 인쇄로 써요. '3도'는 3가지 색이라는 뜻이에요.",
        price: "견적에 3도 포함이 흔하고, 도수를 늘리면 단가가 올라요",
      },
      {
        name: "실크 인쇄",
        meaning:
          "망사판으로 잉크를 두껍게 밀어 찍는 인쇄. 색이 진하고 도톰하게 올라와 로고·포인트에 써요.",
        price: "1도 +100원 (실제 견적)",
      },
      {
        name: "무광",
        meaning:
          "표면을 매트하게 코팅하는 마감. 지문이 덜 묻고 차분하고 고급스러워 보여요. 원터치캡에 무광코팅을 하면 여닫는 힌지 부분 코팅이 벗겨질 수 있어요.",
        price:
          "튜브 몸통(슬리브)은 무광·유광 단가 같음 · 원터치캡 무광 +50원 (실제 견적)",
      },
    ],
    quote: {
      title: "35파이 ABL 튜브 실제 견적",
      photo: {
        src: "/packaging-photos/abl-tube-quote.jpg",
        width: 70,
        height: 232,
      },
      spec: [
        "35파이 ABL 튜브 · 옵셋 3도 + 실크 1도",
        "원터치캡 · 색상사출",
        "토출구 5mm (3mm도 가능)",
        "리드씰 포함",
      ],
      lines: [
        { label: "용기+캡", price: 520, group: "자재" },
        { label: "튜브 1도 인쇄(실크)", price: 100, group: "후가공" },
      ],
      notes: [
        "옵셋 3도 포함 (도수 추가 시 단가 변동)",
        "사양 변경 시 단가 변동",
        "지류 개발비 별도",
        "VAT 별도",
      ],
      qa: [
        {
          q: "샘플 기준 토출구 규격이 약 5mm인데 맞나요?",
          a: "튜브 토출구 기준 5mm 맞아요 (3mm / 5mm 가능).",
        },
        {
          q: "튜브 입구 알루미늄 실링이 단가에 포함되어 있나요?",
          a: "리드씰 포함 단가예요.",
        },
        {
          q: "현재 사양 기준으로 무광(Matte)이 가능한지, 단가가 바뀌는지?",
          a: "슬리브(튜브 몸통)는 무광·유광 단가가 같아요. 원터치캡에 무광코팅을 하면 힌지 부분 코팅이 벗겨질 수 있고, 원터치캡 무광코팅은 50원 추가예요.",
        },
      ],
    },
    layers: {
      title: "ABL 튜브 배리어층 구성 (바깥 → 안쪽)",
      total: "355㎛ ± 5%",
      rows: [
        {
          material: "Polyethylene (LLDPE)",
          role: "인쇄층. 바깥 면으로 인쇄가 올라가요",
          thickness: "165㎛",
          kind: "pe",
        },
        {
          material: "DRY 접착제 815",
          role: "우레탄계 내열 접착제로 층을 붙여요",
          thickness: "1~2㎛",
          kind: "glue",
        },
        {
          material: "나일론 (Nylon)",
          role: "질기게 잡아 줘서 찢김·핀홀을 막아요",
          thickness: "15㎛",
          kind: "nylon",
        },
        {
          material: "DRY 접착제 815",
          role: "접착",
          thickness: "1~2㎛",
          kind: "glue",
        },
        {
          material: "AL-FOIL (알루미늄 호일)",
          role: "빛·산소·수분을 막는 핵심 배리어",
          thickness: "12㎛",
          kind: "foil",
        },
        {
          material: "DRY 접착제 815",
          role: "접착",
          thickness: "1~2㎛",
          kind: "glue",
        },
        {
          material: "Special Polyethylene (LLDPE)",
          role: "접착층. 내용물과 닿고 튜브 이음새를 열로 붙여요",
          thickness: "165㎛",
          kind: "pe",
        },
      ],
    },
    photos: [
      {
        src: "/packaging-photos/abl-tube-cross-section.jpg",
        width: 692,
        height: 446,
        caption:
          "일반 선크림 튜브(왼쪽)와 7중 ABL 튜브(오른쪽). ABL은 안쪽에 알루미늄 층이 보여요",
      },
    ],
  },
  {
    id: "jar",
    category: "용기 타입",
    name: "자타입",
    aka: "Jar",
    meaning: "입구가 넓고 낮은 통에 뚜껑을 돌려 닫는 용기",
    description:
      "크림·밤·마스크처럼 되직한 제형을 손가락이나 스패츌러로 덜어 쓰는 제품에 써요. 겉통과 속통이 나뉜 이중자는 두께감이 있어 고급스러워요. 안쪽에 속뚜껑(내캡)을 넣는 경우가 많아요.",
    price: "PP 자 200~600원 · 이중자 500~1,500원 · 유리자 700~2,000원",
  },
  {
    id: "spray",
    category: "용기 타입",
    name: "스프레이",
    aka: "Mist / Spray pump",
    meaning: "눌러서 내용물을 안개처럼 뿌리는 펌프가 달린 용기",
    description:
      "미스트·토너·헤어·바디 미스트에 써요. 입자 크기와 분사량이 펌프마다 달라 샘플로 분사감을 확인해요. 계속 누르는 동안 연속으로 뿜어지는 연속분사형은 단가가 높아요.",
    price: "미스트 펌프 100~300원 · 병 포함 300~900원 · 연속분사형 600~1,500원",
  },
  {
    id: "three-side-glued",
    category: "단상자",
    name: "3면접착",
    aka: "자동바닥 · 원터치 바닥 단상자",
    meaning:
      "바닥 날개 세 면을 미리 붙여 두어 펼치기만 하면 바닥이 잡히는 단상자",
    description:
      "단상자는 제품 하나를 담는 종이 상자예요. 3면접착은 공장에서 바닥을 미리 접착해 두기 때문에 포장할 때 접어 넣는 작업이 줄고 바닥이 튼튼해요. 무거운 유리병이나 대량 포장에 유리해요. 날개를 끼우는 일자형보다 접착 공정 비용이 조금 더 들어요.",
    price: "120~400원 (박·형압·UV 같은 후가공은 +30~150원)",
    extraCost: "목형(칼선) 10만~30만 원",
  },
  {
    id: "lid-and-base",
    category: "단상자",
    name: "맞뚜껑",
    aka: "Lid & base box · 싸바리 하드박스",
    meaning: "몸통과 뚜껑이 따로 있어 위에서 덮어 씌우는 상자",
    description:
      "두꺼운 판지에 인쇄지를 감싸(싸바리) 만든 단단한 상자가 많아요. 세트·기획 상품이나 선물용에 써요. 손으로 감싸는 공정이 많아 일반 단상자보다 훨씬 비싸고 부피도 커요.",
    price: "1,000~4,000원 (소량이면 5,000원 이상)",
  },
  {
    id: "outer-carton",
    category: "아웃박스",
    name: "카톤박스 · 입수량",
    aka: "Outer carton · Master carton · Pcs/Carton",
    meaning:
      "단상자 여러 개를 한꺼번에 담는 골판지 운송 상자와, 한 상자에 들어가는 개수",
    description:
      "입수량은 카톤박스 하나에 제품이 몇 개 들어가는지를 말해요(예: 48입). 입수량이 정해져야 박스 크기, 팔레트 적재, 물류비와 수출 서류(패킹리스트)가 정해져요. 바이어 주문 단위도 보통 카톤 단위라 MOQ를 입수량의 배수로 맞춰요.",
    price: "골판지 카톤 600~2,000원/개 (제품 1개당으로 나누면 10~50원)",
  },
  {
    id: "lid-seal",
    category: "씰·라벨·필름",
    name: "리드씰",
    aka: "Lid seal · Inner seal · 알루미늄 실링",
    meaning: "튜브·병·자의 입구를 막아 붙이는 은색 알루미늄 막",
    description:
      "캡을 열면 입구에 붙어 있는 은색 막이에요. 알루미늄 호일에 접착층을 입혀 열이나 유도가열(인덕션 실링)로 입구에 붙여요. 공기·습기를 막아 내용물을 보호하고, 소비자가 처음 쓸 때 직접 뜯기 때문에 미개봉 상태와 위생을 보장해요. 쉽게 뜯도록 손잡이(탭)를 달거나 브랜드 로고를 인쇄하기도 해요.",
    price: "튜브 리드씰 10~40원 · 병·자 인덕션 실링 15~50원",
  },
  {
    id: "seal-label",
    category: "씰·라벨·필름",
    name: "봉합라벨 · 실드",
    aka: "Seal sticker · 씰 스티커 · Tamper-evident label · Void 라벨",
    meaning:
      "단상자 입구에 붙여 상자를 봉인하고, 뜯으면 흔적이 남아 개봉 여부를 확인하는 라벨",
    description:
      "단상자 뚜껑 날개와 몸통 이음새에 걸쳐 붙여요. 업체에 따라 봉합라벨, 실드(씰 스티커)라고 부르는 같은 용도의 부자재예요. 지름 2~3cm 정도의 투명 원형 스티커에 브랜드명이나 '제품 사용 후 교환 및 반품이 제한될 수 있습니다' 같은 문구를 인쇄한 형태가 흔하고, 투명해서 단상자 디자인을 가리지 않아요. 개봉 흔적이 확실히 남아야 하면 떼는 순간 'VOID' 글자가 남거나 찢어지는 보이드·파손지 재질을 써요. 반품·재판매나 위조를 막는 데 쓰고, 일부 수출국 유통사는 요구하기도 해요.",
    price:
      "투명 원형 실드 10~30원 · VOID·파손지 10~50원 · 홀로그램 정품 라벨 30~100원",
  },
  {
    id: "shrink-film",
    category: "씰·라벨·필름",
    name: "수출필름",
    aka: "Shrink film · 수축필름",
    meaning: "열을 가해 제품 상단에 밀착, 완전 밀봉",
    description:
      "얇은 수축 필름을 씌우고 열 터널을 통과시키면 필름이 줄어들며 단상자나 용기에 딱 붙어요. 개봉 흔적이 남고 먼지·습기를 막아서 수출품에 거의 기본으로 들어가요. 뜯기 쉽게 절취선(티어 테이프)을 넣기도 해요.",
    price: "자재 10~40원 · 작업비 포함 30~120원",
  },
  {
    id: "seeding-box",
    category: "마케팅",
    name: "시딩용 박스 디자인",
    aka: "PR box · Seeding kit",
    meaning: "인플루언서·기자에게 제품을 보낼 때 쓰는 기획 박스",
    description:
      "시딩은 인플루언서가 써 보고 콘텐츠를 올리도록 제품을 보내는 마케팅이에요. 언박싱 장면이 그대로 콘텐츠가 되니 열었을 때 첫인상(속지 문구, 안내 카드, 브랜드 소품)을 함께 설계해요. 보통 300~1,000개 소량 제작이라 개당 단가가 높아요.",
    price: "박스 제작 3,000~15,000원/개",
    extraCost: "디자인비 50만~300만 원 별도",
  },
];
