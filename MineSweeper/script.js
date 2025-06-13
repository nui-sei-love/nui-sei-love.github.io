document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty-select');
    const startButton = document.getElementById('start-button'); 
    const messageArea = document.getElementById('message-area');

    let board = [];
    let rows = 0;
    let cols = 0;
    let bombCount = 0;
    let cellsToOpen = 0;
    let gameOver = false;

    const difficulties = {
        easy: { rows: 5, cols: 5, bombs: 3 },
        medium: { rows: 8, cols: 8, bombs: 10 },
        hard: { rows: 10, cols: 10, bombs: 20 }
    };

    function initializeGame() {
        gameOver = false;
        messageArea.textContent = '';
        startButton.textContent = 'ゲーム開始'; // ゲーム開始時は「ゲーム開始」表示
        startButton.disabled = false; // ボタンを常に有効にする
        difficultySelect.disabled = false; // 難易度選択を常に有効にする
        gameBoard.innerHTML = ''; 
        gameBoard.classList.remove('game-over'); 

        const difficulty = difficultySelect.value;
        rows = difficulties[difficulty].rows;
        cols = difficulties[difficulty].cols;
        bombCount = difficulties[difficulty].bombs;
        cellsToOpen = (rows * cols) - bombCount;

        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        board = Array(rows).fill(null).map(() => 
            Array(cols).fill(null).map(() => ({
                isBomb: false,
                isOpen: false,
                isFlagged: false,
                bombNeighborCount: 0
            }))
        );

        placeBombs();
        calculateBombNeighbors();
        renderBoard();
    }

    function placeBombs() {
        let placedBombs = 0;
        const bombEmojis = ['🥩', '🐟'];
        while (placedBombs < bombCount) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!board[r][c].isBomb) {
                board[r][c].isBomb = true;
                board[r][c].bombEmoji = bombEmojis[Math.floor(Math.random() * bombEmojis.length)];
                placedBombs++;
            }
        }
    }

    function calculateBombNeighbors() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!board[r][c].isBomb) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isBomb) {
                                count++;
                            }
                        }
                    }
                    board[r][c].bombNeighborCount = count;
                }
            }
        }
    }

    function renderBoard() {
        gameBoard.innerHTML = ''; 

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.dataset.row = r;
                cellDiv.dataset.col = c;

                const cellData = board[r][c];

                if (cellData.isOpen) {
                    cellDiv.classList.add('opened');
                    if (cellData.isBomb) {
                        cellDiv.textContent = cellData.bombEmoji; 
                        cellDiv.classList.add('bomb');
                    } else if (cellData.bombNeighborCount > 0) {
                        cellDiv.textContent = cellData.bombNeighborCount;
                        cellDiv.classList.add(`num-${cellData.bombNeighborCount}`);
                    }
                } else if (cellData.isFlagged) {
                    cellDiv.textContent = '🐾'; 
                }

                cellDiv.addEventListener('click', handleCellClick);
                cellDiv.addEventListener('contextmenu', handleRightClick); 
                gameBoard.appendChild(cellDiv);
            }
        }
    }

    function handleCellClick(event) {
        if (gameOver) return;

        // ゲームが開始されていない状態でマスをクリックした場合、ボタンを「ゲーム開始」に戻す
        if (startButton.textContent === 'ゲーム開始' && startButton.disabled) {
            startButton.disabled = false;
            difficultySelect.disabled = false;
        }

        const r = parseInt(event.target.dataset.row);
        const c = parseInt(event.target.dataset.col);
        const cellData = board[r][c];

        if (cellData.isOpen || cellData.isFlagged) return;

        if (cellData.isBomb) {
            cellData.isOpen = true; 
            handleGameOver(); 
        } else {
            openCell(r, c);
            checkWin();
        }
        renderBoard(); 
    }

    function handleRightClick(event) {
        event.preventDefault(); 
        if (gameOver) return;

        const r = parseInt(event.target.dataset.row);
        const c = parseInt(event.target.dataset.col);
        const cellData = board[r][c];

        if (cellData.isOpen) return;

        cellData.isFlagged = !cellData.isFlagged;
        renderBoard();
    }

    function openCell(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c].isOpen || board[r][c].isBomb || board[r][c].isFlagged) {
            return;
        }

        board[r][c].isOpen = true;
        cellsToOpen--;

        if (board[r][c].bombNeighborCount === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    openCell(r + dr, c + dc);
                }
            }
        }
    }

    function revealAllBombs() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isBomb) {
                    board[r][c].isOpen = true;
                }
            }
        }
    }

    function checkWin() {
        if (cellsToOpen === 0 && !gameOver) {
            messageArea.textContent = '😸'; 
            gameOver = true;
            startButton.textContent = 'もう一度遊ぶ'; 
            // ゲーム終了時はボタンと難易度選択を有効にする
            startButton.disabled = false; 
            difficultySelect.disabled = false; 
        }
    }

    function handleGameOver() {
        revealAllBombs();
        messageArea.textContent = '😾'; 
        gameOver = true;
        startButton.textContent = 'もう一度遊ぶ'; 
        // ゲーム終了時はボタンと難易度選択を有効にする
        startButton.disabled = false; 
        difficultySelect.disabled = false; 
    }

    // startButton のイベントリスナーは、単に initializeGame を呼ぶだけにする
    startButton.addEventListener('click', () => {
        initializeGame();
    });

    // 初期表示
    initializeGame();
});