import { ToolDefinition, ToolId } from '../types';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export interface ToolConfig extends ToolDefinition {
  fields: FormField[];
}

export const TOOLS_LIST: ToolConfig[] = [
  {
    id: 'naver-diagnostic',
    name: '네이버 플레이스 진단기',
    shortDesc: '알고리즘 기반 플레이스 순위 상위 노출 정밀 진단',
    longDesc: '네이버 플레이스 최신 검색 노출 가이드라인 지표를 기준으로 업체의 지표를 평가하고, 개선 우선순위를 즉시 점수화하여 제공합니다.',
    iconName: 'Activity',
    category: 'place',
    fields: [
      { key: 'businessName', label: '업체명', type: 'text', placeholder: '예: 정성가득 마포점', defaultValue: '' },
      { key: 'industry', label: '업종', type: 'text', placeholder: '예: 삼겹살 전문 고기집', defaultValue: '' },
      { key: 'region', label: '타겟 핵심 지역', type: 'text', placeholder: '예: 서울 마포구', defaultValue: '' },
      { key: 'reviewCount', label: '리뷰 수 (방문자+블로그)', type: 'number', placeholder: '예: 250', defaultValue: 50 },
      { key: 'rating', label: '별점 평점', type: 'number', placeholder: '예: 4.8', defaultValue: 4.5 },
      { key: 'photoCount', label: '플레이스 등록 사진 수', type: 'number', placeholder: '예: 45', defaultValue: 10 },
      { key: 'newsCount', label: '최근 30일 이내 등록한 소식 수', type: 'number', placeholder: '예: 2', defaultValue: 0 },
      { key: 'hasBooking', label: '네이버 예약/주문 기능 사용 여부', type: 'boolean', defaultValue: false },
    ],
  },
  {
    id: 'review-reply',
    name: '리뷰 답글 생성기',
    shortDesc: '충성 고객을 만드는 개인 최적화 답글',
    longDesc: '고객 리뷰를 정밀 분석하여 사장님의 친절함과 혜택을 자연스럽게 알리고 우호적인 이미지를 만드는 스마트 답글 3종 패키지.',
    iconName: 'MessageSquareShare',
    category: 'review',
    fields: [
      { key: 'reviewText', label: '고객 리뷰 원문', type: 'textarea', placeholder: '인증 완료된 영수증/예약 리뷰 내용을 그대로 붙여넣어 주세요.', defaultValue: '' },
      { 
        key: 'tone', 
        label: '답변 스타일 선택', 
        type: 'select', 
        defaultValue: 'friendly',
        options: [
          { value: 'friendly', label: '친근형 (친절하고 정감가는 이웃 사촌 컨셉)' },
          { value: 'professional', label: '전문형 (고품격 전문 비즈니스 정중한 에티켓)' },
          { value: 'emotional', label: '감성형 (깊은 위로와 공감대 형성 톤)' },
          { value: 'vip', label: 'VIP형 (자주 찾아주는 실단골 우대 감사 톤)' },
        ]
      },
    ],
  },
  {
    id: 'naver-news',
    name: '플레이스 소식 생성기',
    shortDesc: '알고리즘 점수를 높여주는 단골 소식 발행기',
    longDesc: '정정당당한 최신 소식을 지속 기재하여 플레이스 활성 등급을 높입니다. 500자, 1000자, 1500자 길이별 맞춤 생성.',
    iconName: 'Bell',
    category: 'place',
    fields: [
      { key: 'industry', label: '업종/서비스명', type: 'text', placeholder: '예: 미용실 / 헤어살롱', defaultValue: '' },
      { key: 'weather', label: '현재 날씨 또는 계절', type: 'text', placeholder: '예: 무더운 여름 폭염 속', defaultValue: '' },
      { key: 'dayOfWeek', label: '요일 또는 노출 시기', type: 'text', placeholder: '예: 특별한 금요일 오후', defaultValue: '' },
      { key: 'event', label: '진행할 이벤트/쿠폰 혜택', type: 'text', placeholder: '예: 알림받기 동의 시 탄산 테라피 서비스 쿠폰', defaultValue: '' },
      { key: 'promoKeyword', label: '핵심 홍보 유입 키워드', type: 'text', placeholder: '예: 강남역미용실 추천', defaultValue: '' },
    ],
  },
  {
    id: 'blog-press',
    name: '블로그 기자단 원고 생성기',
    shortDesc: 'SEO 최적화 로드맵 내장형 블로그 배포 원고',
    longDesc: '네이버 블로그 검색 상위 랭크를 위해 키워드 배치가 정교하게 설계된 전문 원고 배포본. 3개 분량(1500/2000/2500자)을 소주제와 함께 구성합니다.',
    iconName: 'FileText',
    category: 'blog',
    fields: [
      { key: 'businessName', label: '업체명', type: 'text', placeholder: '예: 대박 맛있는 한우 본점', defaultValue: '' },
      { key: 'region', label: '타겟 핵심 지역명', type: 'text', placeholder: '예: 인천 송도동', defaultValue: '' },
      { key: 'keyword', label: '반복 공략할 메인 키워드', type: 'text', placeholder: '예: 송도 맛집 추천', defaultValue: '' },
      { key: 'industry', label: '상세 업종', type: 'text', placeholder: '예: 프리미엄 한우 소고기 전문', defaultValue: '' },
    ],
  },
  {
    id: 'experience-recruit',
    name: '체험단 모집 공고 생성기',
    shortDesc: '영향력 있는 블로거 지원율을 높이는 배포 공지',
    longDesc: '매장의 긍정적 후기 생산을 극대화하기 위하여 일하는 방식과 구체적 미션 규정이 자연스럽게 녹아든 최종 가이드.',
    iconName: 'Users',
    category: 'blog',
    fields: [
      { key: 'businessName', label: '체험을 제공할 업체명', type: 'text', placeholder: '예: 힐링 마사지 테라피', defaultValue: '' },
      { key: 'recruitCount', label: '모집 인원수', type: 'number', placeholder: '예: 10', defaultValue: 10 },
      { key: 'benefits', label: '블로거에게 제공할 내역', type: 'textarea', placeholder: '예: 커플 아로마 오일 테라피 60분 무료 이용 + 동반 1인 포함', defaultValue: '' },
      { 
        key: 'type', 
        label: '체험 진행 형태', 
        type: 'select', 
        defaultValue: 'visit',
        options: [
          { value: 'visit', label: '방문 체험형 (매장 방문 및 인증 필수)' },
          { value: 'delivery', label: '배송 수령형 (가정으로 제품 수령 후 자택 리뷰)' },
        ]
      },
    ],
  },
  {
    id: 'instagram-script',
    name: '인스타 게시글 생성기',
    shortDesc: '줄글과 릴스 촬영 대본 및 복사용 태그 패키지',
    longDesc: '매장의 감각적인 트렌드 유도를 한 번에 다잡는 마케팅 인스타 피드, 오프닝 훅이 살아있는 쇼츠/릴스용 완벽한 큐앤에이 대본과 30개 해시태그 모음.',
    iconName: 'Instagram',
    category: 'social',
    fields: [
      { key: 'industry', label: '매장 성격 및 업종', type: 'text', placeholder: '예: 루프탑 브런치 까페', defaultValue: '' },
      { key: 'productName', label: '소개할 시그니처 메뉴/상품명', type: 'text', placeholder: '예: 생과일 수플레 팬케이크', defaultValue: '' },
      { key: 'event', label: '현재 안내할 이벤트', type: 'text', placeholder: '예: 수플레 스페셜 메뉴 출시 기념 아메리카노 무료 증정', defaultValue: '' },
    ],
  },
  {
    id: 'advert-copy',
    name: '광고 문구 생성기',
    shortDesc: '클릭율을 폭발시키는 제목, 본문, CTA 20세트',
    longDesc: '파워링크, 디스플레이 광고 시스템에 즉시 붙여 넣고 쓸 수 있도록 검증된 후킹 패턴 카피라이팅 기법 기반의 초강력 클릭 유도 제안.',
    iconName: 'Megaphone',
    category: 'marketing',
    fields: [
      { key: 'industry', label: '업종명', type: 'text', placeholder: '예: 실내 골프 아카데미 / 연습장', defaultValue: '' },
      { key: 'productName', label: '핵심 강조 상품/지점명', type: 'text', placeholder: '예: 마포 실내 스크린 GDR 골프', defaultValue: '' },
      { key: 'eventContent', label: '혜택 / 프로모션 세부 사항', type: 'textarea', placeholder: '예: 여름맞이 특가 3개월 등록 시 레슨 프리패스 5회 무료 제공', defaultValue: '' },
    ],
  },
  {
    id: 'naver-seo',
    name: '플레이스 SEO 키워드 추천기',
    shortDesc: '타겟 지역을 장악할 상위 랭킹 키워드 포지션',
    longDesc: '실제 이용자들이 높은 구매 의도로 검색하는 메인 연관어 목록, 서브 상권 조합어, 그리고 상세 니즈를 반영한 롱테일 키워드 분류 설계 리스트.',
    iconName: 'TrendingUp',
    category: 'place',
    fields: [
      { key: 'region', label: '대상 핵심 지역 (시/구/동 단위)', type: 'text', placeholder: '예: 부산 해운대구 우동', defaultValue: '' },
      { key: 'industry', label: '주 업종 카테고리', type: 'text', placeholder: '예: 프라이빗 숙성 횟집', defaultValue: '' },
    ],
  },
  {
    id: 'store-intro',
    name: '업체 소개글 생성기',
    shortDesc: '플레이스용 요약글부터 고품격 회사소개서 버전까지',
    longDesc: '매장의 정체성과 철학을 어필합니다. 플레이스 등록(400자), 브랜드 메인 스토리(1000자), 가맹/대외 영업용 회사소개(1500자)를 동시 완성합니다.',
    iconName: 'Award',
    category: 'place',
    fields: [
      { key: 'businessName', label: '업체명', type: 'text', placeholder: '예: 단아한 이안 한의원', defaultValue: '' },
      { key: 'industry', label: '의원 또는 전문 분야', type: 'text', placeholder: '예: 비수술 관절 교정 전문 한의원', defaultValue: '' },
      { key: 'features', label: '우수 강점 및 설립 철학', type: 'textarea', placeholder: '예: 3대 전통 비법 한약 처방, 야간 진료 시행, 침도 요법을 통한 허리 만성 전문 관리', defaultValue: '' },
    ],
  },
  {
    id: 'lead-cta',
    name: '상담 신청 유도 문구 생성기',
    shortDesc: '예약 문의 전환율 향상 행동 설계 문안',
    longDesc: '상세페이지 이탈을 방지하고 1초 만에 스마트콜 전화를 돌리거나 문자, 카카오톡 채널 상담 예약을 유소하는 심리 기반의 카피 세트.',
    iconName: 'Compass',
    category: 'marketing',
    fields: [
      { key: 'industry', label: '타겟 서비스 업종', type: 'text', placeholder: '예: 수입차 전문 차량 외형 관리 정비소', defaultValue: '' },
      { key: 'serviceDetail', label: '행동을 일으킬 주요 혜택 및 내용', type: 'textarea', placeholder: '예: 찌그러짐 덴트/유리막 코팅 실시간 무료 카카오톡 견적 상담시 10% 추가 혜택 적용', defaultValue: '' },
    ],
  }
];
