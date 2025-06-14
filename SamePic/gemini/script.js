document.addEventListener('DOMContentLoaded', () => {
    const emojis = ['🐈‍⬛', '🐈', '🦐', '🪲', '🦋', '💎', '🌹', '🪻', '🍩', '🐣'];
    const gameBoard = document.getElementById('game-board');
    const mistakesDisplay = document.getElementById('mistakes');
    const remainingPairsDisplay = document.getElementById('remaining-pairs');
    const resetButton = document.getElementById('reset-button');
    const gameMessage = document.getElementById('game-message');

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let mistakes = 0;
    let gameLocked = false; // カードめくり中にクリックできないようにロック

    const maxMistakes = 10;
    const totalPairs = emojis.length;

    // ゲームの初期化
    function initializeGame() {
        // パネルを空にする
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        mistakes = 0;
        gameLocked = false;

        mistakesDisplay.textContent = mistakes;
        remainingPairsDisplay.textContent = totalPairs;
        gameMessage.textContent = '';
        resetButton.style.display = 'none'; // リセットボタンを隠す

        // 絵文字を2倍にしてシャッフル
        const shuffledEmojis = shuffle([...emojis, ...emojis]);

        // カードを生成
        shuffledEmojis.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji; // 絵文字をデータ属性に保存

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front', 'card-inner'); // 表面
            cardFront.textContent = emoji; // 表面に絵文字を表示

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back', 'card-inner'); // 裏面

            // card要素の中に裏面と表面を追加
            card.appendChild(cardFront);
            card.appendChild(cardBack);

            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
            cards.push(card);
        });
    }

    // 配列をシャッフルする関数 (Fisher-Yates)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // カードをめくる処理
    function flipCard(card) {
        // ゲームがロックされているか、既にめくられているか、マッチ済みなら何もしない
        if (gameLocked || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) {
            return;
        }

        card.classList.add('is-flipped');
        flippedCards.push(card);

        // 2枚目のカードがめくられたらチェック
        if (flippedCards.length === 2) {
            gameLocked = true; // めくり中はクリックを無効にする
            checkForMatch();
        }
    }

    // めくられたカードがマッチしているかチェック
    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            // マッチした場合
            card1.classList.add('is-matched');
            card2.classList.add('is-matched');
            matchedPairs++;
            remainingPairsDisplay.textContent = totalPairs - matchedPairs;
            flippedCards = [];
            gameLocked = false; // ロック解除

            if (matchedPairs === totalPairs) {
                // 全てのペアを見つけた場合
                gameMessage.textContent = '✨ ゲームクリア！おめでとうございます！ ✨';
                resetButton.style.display = 'block';
            }
        } else {
            // マッチしない場合
            mistakes++;
            mistakesDisplay.textContent = mistakes;

            if (mistakes >= maxMistakes) {
                // ゲームオーバー
                gameMessage.textContent = `残念！ゲームオーバーです。`;
                // 全てのカードを表向きにする（ゲームオーバー後も絵文字が見えるように）
                cards.forEach(card => card.classList.add('is-flipped'));
                resetButton.style.display = 'block';
                gameLocked = true; // ゲームオーバー時は完全にロック
            } else {
                // マッチしなかったカードを裏返す
                setTimeout(() => {
                    card1.classList.remove('is-flipped');
                    card2.classList.remove('is-flipped');
                    flippedCards = [];
                    gameLocked = false; // ロック解除
                }, 1000); // 1秒後に裏返す
            }
        }
    }

    // リセットボタンのイベントリスナー
    resetButton.addEventListener('click', initializeGame);

    // 最初のゲーム開始
    initializeGame();
});