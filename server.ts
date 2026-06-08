import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure key exists lazily, but don't let it crash the module load
const getGoogleGenAI = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY environment variable is not configured in Secrets.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', configured: !!process.env.GEMINI_API_KEY });
});

// Common System Prompt requested
const SYSTEM_PROMPT = `
당신은 20년 경력의 네이버 플레이스 마케팅 전문가입니다.
네이버 플레이스 상위 노출(SEO), 블로그 체험단, 영수증 리뷰 관리, 소식 발행 및 마케팅 원고 최적화에 특화되어 있습니다.
모든 결과물은 한글을 지원하며, 소상공인 사업체들이 네이버 플레이스에서 검색 순위를 높이고 실질적인 매출 전환을 이끌 수 있도록 실제 마케팅 실무 수준으로 상세하고 정교하게 작성해야 합니다.
과도한 과장이나 허위 표현(경쟁사 비방, 무조건적 1위 등)은 철저히 지양하고, 고객의 신뢰를 주는 자연스럽고 설득력 있는 문구를 구성하십시오.
출력은 사용자가 복사하여 네이버 스마트플레이스, 블로그, 인스타그램, 광고 시스템 등에 그대로 사용할 수 있는 실제 형태(복사 가능 포맷)로 제공하십시오.
`;

