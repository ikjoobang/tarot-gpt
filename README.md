# 🔮 Studiojuai_Tarot_타로

AI + 3,000장 분량의 프롬프트를 78장 타로 카드로 해석하는 노하우

## 📋 프로젝트 개요

- **프레임워크**: Hono (Cloudflare Workers/Pages)
- **AI**: OpenAI GPT-4o-mini (고품질 A4 분량 해석)
- **배포**: Cloudflare Pages
- **디자인**: GenSpark 미니멀리즘 (#000000 배경, #FF6B35 강조색)

## 🎨 주요 기능

### ✅ 완료된 기능

1. **고품질 타로 리딩**
   - 원 카드 리딩 (간단한 질문)
   - 쓰리 카드 리딩 (과거-현재-미래)
   - GPT-4o-mini가 A4 3-4페이지 분량의 상세한 해석 제공
   - 이모지 넘버링 시스템 (❶❷❸❹❺ + ■✔️→)

2. **78장 타로 덱 비주얼**
   - 이모지 기반 수트 시스템 (⭐🔥💧⚔️💰)
   - 그라데이션 색상 코딩
   - 메이저 아르카나 22장 + 마이너 아르카나 56장

3. **반응형 UI/UX**
   - 모바일: 400px 컨테이너, 17px/1.7 타이포그래피
   - 태블릿: 600px 컨테이너 (481-768px)
   - 데스크톱: 800px 컨테이너, 16px/1.6 타이포그래피
   - 덱 그리드: 6/8/12 컬럼 반응형

4. **다운로드 기능**
   - TXT 다운로드: 타로 리딩 결과를 텍스트 파일로 저장
   - 이미지 다운로드: html2canvas로 결과 화면 캡처

## 🌐 API 엔드포인트

### 현재 작동 중인 엔드포인트

- `GET /` - 메인 페이지
- `GET /api/cards` - 78장 타로 카드 목록
- `POST /api/reading` - 타로 리딩 (GPT-3.5 해석)
- `GET /health` - 서버 상태 확인

### 사용 예시

```javascript
// 타로 카드 목록 가져오기
fetch('/api/cards')

// 타로 리딩 요청
fetch('/api/reading', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cards: [selectedCard1, selectedCard2],
    question: "나의 연애운은?",
    spread: "three-card"
  })
})
```

## 📊 데이터 구조

### 타로 카드 객체
```typescript
{
  id: number,          // 0-77
  name: string,        // "바보(The Fool)"
  image: string,       // "00-fool.jpg"
  suit: string,        // "major" | "wands" | "cups" | "swords" | "pentacles"
  keywords: string     // "새로운 시작, 순수함, 자유"
}
```

## 🚀 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 로컬 미리보기
npm run preview
```

## 🌐 배포 정보

- **플랫폼**: Cloudflare Pages
- **프로젝트**: tarot-gpt
- **상태**: ✅ 배포 완료 (2025-11-09)
- **최신 배포 URL**: https://87786b03.tarot-gpt.pages.dev
- **프로덕션 URL**: https://tarot-gpt.pages.dev
- **GitHub**: https://github.com/ikjoobang/tarot-gpt
- **비용**: 완전 무료

## 🔐 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키 (필수)

## 💡 기술 스펙

### 프롬프트 엔지니어링
- **3,000자 분량** 시스템 프롬프트
- **이모지 넘버링** 구조화 (❶ 전체 흐름 → ❺ 긍정 제안)
- **실천 가능한 조언** 포함 (즉시/1개월/3개월/6개월)
- **심리학적 관점** 통합

### 반응형 디자인
```
모바일: max-width: 400px, font: 17px/1.7
태블릿: max-width: 600px (481-768px)
데스크톱: max-width: 800px, font: 16px/1.6
리딩 영역: max-width: 720px (PC)
```

### 카드 시각화
```
⭐ 메이저 아르카나 - 금색 그라데이션
🔥 완드 - 빨강/주황 그라데이션
💧 컵 - 파랑 그라데이션
⚔️ 소드 - 회색 그라데이션
💰 펜타클 - 녹색 그라데이션
```

## 💡 다음 개발 예정 기능

- [ ] 오늘의 운세 (데일리 카드)
- [ ] 리딩 히스토리 저장 (Cloudflare D1)
- [ ] 다양한 스프레드 추가 (켈틱 크로스 등)
- [ ] 소셜 공유 기능
- [ ] 다국어 지원 (EN/JP)

## 📧 문의

- **Email**: ikjoobang@gmail.com
- **GitHub**: https://github.com/ikjoobang

## 📄 라이선스

MIT License

---

## 📸 주요 화면

### 메인 화면
- GenSpark 스타일 미니멀 디자인
- 78장 타로 덱 그리드 (반응형 6/8/12 컬럼)
- 수트별 이모지 및 그라데이션 색상

### 리딩 결과
- A4 3-4페이지 분량 GPT-4o-mini 해석
- 이모지 넘버링 구조 (❶❷❸❹❺)
- 실천 가능한 타임라인별 조언
- TXT/이미지 다운로드 버튼

---

**마지막 업데이트**: 2025-11-09
**버전**: v2.0 (Responsive + Download Features)
