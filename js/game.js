// ゲーム設定
const GAME_CONFIG = {
    animals: ['🐶', '🐱', '🐰', '🐸', '🐻', '🐼', '🐨', '🦁', '🐯', '🦊', '🐷', '🐮'],
    gridSize: 9, // 3x3 grid
    gameDuration: 30, // 秒
    spawnInterval: 800, // ミリ秒
    pointsPerClick: 10
};

// ゲーム状態
let gameState = {
    score: 0,
    timeLeft: GAME_CONFIG.gameDuration,
    isPlaying: false,
    currentAnimal: null,
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
    elements.gameGrid.innerHTML = '';
    for (let i = 0; i < GAME_CONFIG.gridSize; i++) {
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
    spawnAnimal();
    gameState.spawnTimer = setInterval(() => {
        if (gameState.isPlaying) {
            spawnAnimal();
        }
    }, GAME_CONFIG.spawnInterval);
}

// ランダムなセルに動物を表示
function spawnAnimal() {
    // 前の動物を削除
    if (gameState.currentAnimal !== null) {
        const previousCell = document.querySelector(`[data-index="${gameState.currentAnimal}"]`);
        if (previousCell) {
            previousCell.textContent = '';
            previousCell.classList.remove('active');
        }
    }

    // ランダムなセルを選択
    const randomIndex = Math.floor(Math.random() * GAME_CONFIG.gridSize);
    const randomAnimal = GAME_CONFIG.animals[Math.floor(Math.random() * GAME_CONFIG.animals.length)];

    const cell = document.querySelector(`[data-index="${randomIndex}"]`);
    if (cell) {
        cell.textContent = randomAnimal;
        cell.classList.add('active');
        gameState.currentAnimal = randomIndex;
    }
}

// セルクリック処理
function handleCellClick(event) {
    if (!gameState.isPlaying) return;

    const clickedIndex = parseInt(event.currentTarget.dataset.index);
    const cell = event.currentTarget;

    // アクティブな動物をクリックした場合
    if (clickedIndex === gameState.currentAnimal && cell.classList.contains('active')) {
        // スコア追加
        gameState.score += GAME_CONFIG.pointsPerClick;
        updateScore();

        // エフェクト
        cell.classList.add('clicked', 'sparkle');
        setTimeout(() => {
            cell.classList.remove('clicked', 'sparkle');
            cell.textContent = '';
            cell.classList.remove('active');
        }, 300);

        // 効果音
        playSound('click');

        // 新しい動物をすぐにスポーン
        gameState.currentAnimal = null;
        setTimeout(spawnAnimal, 300);
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
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('active');
    });

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
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
                oscillator.type = 'sine';
                break;
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
