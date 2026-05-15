// ============================================
// ГЛАВНЫЙ КОНТРОЛЛЕР (ЭКРАНЫ + НАВИГАЦИЯ)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========== ЭКРАНЫ ==========
    const menuScreen = document.getElementById('menu-screen');
    const achievementsScreen = document.getElementById('achievements-screen');
    const modesScreen = document.getElementById('modes-screen');
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    
    // ========== КНОПКИ МЕНЮ ==========
    const btnPlay = document.getElementById('btn-play');
    const btnAchievements = document.getElementById('btn-achievements');
    const btnSettings = document.getElementById('btn-settings');
    const menuRevolver = document.getElementById('menu-revolver');
    const versionText = document.getElementById('version-text');
    const menuSubtitle = document.getElementById('menu-subtitle');
    
    // ========== КНОПКИ ДОСТИЖЕНИЙ ==========
    const btnAchBack = document.getElementById('btn-ach-back');
    
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
    let currentMode = 'classic';
    let chambers = [0, 0, 0, 0, 0, 0];
    let bulletCount = 1;
    let spinMode = 'spin';
    let round = 0;
    let alive = true;
    let history = [];
    let memesEnabled = false;
    let versionClicks = 0;
    let revolverClicks = 0;
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ==========
    function showScreen(screen) {
        [menuScreen, achievementsScreen, modesScreen, setupScreen, gameScreen].forEach(s => {
            s.classList.remove('active');
        });
        screen.classList.add('active');
        
        // Если открыли достижения — обновляем
        if (screen === achievementsScreen) {
            updateAchievementsScreen();
        }
    }
    
    // ========== МЕНЮ ==========
    btnPlay.addEventListener('click', () => showScreen(modesScreen));
    btnSettings.addEventListener('click', () => showScreen(modesScreen));
    
    btnAchievements.addEventListener('click', () => {
        showScreen(achievementsScreen);
    });
    
    // Клик по револьверу (для ачивки Жабка)
    menuRevolver.addEventListener('click', () => {
        revolverClicks++;
        if (typeof Achievements !== 'undefined') {
            Achievements.onRevolverClick();
        }
        
        // Пасхалка с котом (мем-режим + 3 клика по версии + револьвер)
        if (memesEnabled && versionClicks >= 3) {
            if (typeof Achievements !== 'undefined') {
                Achievements.onEasterEgg('cat');
            }
            // Мяу!
            const meow = document.createElement('div');
            meow.textContent = '🐱 МЯУ!';
            meow.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3rem;z-index:999;pointer-events:none;animation:fadeIn 1s ease';
            document.body.appendChild(meow);
            setTimeout(() => meow.remove(), 2000);
        }
    });
    
    // Клик по версии (для мем-режима и пасхалок)
    versionText.addEventListener('click', () => {
        versionClicks++;
        
        // 5 кликов — включаем мем-режим
        if (versionClicks >= 5 && !memesEnabled) {
            memesEnabled = true;
            enableMemesMode();
            if (typeof Achievements !== 'undefined') {
                Achievements.enableMemes();
            }
            
            // Эффект тряски
            document.body.style.animation = 'deadShake 0.5s ease';
            setTimeout(() => document.body.style.animation = '', 500);
        }
        
        // 3 клика + потом револьвер = кот
        if (versionClicks === 3 && memesEnabled) {
            versionText.textContent = '🐱?';
            setTimeout(() => {
                if (memesEnabled) versionText.textContent = 'v6.9.0 🐸';
            }, 2000);
        }
    });
    
    // Клик по подписи (Юджин в мем-режиме)
    menuSubtitle.addEventListener('click', () => {
        if (memesEnabled && menuSubtitle.textContent === 'Test your luck') {
            window.open('https://rutube.ru/video/530f0d755fcf5ef0997bac7484220bc2/', '_blank');
        }
    });
    
    // ========== МЕМ-РЕЖИМ ==========
    function enableMemesMode() {
        // Меняем тексты
        document.getElementById('menu-title').textContent = '☭ РУССКАЯ';
        document.getElementById('menu-title2').textContent = 'КОТЛЕТКА ☭';
        document.getElementById('menu-subtitle').textContent = 'Test your luck';
        document.getElementById('menu-subtitle').style.cursor = 'pointer';
        document.getElementById('version-text').textContent = 'v6.9.0 🐸';
        
        // Меняем названия режимов
        document.getElementById('mode-name-classic').textContent = 'Котлетка';
        document.getElementById('mode-name-nospin').textContent = 'Без шансов';
        document.getElementById('mode-name-buckshot').textContent = 'Шлёп-шлёп';
        document.getElementById('mode-name-squid').textContent = 'Каракатица';
        
        // Меняем кнопку выстрела
        const shootBtnText = document.getElementById('btn-shoot');
        if (shootBtnText) shootBtnText.textContent = '💨 ПУКНУТЬ';
        
        // Меняем заголовки
        document.getElementById('modes-title').textContent = '🤡 РЕЖИМ МЕМОВ';
        document.getElementById('setup-title').textContent = '🥒 ЗАРЯДИ ОГУРЦЫ';
        document.getElementById('setup-label').textContent = '🥒 Зарядите огурцы:';
        document.getElementById('spin-label').textContent = '🎰 Крутить или не крутить:';
        
        // Сохраняем
        localStorage.setItem('rr_memes', 'true');
    }
    
    // Проверяем при загрузке
    if (localStorage.getItem('rr_memes') === 'true') {
        memesEnabled = true;
        versionClicks = 5;
        enableMemesMode();
        if (typeof Achievements !== 'undefined') {
            Achievements.stats.memesEnabled = true;
        }
    }
    
    // ========== ДОСТИЖЕНИЯ ==========
    function updateAchievementsScreen() {
        if (typeof Achievements === 'undefined') return;
        
        const achGrid = document.getElementById('ach-grid');
        const statUnlocked = document.getElementById('stat-unlocked');
        const statDeaths = document.getElementById('stat-deaths');
        const achSubtitle = document.getElementById('ach-subtitle');
        
        const all = Achievements.getAllForDisplay();
        const unlocked = all.filter(a => a.unlocked && a.available);
        
        statUnlocked.textContent = unlocked.length;
        statDeaths.textContent = Achievements.stats.deaths;
        
        if (memesEnabled) {
            achSubtitle.textContent = 'Собери их всех, мемный ты! 🐸';
        } else {
            achSubtitle.textContent = 'Собери их всех!';
        }
        
        achGrid.innerHTML = '';
        
        all.forEach(ach => {
            if (!ach.available) return;
            if (!ach.visible) return;
            
            const card = document.createElement('div');
            card.className = `ach-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
            
            let icon = ach.unlocked ? ach.icon : '';
            let name = ach.unlocked ? ach.name : '???';
            let desc = ach.unlocked ? ach.desc : 'Получите чтобы узнать';
            
            // Мем-названия
            if (memesEnabled && ach.unlocked) {
                const memeNames = {
                    'Везунчик': 'Везучий дурачок',
                    'Камикадзе': 'Лоб в лоб',
                    'Охотник на ботов': 'Железяку в нокаут',
                    'Ги Хун': 'Каракатица-победитель',
                    'Коллекционер': 'Хозяин зоопарка',
                    'Король рулетки': 'Диванный император',
                    'Лох': 'Лошара года',
                    'Джекпот': 'Слоник-джекпотик',
                    'Ленивая колбаса': 'Батон с дивана',
                    'Да ты снайпер': 'Василий Зайцев',
                    'Диванный король': 'Его Величество Пуфик',
                    'Счастливчик': 'Везучий какашка',
                    'Клоун': 'Клоун в цирке',
                    'Интеллигент': 'Профессор кислых щей'
                };
                name = memeNames[name] || name;
            }
            
            card.innerHTML = `
                <div class="ach-card-icon">${icon || '❓'}</div>
                <div class="ach-card-info">
                    <div class="ach-card-name ${ach.id === 'king' && ach.unlocked ? 'clickable-crown' : ''}" 
                         ${ach.id === 'king' && ach.unlocked ? 'id="crown-achievement"' : ''}>
                        ${name}
                    </div>
                    <div class="ach-card-desc">${desc}</div>
                </div>
            `;
            
            achGrid.appendChild(card);
        });
        
        // Клик по короне
        setTimeout(() => {
            const crown = document.getElementById('crown-achievement');
            if (crown) {
                crown.addEventListener('click', () => {
                    Achievements.onCrownClick();
                    updateAchievementsScreen();
                });
            }
        }, 100);
    }
    
    // ========== ВЫБОР РЕЖИМА → НАСТРОЙКА ==========
    btnBackToMenu.addEventListener('click', () => showScreen(menuScreen));
    btnAchBack.addEventListener('click', () => showScreen(menuScreen));
    
    function selectMode(mode) {
        currentMode = mode;
        
        if (mode === 'buckshot' || mode === 'squid') {
            spinModeSection.style.display = 'none';
        } else {
            spinModeSection.style.display = 'block';
        }
        
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
        
        // Счётчик для ачивки
        if (typeof Achievements !== 'undefined') {
            Achievements.onRandomClick();
        }
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
            
            // Пасхалка "конь"
            if (bulletCount === 6 || (bulletCount === 5 && chambers.filter(c => c === 1).length === 5)) {
                // Не сработает так, лучше ввести "конь"
            }
        });
    });
    
    // Пасхалка: вводим "конь" в количестве патронов
    let konTyped = '';
    document.addEventListener('keydown', (e) => {
        konTyped += e.key.toLowerCase();
        if (konTyped.length > 4) konTyped = konTyped.slice(-4);
        if (konTyped === 'конь' || konTyped === 'kohn') {
            bulletCount = 6;
            chambers = [1, 1, 1, 1, 1, 1];
            updateSetupDisplay();
            konTyped = '';
            if (memesEnabled && typeof Achievements !== 'undefined') {
                Achievements.onEasterEgg('horse');
            }
        }
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
            alert(memesEnabled ? 'Заряди огурцы!' : 'Зарядите хотя бы один патрон!');
            return;
        }
        
        // Сброс состояния
        round = 0;
        alive = true;
        history = [];
        roundCounter.textContent = '0';
        gameStatus.textContent = memesEnabled ? '🎯 Жми Пукнуть!' : '🎯 Нажмите на курок';
        gameStatus.className = 'game-status';
        historyList.innerHTML = '<li style="color: #666;">Пока выстрелов нет...</li>';
        bloodSplatter.classList.remove('active');
        
        // Показываем/скрываем интерфейс
        normalDrumContainer.style.display = 'none';
        buckshotUI.style.display = 'none';
        squidUI.style.display = 'none';
        gameButtonsNormal.style.display = 'none';
        
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
                modeDisplay.textContent = memesEnabled ? '🤖 Шлёп-шлёп' : '💀 Багшот';
                initBuckshotGame();
                break;
                
            case 'squid':
                squidUI.style.display = 'block';
                normalDrumContainer.style.display = 'block';
                modeDisplay.textContent = memesEnabled ? '🐙 Каракатица' : '🦑 Кальмар';
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
        isMemesEnabled: () => memesEnabled,
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
        getRound: () => round,
        getHistory: () => history,
        getGameElements: () => ({
            drum: document.getElementById('game-drum'),
            chamberGame: document.querySelectorAll('#normal-drum-container .chamber-game'),
            muzzleFlash: document.getElementById('muzzle-flash'),
            btnShoot: btnShoot,
            gameButtonsNormal: gameButtonsNormal
        }),
        onShootClick: () => {
            if (typeof Achievements !== 'undefined') {
                Achievements.onShootClick();
            }
        },
        onSkipClick: () => {
            if (typeof Achievements !== 'undefined') {
                Achievements.onSkip();
            }
        },
        onSelfShoot: (survived) => {
            if (typeof Achievements !== 'undefined') {
                Achievements.onSelfShoot(survived);
            }
        },
        checkAchievements: (won, rounds, bulletCount, firstShot) => {
            if (typeof Achievements !== 'undefined') {
                Achievements.checkAfterGame(currentMode, won, rounds, bulletCount, firstShot);
            }
        }
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
