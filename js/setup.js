// ============================================
// ЭКРАН НАСТРОЙКИ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const chambers = [0, 0, 0, 0, 0, 0];
    let bulletCount = 1;
    let gameMode = 'spin';

    const chamberSlots = document.querySelectorAll('.chamber-slot');
    const bulletCountDisplay = document.getElementById('bullet-count');
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const btnRandom = document.getElementById('btn-random');
    const btnClear = document.getElementById('btn-clear');
    const btnSpin = document.getElementById('mode-spin');
    const btnNoSpin = document.getElementById('mode-no-spin');
    const btnStart = document.getElementById('btn-start-game');
    const btnBack = document.getElementById('btn-back-menu');

    function updateDisplay() {
        chamberSlots.forEach((slot, i) => {
            if (chambers[i] === 1) {
                slot.classList.add('loaded');
            } else {
                slot.classList.remove('loaded');
            }
        });
        bulletCountDisplay.textContent = bulletCount;
        btnSpin.classList.toggle('selected', gameMode === 'spin');
        btnNoSpin.classList.toggle('selected', gameMode === 'no_spin');
    }

    function randomLoad() {
        for (let i = 0; i < 6; i++) chambers[i] = 0;
        const pos = [];
        while (pos.length < bulletCount) {
            const p = Math.floor(Math.random() * 6);
            if (!pos.includes(p)) pos.push(p);
        }
        pos.forEach(p => chambers[p] = 1);
        updateDisplay();
    }

    chamberSlots.forEach((slot, i) => {
        slot.addEventListener('click', () => {
            const current = chambers.filter(c => c === 1).length;
            if (chambers[i] === 0 && current < 5) {
                chambers[i] = 1;
            } else if (chambers[i] === 1) {
                chambers[i] = 0;
            }
            bulletCount = chambers.filter(c => c === 1).length;
            updateDisplay();
        });
    });

    btnMinus.addEventListener('click', () => {
        bulletCount = Math.max(1, bulletCount - 1);
        randomLoad();
    });

    btnPlus.addEventListener('click', () => {
        bulletCount = Math.min(5, bulletCount + 1);
        randomLoad();
    });

    btnRandom.addEventListener('click', randomLoad);

    btnClear.addEventListener('click', () => {
        for (let i = 0; i < 6; i++) chambers[i] = 0;
        bulletCount = 0;
        updateDisplay();
    });

    btnSpin.addEventListener('click', () => {
        gameMode = 'spin';
        updateDisplay();
    });

    btnNoSpin.addEventListener('click', () => {
        gameMode = 'no_spin';
        updateDisplay();
    });

    btnStart.addEventListener('click', () => {
        const positions = [];
        chambers.forEach((c, i) => {
            if (c === 1) positions.push(i);
        });

        if (positions.length === 0) {
            alert('Зарядите хотя бы один патрон!');
            return;
        }

        GameLogic.reset();
        GameLogic.manualLoad(positions);
        GameLogic.setMode(gameMode);

        document.getElementById('menu-screen').classList.remove('active');
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        // Запускаем игру
        if (typeof initGame === 'function') initGame();
    });

    btnBack.addEventListener('click', () => {
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('menu-screen').classList.add('active');
    });

    // Начальная загрузка
    randomLoad();
});
