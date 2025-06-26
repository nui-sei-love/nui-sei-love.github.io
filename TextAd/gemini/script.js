document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const messageBox = document.getElementById('message-box');
    const choicesDiv = document.getElementById('choices');

    // プレイヤーの現在位置と状態
    let playerPosition = { x: 3, y: 3 }; // 中央 (0-6の範囲)
    let inventory = { magic_leaf: false, ancient_key: false }; // 持ち物リスト
    let currentMapState = []; // 現在のマップの状態を保持（動的に変更するため）

    // 初期ゲームマップ (7x7マス)
    // マスごとに表示する絵文字を定義
    // '🌱' 草原, '🌳' 木, '🌸' 花, '🍄' キノコ, '💧' 水辺, ⛰️' 岩山, '🐾' 足跡, '🕯️' 洞窟入り口
    // プレイヤーの位置は'🚶‍♀️'で表現し、マップデータは背景として扱う
    const initialGameMap = [
        ['🌳', '🌱', '🌸', '🌱', '🌳', '🌱', '🌳'],
        ['🌱', '💧', '🌱', '🍄', '🌱', '💧', '🌱'],
        ['🌸', '🌱', '🌱', '🌳', '🌸', '🌱', '🍄'],
        ['🌱', '🍄', '🌳', '🌱', '🌱', '🌱', '🌳'],
        ['🌳', '🌱', '🌸', '💧', '🌱', '🍄', '🌱'],
        ['🌱', '💧', '🌱', '🌳', '🌱', '🌸', '💧'],
        ['🍄', '🌱', '🌳', '🌸', '🌱', '🌳', '🌱']
    ];

    // マップの状態を初期化する関数
    function resetMapState() {
        currentMapState = initialGameMap.map(row => [...row]); // ディープコピー
    }

    // ゲームマップを描画する関数
    function drawMap() {
        gameArea.innerHTML = ''; // マップをクリア
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                // プレイヤーの位置にのみプレイヤー絵文字を表示
                if (x === playerPosition.x && y === playerPosition.y) {
                    cell.textContent = '🚶‍♀️'; // プレイヤー絵文字
                } else {
                    cell.textContent = currentMapState[y][x]; // 現在のマップの状態の絵文字
                }
                gameArea.appendChild(cell);
            }
        }
    }

    // シナリオデータ
    // 各シーンにはメッセージ、表示する絵文字の更新、選択肢が含まれる
    const scenes = {
        start: {
            message: "あなたは小さな探検家 🚶‍♀️ です。今日、あなたは不思議な光に導かれ、地図にはない「絵文字の森」🌳 に迷い込んでしまいました。あたりはカラフルな絵文字の植物でいっぱいです。",
            choices: [
                { text: "キラキラと光る道 ✨ を進む", nextScene: "sparkling_path" },
                { text: "静かで暗い道 🌑 を進む", nextScene: "dark_path" }
            ],
            onEnter: () => {
                resetMapState();
                playerPosition = { x: 3, y: 3 }; // 中央
                drawMap();
            }
        },
        sparkling_path: {
            message: "キラキラと光る道を進むと、足元には小さな光の粒 ✨ が舞っています。道の先には古い石碑 🪨 が見えます。",
            choices: [
                { text: "石碑を調べてみる 🔍", nextScene: "examine_monument" },
                { text: "さらに奥へ進む ➡️", nextScene: "deeper_forest_sparkle" }
            ],
            onEnter: () => {
                playerPosition = { x: 5, y: 2 }; // 石碑の近くへ移動
                currentMapState[2][5] = '🪨'; // 石碑をマップに表示
                currentMapState[2][4] = '✨'; // 道に光の粒
                currentMapState[3][4] = '✨';
                drawMap();
            }
        },
        dark_path: {
            message: "静かで暗い道を進むと、ひんやりとした空気が肌を刺します。遠くから微かに水の流れる音 💧 が聞こえてきます。",
            choices: [
                { text: "水の音のする方へ向かう 💧➡️", nextScene: "follow_water_sound" },
                { text: "引き返す ↩️", nextScene: "start" }
            ],
            onEnter: () => {
                playerPosition = { x: 1, y: 4 }; // 暗い道、水の近く
                currentMapState[4][0] = '💧'; // 水辺をマップに表示
                currentMapState[4][1] = '💧';
                currentMapState[5][1] = '💧';
                drawMap();
            }
        },
        examine_monument: {
            message: "石碑 🪨 には、古びた文字でこう刻まれていました。「真の探求者には、森の心臓に隠された魔法の葉 🍃 が道を示すだろう。」",
            choices: [
                { text: "魔法の葉を探す 🍃❓", nextScene: "search_leaf" },
                { text: "奥へ進む ➡️", nextScene: "deeper_forest_sparkle" }
            ],
            onEnter: () => {
                playerPosition = { x: 5, y: 2 }; // 石碑の位置を維持
                drawMap();
            }
        },
        deeper_forest_sparkle: {
            message: "さらに奥へ進むと、森はより一層神秘的になり、様々な絵文字の動物 🦊🐻‍❄️ が姿を見せます。しかし、道は行き止まりのようです。目の前には巨大な岩 🪨 が道を塞いでいます。",
            choices: [
                { text: "岩をよじ登ろうとする 🧗‍♀️", nextScene: "climb_rock" },
                { text: "別の道を探す 🔄", nextScene: "start" }
            ],
            onEnter: () => {
                playerPosition = { x: 6, y: 3 }; // 岩の近く
                currentMapState[3][6] = '🪨'; // 岩をマップに表示
                currentMapState[2][6] = '🐻‍❄️'; // 動物も追加
                currentMapState[4][5] = '🦊';
                drawMap();
            }
        },
        follow_water_sound: {
            message: "水の音のする方へ向かうと、小さな滝 🏞️ と透き通った泉 💦 がありました。泉の底には何かが光っています…。",
            choices: [
                { text: "泉の中を覗き込む 🧐", nextScene: "look_into_spring" },
                { text: "森の奥へ進む ➡️", nextScene: "deeper_forest_dark" }
            ],
            onEnter: () => {
                playerPosition = { x: 0, y: 5 }; // 泉の近く
                currentMapState[5][0] = '🏞️'; // 滝
                currentMapState[6][0] = '💦'; // 泉
                drawMap();
            }
        },
        look_into_spring: {
            message: "泉の底を覗き込むと、そこには光る小さな鍵 🔑 がありました！あなたはそれを手に入れました！",
            choices: [
                { text: "森の奥へ進む ➡️", nextScene: "deeper_forest_dark" }
            ],
            onEnter: () => {
                inventory.ancient_key = true; // 鍵を手に入れた
                playerPosition = { x: 0, y: 5 };
                currentMapState[6][0] = '🔑'; // 鍵がマップに表示
                drawMap();
            }
        },
        deeper_forest_dark: {
            message: "暗い森の奥に進むと、空気は一層冷たくなり、目の前に不気味な洞窟の入り口 🕯️ が現れました。",
            choices: [
                { text: "洞窟に入る 🚶‍♀️🕯️", nextScene: "enter_cave" },
                { text: "引き返す ↩️", nextScene: "dark_path" }
            ],
            onEnter: () => {
                playerPosition = { x: 2, y: 0 }; // 洞窟の近く
                currentMapState[0][2] = '🕯️'; // 洞窟入り口
                drawMap();
            }
        },
        climb_rock: {
            message: "巨大な岩 🪨 をよじ登ると、森全体が見渡せる絶景が広がっていました！遠くには光る泉 ⛲ と、その奥に何かの遺跡 🏛️ が見えます。",
            choices: [
                { text: "遺跡へ向かう 🚶‍♀️🏛️", nextScene: "approach_ruins" },
                { text: "引き返す ↩️", nextScene: "deeper_forest_sparkle" }
            ],
            onEnter: () => {
                playerPosition = { x: 6, y: 0 }; // 岩の上からの景色
                currentMapState[0][6] = '🏛️'; // 遺跡をマップに表示
                currentMapState[1][5] = '⛲'; // 泉も
                drawMap();
            }
        },
        search_leaf: {
            message: "石碑の言葉に従い、森の奥深くで「魔法の葉」🍃 を探しました。しばらくすると、光を放つ小さな葉を見つけ、手に入れました！",
            choices: [
                { text: "奥へ進む ➡️", nextScene: "deeper_forest_sparkle" }
            ],
            onEnter: () => {
                inventory.magic_leaf = true; // 魔法の葉を手に入れた
                playerPosition = { x: 4, y: 1 }; // 葉を見つけた場所
                currentMapState[1][4] = '🍃'; // 葉をマップに表示
                drawMap();
            }
        },
        enter_cave: {
            message: "洞窟 🕯️ に入ると、中は真っ暗です。しかし、奥から微かな光が見えます。これは進むべき道でしょうか？",
            choices: [
                { text: "光の方向へ進む 💡➡️", nextScene: "cave_light" },
                { text: "引き返す ↩️", nextScene: "deeper_forest_dark" }
            ],
            onEnter: () => {
                playerPosition = { x: 3, y: 3 }; // 洞窟内は中央に表示
                resetMapState(); // 洞窟内はマップを初期化
                currentMapState[3][3] = '💡'; // 中央に光
                drawMap();
            }
        },
        cave_light: {
            message: "光の方向へ進むと、そこは巨大な広間でした。中央には古びた扉 🚪 があります。どうやら鍵穴があるようです。",
            choices: [
                { text: "扉を調べる 🧐🚪", nextScene: "examine_door" }
            ],
            onEnter: () => {
                playerPosition = { x: 3, y: 3 };
                currentMapState[3][3] = '🚪'; // ドアをマップに表示
                drawMap();
            }
        },
        examine_door: {
            message: "扉 🚪 は頑丈に閉まっています。鍵穴に合う鍵が必要です。",
            choices: [
                {
                    text: "鍵 🔑 を使う (持っている場合)",
                    nextScene: "use_key",
                    condition: () => inventory.ancient_key // 鍵を持っている場合のみ表示
                },
                { text: "引き返す ↩️", nextScene: "cave_light" }
            ],
            onEnter: () => { drawMap(); }
        },
        use_key: {
            message: "あなたは手に入れた鍵 🔑 を鍵穴に差し込みました。カチリと音がして、扉 🚪 が開きました！その先には…まばゆい光が…！",
            choices: [
                { text: "光の中へ進む 🚀", nextScene: "ending_true" }
            ],
            onEnter: () => {
                playerPosition = { x: 3, y: 3 };
                currentMapState[3][3] = '✨'; // 光の渦
                drawMap();
            }
        },
        ending_true: {
            message: "あなたは光の中へと進みました。そこには、あなたがずっと探し求めていた、森の真の秘密が隠されていました。あなたの冒険はまだ続くでしょう…！\n\n🎉 祝福された探求者！ゲームクリア！ 🎉",
            choices: [], // 終了
            onEnter: () => {
                playerPosition = { x: 3, y: 3 };
                currentMapState[3][3] = '🏆'; // 勝利の絵文字
                drawMap();
            }
        },
        approach_ruins: {
            message: "遺跡 🏛️ に近づくと、その古さと荘厳さに圧倒されます。壁には奇妙な模様が刻まれています。模様に触れると、何かが反応し、地面から古い巻物 📜 が現れました。",
            choices: [
                { text: "巻物を読む 📜🧐", nextScene: "read_scroll" },
                { text: "引き返す ↩️", nextScene: "climb_rock" }
            ],
            onEnter: () => {
                playerPosition = { x: 6, y: 1 }; // 遺跡の近く
                currentMapState[1][6] = '📜'; // 巻物
                drawMap();
            }
        },
        read_scroll: {
            message: "巻物 📜 には、この森の地図と、隠された「願いを叶える絵文字」の場所が記されていました！これであなたは本当の冒険を始められますね！\n\n✨ 森の秘密を解き明かした！ゲームクリア！ ✨",
            choices: [], // 終了
            onEnter: () => {
                playerPosition = { x: 3, y: 3 };
                currentMapState[3][3] = '🗺️'; // 地図の絵文字
                drawMap();
            }
        }
        // ここに新しいシーンを追加していくことができます！
    };

    let currentSceneId = 'start';

    // シーンを表示する関数
    function displayScene(sceneId) {
        currentSceneId = sceneId;
        const scene = scenes[sceneId];

        if (!scene) {
            console.error("Unknown scene ID:", sceneId);
            messageBox.innerHTML = "ゲームエラーが発生しました。";
            choicesDiv.innerHTML = '';
            return;
        }

        // シーンに入るときの処理を実行 (マップ更新など)
        if (scene.onEnter) {
            scene.onEnter();
        }

        // メッセージの表示
        messageBox.innerHTML = scene.message;

        // 選択肢の表示
        choicesDiv.innerHTML = '';
        if (scene.choices && scene.choices.length > 0) {
            scene.choices.forEach(choice => {
                // 条件がある選択肢は条件を満たした場合のみ表示
                if (choice.condition && !choice.condition()) {
                    return; // 条件を満たさないのでスキップ
                }

                const button = document.createElement('button');
                button.classList.add('choice-button');
                button.textContent = choice.text;
                button.addEventListener('click', () => {
                    displayScene(choice.nextScene);
                });
                choicesDiv.appendChild(button);
            });
        } else {
            // 選択肢がない場合（ゲーム終了時など）
            const restartButton = document.createElement('button');
            restartButton.classList.add('choice-button');
            restartButton.textContent = "最初からやり直す 🔄";
            restartButton.addEventListener('click', () => {
                displayScene('start');
            });
            choicesDiv.appendChild(restartButton);
        }
    }

    // ゲーム開始
    displayScene('start');
});