// API: Post core generation endpoint
app.post('/api/generate', async (req, res) => {
  const { toolId, inputs } = req.body;

  if (!toolId || !inputs) {
    return res.status(400).json({ error: 'Missing required toolId or inputs in request body.' });
  }

  try {
    const aiInstance = getGoogleGenAI();

    let prompt = '';

    switch (toolId) {
      case 'naver-diagnostic':
        prompt = `
네이버 플레이스 실시간 마케팅 정밀 진단을 수행합니다.
[입력 정보]
- 업체명: ${inputs.businessName}
- 업종: ${inputs.industry}
- 지역: ${inputs.region}
- 리뷰 수: 영수증/블로그 리뷰 총 ${inputs.reviewCount}건
- 평점: ${inputs.rating} / 5.0
- 등록된 사진 수: ${inputs.photoCount}장
- 최근 30일 이내 소식 발행 수: ${inputs.newsCount}회
- 네이버 예약/주문 연동 여부: ${inputs.hasBooking ? '연동 완료' : '미연동'}

[수행할 작업]
위 세부 지표를 네이버 최신 플레이스 검색 알고리즘 기준에 따라 진단하고, 100점 만점으로 계산한 종합 평가 "플레이스 점수" 및 리테일 "수준 등급 (A~F)"을 매겨주십시오.
그 다음, 실제 사례에 기반하여 다음의 구분 형태로 명확하게 가이드를 제시해주세요:

# 네이버 플레이스 진단 리포트: ${inputs.businessName}

### 📊 종합 요약
- **플레이스 점수**: [점수]점 / 100점
- **수준 등급**: [A/B/C/D/F] 등급

---

### 💪 핵심 강점 (Strengths)
- [현재 잘하고 있는 점 분석 내용 작성]

### ⚠️ 긴급 보완 약점 (Weaknesses)
- [현재 알고리즘 관점에서 누락되었거나 개선이 시급한 지표 분석]

---

### 🚀 개선 실행 가이드
1. **[개선 행동 1]**: [구체적 실행 방법, 예: 소식 주 2회 등록 시 추천 포맷 등]
2. **[개선 행동 2]**: [구체적 노하우 예시]

### 📌 실행 우선순위 (영향도 높은 순)
1. **우선순위 1**: [첫번째 해결 과제]
2. **우선순위 2**: [두번째 해결 과제]
        `;
        break;

      case 'review-reply':
        prompt = `
네이버 스마트플레이스 영수증 리뷰에 대한 사장님 전용 맞춤 답글을 작성합니다.
[입력 정보]
- 고객이 남긴 리뷰: "${inputs.reviewText}"
- 요청한 답변 말투/콘셉트: ${inputs.tone === 'friendly' ? '친근하고 다정한 이웃집 이모/형 같은 느낌' : inputs.tone === 'professional' ? '정중하고 신뢰감을 주는 전문적인 비즈니스 톤' : inputs.tone === 'emotional' ? '진심 어린 공감과 감성적인 톤' : 'vip 감사 우대 톤 (단골 확장형)'}

[수행할 작업]
고객 리뷰에 담긴 구체적인 칭찬 요소를 키워드로 잘 활용하여, 재방문을 자연스럽게 유도하는 명품 답글 3종(옵션 A, 옵션 B, 옵션 C)을 다채롭게 작성해주십시오. 각 답글은 바로 복사할 수 있도록 깔끔하게 나눠주세요.
        `;
        break;

      case 'naver-news':
        prompt = `
네이버 플레이스 소식 탭(새소식)에 등록할 마케팅 게시글을 생성합니다.
[입력 정보]
- 업종: ${inputs.industry}
- 현재 날씨/계절: ${inputs.weather}
- 요일/시기: ${inputs.dayOfWeek}
- 이벤트/할인 정보: ${inputs.event}
- 홍보 타겟 키워드: ${inputs.promoKeyword}

[수행할 작업]
네이버 플레이스 새소식 노출은 최신 상위 검색 순위 유지에 중요한 요소입니다. 위 정보를 결합하여 고객 유입율을 높일 수 있는 소식을 3가지 길이 형태별로 정교하게 구성해주십시오.
- **500자 (초간단 공지/피드형)**
- **1000자 (풍부한 혜택 강조형)**
- **1500자 (상세 스토리텔링 및 쿠폰 유도형)**

각각 실제 글자수가 맞게 탄탄한 정보와 흥미 위주로 내용을 충실히 채우고, 하단에는 예약 기능이나 플레이스 지도 링크를 삽입하라는 안내 문구도 기입해주십시오.
        `;
        break;

      case 'blog-press':
        prompt = `
블로그 마케팅 기자단 배포 전문 고효율 원고를 작성합니다.
[입력 정보]
- 업체명: ${inputs.businessName}
- 위치/지역: ${inputs.region}
- 메인 공략 키워드: ${inputs.keyword}
- 업종: ${inputs.industry}

[수행할 작업]
네이버 검색 노출 로직을 극대화하기 위하여, 메인 키워드를 문맥에 어색하지 않게 반복 배치(SEO 최적화)하면서, 블로그 서두-본론-결론의 구성을 유지하십시오.
내용에는 매력적인 소제목들을 자동으로 포함하고, 본문 글자수에 맞춰 3개 분량 버전으로 제공해주십시오:
- **버전 1: 1500자**
- **버전 2: 2000자**
- **버전 3: 2500자**

추가로, 원고 마지막 마무리에 '직접 예약하기', '전화 문의', '길 찾기 링크' 등을 넣을 수 있도록 전환율 높은 마무리 CTA 양식도 구체적으로 제시하십시오.
        `;
        break;

      case 'experience-recruit':
        prompt = `
소기업/소상공인 맞춤 네이버 블로그/인스타 체험단 모집 공고를 생성합니다.
[입력 정보]
- 업체명: ${inputs.businessName}
- 모집 인원수: ${inputs.recruitCount}명
- 체험 제공 세부 내역: ${inputs.benefits}
- 진행 유형: ${inputs.type === 'visit' ? '오프라인 매장 직접 방문형' : '원격 상품 가정 내 배송형'}

[수행할 작업]
마케팅 체험단이 모집 소식을 보고 주도적으로 활발히 신청하도록 유도하는 상세 공지사항을 작성해 주십시오. 모집 글 양식은 다음 세 가지 섹션을 필수 포함해야 합니다:
1. **체험단 상세 모집 요강**: 모집 일정, 발표 일정, 당첨 인원, 상세 혜택
2. **리뷰 작성 필수 주의사항 (미션)**: 해시태그 규칙, 사진/동영상 첨부 개수, 매장 인지도 제고 미션
3. **간편 신청 양식과 방법**: 네이버 폼이나 댓글 신청 구조
        `;
        break;

      case 'instagram-script':
        prompt = `
소매업 마케팅용 인스타그램 종합 퍼블리싱 세트를 제작합니다.
[입력 정보]
- 업종: ${inputs.industry}
- 주력 제품/서비스명: ${inputs.productName}
- 프로모션/이벤트 성격: ${inputs.event}

[수행할 작업]
피드 본문과 숏폼(Reels) 영상 제작에 바로 이용할 수 있는 고감도 카피 패키지를 구성해 주세요.
출력 구성은 이 세 가지를 무조건 포함하십시오:
1. **인스타 피드용 본문 게시글**: 흥미를 자극하고 줄바꿈과 이모지가 적절히 섞인 트렌디한 문구
2. **짧은 숏폼 릴스(Reels) 대본**: 15초~30초용 자막 타이밍, 오프닝 훅, 화자 멘트, 시각 효과 제안이 들어간 완전한 촬영 대본
3. **최적의 연관 해시태그 30개**: 대형 해시태그, 타겟팅용 중형 해시태그, 상세 롱테일 태그를 정밀 조합하여 로봇 노출 극대화
        `;
        break;

      case 'advert-copy':
        prompt = `
네이버 성과형 디스플레이, 키워드 광고 및 파워링크에 사용할 다채로운 광고 카피 리스트를 대량 생산합니다.
[입력 정보]
- 업종: ${inputs.industry}
- 상품/지점명: ${inputs.productName}
- 행사/이벤트 핵심 내용: ${inputs.eventContent}

[수행할 작업]
고객의 주목 행동을 강력하게 이끌어내는 클릭 최적화 마케팅 광고 카피를 정밀 제작해주세요.
각 카피는 사용자가 편하게 보고 골라 쓸 수 있도록 줄바꿈으로 번호를 메겨 다음과 같이 대하단으로 뽑아주십시오:
- 실전 즉시 활용 가능한 **광고 헤드라인 제목 20개** (혜택 강조형, 질문형, 선착순 자극형, 위기감 조성형 등 다양하게 변화)
- 전달력을 확대해주는 **광고 설명문(Body Text) 20개**
- 클릭 전환율을 최고로 올려주는 매력적인 **CTA(행동양식 유도) 문구 20개**
        `;
        break;

      case 'naver-seo':
        prompt = `
네이버 포털 검색 및 플레이스 노출을 지배할 타겟 키워드 추천 리스트를 설계합니다.
[입력 정보]
- 타겟 지역명: ${inputs.region}
- 타겟 업종: ${inputs.industry}

[수행할 작업]
실제 소비자가 네이버에서 해당 카테고리를 찾을 때 검색하는 핵심 유인 키워드 조합 로직에 맞게 분류하여 풍성하게 제공해주세요. 각 키워드는 실제 사용성 관점에서 예제와 함께 마케팅 효과까지 상세히 해설해야 합니다:
1. **플레이스 상위 랭킹을 겨냥할 메인 키워드 (지역+업종 대표)**
2. **경쟁을 피해 바로 진입하기 좋은 중소형 서브 키워드 (상권+특성)**
3. **구매 전환 의도가 극히 높은 고농도 롱테일 키워드 (미시 검색어, 해결책 갈망형)**
        `;
        break;

      case 'store-intro':
        prompt = `
네이버 스마트플레이스 및 다각채널 노출을 위한 프리미엄 업체 소개서 원고를 조율합니다.
[입력 정보]
- 업체명: ${inputs.businessName}
- 업종: ${inputs.industry}
- 업체의 차별화된 특장점/스토리: ${inputs.features}

[수행할 작업]
소비자의 지갑을 열고 깊은 영감을 줄 수 있는 완벽한 신용 구축 브랜드 소개글을 채널 목적에 부합하게 3가지 규격 버전으로 나누어 생성하십시오:
1. **네이버 플레이스 등록용 소개글 (공백 포함 400~500자 요약형)**
2. **자사 홈페이지 또는 블로그 대문 공지용 브랜드스토리 버전 (1000자 내외 고해상도 버전)**
3. **가맹 유치, 투자, 혹은 공식 협약에 쓸 수 있는 대외용 격식 있는 회사소개서 버전 (1500자 고품격 버전)**
        `;
        break;

      case 'lead-cta':
        prompt = `
잠재 고객이 질문을 대대적으로 멈추고 직접 1초 만에 예약/상담 신청을 하도록 등 떠미는 심리 기법의 전환 안내 가이드 카피를 제작합니다.
[입력 정보]
- 업종: ${inputs.industry}
- 구체적 서비스/상담 내용: ${inputs.serviceDetail}

[수행할 작업]
이탈하려는 잠재 고객의 이목을 묶고 빠른 문의 신청 및 전화 통화, 카카오톡 상담, 예약 행동을 적극 생성하게 유도하는 특화 카피 세트를 출력하십시오:
1. **상담 신청 유도 문구(Body Lead Copy) 10종**
2. **배너 이미지/카드뉴스용 문구(Banner Typography Copy) 10종**
3. **즉각 조치를 가속화하는 CTA 버튼 문구(Button CTA Copy) 10종**
        `;
        break;

      default:
        return res.status(400).json({ error: 'Unsupported or unrecognized toolId.' });
    }

    console.log(`Starting Gemini Generation for toolId: ${toolId}...`);
    
    // Call generateContent using standard v2 `@google/genai` pattern
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.85,
      },
    });

    const outputText = response.text || 'AI 생성 결과가 공백입니다. 입력 데이터를 보완해주세요.';
    return res.json({ text: outputText });

  } catch (err: any) {
    console.error('Gemini Backend integration Error:', err);
    // Graceful error propagation back to client with robust detail
    return res.status(500).json({
      error: 'Gemini 생성 중 문제 발생: ' + (err.message || String(err)),
      details: err.stack,
    });
  }
});

// Configure Vite or Static production serving
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: Initialize Vite server
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteInstance.middlewares);
    console.log('Serving using Vite Middleware in Development.');
  } else {
    // In production: Serve pre-built static files in /dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files in Production.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express dev server actively listening on http://localhost:${PORT}`);
  });
}

initializeServer().catch((error) => {
  console.error('Fatal issue during server boot initialization:', error);
});
