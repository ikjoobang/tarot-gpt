import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import OpenAI from 'openai'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './' }))

// 타로 카드 데이터 (78장 전체)
const tarotCards = [
  // 메이저 아르카나 (0-21)
  { id: 0, name: "바보(The Fool)", image: "00-fool.jpg", suit: "major", emoji: "⭐", keywords: "새로운 시작, 순수함, 자유" },
  { id: 1, name: "마법사(The Magician)", image: "01-magician.jpg", suit: "major", keywords: "창조력, 의지력, 기술" },
  { id: 2, name: "여사제(The High Priestess)", image: "02-high-priestess.jpg", suit: "major", keywords: "직관, 신비, 잠재의식" },
  { id: 3, name: "여황제(The Empress)", image: "03-empress.jpg", suit: "major", keywords: "풍요, 모성, 창조성" },
  { id: 4, name: "황제(The Emperor)", image: "04-emperor.jpg", suit: "major", keywords: "권위, 구조, 안정" },
  { id: 5, name: "교황(The Hierophant)", image: "05-hierophant.jpg", suit: "major", keywords: "전통, 교육, 믿음" },
  { id: 6, name: "연인(The Lovers)", image: "06-lovers.jpg", suit: "major", keywords: "사랑, 선택, 조화" },
  { id: 7, name: "전차(The Chariot)", image: "07-chariot.jpg", suit: "major", keywords: "의지, 승리, 결단" },
  { id: 8, name: "힘(Strength)", image: "08-strength.jpg", suit: "major", keywords: "용기, 인내, 자제력" },
  { id: 9, name: "은둔자(The Hermit)", image: "09-hermit.jpg", suit: "major", keywords: "성찰, 지혜, 고독" },
  { id: 10, name: "운명의 수레바퀴(Wheel of Fortune)", image: "10-wheel-of-fortune.jpg", suit: "major", keywords: "변화, 운명, 순환" },
  { id: 11, name: "정의(Justice)", image: "11-justice.jpg", suit: "major", keywords: "균형, 진실, 공정" },
  { id: 12, name: "거꾸로 매달린 사람(The Hanged Man)", image: "12-hanged-man.jpg", suit: "major", keywords: "희생, 관점의 전환, 깨달음" },
  { id: 13, name: "죽음(Death)", image: "13-death.jpg", suit: "major", keywords: "변화, 종결, 새로운 시작" },
  { id: 14, name: "절제(Temperance)", image: "14-temperance.jpg", suit: "major", keywords: "균형, 조화, 절제" },
  { id: 15, name: "악마(The Devil)", image: "15-devil.jpg", suit: "major", keywords: "속박, 집착, 유혹" },
  { id: 16, name: "탑(The Tower)", image: "16-tower.jpg", suit: "major", keywords: "급격한 변화, 파괴, 깨달음" },
  { id: 17, name: "별(The Star)", image: "17-star.jpg", suit: "major", keywords: "희망, 영감, 평온" },
  { id: 18, name: "달(The Moon)", image: "18-moon.jpg", suit: "major", keywords: "무의식, 두려움, 환상" },
  { id: 19, name: "태양(The Sun)", image: "19-sun.jpg", suit: "major", keywords: "기쁨, 성공, 활력" },
  { id: 20, name: "심판(Judgement)", image: "20-judgement.jpg", suit: "major", keywords: "부활, 결정, 평가" },
  { id: 21, name: "세계(The World)", image: "21-world.jpg", suit: "major", keywords: "완성, 성취, 통합" },

  // 완드(Wands) 수트
  { id: 22, name: "완드 에이스", image: "wands-01.jpg", suit: "wands", keywords: "창조적 에너지, 새로운 프로젝트" },
  { id: 23, name: "완드 2", image: "wands-02.jpg", suit: "wands", keywords: "계획, 미래 전망" },
  { id: 24, name: "완드 3", image: "wands-03.jpg", suit: "wands", keywords: "확장, 전망" },
  { id: 25, name: "완드 4", image: "wands-04.jpg", suit: "wands", keywords: "축하, 조화" },
  { id: 26, name: "완드 5", image: "wands-05.jpg", suit: "wands", keywords: "갈등, 경쟁" },
  { id: 27, name: "완드 6", image: "wands-06.jpg", suit: "wands", keywords: "승리, 인정" },
  { id: 28, name: "완드 7", image: "wands-07.jpg", suit: "wands", keywords: "도전, 용기" },
  { id: 29, name: "완드 8", image: "wands-08.jpg", suit: "wands", keywords: "빠른 행동, 소식" },
  { id: 30, name: "완드 9", image: "wands-09.jpg", suit: "wands", keywords: "회복력, 경계" },
  { id: 31, name: "완드 10", image: "wands-10.jpg", suit: "wands", keywords: "부담, 책임" },
  { id: 32, name: "완드 페이지", image: "wands-page.jpg", suit: "wands", keywords: "열정, 탐험" },
  { id: 33, name: "완드 나이트", image: "wands-knight.jpg", suit: "wands", keywords: "모험, 충동" },
  { id: 34, name: "완드 퀸", image: "wands-queen.jpg", suit: "wands", keywords: "자신감, 독립" },
  { id: 35, name: "완드 킹", image: "wands-king.jpg", suit: "wands", keywords: "리더십, 비전" },

  // 컵(Cups) 수트
  { id: 36, name: "컵 에이스", image: "cups-01.jpg", suit: "cups", keywords: "새로운 사랑, 감정" },
  { id: 37, name: "컵 2", image: "cups-02.jpg", suit: "cups", keywords: "파트너십, 연결" },
  { id: 38, name: "컵 3", image: "cups-03.jpg", suit: "cups", keywords: "축하, 우정" },
  { id: 39, name: "컵 4", image: "cups-04.jpg", suit: "cups", keywords: "무관심, 명상" },
  { id: 40, name: "컵 5", image: "cups-05.jpg", suit: "cups", keywords: "상실, 후회" },
  { id: 41, name: "컵 6", image: "cups-06.jpg", suit: "cups", keywords: "향수, 순수" },
  { id: 42, name: "컵 7", image: "cups-07.jpg", suit: "cups", keywords: "선택, 환상" },
  { id: 43, name: "컵 8", image: "cups-08.jpg", suit: "cups", keywords: "떠남, 탐색" },
  { id: 44, name: "컵 9", image: "cups-09.jpg", suit: "cups", keywords: "만족, 소원 성취" },
  { id: 45, name: "컵 10", image: "cups-10.jpg", suit: "cups", keywords: "행복, 가족" },
  { id: 46, name: "컵 페이지", image: "cups-page.jpg", suit: "cups", keywords: "창의성, 직관" },
  { id: 47, name: "컵 나이트", image: "cups-knight.jpg", suit: "cups", keywords: "로맨스, 매력" },
  { id: 48, name: "컵 퀸", image: "cups-queen.jpg", suit: "cups", keywords: "공감, 감성" },
  { id: 49, name: "컵 킹", image: "cups-king.jpg", suit: "cups", keywords: "감정 성숙, 외교" },

  // 검(Swords) 수트
  { id: 50, name: "검 에이스", image: "swords-01.jpg", suit: "swords", keywords: "명확함, 진실" },
  { id: 51, name: "검 2", image: "swords-02.jpg", suit: "swords", keywords: "결정, 균형" },
  { id: 52, name: "검 3", image: "swords-03.jpg", suit: "swords", keywords: "상처, 슬픔" },
  { id: 53, name: "검 4", image: "swords-04.jpg", suit: "swords", keywords: "휴식, 회복" },
  { id: 54, name: "검 5", image: "swords-05.jpg", suit: "swords", keywords: "갈등, 패배" },
  { id: 55, name: "검 6", image: "swords-06.jpg", suit: "swords", keywords: "전환, 여행" },
  { id: 56, name: "검 7", image: "swords-07.jpg", suit: "swords", keywords: "전략, 기만" },
  { id: 57, name: "검 8", image: "swords-08.jpg", suit: "swords", keywords: "제약, 혼란" },
  { id: 58, name: "검 9", image: "swords-09.jpg", suit: "swords", keywords: "불안, 악몽" },
  { id: 59, name: "검 10", image: "swords-10.jpg", suit: "swords", keywords: "종결, 바닥" },
  { id: 60, name: "검 페이지", image: "swords-page.jpg", suit: "swords", keywords: "호기심, 경계" },
  { id: 61, name: "검 나이트", image: "swords-knight.jpg", suit: "swords", keywords: "행동, 충동" },
  { id: 62, name: "검 퀸", image: "swords-queen.jpg", suit: "swords", keywords: "지성, 독립" },
  { id: 63, name: "검 킹", image: "swords-king.jpg", suit: "swords", keywords: "권위, 진실" },

  // 펜타클(Pentacles) 수트
  { id: 64, name: "펜타클 에이스", image: "pentacles-01.jpg", suit: "pentacles", keywords: "새로운 기회, 번영" },
  { id: 65, name: "펜타클 2", image: "pentacles-02.jpg", suit: "pentacles", keywords: "균형, 적응" },
  { id: 66, name: "펜타클 3", image: "pentacles-03.jpg", suit: "pentacles", keywords: "협력, 기술" },
  { id: 67, name: "펜타클 4", image: "pentacles-04.jpg", suit: "pentacles", keywords: "안정, 소유" },
  { id: 68, name: "펜타클 5", image: "pentacles-05.jpg", suit: "pentacles", keywords: "재정 어려움, 고립" },
  { id: 69, name: "펜타클 6", image: "pentacles-06.jpg", suit: "pentacles", keywords: "관대함, 나눔" },
  { id: 70, name: "펜타클 7", image: "pentacles-07.jpg", suit: "pentacles", keywords: "평가, 인내" },
  { id: 71, name: "펜타클 8", image: "pentacles-08.jpg", suit: "pentacles", keywords: "장인정신, 근면" },
  { id: 72, name: "펜타클 9", image: "pentacles-09.jpg", suit: "pentacles", keywords: "성취, 사치" },
  { id: 73, name: "펜타클 10", image: "pentacles-10.jpg", suit: "pentacles", keywords: "유산, 부" },
  { id: 74, name: "펜타클 페이지", image: "pentacles-page.jpg", suit: "pentacles", keywords: "야망, 실용성" },
  { id: 75, name: "펜타클 나이트", image: "pentacles-knight.jpg", suit: "pentacles", keywords: "책임감, 성실" },
  { id: 76, name: "펜타클 퀸", image: "pentacles-queen.jpg", suit: "pentacles", keywords: "양육, 실용성" },
  { id: 77, name: "펜타클 킹", image: "pentacles-king.jpg", suit: "pentacles", keywords: "풍요, 비즈니스" }
]

