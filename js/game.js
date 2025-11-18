// ゲーム設定
const GAME_CONFIG = {
    animals: [
        { emoji: '🐶', name: 'いぬ', sound: 'ワンワン', frequency: 800 },
        { emoji: '🐱', name: 'ねこ', sound: 'ニャーニャー', frequency: 900 },
        { emoji: '🐰', name: 'うさぎ', sound: 'ピョンピョン', frequency: 1000 },
        { emoji: '🐸', name: 'かえる', sound: 'ケロケロ', frequency: 700 },
        { emoji: '🐻', name: 'くま', sound: 'ガオー', frequency: 400 },
        { emoji: '🐼', name: 'パンダ', sound: 'モグモグ', frequency: 500 },
        { emoji: '🐨', name: 'コアラ', sound: 'コアー', frequency: 600 },
        { emoji: '🦁', name: 'らいおん', sound: 'ガオー', frequency: 350 },
        { emoji: '🐯', name: 'とら', sound: 'ガルル', frequency: 380 },
        { emoji: '🦊', name: 'きつね', sound: 'コンコン', frequency: 850 },
        { emoji: '🐷', name: 'ぶた', sound: 'ブーブー', frequency: 450 },
        { emoji: '🐮', name: 'うし', sound: 'モーモー', frequency: 300 }
    ],
    gridSize: 9, // 常に3x3 grid
    gameDuration: 60, // 秒（長めに設定）
    spawnInterval: 2500, // ミリ秒（ゆっくり）
    pointsPerClick: 10,
    maxActiveAnimals: 3, // 同時に表示する動物の最大数
    minActiveAnimals: 2  // 同時に表示する動物の最小数
};

// グリッド設定を取得（常に3x3）
function getGridConfig() {
    return {
        size: 9,
        columns: 3,
        rows: 3
    };
}

// 現在のグリッドサイズを取得（常に9）
function getGridSize() {
    return 9;
}

// ゲーム状態
let gameState = {
    score: 0,
    timeLeft: GAME_CONFIG.gameDuration,
    isPlaying: false,
    activeAnimals: [], // 現在アクティブな動物の配列 [{index: 0, animal: {...}}, ...]
    spawnTimer: null,
    countdownTimer: null
};

