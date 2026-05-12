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
    
    // Скрываем обычный барабан
    if (normalDrumContainer) normalDrumContainer.style.display = 'none';
    
    // ========== ЗАРЯДКА ==========
    function loadBuckshot() {
        totalBullets = Math.floor(Math.random() * 3) + 1; // 1-3 патрона
        bulletsLeft = totalBullets;
        
        buckshotChambersData = [0, 0, 0, 0, 0, 0];
        const pos = [];
        while (pos.length < totalBullets) {
            const p = Math.floor(Math.random() * 6);
            if (!pos.includes(p)) pos.push(p);
        }
        pos.forEach(p => buckshotChambersData[p] = 1);
        
        buckshotBullets.textContent = '?';
        
        // Все гнёзда выглядят одинаково
        buckshotChambers.forEach(ch => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
            ch.style.background = 'radial-gradient(circle, #444, #222)';
        });
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireBuckshot(target) {
        if (isAnimating || gameOver) return;
        isAnimating = true;
        
        // Отключаем кнопки
        btnShootSelf.disabled = true;
        btnShootBot.disabled = true;
        btnSkip.disabled = true;
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Крутим барабан
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = buckshotChambersData[firedChamber] === 1;
        
        // Анимация вращения
        buckshotDrum.classList.add('spinning');
        
        setTimeout(() => {
            buckshotDrum.classList.remove('spinning');
            
            // Подсветка
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
                    GC.setGameStatus('☠️ ТЫ ПРОИГРАЛ! ☠️', 'dead');
                    GC.showBlood();
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: `Раунд ${currentRound}: 💀 Выстрел в себя — ПРОИГРЫШ`
                    });
                } else {
                    GC.setGameStatus('🎉 БОТ УБИТ! ТЫ ВЫИГРАЛ!', 'alive');
                    GC.updateHistory({
                        round: currentRound,
                        hit: true,
                        text: `Раунд ${currentRound}: 🤖 Выстрел в бота — ПОБЕДА`
                    });
                }
                
                gameOver = true;
                btnShootSelf.disabled = true;
                btnShootBot.disabled = true;
                btnSkip.disabled = true;
                
            } else {
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
                
                if (!isPlayerTurn && !gameOver) {
                    setTimeout(() => botTurn(), 1000);
                } else if (isPlayerTurn && !gameOver) {
                    btnShootSelf.disabled = false;
                    btnShootBot.disabled = false;
                    btnSkip.disabled = false;
                    GC.setGameStatus('🎯 Твой ход! Выбери цель', 'alive');
                }
            }
            
            isAnimating = false;
        }, 700 + Math.random() * 500);
    }
    
    // ========== ХОД БОТА ==========
    function botTurn() {
        if (gameOver) return;
        
        GC.setGameStatus('🤖 Бот думает...', '');
        
        setTimeout(() => {
            if (gameOver) return;
            
            const shootSelf = Math.random() < 0.3;
            const target = shootSelf ? 'bot' : 'player';
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `🤖 Бот выбрал стрелять в ${shootSelf ? 'себя' : 'тебя'}`
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
                text: `Ты выбрал стрелять в себя`
            });
            fireBuckshot('player');
        }
    };
    
    btnShootBot.onclick = () => {
        if (isPlayerTurn && !gameOver) {
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `Ты выбрал стрелять в бота`
            });
            fireBuckshot('bot');
        }
    };
    
    btnSkip.onclick = () => {
        if (isPlayerTurn && !gameOver) {
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `⏭️ Ты пропустил ход`
            });
            
            isPlayerTurn = false;
            btnShootSelf.disabled = true;
            btnShootBot.disabled = true;
            btnSkip.disabled = true;
            
            setTimeout(() => botTurn(), 500);
        }
    };
    
    // ========== СТАРТ ==========
    gameOver = false;
    currentRound = 0;
    isPlayerTurn = true;
    isAnimating = false;
    
    GC.updateRound(0);
    GC.setGameStatus('🎯 Твой ход! Выбери цель', 'alive');
    
    btnShootSelf.disabled = false;
    btnShootBot.disabled = false;
    btnSkip.disabled = false;
    
    loadBuckshot();
}
