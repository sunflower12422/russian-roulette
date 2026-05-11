// ============================================
// РЕЖИМ: БАГШОТ РУЛЕТКА (ТЫ ПРОТИВ БОТА)
// ============================================

function initBuckshotGame() {
    
    const GC = window.GameController;
    const elements = GC.getGameElements();
    
    // Элементы багшота
    const buckshotDrum = document.getElementById('buckshot-drum');
    const buckshotChambers = document.querySelectorAll('#buckshot-drum .chamber-game');
    const buckshotFlash = document.getElementById('buckshot-flash');
    const buckshotBullets = document.getElementById('buckshot-bullets');
    const btnShootSelf = document.getElementById('btn-shoot-self');
    const btnShootBot = document.getElementById('btn-shoot-bot');
    const btnSkip = document.getElementById('btn-skip');
    const btnShoot = elements.btnShoot;
    const gameButtonsNormal = elements.gameButtonsNormal;
    
    // Состояние багшота
    let buckshotChambers = [0, 0, 0, 0, 0, 0];
    let totalBullets = 0;
    let bulletsLeft = 0;
    let isPlayerTurn = true; // true - игрок, false - бот
    let gameOver = false;
    let currentRound = 0;
    let isAnimating = false;
    
    // Скрываем обычные кнопки
    gameButtonsNormal.style.display = 'none';
    
    // ========== ЗАРЯДКА (СЛУЧАЙНАЯ) ==========
    function loadBuckshot() {
        // Случайное количество патронов (1-3)
        totalBullets = Math.floor(Math.random() * 3) + 1;
        bulletsLeft = totalBullets;
        
        // Случайные позиции
        buckshotChambers = [0, 0, 0, 0, 0, 0];
        const pos = [];
        while (pos.length < totalBullets) {
            const p = Math.floor(Math.random() * 6);
            if (!pos.includes(p)) pos.push(p);
        }
        pos.forEach(p => buckshotChambers[p] = 1);
        
        // Игрок не знает где патроны
        updateBuckshotDisplay();
    }
    
    // ========== ОТОБРАЖЕНИЕ ==========
    function updateBuckshotDisplay() {
        buckshotChambers.forEach((ch, i) => {
            buckshotChambers[i].classList.remove('highlight', 'highlight-safe', 'bullet-mark', 'hidden-bullet');
            // Все гнёзда выглядят одинаково (скрыто)
            buckshotChambers[i].classList.add('hidden-bullet');
        });
        
        // Показываем только количество (не где)
        buckshotBullets.textContent = '?';
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireBuckshot(target) {
        if (isAnimating || gameOver) return;
        isAnimating = true;
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Крутим барабан
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = buckshotChambers[firedChamber] === 1;
        
        // Анимация вращения
        buckshotDrum.classList.add('spinning');
        
        setTimeout(() => {
            buckshotDrum.classList.remove('spinning');
            
            // Подсветка
            buckshotChambers.forEach(ch => ch.classList.remove('highlight', 'highlight-safe'));
            
            if (hit) {
                buckshotChambers[firedChamber].classList.add('highlight');
                buckshotFlash.classList.add('active');
                setTimeout(() => buckshotFlash.classList.remove('active'), 150);
                
                // Убираем патрон
                buckshotChambers[firedChamber] = 0;
                bulletsLeft--;
                
                if (target === 'player') {
                    // Игрок проиграл
                    GC.setGameStatus('☠️ ТЫ ПРОИГРАЛ! ☠️', 'dead');
                    GC.showBlood();
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: `Раунд ${currentRound}: 💀 Выстрел в себя — ПРОИГРЫШ`
                    });
                } else {
                    // Бот проиграл
                    GC.setGameStatus('🎉 БОТ УБИТ! ТЫ ВЫИГРАЛ!', 'alive');
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: `Раунд ${currentRound}: 🤖 Выстрел в бота — ПОБЕДА`
                    });
                }
                
                gameOver = true;
                disableButtons();
                
            } else {
                // Осечка
                buckshotChambers[firedChamber].classList.add('highlight-safe');
                
                const targetName = target === 'player' ? 'себя' : 'бота';
                GC.setGameStatus(`✅ Осечка! Выстрел в ${targetName}`, 'alive');
                GC.updateHistory({
                    round: currentRound,
                    hit: false,
                    text: `Раунд ${currentRound}: ✅ В ${targetName} — Осечка`
                });
                
                // Смена хода
                isPlayerTurn = !isPlayerTurn;
                updateTurnDisplay();
                
                // Ход бота
                if (!isPlayerTurn && !gameOver) {
                    setTimeout(() => botTurn(), 1000);
                }
            }
            
            isAnimating = false;
        }, 700 + Math.random() * 500);
    }
    
    // ========== ХОД БОТА ==========
    function botTurn() {
        if (gameOver) return;
        
        // Бот думает 1-2 секунды
        const thinkTime = 1000 + Math.random() * 1000;
        
        setTimeout(() => {
            if (gameOver) return;
            
            // Бот выбирает случайно: в себя (30%) или в игрока (70%)
            const shootSelf = Math.random() < 0.3;
            const target = shootSelf ? 'bot' : 'player';
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `🤖 Бот выбрал стрелять в ${shootSelf ? 'себя' : 'тебя'}`
            });
            
            fireBuckshot(target);
        }, thinkTime);
    }
    
    // ========== ХОД ИГРОКА ==========
    function playerTurn(target) {
        if (!isPlayerTurn || gameOver) return;
        
        GC.updateHistory({
            round: currentRound,
            hit: false,
            text: `Ты выбрал стрелять в ${target === 'player' ? 'себя' : 'бота'}`
        });
        
        fireBuckshot(target);
    }
    
    // ========== СКИП ХОДА ==========
    function skipTurn() {
        if (!isPlayerTurn || gameOver) return;
        
        GC.updateHistory({
            round: currentRound,
            hit: false,
            text: '⏭️ Ты пропустил ход'
        });
        
        isPlayerTurn = false;
        updateTurnDisplay();
        
        setTimeout(() => botTurn(), 500);
    }
    
    // ========== ОТОБРАЖЕНИЕ ХОДА ==========
    function updateTurnDisplay() {
        if (gameOver) return;
        
        if (isPlayerTurn) {
            GC.setGameStatus('🎯 Твой ход! Выбери цель', 'alive');
            enablePlayerButtons();
        } else {
            GC.setGameStatus('🤖 Ход бота...', '');
            disableButtons();
        }
    }
    
    function enablePlayerButtons() {
        btnShootSelf.disabled = false;
        btnShootBot.disabled = false;
        btnSkip.disabled = false;
    }
    
    function disableButtons() {
        btnShootSelf.disabled = true;
        btnShootBot.disabled = true;
        btnSkip.disabled = true;
    }
    
    // ========== СОБЫТИЯ ==========
    btnShootSelf.addEventListener('click', () => playerTurn('player'));
    btnShootBot.addEventListener('click', () => playerTurn('bot'));
    btnSkip.addEventListener('click', skipTurn);
    
    // ========== СБРОС ==========
    function resetBuckshot() {
        gameOver = false;
        currentRound = 0;
        isPlayerTurn = true;
        bulletsLeft = 0;
        buckshotChambers = [0, 0, 0, 0, 0, 0];
        
        buckshotChambers.forEach(ch => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark', 'hidden-bullet');
        });
        
        GC.updateRound(0);
        GC.setGameStatus('🎯 Твой ход! Выбери цель', 'alive');
        updateTurnDisplay();
        loadBuckshot();
    }
    
    // Начало игры
    resetBuckshot();
}
