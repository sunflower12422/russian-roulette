// ============================================
// ГЛАВНЫЙ КОНТРОЛЛЕР (ЭКРАНЫ + НАВИГАЦИЯ)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========== ЭКРАНЫ ==========
    const menuScreen = document.getElementById('menu-screen');
    const modesScreen = document.getElementById('modes-screen');
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    
    // ========== КНОПКИ МЕНЮ ==========
    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    
    // ========== КНОПКИ ВЫБОРА РЕЖИМА ==========
    const modeClassic = document.getElementById('mode-classic');
    const modeNospin = document.getElementById('mode-nospin');
    const modeBuckshot = document.getElementById('mode-buckshot');
    const modeSquid = document.getElementById('mode-squid');
    const btnBackToMenu = document.getElementById('btn-back-to-menu');
    
    // ========== КНОПКИ НАСТРОЙКИ ==========
    const chamberSlots = document.querySelectorAll('.chamber-slot');
    const bulletCountDisplay = document.getElementById('bullet-count');
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const btnRandom = document.getElementById('btn-random');
    const btnClear = document.getElementById('btn-clear');
    const modeSpin = document.getElementById('mode-spin');
    const modeNoSpin = document.getElementById('mode-no-spin');
    const spinModeSection = document.getElementById('spin-mode-section');
    const btnStartGame = document.getElementById('btn-start-game');
    const btnBackSetup = document.getElementById('btn-back-setup');
    
    // ========== ЭЛЕМЕНТЫ ИГРЫ ==========
    const roundCounter = document.getElementById('round-counter');
    const modeDisplay = document.getElementById('mode-display');
    const gameStatus = document.getElementById('game-status');
    const btnShoot = document.getElementById('btn-shoot');
    const btnReset = document.getElementById('btn-reset');
    const btnToMenu = document.getElementById('btn-to-menu');
    const historyList = document.getElementById('history-list');
    const bloodSplatter = document.getElementById('blood-splatter');
    const gameButtonsNormal = document.getElementById('game-buttons-normal');
    const normalDrumContainer = document.getElementById('normal-drum-container');
    const buckshotUI = document.getElementById('buckshot-ui');
    const squidUI = document.getElementById('squid-ui');
    
    // ========== СОСТОЯНИЕ ==========
    let currentMode = 'classic'; // classic, nospin, buckshot, squid
    let chambers = [0, 0, 0, 0, 0, 0];
    let bulletCount = 1;
    let spinMode = 'spin';
    let round = 0;
    let alive = true;
    let history = [];
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ==========
    function showScreen(screen) {
        [menuScreen, modesScreen, setupScreen, gameScreen].forEach(s => {
            s.classList.remove('active');
        });
        screen.classList.add('active');
    }
    
    // ========== МЕНЮ → ВЫБОР РЕЖИМА ==========
    btnPlay.addEventListener('click', () => showScreen(modesScreen));
    btnSettings.addEventListener('click', () => showScreen(modesScreen));
    
    // ========== ВЫБОР РЕЖИМА → НАСТРОЙКА ==========
    btnBackToMenu.addEventListener('click', () => showScreen(menuScreen));
    
    function selectMode(mode) {
        currentMode = mode;
        
        // Скрываем выбор вращения для багшота и кальмара
        if (mode === 'buckshot' || mode === 'squid') {
            spinModeSection.style.display = 'none';
        } else {
            spinModeSection.style.display = 'block';
        }
        
        // Устанавливаем режим вращения по умолчанию
        if (mode === 'nospin') {
            spinMode = 'no_spin';
            modeSpin.classList.remove('selected');
            modeNoSpin.classList.add('selected');
        } else {
            spinMode = 'spin';
            modeSpin.classList.add('selected');
            modeNoSpin.classList.remove('selected');
        }
        
        showScreen(setupScreen);
    }
    
    modeClassic.addEventListener('click', () => selectMode('classic'));
    modeNospin.addEventListener('click', () => selectMode('nospin'));
    modeBuckshot.addEventListener('click', () => selectMode('buckshot'));
    modeSquid.addEventListener('click', () => selectMode('squid'));
    
    // ========== НАСТРОЙКА ==========
    function updateSetupDisplay() {
        chamberSlots.forEach((slot, i) => {
            slot.classList.toggle('loaded', chambers[i] === 1);
        });
        bulletCountDisplay.textContent = bulletCount;
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
                if (current < 5) chambers[i] = 1;
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
    
    modeSpin.addEventListener('click', () => {
        spinMode = 'spin';
        modeSpin.classList.add('selected');
        modeNoSpin.classList.remove('selected');
    });
    
    modeNoSpin.addEventListener('click', () => {
        spinMode = 'no_spin';
        modeNoSpin.classList.add('selected');
        modeSpin.classList.remove('selected');
    });
    
    btnBackSetup.addEventListener('click', () => showScreen(modesScreen));
    
    // ========== ЗАПУСК ИГРЫ ==========
    btnStartGame.addEventListener('click', () => {
        const bulletPositions = [];
        chambers.forEach((c, i) => {
            if (c === 1) bulletPositions.push(i);
        });
        
        if (bulletPositions.length === 0 && currentMode !== 'buckshot' && currentMode !== 'squid') {
            alert('Зарядите хотя бы один патрон!');
            return;
        }
        
        // Сброс состояния
        round = 0;
        alive = true;
        history = [];
        roundCounter.textContent = '0';
        gameStatus.textContent = '🎯 Нажмите на курок';
        gameStatus.className = 'game-status';
        historyList.innerHTML = '<li style="color: #666;">Пока выстрелов нет...</li>';
        bloodSplatter.classList.remove('active');
        
        // Показываем/скрываем нужный интерфейс
        normalDrumContainer.style.display = 'none';
        buckshotUI.style.display = 'none';
        squidUI.style.display = 'none';
        gameButtonsNormal.style.display = 'none';
        
        // Запускаем нужный режим
        switch(currentMode) {
            case 'classic':
            case 'nospin':
                normalDrumContainer.style.display = 'block';
                gameButtonsNormal.style.display = 'flex';
                modeDisplay.textContent = spinMode === 'spin' ? '🔄 Вращение' : '🔒 Без вращения';
                initClassicGame(bulletPositions, spinMode);
                break;
                
            case 'buckshot':
                buckshotUI.style.display = 'block';
                modeDisplay.textContent = '💀 Багшот';
                initBuckshotGame();
                break;
                
            case 'squid':
                squidUI.style.display = 'block';
                normalDrumContainer.style.display = 'block';
                modeDisplay.textContent = '🦑 Кальмар';
                initSquidGame();
                break;
        }
        
        showScreen(gameScreen);
    });
    
    // ========== КНОПКИ ИГРЫ ==========
    btnReset.addEventListener('click', () => {
        alive = true;
        round = 0;
        history = [];
        showScreen(modesScreen);
    });
    
    btnToMenu.addEventListener('click', () => {
        alive = true;
        round = 0;
        history = [];
        showScreen(menuScreen);
    });
    
    // Пробел для выстрела
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameScreen.classList.contains('active') && alive) {
            e.preventDefault();
            if (btnShoot && !btnShoot.disabled) btnShoot.click();
        }
    });
    
    // Начальная загрузка
    randomLoad();
    
    // Экспорт для других модулей
    window.GameController = {
        showScreen,
        getChambers: () => chambers,
        setChambers: (newChambers) => { chambers = newChambers; },
        getBulletCount: () => bulletCount,
        getSpinMode: () => spinMode,
        getCurrentMode: () => currentMode,
        updateHistory: (entry) => {
            history.push(entry);
            updateHistoryDisplay();
        },
        showBlood: () => {
            bloodSplatter.classList.add('active');
            setTimeout(() => bloodSplatter.classList.remove('active'), 2000);
        },
        setGameStatus: (text, className) => {
            gameStatus.textContent = text;
            gameStatus.className = 'game-status ' + (className || '');
        },
        updateRound: (num) => {
            round = num;
            roundCounter.textContent = num;
        },
        getGameElements: () => ({
            drum: document.getElementById('game-drum'),
            chamberGame: document.querySelectorAll('#normal-drum-container .chamber-game'),
            muzzleFlash: document.getElementById('muzzle-flash'),
            btnShoot: btnShoot,
            gameButtonsNormal: gameButtonsNormal
        })
    };
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        [...history].reverse().forEach(entry => {
            const li = document.createElement('li');
            li.className = entry.hit ? 'hit' : 'miss';
            li.textContent = entry.text || (entry.hit
                ? `Раунд ${entry.round}: 💀 Гнездо ${entry.firedChamber + 1} — ПРОИГРЫШ`
                : `Раунд ${entry.round}: ✅ Гнездо ${entry.firedChamber + 1} — Осечка`);
            historyList.appendChild(li);
        });
    }
});
