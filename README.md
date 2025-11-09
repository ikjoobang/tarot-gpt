# 🔮 AI 타로 상담 서비스

GPT-3.5를 활용한 지능형 타로 리딩 웹 서비스 (Cloudflare Pages 배포)

## 📋 프로젝트 개요

- **프레임워크**: Hono (Cloudflare Workers/Pages)
- **AI**: OpenAI GPT-3.5-turbo
- **배포**: Cloudflare Pages
- **디자인**: TailwindCSS, 글라스모피즘

## 🎨 주요 기능

### ✅ 완료된 기능

1. **타로 리딩**
   - 원 카드 리딩 (간단한 질문)
   - 쓰리 카드 리딩 (과거-현재-미래)
   - GPT-3.5가 실시간 해석 제공

2. **78장 타로 덱**
   - 메이저 아르카나 22장
   - 마이너 아르카나 56장 (완드, 컵, 검, 펜타클)
   - 각 카드의 의미와 키워드

3. **인터랙티브 UI**
   - 카드 선택 애니메이션
   - 실시간 리딩 결과
   - 모바일 반응형 디자인

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
- **상태**: 배포 진행 중
- **비용**: 완전 무료

## 🔐 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키 (필수)

## 💡 다음 개발 예정 기능

- [ ] 오늘의 운세 (데일리 카드)
- [ ] 리딩 히스토리 저장
- [ ] 다양한 스프레드 추가 (켈틱 크로스 등)
- [ ] 카드 이미지 추가
- [ ] 사용자 계정 기능

## 📧 문의

- **Email**: ikjoobang@gmail.com
- **GitHub**: https://github.com/ikjoobang

## 📄 라이선스

MIT License

---

**마지막 업데이트**: 2025-11-09