// DOM要素
const elements = {
    startButton: document.getElementById('startButton'),
    restartButton: document.getElementById('restartButton'),
    startScreen: document.getElementById('startScreen'),
    gameGrid: document.getElementById('gameGrid'),
    endScreen: document.getElementById('endScreen'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalScoreDisplay: document.getElementById('finalScore')
};

// 初期化
function init() {
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', resetGame);
    createGameGrid();
}

// ゲームグリッドを作成
function createGameGrid() {
    const gridConfig = getGridConfig();
    elements.gameGrid.innerHTML = '';

    // グリッドのレイアウトを設定
    elements.gameGrid.style.gridTemplateColumns = `repeat(${gridConfig.columns}, 1fr)`;
    elements.gameGrid.style.gridTemplateRows = `repeat(${gridConfig.rows}, 1fr)`;

    // セルを作成
    for (let i = 0; i < gridConfig.size; i++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        elements.gameGrid.appendChild(cell);
    }
}

// ゲーム開始
function startGame() {
    // 初期化
    gameState.score = 0;
    gameState.timeLeft = GAME_CONFIG.gameDuration;
    gameState.isPlaying = true;

    // UI更新
    updateScore();
    updateTimer();
    elements.startScreen.style.display = 'none';
    elements.gameGrid.style.display = 'grid';
    elements.endScreen.style.display = 'none';

    // ゲームループ開始
    startSpawning();
    startCountdown();

    // 効果音（オプション）
    playSound('start');
}

// 動物をスポーン
function startSpawning() {
    spawnAnimals();
    gameState.spawnTimer = setInterval(() => {
        if (gameState.isPlaying) {
            spawnAnimals();
        }
    }, GAME_CONFIG.spawnInterval);
}

// ランダムなセルに動物を表示（複数）
function spawnAnimals() {
    // 全ての動物をクリア
    clearAllAnimals();

    const gridSize = getGridSize();
    const numAnimals = Math.floor(Math.random() * (GAME_CONFIG.maxActiveAnimals - GAME_CONFIG.minActiveAnimals + 1)) + GAME_CONFIG.minActiveAnimals;

    // 使用可能なセルのインデックス
    const availableIndexes = Array.from({length: gridSize}, (_, i) => i);

    // ランダムに複数の動物を配置
    for (let i = 0; i < numAnimals && availableIndexes.length > 0; i++) {
        // ランダムなセルを選択
        const randomPos = Math.floor(Math.random() * availableIndexes.length);
        const cellIndex = availableIndexes[randomPos];
        availableIndexes.splice(randomPos, 1); // 使用したインデックスを削除

        // ランダムな動物を選択
        const randomAnimal = GAME_CONFIG.animals[Math.floor(Math.random() * GAME_CONFIG.animals.length)];

        // セルに動物を表示
        const cell = document.querySelector(`[data-index="${cellIndex}"]`);
        if (cell) {
            cell.innerHTML = `
                <div class="animal-emoji">${randomAnimal.emoji}</div>
                <div class="animal-name">${randomAnimal.name}</div>
                <div class="animal-sound">${randomAnimal.sound}</div>
            `;
            cell.classList.add('active');
            gameState.activeAnimals.push({index: cellIndex, animal: randomAnimal});
        }
    }
}

// 全ての動物をクリア
function clearAllAnimals() {
    gameState.activeAnimals.forEach(animal => {
        const cell = document.querySelector(`[data-index="${animal.index}"]`);
        if (cell) {
            cell.innerHTML = '';
            cell.classList.remove('active');
        }
    });
    gameState.activeAnimals = [];
}

// セルクリック処理
function handleCellClick(event) {
    if (!gameState.isPlaying) return;

    const clickedIndex = parseInt(event.currentTarget.dataset.index);
    const cell = event.currentTarget;

    // クリックされたセルに動物がいるか確認
    const animalIndex = gameState.activeAnimals.findIndex(animal => animal.index === clickedIndex);

    if (animalIndex !== -1 && cell.classList.contains('active')) {
        const clickedAnimal = gameState.activeAnimals[animalIndex].animal;

        // スコア追加
        gameState.score += GAME_CONFIG.pointsPerClick;
        updateScore();

        // エフェクト
        cell.classList.add('clicked', 'sparkle');
        setTimeout(() => {
            cell.classList.remove('clicked', 'sparkle');
            cell.innerHTML = '';
            cell.classList.remove('active');
        }, 300);

        // 動物の鳴き声を再生
        playAnimalSound(clickedAnimal);

        // 配列から削除
        gameState.activeAnimals.splice(animalIndex, 1);
    }
}

// カウントダウン開始
function startCountdown() {
    gameState.countdownTimer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ゲーム終了
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.spawnTimer);
    clearInterval(gameState.countdownTimer);

    // 全ての動物を削除
    clearAllAnimals();

    // 終了画面を表示
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.gameGrid.style.display = 'none';
    elements.endScreen.style.display = 'block';

    // 効果音
    playSound('end');
}

// ゲームリセット
function resetGame() {
    elements.endScreen.style.display = 'none';
    elements.startScreen.style.display = 'block';

    // グリッドを再作成（画面サイズが変わった場合に対応）
    createGameGrid();
}

// スコア更新
function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

// タイマー更新
function updateTimer() {
    elements.timerDisplay.textContent = gameState.timeLeft;

    // 時間が少なくなったら色を変える
    if (gameState.timeLeft <= 5) {
        elements.timerDisplay.style.color = '#ff6b6b';
        elements.timerDisplay.style.animation = 'pulse 0.5s infinite';
    } else {
        elements.timerDisplay.style.color = '#fff59d';
        elements.timerDisplay.style.animation = 'none';
    }
}

// 動物の鳴き声を再生
function playAnimalSound(animal) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 動物ごとの周波数で音を鳴らす
        oscillator.frequency.value = animal.frequency;
        gainNode.gain.value = 0.3;
        oscillator.type = 'sine';

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// 効果音再生（オプション - Web Audio API使用）
function playSound(type) {
    // AudioContextを使った簡単なビープ音
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 音の種類に応じて周波数を変える
        switch(type) {
            case 'start':
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.2;
                oscillator.type = 'triangle';
                break;
            case 'end':
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.2;
                oscillator.type = 'square';
                break;
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // 効果音が再生できない場合は無視
        console.log('Audio not supported');
    }
}

// キーボードサポート（アクセシビリティ）
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        if (!gameState.isPlaying && elements.startScreen.style.display !== 'none') {
            event.preventDefault();
            startGame();
        } else if (!gameState.isPlaying && elements.endScreen.style.display !== 'none') {
            event.preventDefault();
            resetGame();
        }
    }
});

// ページ読み込み時に初期化
window.addEventListener('DOMContentLoaded', init);

// ウィンドウサイズ変更時にグリッドを再作成
let resizeTimer;
window.addEventListener('resize', () => {
    // ゲーム中でない場合のみ再作成
    if (!gameState.isPlaying) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            createGameGrid();
        }, 250); // デバウンス: 250ms待ってから実行
    }
});
