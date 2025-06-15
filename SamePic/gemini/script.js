document.addEventListener('DOMContentLoaded', () => {
    const emojis = ['🐾', '🐈', '🐸', '🐞', '🦋', '💎', '🌻', '🍀', '🍩', '🐟'];
    let gameBoard = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let failCount = 0;
    const maxFails = 10;

    const puzzleBoard = document.getElementById('puzzle-board');
    const failCountDisplay = document.getElementById('fail-count');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverMessage = document.getElementById('game-over-message');
    const restartButton = document.getElementById('restart-button');

    function initializeGame() {
        gameBoard = [];
        flippedCards = [];
        matchedPairs = 0;
        failCount = 0;
        failCountDisplay.textContent = failCount;
        puzzleBoard.innerHTML = '';
        gameOverScreen.classList.remove('active');

        let cards = [...emojis, ...emojis];
        cards.sort(() => Math.random() - 0.5);

        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji; // 親要素に絵文字データを保持
            card.dataset.index = index;

            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            // cardFront.textContent = '?'; // ★削除：card-frontには絵文字は不要

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            cardBack.textContent = emoji; // ★確認：ここに絵文字が設定されていることを再度確認

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);

            card.addEventListener('click', handleCardClick);
            puzzleBoard.appendChild(card);
            gameBoard.push(card);
        });
    }

    function handleCardClick(event) {
        const clickedCard = event.target.closest('.card');

        if (!clickedCard) return;

        if (flippedCards.length < 2 && !clickedCard.classList.contains('flipped') && !clickedCard.classList.contains('matched')) {
            clickedCard.classList.add('flipped');
            flippedCards.push(clickedCard);

            if (flippedCards.length === 2) {
                setTimeout(checkMatch, 800);
            }
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            if (matchedPairs === emojis.length) {
                setTimeout(() => showGameOverScreen('clear'), 500);
            }
        } else {
            failCount++;
            failCountDisplay.textContent = failCount;
            if (failCount >= maxFails) {
                setTimeout(() => showGameOverScreen('fail'), 500);
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                }, 800);
            }
        }
        flippedCards = [];
    }

    function showGameOverScreen(result) {
        if (result === 'clear') {
            gameOverMessage.textContent = '🎉 ゲームクリア！ 🎉';
        } else {
            gameOverMessage.textContent = `ゲームオーバー... (失敗: ${failCount}回)`;
        }
        gameOverScreen.classList.add('active');
    }

    restartButton.addEventListener('click', initializeGame);

    initializeGame();
});