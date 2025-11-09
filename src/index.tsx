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
  { id: 0, name: "바보(The Fool)", image: "00-fool.jpg", suit: "major", keywords: "새로운 시작, 순수함, 자유" },
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

  // 완드(Wands) 수트 - 불의 원소
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

  // 컵(Cups) 수트 - 물의 원소
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

  // 검(Swords) 수트 - 공기의 원소
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

  // 펜타클(Pentacles) 수트 - 땅의 원소
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

// API 엔드포인트: 타로 리딩 (GPT 연동)
app.post('/api/reading', async (c) => {
  try {
    const { cards, question, spread } = await c.req.json()
    
    if (!cards || cards.length === 0) {
      return c.json({ error: '카드를 선택해주세요.' }, 400)
    }

    // OpenAI 클라이언트 초기화
    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY
    })

    // GPT에게 전달할 프롬프트 구성
    const cardDescriptions = cards.map((card: any, index: number) => 
      `${index + 1}. ${card.name} (${card.keywords})`
    ).join('\n')

    const systemPrompt = `당신은 30년 경력의 전문 타로 리더입니다. 
사용자의 질문과 뽑힌 카드를 바탕으로 깊이 있고 구체적인 해석을 제공합니다.
해석은 다음 구조로 작성하세요:

1. **전체적인 메시지** (2-3문장)
2. **각 카드의 의미** (각 카드마다 구체적 해석)
3. **실천 조언** (구체적이고 실용적인 조언)

따뜻하고 공감적인 톤으로 작성하되, 명확하고 구체적으로 답변하세요.`

    const userPrompt = `질문: ${question || '일반적인 운세를 알려주세요'}
스프레드: ${spread}
뽑힌 카드:
${cardDescriptions}

위 카드들을 바탕으로 타로 리딩을 해주세요.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000
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
        <title>🔮 AI 타로 상담 - GPT 타로 리더</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .glass {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .tarot-card {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .tarot-card:hover {
                transform: translateY(-10px) scale(1.05);
            }
            .tarot-card.selected {
                border: 3px solid #fbbf24;
                box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
            }
            .loading-spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body class="p-4">
        <!-- 로딩 오버레이 -->
        <div id="loading-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="glass rounded-lg p-8 text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p id="loading-text" class="text-white text-lg">타로 카드를 준비하는 중...</p>
            </div>
        </div>

        <div class="max-w-6xl mx-auto">
            <!-- 헤더 -->
            <header class="text-center mb-8">
                <h1 class="text-5xl font-bold text-white mb-2">🔮 AI 타로 상담</h1>
                <p class="text-xl text-purple-200">GPT가 해석하는 당신의 운명</p>
            </header>

            <!-- 질문 입력 -->
            <section class="glass rounded-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-white mb-4">무엇이 궁금하신가요?</h2>
                <textarea 
                    id="question-input" 
                    class="w-full p-4 rounded-lg bg-white bg-opacity-20 text-white placeholder-purple-200 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="예: 나의 연애운은 어떤가요?&#10;예: 이직을 해도 될까요?&#10;예: 오늘 하루는 어떨까요?"
                    rows="3"
                ></textarea>
            </section>

            <!-- 스프레드 선택 -->
            <section class="glass rounded-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-white mb-4">리딩 방식 선택</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button class="spread-btn glass rounded-lg p-6 text-white hover:bg-white hover:bg-opacity-20 transition active" data-spread="single" data-count="1">
                        <div class="text-4xl mb-2">🃏</div>
                        <div class="text-xl font-bold mb-1">원 카드</div>
                        <div class="text-sm text-purple-200">간단한 질문</div>
                    </button>
                    <button class="spread-btn glass rounded-lg p-6 text-white hover:bg-white hover:bg-opacity-20 transition" data-spread="three-card" data-count="3">
                        <div class="text-4xl mb-2">🎴</div>
                        <div class="text-xl font-bold mb-1">쓰리 카드</div>
                        <div class="text-sm text-purple-200">과거-현재-미래</div>
                    </button>
                </div>
            </section>

            <!-- 카드 덱 -->
            <section id="deck-section" class="glass rounded-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-white mb-4">카드를 선택하세요 <span id="card-counter" class="text-yellow-300">(0/1)</span></h2>
                <div id="deck-container" class="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-13 gap-2 mb-6">
                    <!-- 카드들이 JavaScript로 생성됨 -->
                </div>
                <button id="start-reading-btn" class="w-full bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    타로 리딩 시작하기
                </button>
            </section>

            <!-- 선택된 카드 -->
            <section id="selected-section" class="glass rounded-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-white mb-4">선택하신 카드</h2>
                <div id="selected-cards" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
            </section>

            <!-- 리딩 결과 -->
            <section id="result-section" class="glass rounded-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-white mb-4">타로 리딩 결과</h2>
                <div class="bg-white bg-opacity-10 rounded-lg p-6">
                    <div class="mb-4">
                        <strong class="text-yellow-300">질문:</strong> 
                        <span id="result-question-text" class="text-white"></span>
                    </div>
                    <div id="result-cards" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"></div>
                    <div id="result-reading" class="text-white leading-relaxed"></div>
                    <button onclick="location.reload()" class="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        다시 점보기
                    </button>
                </div>
            </section>
        </div>

        <script>
            const API_BASE = '';
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
                    showLoading('❌ 카드를 불러오는데 실패했습니다. 새로고침해주세요.');
                }
            }

            function setupEventListeners() {
                spreadButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        spreadButtons.forEach(b => b.classList.remove('active', 'bg-white', 'bg-opacity-20'));
                        btn.classList.add('active', 'bg-white', 'bg-opacity-20');
                        
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

            function renderDeck() {
                deckContainer.innerHTML = '';
                
                const shuffled = [...allCards].sort(() => Math.random() - 0.5);
                
                shuffled.forEach((card, index) => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'tarot-card glass rounded-lg p-2 text-center text-white text-2xl';
                    cardElement.dataset.cardId = card.id;
                    cardElement.innerHTML = '🔮';
                    
                    cardElement.addEventListener('click', () => selectCard(card, cardElement));
                    
                    deckContainer.appendChild(cardElement);
                });
            }

            function selectCard(card, element) {
                if (selectedCards.length >= requiredCardCount) return;
                if (selectedCards.find(c => c.id === card.id)) return;
                
                selectedCards.push(card);
                element.classList.add('selected');
                
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
                    cardDiv.className = 'glass rounded-lg p-4 text-white';
                    cardDiv.innerHTML = \`
                        <div class="text-yellow-300 font-bold mb-2">\${getPositionName(index)}</div>
                        <div class="text-lg font-bold mb-1">\${card.name}</div>
                        <div class="text-sm text-purple-200">\${card.keywords}</div>
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
                    showLoading('AI가 타로를 해석하는 중...');
                    
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
                    cardDiv.className = 'glass rounded-lg p-4 text-white';
                    cardDiv.innerHTML = \`
                        <div class="text-yellow-300 font-bold mb-2">\${getPositionName(index)}</div>
                        <div class="text-lg font-bold">\${card.name}</div>
                    \`;
                    resultCardsContainer.appendChild(cardDiv);
                });
                
                const readingContainer = document.getElementById('result-reading');
                readingContainer.innerHTML = formatReading(result.reading);
                
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

            function formatReading(text) {
                return text
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-yellow-300">$1</strong>')
                    .replace(/\\n\\n/g, '</p><p class="mb-4">')
                    .replace(/^/, '<p class="mb-4">')
                    .replace(/$/, '</p>');
            }

            function showLoading(text) {
                document.getElementById('loading-text').textContent = text;
                loadingOverlay.classList.remove('hidden');
            }

            function hideLoading() {
                loadingOverlay.classList.add('hidden');
            }

            window.addEventListener('DOMContentLoaded', init);
        </script>
    </body>
    </html>
  `)
})

export default app
