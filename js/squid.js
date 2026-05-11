// ============================================
// РЕЖИМ: ИГРА В КАЛЬМАРА (С ДРУГОМ)
// ============================================

function initSquidGame() {
    
    const GC = window.GameController;
    const elements = GC.getGameElements();
    
    // Элементы кальмара
    const player1Box = document.getElementById('player1-box');
    const player2Box = document.getElementById('player2-box');
    const squidInfo = document.getElementById('squid-info');
    const loseButtons = document.querySelectorAll('.lose-btn');
    const drum = document.getElementById('game-drum');
    const squidChambers = document.querySelectorAll('#normal-drum-container .chamber-game');
    const muzzleFlash = document.getElementById('muzzle-flash');
    const btnShoot = elements.btnShoot;
    const gameButtonsNormal = elements.gameButtonsNormal;
    
    // Состояние кальмара
    let squidChambersData = [0, 0, 0, 0, 0, 0];
    let currentPlayer = 1; // 1 или 2
    let gameOver = false;
    let currentRound = 0;
    let playersAlive = { 1: true, 2: true };
    
    // Скрываем обычные кнопки
    gameButtonsNormal.style.display = 'none';
    if (btnShoot) btnShoot.style.display = 'none';
    
    // ========== ЗАРЯДКА ==========
    function loadSquidChambers() {
        // Всегда 1 патрон (как в оригинале)
        squidChambersData = [0, 0, 0, 0, 0, 0];
        const bulletPos = Math.floor(Math.random() * 6);
        squidChambersData[bulletPos] = 1;
        
        // Показываем патроны (в кальмаре видно)
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
        
        // Мёртвые игроки
        if (!playersAlive[1]) {
            player1Box.classList.add('dead-player');
        }
        if (!playersAlive[2]) {
            player2Box.classList.add('dead-player');
        }
        
        // Активный игрок
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
        } else {
            squidInfo.textContent = `🎯 Игрок ${currentPlayer} стреляет...`;
        }
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireSquid(targetPlayer) {
        if (gameOver) return;
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Крутим барабан
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = squidChambersData[firedChamber] === 1;
        
        // Анимация
        drum.classList.add('spinning');
        document.getElementById('game-screen').classList.add('squid-dramatic');
        
        setTimeout(() => {
            drum.classList.remove('spinning');
            document.getElementById('game-screen').classList.remove('squid-dramatic');
            
            // Подсветка
            squidChambers.forEach(ch => ch.classList.remove('highlight', 'highlight-safe'));
            
            if (hit) {
                squidChambers[firedChamber].classList.add('highlight');
                muzzleFlash.classList.add('active');
                setTimeout(() => muzzleFlash.classList.remove('active'), 150);
                
                // Игрок убит
                playersAlive[targetPlayer] = false;
                squidChambersData[firedChamber] = 0;
                
                GC.setGameStatus(`💀 Игрок ${targetPlayer} убит!`, 'dead');
                GC.showBlood();
                
                GC.updateHistory({
                    round: currentRound,
                    hit: true,
                    text: `Раунд ${currentRound}: 💀 Игрок ${targetPlayer} — УБИТ`
                });
                
                // Проверка на конец игры
                const alivePlayers = Object.values(playersAlive).filter(v => v).length;
                if (alivePlayers <= 1) {
                    gameOver = true;
                    const winner = playersAlive[1] ? 1 : 2;
                    GC.setGameStatus(`🏆 Игрок ${winner} победил!`, 'alive');
                    squidInfo.textContent = `🏆 Игрок ${winner} выжил и победил!`;
                } else {
                    // Перезарядка и смена игрока
                    switchPlayer();
                    loadSquidChambers();
                }
                
            } else {
                // Осечка
                squidChambers[firedChamber].classList.add('highlight-safe');
                
                GC.setGameStatus(`✅ Осечка! Игрок ${targetPlayer} выжил`, 'alive');
                GC.updateHistory({
                    round: currentRound,
                    hit: false,
                    text: `Раунд ${currentRound}: ✅ Игрок ${targetPlayer} — Осечка`
                });
                
                // Смена игрока
                switchPlayer();
            }
            
            updatePlayerDisplay();
            updateChamberDisplay();
            
        }, 1000);
    }
    
    // ========== СМЕНА ИГРОКА ==========
    function switchPlayer() {
        if (gameOver) return;
        
        // Переключение
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        
        // Если следующий игрок мёртв — пропускаем
        if (!playersAlive[currentPlayer]) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
    }
    
    // ========== ОБРАБОТКА ПРОИГРЫША ==========
    loseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameOver) return;
            
            const player = parseInt(btn.dataset.player);
            
            // Игрок в реальности проиграл КНБ
            squidInfo.textContent = `🎲 Игрок ${player} проиграл камень-ножницы-бумага`;
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: `🦑 Игрок ${player} проиграл КНБ и будет стрелять`
            });
            
            // Бот стреляет в проигравшего
            setTimeout(() => {
                fireSquid(player);
            }, 1500);
        });
    });
    
    // ========== СБРОС ==========
    function resetSquid() {
        gameOver = false;
        currentRound = 0;
        currentPlayer = 1;
        playersAlive = { 1: true, 2: true };
        squidChambersData = [0, 0, 0, 0, 0, 0];
        
        squidChambers.forEach(ch => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
        });
        
        GC.updateRound(0);
        GC.setGameStatus('🦑 Камень-Ножницы-Бумага!', 'alive');
        
        updatePlayerDisplay();
        loadSquidChambers();
        updateChamberDisplay();
        
        squidInfo.textContent = '🤼 Игроки играют в КНБ в реальности';
    }
    
    // Начало игры
    resetSquid();
}