// API 엔드포인트: 타로 카드 목록
app.get('/api/cards', (c) => {
  return c.json(tarotCards)
})

// API 엔드포인트: 타로 리딩 (GPT-4o-mini 연동)
app.post('/api/reading', async (c) => {
  try {
    const { cards, question, spread } = await c.req.json()
    
    if (!cards || cards.length === 0) {
      return c.json({ error: '카드를 선택해주세요.' }, 400)
    }

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY
    })

    const cardDescriptions = cards.map((card: any, index: number) => 
      `${index + 1}번 카드: ${card.name}
   - 키워드: ${card.keywords}
   - 수트: ${card.suit}
   - 위치: ${spread === 'single' ? '현재' : spread === 'three-card' ? ['과거', '현재', '미래'][index] : `포지션 ${index + 1}`}`
    ).join('\n\n')

    const systemPrompt = `당신은 30년 경력의 전문 타로 마스터이자 심리 상담가입니다.

3,000장 분량의 타로 해석 데이터베이스를 바탕으로, 각 카드의 깊은 상징과 의미를 이해하고 있습니다.

당신의 해석은:
- 각 카드의 역사적, 신화적 배경을 포함
- 심리학적 관점에서의 해석
- 실생활에 적용 가능한 구체적인 조언
- 타임라인별 상세한 전망
- 주의사항과 극복 방법

반드시 다음 구조로 작성하세요:

## ❶ 전체 운세의 흐름

3-4개 문단으로 전체적인 에너지와 메시지를 설명합니다.

• 한 문단은 3-4줄로 구성
• 핵심 메시지는 **굵게** 강조
• 각 문단 사이에 빈 줄 추가

## ❷ 각 카드 상세 해석

### ■ [카드 위치]: [카드 이름]

**✦ 상징과 의미**

2-3문단으로 카드의 깊은 상징, 신화적 배경, 전통적 해석을 설명합니다.

**✦ 현재 상황에서의 메시지**

2-3문단으로 질문과 연결하여 구체적으로 해석합니다.

**✦ 심리적 관점**

1-2문단으로 내면의 상태, 감정, 무의식적 패턴을 분석합니다.

## ❸ 실천 가능한 조언

### ✔️ 즉시 실행 가능한 행동

• 구체적인 액션 아이템 1
• 구체적인 액션 아이템 2
• 구체적인 액션 아이템 3

각 항목은 한 줄로 간결하게, 바로 실천 가능해야 합니다.

### → 장기적 관점의 조언

**1개월 후**
(구체적인 전망과 조언)

**3개월 후**
(구체적인 전망과 조언)

**6개월 후**
(구체적인 전망과 조언)

## ❹ 주의사항

• 주의사항 1 (이유와 함께)
• 주의사항 2 (이유와 함께)
• 주의사항 3 (이유와 함께)

## ❺ 긍정적 변화를 위한 제안

• 제안 1 (구체적이고 실천 가능하게)
• 제안 2 (구체적이고 실천 가능하게)
• 제안 3 (구체적이고 실천 가능하게)

---

최소 A4 용지 1장 분량(약 1,500-2,000자)으로 작성하되, 각 섹션을 명확히 구분하고 가독성 있게 작성하세요.
따뜻하고 공감적이면서도 전문적인 톤을 유지하세요.`

    const userPrompt = `
질문자의 고민: "${question}"

스프레드 방식: ${spread === 'single' ? '원 카드 리딩 (현재 에너지 집중)' : '쓰리 카드 스프레드 (과거-현재-미래)'}

뽑힌 카드 정보:
${cardDescriptions}

---

위 카드들을 바탕으로 질문자에게 깊이 있고 상세한 타로 리딩을 제공해주세요.
각 카드의 상징과 의미를 충분히 설명하고, 실생활에 적용 가능한 구체적인 조언을 포함해주세요.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000
    })

    const reading = completion.choices[0].message.content

    return c.json({
      reading,
      cards,
      question,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('타로 리딩 오류:', error)
    
    if (error.code === 'insufficient_quota') {
      return c.json({ 
        error: 'OpenAI API 크레딧이 부족합니다. API 키를 확인해주세요.' 
      }, 402)
    }
    
    return c.json({ 
      error: '타로 리딩 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 헬스 체크
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openai: c.env.OPENAI_API_KEY ? 'configured' : 'missing'
  })
})

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔮 Studiojuai Tarot</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #000000;
                color: #FFFFFF;
                line-height: 1.6;
                min-height: 100vh;
            }
            
            .container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px 16px;
            }
            
            @media (min-width: 481px) and (max-width: 768px) {
                .container {
                    max-width: 700px;
                    padding: 24px 32px;
                }
            }
            
            @media (min-width: 769px) {
                .container {
                    max-width: 1200px;
                    padding: 40px 60px;
                }
            }
            
            .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid #333333;
            }
            
            .header h1 {
                font-size: 18px;
                font-weight: 700;
                background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            .header p {
                font-size: 12px;
                color: #CCCCCC;
                line-height: 1.5;
                margin-bottom: 2px;
            }
            
            .section {
                background: #1a1a1a;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
            }
            
            .section-title {
                font-size: 14px;
                font-weight: 600;
                color: #FFFFFF;
                margin-bottom: 12px;
            }
            
            .input-field {
                width: 100%;
                background: #000000;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 10px 12px;
                color: #FFFFFF;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                resize: vertical;
                transition: border-color 0.2s;
            }
            
            .input-field:focus {
                outline: none;
                border-color: #FF6B35;
            }
            
            .input-field::placeholder {
                color: #666666;
            }
            
            .spread-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .spread-btn {
                background: #000000;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 12px;
                color: #CCCCCC;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            
            .spread-btn:hover {
                border-color: #FF6B35;
                color: #FFFFFF;
            }
            
            .spread-btn.active {
                background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
                border-color: #FF6B35;
                color: #FFFFFF;
            }
            
            .spread-icon {
                display: block;
                font-size: 24px;
                margin-bottom: 4px;
            }
            
            .spread-name {
                display: block;
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .spread-desc {
                display: block;
                font-size: 12px;
                color: #999999;
            }
            
            .deck-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 6px;
                margin-bottom: 12px;
            }
            
            .card-item {
                aspect-ratio: 2/3;
                background: #000000;
                border: 1px solid #333333;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
                padding: 4px;
                text-align: center;
            }
            
            .card-item:hover {
                border-color: #FF6B35;
                transform: scale(1.05);
            }
            
            .card-item.selected {
                border-color: #FF6B35;
                background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
            }
            
            .card-back {
                font-size: 20px;
            }
            
            .card-front {
                font-size: 8px;
                color: #FFFFFF;
                word-break: keep-all;
                line-height: 1.2;
            }
            
            .btn {
                width: 100%;
                background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
                border: none;
                border-radius: 8px;
                padding: 10px 20px;
                color: #FFFFFF;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
                font-family: 'Inter', sans-serif;
            }
            
            .btn:hover:not(:disabled) {
                opacity: 0.9;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-secondary {
                background: #1a1a1a;
                border: 1px solid #333333;
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: #000000;
                opacity: 1;
            }
            
            .card-counter {
                color: #FF6B35;
                font-weight: 600;
            }
            
            .selected-cards {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .selected-card {
                background: #000000;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 12px;
            }
            
            .card-position {
                font-size: 12px;
                color: #FF6B35;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .card-name {
                font-size: 14px;
                font-weight: 600;
                color: #FFFFFF;
                margin-bottom: 2px;
            }
            
            .card-keywords {
                font-size: 12px;
                color: #CCCCCC;
            }
            
            .result-question {
                background: #000000;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            }
            
            .result-question strong {
                color: #FF6B35;
                font-size: 12px;
            }
            
            .result-question span {
                color: #FFFFFF;
                font-size: 14px;
            }
            
            .result-reading {
                background: #000000;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 16px;
                font-size: 17px;
                line-height: 1.7;
                letter-spacing: -0.02em;
                color: #CCCCCC;
                max-height: 600px;
                overflow-y: auto;
            }
            
            @media (min-width: 769px) {
                .result-reading {
                    font-size: 16px;
                    line-height: 1.6;
                    letter-spacing: -0.01em;
                    padding: 24px 32px;
                    max-width: 720px;
                    margin: 0 auto;
                }
            }
            
            .result-reading h2 {
                color: #FF6B35;
                font-size: 18px;
                font-weight: 700;
                margin: 24px 0 16px 0;
                padding-top: 16px;
                border-top: 1px solid #333333;
            }
            
            .result-reading h2:first-child {
                margin-top: 0;
                padding-top: 0;
                border-top: none;
            }
            
            .result-reading h3 {
                color: #FF8C42;
                font-size: 16px;
                font-weight: 600;
                margin: 16px 0 12px 0;
            }
            
            @media (min-width: 769px) {
                .result-reading h2 {
                    font-size: 20px;
                    margin: 32px 0 20px 0;
                }
                
                .result-reading h3 {
                    font-size: 17px;
                }
            }
            
            .result-reading strong {
                color: #FFFFFF;
                font-weight: 600;
            }
            
            .result-reading p {
                margin-bottom: 12px;
            }
            
            .result-reading ul {
                margin: 8px 0 12px 20px;
            }
            
            .result-reading li {
                margin-bottom: 6px;
            }
            
            .loading-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .loading-content {
                text-align: center;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #333333;
                border-top-color: #FF6B35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-text {
                font-size: 14px;
                color: #CCCCCC;
            }
            
            .hidden {
                display: none;
            }
            
            .footer {
                text-align: center;
                padding: 20px 16px;
                border-top: 1px solid #333333;
                margin-top: 20px;
            }
            
            .footer-links {
                font-size: 12px;
                color: #CCCCCC;
                line-height: 1.6;
            }
            
            .footer-links a {
                color: #FF6B35;
                text-decoration: none;
                transition: color 0.2s;
            }
            
            .footer-links a:hover {
                color: #FF8C42;
            }
            
            @media (max-width: 480px) {
                .deck-grid {
                    grid-template-columns: repeat(6, 1fr);
                }
            }
            
            @media (min-width: 481px) and (max-width: 768px) {
                .deck-grid {
                    grid-template-columns: repeat(8, 1fr);
                }
            }
            
            @media (min-width: 769px) {
                .deck-grid {
                    grid-template-columns: repeat(13, 1fr);
                }
                
                .section-title {
                    font-size: 16px;
                }
                
                .input-field {
                    font-size: 15px;
                    padding: 14px 16px;
                }
                
                .spread-btn {
                    padding: 16px;
                    font-size: 15px;
                }
                
                .spread-icon {
                    font-size: 32px;
                }
            }
            
            .download-buttons {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .download-buttons .btn {
                flex: 1;
                font-size: 13px;
                padding: 8px 16px;
            }
            
            @media (min-width: 769px) {
                .download-buttons .btn {
                    font-size: 14px;
                    padding: 10px 20px;
                }
            }
        </style>
    </head>
    <body>
        <!-- 로딩 오버레이 -->
        <div id="loading-overlay" class="loading-overlay hidden">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div id="loading-text" class="loading-text">타로 카드를 준비하는 중...</div>
            </div>
        </div>

        <div class="container">
            <!-- 헤더 -->
            <header class="header">
                <h1>🔮 Studiojuai_Tarot_타로</h1>
                <p>AI + 3,000장 분량의 프롬프트를</p>
                <p>78장 타로 카드로 해석하는 노하우</p>
            </header>

            <!-- 질문 입력 -->
            <section id="question-section" class="section">
                <h2 class="section-title">무엇이 궁금하신가요?</h2>
                <textarea 
                    id="question-input" 
                    class="input-field"
                    placeholder="예: 나의 연애운은 어떤가요?
예: 이직을 해도 될까요?
예: 사업은 잘 될까요?"
                    rows="3"
                ></textarea>
            </section>

            <!-- 스프레드 선택 -->
            <section id="spread-section" class="section">
                <h2 class="section-title">리딩 방식 선택</h2>
                <div class="spread-options">
                    <button class="spread-btn active" data-spread="single" data-count="1">
                        <span class="spread-icon">🎴</span>
                        <span class="spread-name">원 카드</span>
                        <span class="spread-desc">간단한 질문</span>
                    </button>
                    <button class="spread-btn" data-spread="three-card" data-count="3">
                        <span class="spread-icon">🃏</span>
                        <span class="spread-name">쓰리 카드</span>
                        <span class="spread-desc">과거-현재-미래</span>
                    </button>
                </div>
            </section>

            <!-- 카드 덱 -->
            <section id="deck-section" class="section hidden">
                <h2 class="section-title">카드를 선택하세요 <span id="card-counter" class="card-counter">(0/1)</span></h2>
                <div id="deck-container" class="deck-grid"></div>
                <button id="start-reading-btn" class="btn" disabled>타로 리딩 시작하기</button>
            </section>

            <!-- 선택된 카드 -->
            <section id="selected-section" class="section hidden">
                <h2 class="section-title">선택하신 카드</h2>
                <div id="selected-cards" class="selected-cards"></div>
            </section>

            <!-- 리딩 결과 -->
            <section id="result-section" class="section hidden">
                <h2 class="section-title">타로 리딩 결과</h2>
                <div class="result-question">
                    <strong>질문:</strong> <span id="result-question-text"></span>
                </div>
                <div id="result-cards" class="selected-cards" style="margin-bottom: 12px;"></div>
                <div id="result-reading" class="result-reading"></div>
                <div class="download-buttons">
                    <button onclick="location.reload()" class="btn btn-secondary">다시 타로 보기</button>
                    <button onclick="downloadTXT()" class="btn btn-secondary">TXT 다운 📄</button>
                    <button onclick="downloadImage()" class="btn btn-secondary">이미지 저장 🖼️</button>
                </div>
            </section>

            <!-- 푸터 -->
            <footer class="footer">
                <div class="footer-links">
                    <a href="https://www.studiojuai.com" target="_blank">https://www.studiojuai.com</a><br>
                    <a href="https://twitter.com/STUDIO_JU_AI" target="_blank">@STUDIO_JU_AI</a><br>
                    © 2025. ALL RIGHTS RESERVED.<br>
                    <a href="mailto:ikjoobang@gmail.com">ikjoobang@gmail.com</a>
                </div>
            </footer>
        </div>

        <script>
            let allCards = [];
            let selectedCards = [];
            let requiredCardCount = 1;
            let currentSpread = 'single';

            const loadingOverlay = document.getElementById('loading-overlay');
            const questionInput = document.getElementById('question-input');
            const spreadButtons = document.querySelectorAll('.spread-btn');
            const deckSection = document.getElementById('deck-section');
            const deckContainer = document.getElementById('deck-container');
            const cardCounter = document.getElementById('card-counter');
            const startReadingBtn = document.getElementById('start-reading-btn');
            const selectedSection = document.getElementById('selected-section');
            const selectedCardsContainer = document.getElementById('selected-cards');
            const resultSection = document.getElementById('result-section');

            async function init() {
                try {
                    showLoading('타로 카드를 준비하는 중...');
                    
                    const response = await fetch('/api/cards');
                    if (!response.ok) throw new Error('카드 데이터를 불러올 수 없습니다.');
                    
                    allCards = await response.json();
                    
                    hideLoading();
                    setupEventListeners();
                    
                } catch (error) {
                    console.error('초기화 오류:', error);
                    showLoading('❌ 카드를 불러오는데 실패했습니다.');
                }
            }

            function setupEventListeners() {
                spreadButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        spreadButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        
                        currentSpread = btn.dataset.spread;
                        requiredCardCount = parseInt(btn.dataset.count);
                        
                        selectedCards = [];
                        updateCardCounter();
                        renderDeck();
                        
                        deckSection.classList.remove('hidden');
                        selectedSection.classList.add('hidden');
                        resultSection.classList.add('hidden');
                    });
                });
                
                startReadingBtn.addEventListener('click', startReading);
            }

            // 수트별 이모지 반환
            function getSuitEmoji(suit) {
                const emojiMap = {
                    'major': '⭐',
                    'wands': '🔥',
                    'cups': '💧',
                    'swords': '⚔️',
                    'pentacles': '💰'
                };
                return emojiMap[suit] || '🔮';
            }

            // 수트별 색상 반환
            function getSuitGradient(suit) {
                const gradientMap = {
                    'major': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    'wands': 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
                    'cups': 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
                    'swords': 'linear-gradient(135deg, #708090 0%, #A9A9A9 100%)',
                    'pentacles': 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)'
                };
                return gradientMap[suit] || 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)';
            }

            function renderDeck() {
                deckContainer.innerHTML = '';
                
                const shuffled = [...allCards].sort(() => Math.random() - 0.5);
                
                shuffled.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card-item';
                    cardElement.dataset.cardId = card.id;
                    cardElement.innerHTML = '<div class="card-back">🔮</div>';
                    
                    cardElement.addEventListener('click', () => selectCard(card, cardElement));
                    
                    deckContainer.appendChild(cardElement);
                });
            }

            function selectCard(card, element) {
                if (selectedCards.length >= requiredCardCount) return;
                if (selectedCards.find(c => c.id === card.id)) return;
                
                selectedCards.push(card);
                element.classList.add('selected');
                
                const emoji = getSuitEmoji(card.suit);
                const gradient = getSuitGradient(card.suit);
                
                element.style.background = gradient;
                element.innerHTML = \`
                    <div class="card-front">
                        <div style="font-size: 24px; margin-bottom: 4px;">\${emoji}</div>
                        <div style="font-size: 9px; font-weight: 600; line-height: 1.2;">\${card.name}</div>
                    </div>
                \`;
                
                updateCardCounter();
                
                if (selectedCards.length === requiredCardCount) {
                    startReadingBtn.disabled = false;
                    showSelectedCards();
                }
            }

            function updateCardCounter() {
                cardCounter.textContent = \`(\${selectedCards.length}/\${requiredCardCount})\`;
                startReadingBtn.disabled = selectedCards.length < requiredCardCount;
            }

            function showSelectedCards() {
                selectedSection.classList.remove('hidden');
                selectedCardsContainer.innerHTML = '';
                
                selectedCards.forEach((card, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'selected-card';
                    const emoji = getSuitEmoji(card.suit);
                    cardDiv.innerHTML = \`
                        <div class="card-position">\${getPositionName(index)}</div>
                        <div class="card-name">\${emoji} \${card.name}</div>
                        <div class="card-keywords">\${card.keywords}</div>
                    \`;
                    selectedCardsContainer.appendChild(cardDiv);
                });
            }

            function getPositionName(index) {
                if (currentSpread === 'single') return '현재';
                if (currentSpread === 'three-card') {
                    return ['과거', '현재', '미래'][index];
                }
                return \`카드 \${index + 1}\`;
            }

            async function startReading() {
                const question = questionInput.value.trim();
                
                if (!question) {
                    alert('질문을 입력해주세요!');
                    questionInput.focus();
                    return;
                }
                
                try {
                    showLoading('AI가 타로를 해석하는 중...(약 30초 소요)');
                    
                    const response = await fetch('/api/reading', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            cards: selectedCards,
                            question: question,
                            spread: currentSpread
                        })
                    });
                    
                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || '리딩 중 오류가 발생했습니다.');
                    }
                    
                    const result = await response.json();
                    
                    hideLoading();
                    displayResult(result);
                    
                } catch (error) {
                    console.error('리딩 오류:', error);
                    hideLoading();
                    alert('❌ ' + error.message);
                }
            }

            function displayResult(result) {
                deckSection.classList.add('hidden');
                selectedSection.classList.add('hidden');
                resultSection.classList.remove('hidden');
                
                document.getElementById('result-question-text').textContent = result.question;
                
                const resultCardsContainer = document.getElementById('result-cards');
                resultCardsContainer.innerHTML = '';
                
                result.cards.forEach((card, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'selected-card';
                    const emoji = getSuitEmoji(card.suit);
                    cardDiv.innerHTML = \`
                        <div class="card-position">\${getPositionName(index)}</div>
                        <div class="card-name">\${emoji} \${card.name}</div>
                        <div class="card-keywords">\${card.keywords}</div>
                    \`;
                    resultCardsContainer.appendChild(cardDiv);
                });
                
                const readingContainer = document.getElementById('result-reading');
                readingContainer.innerHTML = formatReading(result.reading);
                
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

            function formatReading(text) {
                return text
                    .replace(/##\\s/g, '<h2>')
                    .replace(/###\\s/g, '<h3>')
                    .replace(/\\n(?=##)/g, '</h2>')
                    .replace(/\\n(?=###)/g, '</h3>')
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/^-\\s/gm, '<li>')
                    .replace(/\\n\\n/g, '</p><p>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                    .replace(/<p><li>/g, '<ul><li>')
                    .replace(/<\\/p>\\n<p><li>/g, '</li><li>')
                    .replace(/<li>(.*?)<\\/p>/g, '<li>$1</li></ul>');
            }

            function showLoading(text) {
                document.getElementById('loading-text').textContent = text;
                loadingOverlay.classList.remove('hidden');
            }

            function hideLoading() {
                loadingOverlay.classList.add('hidden');
            }

            // TXT 다운로드
            function downloadTXT() {
                const question = document.getElementById('result-question-text').textContent;
                const reading = document.getElementById('result-reading').innerText;
                const cardInfo = Array.from(document.querySelectorAll('#result-cards .selected-card')).map(card => {
                    const position = card.querySelector('.card-position').textContent;
                    const name = card.querySelector('.card-name').textContent;
                    const keywords = card.querySelector('.card-keywords').textContent;
                    return \`\${position}: \${name}\\n키워드: \${keywords}\`;
                }).join('\\n\\n');
                
                const content = \`🔮 Studiojuai Tarot 타로 리딩 결과
                
날짜: \${new Date().toLocaleString('ko-KR')}

질문: \${question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 선택하신 카드

\${cardInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

\${reading}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© 2025 STUDIO_JU_AI
https://www.studiojuai.com
ikjoobang@gmail.com\`;
                
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`타로리딩_\${new Date().getTime()}.txt\`;
                a.click();
                URL.revokeObjectURL(url);
            }
            
            // 이미지 다운로드
            function downloadImage() {
                const resultSection = document.getElementById('result-section');
                
                // html2canvas 라이브러리 동적 로드
                if (!window.html2canvas) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                    script.onload = () => captureAndDownload();
                    document.head.appendChild(script);
                } else {
                    captureAndDownload();
                }
                
                function captureAndDownload() {
                    html2canvas(resultSection, {
                        backgroundColor: '#000000',
                        scale: 2,
                        logging: false
                    }).then(canvas => {
                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = \`타로리딩_\${new Date().getTime()}.png\`;
                        a.click();
                    });
                }
            }

            window.addEventListener('DOMContentLoaded', init);
        </script>
    </body>
    </html>
  `)
})

export default app
