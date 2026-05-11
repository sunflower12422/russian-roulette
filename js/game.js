// ============================================
// ГЛАВНЫЙ КОНТРОЛЛЕР + ЭКРАН ИГРЫ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Элементы экранов
    const menuScreen = document.getElementById('menu-screen');
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    
    // Элементы меню
    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    
    // Элементы настройки
    const chamberSlots = document.querySelectorAll('.chamber-slot');
    const bulletCountDisplay = document.getElementById('bullet-count');
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const btnRandom = document.getElementById('btn-random');
    const btnClear = document.getElementById('btn-clear');
    const btnSpin = document.getElementById('mode-spin');
    const btnNoSpin = document.getElementById('mode-no-spin');
    const btnStart = document.getElementById('btn-start-game');
    const btnBackSetup = document.getElementById('btn-back-menu');
    
    // Элементы игры
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
    
    // Состояние
    let chambers = [0, 0, 0, 0, 0, 0];
    let bulletCount = 1;
    let gameMode = 'spin';
    let alive = true;
    let round = 0;
    let currentChamber = 0;
    let history = [];
    let isAnimating = false;
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ==========
    function showScreen(screen) {
        menuScreen.classList.remove('active');
        setupScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        screen.classList.add('active');
    }
    
    // ========== МЕНЮ ==========
    btnPlay.addEventListener('click', () => showScreen(setupScreen));
    btnSettings.addEventListener('click', () => showScreen(setupScreen));
    
    // ========== НАСТРОЙКА ==========
    function updateSetupDisplay() {
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
        chambers = [0, 0, 0, 0, 0, 0];
        const pos = [];
        while (pos.length < bulletCount) {
            const p = Math.floor(Math.random() * 6);
            if (!pos.includes(p)) pos.push(p);
        }
        pos.forEach(p => chambers[p] = 1);
        updateSetupDisplay();
    }
    
    chamberSlots.forEach((slot, i) => {
        slot.addEventListener('click', () => {
            if (chambers[i] === 0) {
                const current = chambers.filter(c => c === 1).length;
                if (current < 5) {
                    chambers[i] = 1;
                }
            } else {
                chambers[i] = 0;
            }
            bulletCount = chambers.filter(c => c === 1).length;
            updateSetupDisplay();
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
        chambers = [0, 0, 0, 0, 0, 0];
        bulletCount = 0;
        updateSetupDisplay();
    });
    
    btnSpin.addEventListener('click', () => {
        gameMode = 'spin';
        updateSetupDisplay();
    });
    
    btnNoSpin.addEventListener('click', () => {
        gameMode = 'no_spin';
        updateSetupDisplay();
    });
    
    btnBackSetup.addEventListener('click', () => showScreen(menuScreen));
    
    btnStart.addEventListener('click', () => {
        const bulletPositions = [];
        chambers.forEach((c, i) => {
            if (c === 1) bulletPositions.push(i);
        });
        
        if (bulletPositions.length === 0) {
            alert('Зарядите хотя бы один патрон!');
            return;
        }
        
        // Сохраняем настройки
        window.gameChambers = [...chambers];
        window.gameMode = gameMode;
        
        // Сброс игры
        alive = true;
        round = 0;
        currentChamber = 0;
        history = [];
        
        showScreen(gameScreen);
        initGameScreen();
    });
    
    // ========== ИГРА ==========
    function initGameScreen() {
        roundCounter.textContent = '0';
        modeDisplay.textContent = window.gameMode === 'spin' ? '🔄 Вращение' : '🔒 Без вращения';
        gameStatus.textContent = '🎯 Нажмите на курок';
        gameStatus.className = 'game-status';
        btnShoot.disabled = false;
        bloodSplatter.classList.remove('active');
        historyList.innerHTML = '<li style="color: #666;">Пока выстрелов нет...</li>';
        
        chamberGame.forEach(ch => {
            ch.classList.remove('highlight', 'bullet-mark');
        });
        
        // Показываем патроны
        chamberGame.forEach((ch, i) => {
            if (window.gameChambers[i] === 1) {
                ch.classList.add('bullet-mark');
            }
        });
    }
    
    btnShoot.addEventListener('click', () => {
        if (isAnimating || !alive) return;
        isAnimating = true;
        
        // Анимация вращения
        if (window.gameMode === 'spin') {
            drum.classList.add('spinning');
            setTimeout(() => {
                drum.classList.remove('spinning');
                doShoot();
            }, 700 + Math.random() * 500);
        } else {
            doShoot();
        }
    });
    
    function doShoot() {
        round++;
        roundCounter.textContent = round;
        
        let firedChamber;
        if (window.gameMode === 'spin') {
            firedChamber = Math.floor(Math.random() * 6);
        } else {
            firedChamber = currentChamber % 6;
            currentChamber++;
        }
        
        const hit = window.gameChambers[firedChamber] === 1;
        
        // Подсветка
        chamberGame.forEach(ch => ch.classList.remove('highlight'));
        chamberGame[firedChamber].classList.add('highlight');
        
        if (hit) {
            // Убираем патрон
            window.gameChambers[firedChamber] = 0;
            chamberGame[firedChamber].classList.remove('bullet-mark');
            
            // Эффекты
            muzzleFlash.classList.add('active');
            setTimeout(() => muzzleFlash.classList.remove('active'), 150);
            
            gameStatus.textContent = '☠️ ВЫ ПРОИГРАЛИ! ☠️';
            gameStatus.className = 'game-status dead';
            bloodSplatter.classList.add('active');
            setTimeout(() => bloodSplatter.classList.remove('active'), 2000);
            alive = false;
            btnShoot.disabled = true;
        } else {
            gameStatus.textContent = '✅ Осечка! Вы выжили!';
            gameStatus.className = 'game-status alive';
        }
        
        // История
        history.push({ round, firedChamber, hit });
        updateHistory();
        
        isAnimating = false;
    }
    
    function updateHistory() {
        historyList.innerHTML = '';
        const reversed = [...history].reverse();
        reversed.forEach(entry => {
            const li = document.createElement('li');
            li.className = entry.hit ? 'hit' : 'miss';
            li.textContent = entry.hit
                ? `Раунд ${entry.round}: 💀 Гнездо ${entry.firedChamber + 1} — ПРОИГРЫШ`
                : `Раунд ${entry.round}: ✅ Гнездо ${entry.firedChamber + 1} — Осечка`;
            historyList.appendChild(li);
        });
    }
    
    btnReset.addEventListener('click', () => {
        alive = true;
        round = 0;
        currentChamber = 0;
        history = [];
        showScreen(setupScreen);
    });
    
    btnToMenu.addEventListener('click', () => {
        alive = true;
        round = 0;
        currentChamber = 0;
        history = [];
        showScreen(menuScreen);
    });
    
    // Пробел для выстрела
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameScreen.classList.contains('active') && !isAnimating && alive) {
            e.preventDefault();
            btnShoot.click();
        }
    });
    
    // Начальная загрузка
    randomLoad();
});
