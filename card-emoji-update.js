// 수트별 이모지 매핑
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

// 수트별 색상
function getSuitColor(suit) {
    const colorMap = {
        'major': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'wands': 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
        'cups': 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
        'swords': 'linear-gradient(135deg, #708090 0%, #A9A9A9 100%)',
        'pentacles': 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)'
    };
    return colorMap[suit] || 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)';
}
