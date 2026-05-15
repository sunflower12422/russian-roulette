// ============================================
// РЕЖИМ: БАГШОТ РУЛЕТКА (ТЫ ПРОТИВ БОТА)
// ============================================

function initBuckshotGame() {
    
    const GC = window.GameController;
    
    // Элементы багшота
    const buckshotDrum = document.getElementById('buckshot-drum');
    const buckshotChambers = document.querySelectorAll('#buckshot-drum .chamber-game');
    const buckshotFlash = document.getElementById('buckshot-flash');
    const buckshotBullets = document.getElementById('buckshot-bullets');
    const btnShootSelf = document.getElementById('btn-shoot-self');
    const btnShootBot = document.getElementById('btn-shoot-bot');
    const btnSkip = document.getElementById('btn-skip');
    const normalDrumContainer = document.getElementById('normal-drum-container');
    
    // Состояние багшота
    let buckshotChambersData = [0, 0, 0, 0, 0, 0];
    let totalBullets = 0;
    let bulletsLeft = 0;
    let isPlayerTurn = true;
    let gameOver = false;
    let currentRound = 0;
    let isAnimating = false;
    let skipsThisGame = 0;
    let firstShot = true;
    
    const memesEnabled = GC.isMemesEnabled();
    
    // Скрываем обычный барабан
    if (normalDrumContainer) normalDrumContainer.style.display = 'none';
    
    // Мемные тексты
    if (memesEnabled) {
        btnShootSelf.textContent = '🤡 В себя (лох)';
        btnShootBot.textContent = '🤖 В Чепухатора';
        btnSkip.textContent = '⏭️ Слить ход';
    }
    
    // ========== ЗАРЯДКА ==========
    function loadBuckshot() {
        totalBullets = Math.floor(Math.random() * 3) + 1;
        bulletsLeft = totalBullets;
        
        buckshotChambersData = [0, 0, 0, 0, 0, 0];
        const pos = [];
        while (pos.length < totalBullets) {
            const p = Math.floor(Math.random() * 6);
            if (!pos.includes(p)) pos.push(p);
        }
        pos.forEach(p => buckshotChambersData[p] = 1);
        
        buckshotBullets.textContent = memesEnabled ? '🥒?' : '?';
        
        buckshotChambers.forEach(ch => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
            ch.style.background = 'radial-gradient(circle, #444, #222)';
        });
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireBuckshot(target) {
        if (isAnimating || gameOver) return;
        isAnimating = true;
        
        btnShootSelf.disabled = true;
        btnShootBot.disabled = true;
        btnSkip.disabled = true;
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Счётчик выстрелов
        GC.onShootClick();
        
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = buckshotChambersData[firedChamber] === 1;
        
        // Анимация
        buckshotDrum.classList.add('spinning');
        
        setTimeout(() => {
            buckshotDrum.classList.remove('spinning');
            
            buckshotChambers.forEach(ch => {
                ch.classList.remove('highlight', 'highlight-safe');
                ch.style.background = 'radial-gradient(circle, #444, #222)';
            });
            
            if (hit) {
                buckshotChambers[firedChamber].classList.add('highlight');
                buckshotFlash.classList.add('active');
                setTimeout(() => buckshotFlash.classList.remove('active'), 150);
                
                buckshotChambersData[firedChamber] = 0;
                bulletsLeft--;
                
                if (target === 'player') {
                    GC.setGameStatus(
                        memesEnabled ? '🪦 RIP БРАТИШКА' : '☠️ ТЫ ПРОИГРАЛ!', 
                        'dead'
                    );
                    GC.showBlood();
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: memesEnabled 
                            ? `Раунд ${currentRound}: 💀 Выстрел в себя — ОТЪЕХАЛ`
                            : `Раунд ${currentRound}: 💀 Выстрел в себя — ПРОИГРЫШ`
                    });
                    
                    // Ачивка: выстрелил в себя
                    GC.onSelfShoot(false);
                } else {
                    GC.setGameStatus(
                        memesEnabled ? '🎉 ЧЕПУХАТОР УНИЧТОЖЕН!' : '🎉 БОТ УБИТ! ТЫ ВЫИГРАЛ!', 
                        'alive'
                    );
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: memesEnabled
                            ? `Раунд ${currentRound}: 🤖 Выстрел в бота — ПОБЕДА`
                            : `Раунд ${currentRound}: 🤖 Выстрел в бота — ПОБЕДА`
                    });
                }
                
                gameOver = true;
                GC.checkAchievements(target !== 'player', currentRound, totalBullets, firstShot);
                
            } else {
                buckshotChambers[firedChamber].classList.add('highlight-safe');
                
                const targetName = target === 'player' ? 'себя' : (memesEnabled ? 'Чепухатора' : 'бота');
                GC.setGameStatus(
                    memesEnabled ? '✅ ПОВЕЗЛО ДУРАКУ!' : `✅ Осечка! Выстрел в ${targetName}`, 
                    'alive'
                );
                GC.updateHistory({
                    round: currentRound,
                    hit: false,
                    text: memesEnabled
                        ? `Раунд ${currentRound}: ✅ В ${targetName} — Пук!`
                        : `Раунд ${currentRound}: ✅ В ${targetName} — Осечка`
                });
                
                // Ачивка: выжил после выстрела в себя
                if (target === 'player') {
                    GC.onSelfShoot(true);
                }
                
                firstShot = false;
                isPlayerTurn = !isPlayerTurn;
                
                if (!isPlayerTurn && !gameOver) {
                    GC.setGameStatus(
                        memesEnabled ? '🤖 Чепухатор думает...' : '🤖 Бот думает...', 
                        ''
                    );
                    setTimeout(() => botTurn(), 1000);
                } else if (isPlayerTurn && !gameOver) {
                    btnShootSelf.disabled = false;
                    btnShootBot.disabled = false;
                    btnSkip.disabled = false;
                    GC.setGameStatus(
                        memesEnabled ? '🎯 Твой ход! Кого шлёпнем?' : '🎯 Твой ход! Выбери цель', 
                        'alive'
                    );
                }
            }
            
            isAnimating = false;
        }, 700 + Math.random() * 500);
    }
    
    // ========== ХОД БОТА ==========
    function botTurn() {
        if (gameOver) return;
        
        setTimeout(() => {
            if (gameOver) return;
            
            const shootSelf = Math.random() < 0.3;
            const target = shootSelf ? 'bot' : 'player';
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: memesEnabled
                    ? `🤖 Чепухатор выбрал ${shootSelf ? 'себя' : 'тебя'}`
                    : `🤖 Бот выбрал стрелять в ${shootSelf ? 'себя' : 'тебя'}`
            });
            
            fireBuckshot(target);
        }, 1500);
    }
    
    // ========== КНОПКИ ==========
    btnShootSelf.onclick = () => {
        if (isPlayerTurn && !gameOver) {
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: memesEnabled ? 'Ты выбрал стрелять в себя (лох)' : 'Ты выбрал стрелять в себя'
            });
            fireBuckshot('player');
        }
    };
    
    btnShootBot.onclick = () => {
        if (isPlayerTurn && !gameOver) {
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: memesEnabled ? 'Ты выбрал стрелять в Чепухатора' : 'Ты выбрал стрелять в бота'
            });
            fireBuckshot('bot');
        }
    };
    
    btnSkip.onclick = () => {
        if (isPlayerTurn && !gameOver) {
            skipsThisGame++;
            GC.onSkipClick();
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: memesEnabled ? '⏭️ Слил ход как батон' : '⏭️ Ты пропустил ход'
            });
            
            isPlayerTurn = false;
            btnShootSelf.disabled = true;
            btnShootBot.disabled = true;
            btnSkip.disabled = true;
            
            GC.setGameStatus(
                memesEnabled ? '🤖 Чепухатор рад твоему скипу' : '🤖 Ход бота...', 
                ''
            );
            
            setTimeout(() => botTurn(), 500);
        }
    };
    
    // ========== СТАРТ ==========
    gameOver = false;
    currentRound = 0;
    isPlayerTurn = true;
    isAnimating = false;
    skipsThisGame = 0;
    firstShot = true;
    
    GC.updateRound(0);
    GC.setGameStatus(
        memesEnabled ? '🎯 Твой ход! Кого шлёпнем?' : '🎯 Твой ход! Выбери цель', 
        'alive'
    );
    
    btnShootSelf.disabled = false;
    btnShootBot.disabled = false;
    btnSkip.disabled = false;
    
    loadBuckshot();
}
