document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const currentPlayerEmojiElement = document.getElementById('current-player-emoji');
    const scoreBlackElement = document.getElementById('score-black');
    const scoreWhiteElement = document.getElementById('score-white');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    const playerSelection = document.getElementById('player-selection');
    const gameArea = document.getElementById('game-area');
    const selectCatBlackButton = document.getElementById('select-cat-black');
    const selectCatWhiteButton = document.getElementById('select-cat-white');

    const EMPTY = 0;
    const BLACK = 1;
    const WHITE = 2;

    const EMOJI_BLACK = '🐈‍⬛';
    const EMOJI_WHITE = '🐈';

    let board = [];
    let currentPlayer;
    let userPlayer; // ユーザーが選択したプレイヤー (BLACK or WHITE)
    let aiPlayer; // AIのプレイヤー (ユーザーの反対)
    let isGameActive = false;
    let isProcessingMove = false; // コマがひっくり返っている最中か、AIが考えている最中かを示すフラグ

    // 初期化関数
    const initializeGame = () => {
        board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
        board[3][3] = WHITE;
        board[3][4] = BLACK;
        board[4][3] = BLACK;
        board[4][4] = WHITE;

        currentPlayer = BLACK; // 先攻は常にユーザー
        isGameActive = true;
        isProcessingMove = false;
        renderBoard();
        updateScore();
        messageElement.textContent = 'ゲーム開始！あなたのターンです。';
        resetButton.classList.add('hidden'); // ゲーム中はリセットボタンを非表示
    };

    // プレイヤー選択後のゲーム開始
    const startGameAfterSelection = (selectedPlayer) => {
        userPlayer = selectedPlayer;
        aiPlayer = (userPlayer === BLACK) ? WHITE : BLACK;

        // 現在のプレイヤー表示を更新
        if (currentPlayer === userPlayer) {
            currentPlayerEmojiElement.textContent = `あなた (${getPlayerEmoji(userPlayer)})`;
        } else {
            currentPlayerEmojiElement.textContent = `プログラム (${getPlayerEmoji(aiPlayer)})`;
        }
        
        playerSelection.classList.add('hidden');
        gameArea.classList.remove('hidden');
        initializeGame();

        // ユーザーが白を選択した場合も、先攻はユーザーなので特にAIの処理は不要。
    };

    // コマの絵文字を取得
    const getPlayerEmoji = (player) => {
        if (player === BLACK) {
            return EMOJI_BLACK;
        } else if (player === WHITE) {
            return EMOJI_WHITE;
        }
        return '';
    };

    // 盤面を描画
    const renderBoard = () => {
        boardElement.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (board[r][c] !== EMPTY) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    piece.textContent = getPlayerEmoji(board[r][c]);
                    piece.dataset.backContent = getPlayerEmoji(board[r][c] === BLACK ? WHITE : BLACK); // 裏返る時の絵文字
                    cell.appendChild(piece);
                }

                // 有効な手であればクリック可能にする
                if (isValidMove(r, c, currentPlayer) && !isProcessingMove) {
                    cell.classList.add('valid-move');
                    cell.addEventListener('click', handleCellClick);
                } else {
                    cell.classList.add('invalid-move');
                }
                boardElement.appendChild(cell);
            }
        }
    };

    // スコアを更新
    const updateScore = () => {
        let blackCount = 0;
        let whiteCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === BLACK) {
                    blackCount++;
                } else if (board[r][c] === WHITE) {
                    whiteCount++;
                }
            }
        }
        scoreBlackElement.textContent = blackCount;
        scoreWhiteElement.textContent = whiteCount;

        // ゲーム終了判定
        if (!hasValidMove(BLACK) && !hasValidMove(WHITE)) {
            isGameActive = false;
            messageElement.textContent = 'ゲーム終了！';
            if (blackCount > whiteCount) {
                messageElement.textContent += ` 🐈‍⬛の勝利！`;
            } else if (whiteCount > blackCount) {
                messageElement.textContent += ` 🐈の勝利！`;
            } else {
                messageElement.textContent += ` 引き分け！`;
            }
            resetButton.classList.remove('hidden');
        } else if (!hasValidMove(currentPlayer)) {
            messageElement.textContent = `${getPlayerEmoji(currentPlayer)}は置ける場所がありません。パスします。`;
            setTimeout(() => {
                switchPlayer();
                if (isGameActive && currentPlayer === aiPlayer) {
                    aiTurn();
                } else {
                    renderBoard(); // ユーザーのターンに戻る場合
                    messageElement.textContent = `あなたのターンです。`;
                }
            }, 1000); // パスメッセージ表示後に少し待つ
        }
    };

    // コマをひっくり返す方向の定義 (8方向)
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // 上下左右
        [-1, -1], [-1, 1], [1, -1], [1, 1] // 斜め
    ];

    // 有効な手かどうかを判定
    const isValidMove = (r, c, player) => {
        if (board[r][c] !== EMPTY) {
            return false;
        }

        // ひっくり返せるコマがあるかチェック
        for (const [dr, dc] of directions) {
            if (countFlippablePieces(r, c, dr, dc, player) > 0) {
                return true;
            }
        }
        return false;
    };

    // 指定した方向にひっくり返せるコマの数を数える
    const countFlippablePieces = (r, c, dr, dc, player) => {
        const opponent = (player === BLACK) ? WHITE : BLACK;
        let count = 0;
        let nr = r + dr;
        let nc = c + dc;

        // 盤面の範囲内で相手のコマが続く限りカウント
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opponent) {
            count++;
            nr += dr;
            nc += dc;
        }

        // その先に自分のコマがあれば、ひっくり返せる
        if (count > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
            return count;
        }
        return 0;
    };

    // コマをひっくり返す
    const flipPieces = async (r, c, player) => {
        const flippedLocations = []; // ひっくり返されるコマの座標を格納

        for (const [dr, dc] of directions) {
            const count = countFlippablePieces(r, c, dr, dc, player);
            if (count > 0) {
                for (let i = 1; i <= count; i++) {
                    flippedLocations.push([r + dr * i, c + dc * i]);
                }
            }
        }

        // 自分のコマを置くセルにコマを追加または更新
        let putCellPiece = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"] .piece`);
        if (!putCellPiece) {
            const cell = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            putCellPiece = document.createElement('div');
            putCellPiece.classList.add('piece');
            cell.appendChild(putCellPiece);
        }
        putCellPiece.textContent = getPlayerEmoji(player);
        putCellPiece.dataset.backContent = getPlayerEmoji(player === BLACK ? WHITE : BLACK);

        // ひっくり返すアニメーションを実行
        const cellsToFlip = flippedLocations.map(([fr, fc]) =>
            boardElement.querySelector(`.cell[data-row="${fr}"][data-col="${fc}"] .piece`)
        ).filter(Boolean); // nullを除外

        // すべてのコマにflipクラスを付与して同時にアニメーションを開始
        cellsToFlip.forEach(piece => {
            piece.classList.add('flip');
            // アニメーション完了後に裏面の絵文字に変更
            piece.addEventListener('transitionend', () => {
                piece.textContent = getPlayerEmoji(player);
                piece.dataset.backContent = getPlayerEmoji(player === BLACK ? WHITE : BLACK);
                piece.classList.remove('flip'); // アニメーション後にクラスを削除
            }, { once: true }); // 一度だけ実行
        });
        
        // 実際に盤面の状態を更新
        board[r][c] = player;
        for (const [fr, fc] of flippedLocations) {
            board[fr][fc] = player;
        }

        // アニメーションが終わるまで待つ (CSSのtransition時間に合わせて調整)
        await new Promise(resolve => setTimeout(resolve, 600));
    };

    // 置ける場所があるかチェック
    const hasValidMove = (player) => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isValidMove(r, c, player)) {
                    return true;
                }
            }
        }
        return false;
    };

    // プレイヤーを切り替える
    const switchPlayer = () => {
        currentPlayer = (currentPlayer === BLACK) ? WHITE : BLACK;
        if (currentPlayer === userPlayer) {
            currentPlayerEmojiElement.textContent = `あなた (${getPlayerEmoji(userPlayer)})`;
        } else {
            currentPlayerEmojiElement.textContent = `プログラム (${getPlayerEmoji(aiPlayer)})`;
        }
    };

    // セルクリック時の処理
    const handleCellClick = async (event) => {
        if (!isGameActive || isProcessingMove || currentPlayer !== userPlayer) {
            return;
        }

        const cell = event.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (isValidMove(row, col, currentPlayer)) {
            isProcessingMove = true; // 処理中フラグを立てる
            messageElement.textContent = '';
            await flipPieces(row, col, currentPlayer);
            updateScore();
            switchPlayer();
            renderBoard(); // 盤面を再描画して、置ける場所の表示を更新

            // AIのターン
            if (isGameActive && currentPlayer === aiPlayer) {
                aiTurn();
            } else if (isGameActive) {
                messageElement.textContent = `あなたのターンです。`;
            }
            isProcessingMove = false; // 処理中フラグを下げる
        } else {
            messageElement.textContent = 'そこには置けません。';
        }
    };

    // AIのターン
    const aiTurn = () => {
        isProcessingMove = true; // AI処理中フラグ
        messageElement.textContent = `プログラム (${getPlayerEmoji(aiPlayer)}) が考え中...`;

        setTimeout(async () => {
            const validMoves = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (isValidMove(r, c, aiPlayer)) {
                        validMoves.push({ r, c });
                    }
                }
            }

            if (validMoves.length > 0) {
                // シンプルにランダムな手を選択
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                await flipPieces(randomMove.r, randomMove.c, aiPlayer);
                updateScore();
                switchPlayer();
                renderBoard(); // 盤面を再描画
                if (isGameActive && currentPlayer === userPlayer) {
                     messageElement.textContent = `あなたのターンです。`; // メッセージをクリア
                } else if (isGameActive && currentPlayer === aiPlayer) {
                    aiTurn(); // AIが連続パスした場合
                }
            } else {
                messageElement.textContent = `プログラム (${getPlayerEmoji(aiPlayer)}) は置ける場所がありません。パスします。`;
                setTimeout(() => {
                    switchPlayer();
                    renderBoard(); // 盤面を再描画
                    if (isGameActive && currentPlayer === userPlayer) {
                        messageElement.textContent = `あなたのターンです。`;
                    } else if (isGameActive && currentPlayer === aiPlayer) {
                        aiTurn(); // AIが連続パスした場合
                    }
                }, 1000); // パスメッセージ表示後に少し待つ
            }
            isProcessingMove = false; // AI処理中フラグを下げる
        }, Math.floor(Math.random() * 1000) + 1000); // 1秒から2秒のランダムな思考時間
    };

    // リセットボタンのクリックイベント
    resetButton.addEventListener('click', () => {
        playerSelection.classList.remove('hidden');
        gameArea.classList.add('hidden');
        messageElement.textContent = '';
    });

    // プレイヤー選択ボタンのイベントリスナー
    selectCatBlackButton.addEventListener('click', () => startGameAfterSelection(BLACK));
    selectCatWhiteButton.addEventListener('click', () => startGameAfterSelection(WHITE));

    // 最初にプレイヤー選択画面を表示
    playerSelection.classList.remove('hidden');
    gameArea.classList.add('hidden');
});