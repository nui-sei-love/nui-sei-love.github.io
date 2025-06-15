document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const puzzleArea = document.getElementById('puzzleArea');
    const originalImageDisplay = document.getElementById('originalImageDisplay');
    const resetButton = document.getElementById('resetButton');

    // クリアポップアップ関連の要素を取得
    const clearModal = document.getElementById('clearModal');
    const closeButton = document.querySelector('.close-button');
    const modalResetButton = document.getElementById('modalResetButton');
    // 新しく追加する「閉じる」ボタンの要素を取得
    const modalCloseButton = document.getElementById('modalCloseButton'); 

    const boardSize = 3; // 3x3のパズル
    let pieces = []; // パズルのピースを格納する配列
    // emptyIndexは常に右下のマス（8番目のインデックス）を指すように固定
    let emptyIndex = boardSize * boardSize - 1; 
    let originalImage = null; // 読み込んだ画像データURL

    /**
     * パズルを初期化する関数。
     * 画像が指定された場合は分割して配置し、そうでない場合は空のフレームを表示します。
     * @param {string|null} imgSrc - 読み込む画像のData URL、またはnull
     */
    const initializePuzzle = (imgSrc) => {
        puzzleArea.innerHTML = ''; // パズルエリアをクリア
        puzzleArea.style.display = 'grid'; // パズルエリアをグリッド表示に
        originalImageDisplay.style.display = 'none'; // クリア時の画像を非表示に
        clearModal.style.display = 'none'; // ポップアップを非表示に

        // 画像が選択されていない場合（初期表示やファイル選択キャンセル時）
        if (!imgSrc) {
            pieces = []; // ピース配列をクリア
            for (let i = 0; i < boardSize * boardSize; i++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                if (i === emptyIndex) {
                    piece.classList.add('empty'); // 右下マスを空に設定
                }
                puzzleArea.appendChild(piece);
                pieces.push(piece);
            }
            // emptyIndexは初期化時も常に右下（8番目のインデックス）
            emptyIndex = boardSize * boardSize - 1; 
            return;
        }

        originalImage = imgSrc; // 読み込んだ画像を保存
        originalImageDisplay.style.backgroundImage = `url(${originalImage})`; // クリア時の背景に設定

        const img = new Image();
        img.onload = () => {
            pieces = [];
            // 全てのピース（空のピースを含む）を生成
            for (let i = 0; i < boardSize * boardSize; i++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.dataset.index = i; // 元の位置をデータ属性として保持 (0-8)

                if (i === emptyIndex) {
                    piece.classList.add('empty'); // 空のマスには画像背景を設定しない
                } else {
                    const row = Math.floor(i / boardSize);
                    const col = i % boardSize;
                    piece.style.backgroundImage = `url(${imgSrc})`;
                    // background-positionをパーセンテージで正確に設定
                    piece.style.backgroundPosition = `-${col * 100}% -${row * 100}%`;
                }
                pieces.push(piece);
            }
            shuffleAndRenderPieces(); // ピース生成後にシャッフルして描画
        };
        img.src = imgSrc; // 画像のロードを開始
    };

    /**
     * パズルのピースをシャッフルし、DOMに描画する関数。
     * 右下のマスは常に空のまま、それ以外のマスをランダムに配置します。
     * 生成される配置は必ずクリア可能（偶置換）になるように調整されます。
     */
    const shuffleAndRenderPieces = () => {
        // 空のピース（右下）を除いたピースの配列を作成
        // pieces配列はHTML要素だが、置換の計算にはdata-indexを使用するため、
        // data-indexの数値配列を生成
        let currentOrder = pieces
            .filter((_, index) => index !== emptyIndex)
            .map(piece => parseInt(piece.dataset.index)); // 0から7までの数値

        // 非空のピースの順序をシャッフル
        for (let i = currentOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
        }

        // 置換の偶奇性を計算するヘルパー関数
        const getInversions = (arr) => {
            let inversions = 0;
            for (let i = 0; i < arr.length - 1; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    // arr[j] が arr[i] の右にあり、かつ arr[j] < arr[i] なら転倒
                    if (arr[i] > arr[j]) {
                        inversions++;
                    }
                }
            }
            return inversions;
        };

        // シャッフルされた配置の転倒数（Inversions）を計算
        const inversions = getInversions(currentOrder);

        // 転倒数が奇数（奇置換）の場合、偶置換にするためにどこか2つのピースを入れ替える
        if (inversions % 2 !== 0) {
            // 例: 最初の2つのピースを入れ替える（ただし空のピースは除く）
            // 少なくとも2つのピースがあることを確認
            if (currentOrder.length >= 2) {
                [currentOrder[0], currentOrder[1]] = [currentOrder[1], currentOrder[0]];
            }
        }

        // シャッフルされ、偶置換に調整された順序に基づいて新しいピース配列を構築
        const newPieces = Array(boardSize * boardSize);
        let nonZeroCount = 0;
        for (let i = 0; i < boardSize * boardSize; i++) {
            if (i === emptyIndex) {
                // 空のピースは常に右下の位置に固定
                newPieces[i] = pieces[emptyIndex]; // 元々の空のピース要素を使用
            } else {
                // シャッフルされ、偶奇調整された順序のピースを配置
                // original pieces配列からdata-indexが一致するものを探して使用
                newPieces[i] = pieces.find(p => parseInt(p.dataset.index) === currentOrder[nonZeroCount]);
                nonZeroCount++;
            }
        }
        pieces = newPieces; // グローバルなpieces配列を新しい順序で更新

        // パズルエリアのDOMを更新
        puzzleArea.innerHTML = '';
        pieces.forEach(piece => {
            puzzleArea.appendChild(piece);
            // 空のピースでなければクリックイベントリスナーを追加
            if (!piece.classList.contains('empty')) {
                piece.addEventListener('click', handlePieceClick);
            } else {
                // 空のピースには念のためイベントリスナーを削除（すでに無いことが多いが安全のため）
                piece.removeEventListener('click', handlePieceClick);
            }
        });

        // emptyIndexはシャッフル後も常に右下（8番目のインデックス）のまま
        emptyIndex = pieces.findIndex(piece => piece.classList.contains('empty'));
    };

    /**
     * パズルのピースがクリックされた時の処理。
     * 隣接する空のマスがあればピースを移動させます。
     * @param {Event} event - クリックイベントオブジェクト
     */
    const handlePieceClick = (event) => {
        const clickedPiece = event.target;
        // クリックされたピースが空のピースなら何もしない
        if (clickedPiece.classList.contains('empty')) {
            return; 
        }

        const clickedIndex = pieces.indexOf(clickedPiece);

        // クリックされたピースと空のピースが隣接しているかチェック
        const currentRow = Math.floor(clickedIndex / boardSize);
        const currentCol = clickedIndex % boardSize;
        const emptyRow = Math.floor(emptyIndex / boardSize);
        const emptyCol = emptyIndex % boardSize;

        const isAdjacent = (
            (Math.abs(currentRow - emptyRow) === 1 && currentCol === emptyCol) || // 上下で隣接
            (Math.abs(currentCol - emptyCol) === 1 && currentRow === emptyRow)    // 左右で隣接
        );

        // 隣接していればピースを交換
        if (isAdjacent) {
            // pieces配列内でピースの参照を交換
            [pieces[clickedIndex], pieces[emptyIndex]] = [pieces[emptyIndex], pieces[clickedIndex]];

            // DOMを再描画して見た目を更新
            puzzleArea.innerHTML = '';
            pieces.forEach(piece => puzzleArea.appendChild(piece));

            emptyIndex = clickedIndex; // 空のピースの新しいインデックスを更新

            checkWin(); // クリア判定を実行
        }
    };

    /**
     * パズルのクリア判定を行う関数。
     * 全てのピースが正しい位置にあり、かつ空のマスが右下にあればクリアと判定します。
     */
    const checkWin = () => {
        const isSolved = pieces.every((piece, index) => {
            // 空のピースは常に最後の位置（右下）にあることを期待
            if (piece.classList.contains('empty')) {
                return index === (boardSize * boardSize - 1); 
            }
            // その他のピースは、データ属性に保持している元のインデックスと現在のインデックスが一致するか
            return parseInt(piece.dataset.index) === index;
        });

        if (isSolved) {
            // クリアした場合、少し遅れて元の画像を表示し、ポップアップを表示
            setTimeout(() => {
                displayOriginalImage(); // 元の画像を表示
                clearModal.style.display = 'flex'; // ポップアップを表示
            }, 300); 
        }
    };

    /**
     * パズルクリア時に元の画像をパズルエリアに表示する関数。
     */
    const displayOriginalImage = () => {
        puzzleArea.style.display = 'none'; // パズルエリアを非表示に
        originalImageDisplay.style.display = 'block'; // 元の画像表示エリアを表示
    };

    /**
     * 画像ファイル選択時のイベントハンドラー。
     * 選択された画像を読み込み、パズルを初期化します。
     */
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                initializePuzzle(e.target.result); // 読み込んだ画像でパズルを初期化
            };
            reader.readAsDataURL(file); // 画像をData URLとして読み込む
        } else {
            initializePuzzle(null); // ファイルが選択されなかった場合はフレームのみ表示
        }
    });

    /**
     * メインのリセットボタンがクリックされた時のイベントハンドラー。
     * 現在の画像でパズルをリセットします。
     */
    resetButton.addEventListener('click', () => {
        if (originalImage) {
            initializePuzzle(originalImage); // 元の画像があればそれを使ってリセット
        } else {
            initializePuzzle(null); // なければフレームのみ表示
        }
    });

    // --- クリアポップアップ関連のイベントリスナー ---
    /**
     * ポップアップの閉じるボタン（右上のX印）がクリックされた時のイベントハンドラー。
     */
    closeButton.addEventListener('click', () => {
        clearModal.style.display = 'none'; // ポップアップを非表示に
    });

    /**
     * ポップアップの外側（背景）がクリックされた時のイベントハンドラー。
     */
    window.addEventListener('click', (event) => {
        if (event.target === clearModal) {
            clearModal.style.display = 'none'; // ポップアップを非表示に
        }
    });

    /**
     * ポップアップ内の「もう一度遊ぶ」ボタンがクリックされた時のイベントハンドラー。
     */
    modalResetButton.addEventListener('click', () => {
        clearModal.style.display = 'none'; // ポップアップを非表示に
        if (originalImage) {
            initializePuzzle(originalImage); // 元の画像があればそれを使ってリセット
        } else {
            initializePuzzle(null); // なければフレームのみ表示
        }
    });

    /**
     * ポップアップ内の新しい「閉じる」ボタンがクリックされた時のイベントハンドラー。
     * ポップアップを閉じるだけで、パズルはリセットしません。
     */
    modalCloseButton.addEventListener('click', () => {
        clearModal.style.display = 'none'; // ポップアップを非表示に
    });

    // ページロード時にパズルを初期表示（空のフレーム）
    initializePuzzle(null); 
});