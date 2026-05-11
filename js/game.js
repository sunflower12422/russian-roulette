// ============================================
// ЭКРАН ИГРЫ
// ============================================

function initGame() {
    const roundCounter = document.getElementById('round-counter');
    const modeDisplay = document.getElementById('mode-display');
    const gameStatus = document.getElementById('game-status');
    const btnShoot = document.getElementById('btn-shoot');
    const btnReset = document.getElementById('btn-reset');
    const btnToMenu = document.getElementById('btn-to-menu');
    const historyList = document.getElementById('history-list');
    const drum = document.getElementById('game-drum');
    const chamberGame = document.querySelectorAll('.chamber-game');
    const muzzleFlash = document.getElementById('muzzle-flash');
    const bloodSplatter = document.getElementById('blood-splatter');
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');

    let isAnimating = false;

    function updateUI() {
        const state = GameLogic.getState();
        roundCounter.textContent = state.round;
        modeDisplay.textContent = state.mode === 'spin' ? '🔄 Вращение' : '🔒 Без вращения';

        chamberGame.forEach((ch, i) => {
            ch.classList.remove('highlight', 'bullet-mark');
            if (state.chambers[i] === 1) ch.classList.add('bullet-mark');
        });

        // История
        historyList.innerHTML = '';
        state.history.slice().reverse().forEach(entry => {
            const li = document.createElement('li');
            li.className = entry.hit ? 'hit' : 'miss';
            li.textContent = entry.hit
                ? `Раунд ${entry.round}: 💀 Гнездо ${entry.firedChamber + 1} — ПРОИГРЫШ`
                : `Раунд ${entry.round}: ✅ Гнездо ${entry.firedChamber + 1} — Осечка`;
            historyList.appendChild(li);
        });

        if (!state.alive) {
            btnShoot.disabled = true;
        }
    }

    btnShoot.addEventListener('click', () => {
        if (isAnimating || !GameLogic.alive) return;
        isAnimating = true;

        // Анимация вращения
        if (GameLogic.mode === 'spin') {
            drum.classList.add('spinning');
            setTimeout(() => {
                drum.classList.remove('spinning');
                doShoot();
            }, 800);
        } else {
            doShoot();
        }
    });

    function doShoot() {
        const result = GameLogic.shoot();

        // Подсветка гнезда
        chamberGame.forEach(ch => ch.classList.remove('highlight'));
        chamberGame[result.firedChamber].classList.add('highlight');

        // Вспышка
        if (result.hit) {
            muzzleFlash.classList.add('active');
            setTimeout(() => muzzleFlash.classList.remove('active'), 150);
        }

        // Статус
        if (result.hit) {
            gameStatus.textContent = '☠️ ВЫ ПРОИГРАЛИ! ☠️';
            gameStatus.className = 'game-status dead';
            bloodSplatter.classList.add('active');
            setTimeout(() => bloodSplatter.classList.remove('active'), 1500);
        } else {
            gameStatus.textContent = '✅ Осечка! Вы выжили!';
            gameStatus.className = 'game-status alive';
        }

        updateUI();
        isAnimating = false;
    }

    btnReset.addEventListener('click', () => {
        GameLogic.reset();
        gameScreen.classList.remove('active');
        document.getElementById('setup-screen').classList.add('active');
    });

    btnToMenu.addEventListener('click', () => {
        GameLogic.reset();
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
    });

    // Пробел для выстрела
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameScreen.classList.contains('active')) {
            e.preventDefault();
            btnShoot.click();
        }
    });

    // Начальное обновление
    gameStatus.textContent = '🎯 Нажмите на курок';
    gameStatus.className = 'game-status';
    btnShoot.disabled = false;
    bloodSplatter.classList.remove('active');
    updateUI();
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    randomLoad(); // из setup.js
});
