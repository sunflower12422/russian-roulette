// ============================================
// РЕЖИМ: ИГРА В КАЛЬМАРА (С ДРУГОМ)
// ============================================

function initSquidGame() {
    
    const GC = window.GameController;
    
    // Элементы кальмара
    const player1Box = document.getElementById('player1-box');
    const player2Box = document.getElementById('player2-box');
    const squidInfo = document.getElementById('squid-info');
    const loseButtons = document.querySelectorAll('.lose-btn');
    const drum = document.getElementById('game-drum');
    const squidChambers = document.querySelectorAll('#normal-drum-container .chamber-game');
    const muzzleFlash = document.getElementById('muzzle-flash');
    const normalDrumContainer = document.getElementById('normal-drum-container');
    
    // Состояние кальмара
    let squidChambersData = [0, 0, 0, 0, 0, 0];
    let currentPlayer = 1;
    let gameOver = false;
    let currentRound = 0;
    let playersAlive = { 1: true, 2: true };
    let isAnimating = false;
    
    // Показываем обычный барабан
    if (normalDrumContainer) normalDrumContainer.style.display = 'block';
    
    // ========== ЗАРЯДКА ==========
    function loadSquidChambers() {
        // Всегда 1 патрон
        squidChambersData = [0, 0, 0, 0, 0, 0];
        const bulletPos = Math.floor(Math.random() * 6);
        squidChambersData[bulletPos] = 1;
        
        // Показываем патроны
        updateChamberDisplay();
    }
    
    // ========== ОТОБРАЖЕНИЕ ==========
    function updateChamberDisplay() {
        squidChambers.forEach((ch, i) => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
            if (squidChambersData[i] === 1) {
                ch.classList.add('bullet-mark');
            }
        });
    }
    
    function updatePlayerDisplay() {
        // Сброс
        player1Box.classList.remove('active-player', 'dead-player');
        player2Box.classList.remove('active-player', 'dead-player');
        
        // Мёртвые
        if (!playersAlive[1]) player1Box.classList.add('dead-player');
        if (!playersAlive[2]) player2Box.classList.add('dead-player');
        
        // Активный
        if (!gameOver) {
            if (currentPlayer === 1 && playersAlive[1]) {
                player1Box.classList.add('active-player');
            } else if (currentPlayer === 2 && playersAlive[2]) {
                player2Box.classList.add('active-player');
            }
        }
        
        // Инфо
        if (gameOver) {
            const winner = playersAlive[1] ? 1 : 2;
            squidInfo.textContent = `🏆 Игрок ${winner} победил!`;
            loseButtons.forEach(btn => btn.disabled = true);
        } else {
            squidInfo.textContent = `🎯 Ходит Игрок ${currentPlayer}`;
        }
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireSquid(targetPlayer) {
        if (isAnimating || gameOver) return;
        isAnimating = true;
        
        // Блокируем кнопки
        loseButtons.forEach(btn => btn.disabled = true);
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Крутим барабан
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = squidChambersData[firedChamber] === 1;
        
        // Анимация
        drum.classList.add('spinning');
        
        setTimeout(() => {
            drum.classList.remove('spinning');
            
            // Подсветка
            squidChambers.forEach(ch => ch.classList.remove('highlight', 'highlight-safe'));
            
            if (hit) {
                // ПАЦАН УМЕР
                squidChambers[firedChamber].classList.add('highlight');
                muzzleFlash.classList.add('active');
                setTimeout(() => muzzleFlash.classList.remove('active'), 150);
                
                playersAlive[targetPlayer] = false;
                squidChambersData[firedChamber] = 0;
                
                GC.setGameStatus(`💀 Игрок ${targetPlayer} убит!`, 'dead');
                GC.showBlood();
                
                GC.updateHistory({
                    round: currentRound,
                    hit: true,
                    text: `Раунд ${currentRound}: 💀 Игрок ${targetPlayer} — УБИТ`
                });
                
                // Проверка на конец
                const aliveCount = Object.values(playersAlive).filter(v => v).length;
                
                if (aliveCount <= 1) {
                    gameOver = true;
                    const winner = playersAlive[1] ? 1 : 2;
                    GC.setGameStatus(`🏆 Игрок ${winner} победил!`, 'alive');
                    squidInfo.textContent = `🏆 Игрок ${winner} выжил!`;
                } else {
                    // Перезарядка и смена хода
                    switchPlayer();
                    loadSquidChambers();
                }
                
            } else {
                // ОСЕЧКА
                squidChambers[firedChamber].classList.add('highlight-safe');
                
                GC.setGameStatus(`✅ Осечка! Игрок ${targetPlayer} выжил`, 'alive');
                GC.updateHistory({
                    round: currentRound,
                    hit: false,
                    text: `Раунд ${currentRound}: ✅ Игрок ${targetPlayer} — Осечка`
                });
                
                // Смена хода
                switchPlayer();
            }
            
            updatePlayerDisplay();
            updateChamberDisplay();
            
            // Разблокируем кнопки если не конец
            if (!gameOver) {
                loseButtons.forEach(btn => btn.disabled = false);
            }
            
            isAnimating = false;
        }, 1000);
    }
    
    // ========== СМЕНА ИГРОКА ==========
    function switchPlayer() {
        if (gameOver) return;
        
        // Переключаем
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        
        // Если следующий мёртв — ещё раз
        if (!playersAlive[currentPlayer]) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
    }
    
    // ========== КНОПКИ ПРОИГРЫША ==========
    loseButtons.forEach(btn => {
        btn.onclick = () => {
            if (gameOver || isAnimating) return;
            
            const player = parseInt(btn.dataset.player);
            
            // Проверяем что это ход правильного игрока
            if (player !== currentPlayer) {
                alert(`Сейчас ход Игрока ${currentPlayer}!`);
                return;
            }
            
            squidInfo.textContent = `🎲 Игрок ${player} проиграл КНБ...`;
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `🦑 Игрок ${player} проиграл КНБ`
            });
            
            setTimeout(() => fireSquid(player), 1500);
        };
    });
    
    // ========== СТАРТ ==========
    gameOver = false;
    currentRound = 0;
    currentPlayer = 1;
    playersAlive = { 1: true, 2: true };
    isAnimating = false;
    
    GC.updateRound(0);
    GC.setGameStatus('🦑 Камень-Ножницы-Бумага!', 'alive');
    
    loseButtons.forEach(btn => btn.disabled = false);
    
    loadSquidChambers();
    updatePlayerDisplay();
    squidInfo.textContent = '🤼 Играйте в КНБ в реальности';
}
