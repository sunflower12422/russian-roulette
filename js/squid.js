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
    let gameOver = false;
    let currentRound = 0;
    let playersAlive = { 1: true, 2: true };
    let isAnimating = false;
    let firstShot = true;
    
    const memesEnabled = GC.isMemesEnabled();
    
    if (normalDrumContainer) normalDrumContainer.style.display = 'block';
    
    // Мемные тексты
    if (memesEnabled) {
        document.querySelector('#player1-box .player-name').textContent = 'Ги Хун';
        document.querySelector('#player2-box .player-name').textContent 'Сон Ок-Ну... шучу Игрок 2';
        document.querySelector('#player1-box .player-emoji').textContent = '🦑';
        document.querySelector('#player2-box .player-emoji').textContent = '🐙';
    }
    
    // ========== ЗАРЯДКА ==========
    function loadSquidChambers() {
        squidChambersData = [0, 0, 0, 0, 0, 0];
        const bulletPos = Math.floor(Math.random() * 6);
        squidChambersData[bulletPos] = 1;
        updateChamberDisplay();
    }
    
    function updateChamberDisplay() {
        squidChambers.forEach((ch, i) => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
            if (squidChambersData[i] === 1) {
                ch.classList.add('bullet-mark');
            }
        });
    }
    
    function updatePlayerDisplay() {
        player1Box.classList.remove('active-player', 'dead-player');
        player2Box.classList.remove('active-player', 'dead-player');
        
        if (!playersAlive[1]) player1Box.classList.add('dead-player');
        if (!playersAlive[2]) player2Box.classList.add('dead-player');
        
        if (gameOver) {
            const winner = playersAlive[1] ? 1 : 2;
            const winnerName = memesEnabled 
                ? (winner === 1 ? 'Ги Хун' : 'Игрок 2') 
                : `Игрок ${winner}`;
            squidInfo.textContent = `🏆 ${winnerName} победил!`;
            loseButtons.forEach(btn => btn.disabled = true);
        } else {
            squidInfo.textContent = memesEnabled 
                ? '🦑 Играйте в КНБ!' 
                : '🤼 Играйте в КНБ в реальности';
        }
    }
    
    // ========== ВЫСТРЕЛ ==========
    function fireSquid(targetPlayer) {
        if (isAnimating || gameOver) return;
        isAnimating = true;
        
        loseButtons.forEach(btn => btn.disabled = true);
        
        currentRound++;
        GC.updateRound(currentRound);
        
        // Счётчик выстрелов
        GC.onShootClick();
        
        const firedChamber = Math.floor(Math.random() * 6);
        const hit = squidChambersData[firedChamber] === 1;
        
        const targetName = memesEnabled 
            ? (targetPlayer === 1 ? 'Ги Хун' : 'Игрок 2')
            : `Игрок ${targetPlayer}`;
        
        squidInfo.textContent = memesEnabled 
            ? `🔫 ${targetName} стреляет...` 
            : `🔫 ${targetName} стреляет...`;
        
        drum.classList.add('spinning');
        
        setTimeout(() => {
            drum.classList.remove('spinning');
            
            squidChambers.forEach(ch => ch.classList.remove('highlight', 'highlight-safe'));
            
            if (hit) {
                squidChambers[firedChamber].classList.add('highlight');
                muzzleFlash.classList.add('active');
                setTimeout(() => muzzleFlash.classList.remove('active'), 150);
                
                playersAlive[targetPlayer] = false;
                squidChambersData[firedChamber] = 0;
                
                GC.setGameStatus(
                    memesEnabled ? `💀 ${targetName} убит!` : `💀 Игрок ${targetPlayer} убит!`, 
                    'dead'
                );
                GC.showBlood();
                
                GC.updateHistory({
                    round: currentRound,
                    hit: true,
                    text: memesEnabled
                        ? `Раунд ${currentRound}: 💀 ${targetName} — УБИТ`
                        : `Раунд ${currentRound}: 💀 Игрок ${targetPlayer} — УБИТ`
                });
                
                const aliveCount = Object.values(playersAlive).filter(v => v).length;
                
                if (aliveCount <= 1) {
                    gameOver = true;
                    const winner = playersAlive[1] ? 1 : 2;
                    const winnerName = memesEnabled 
                        ? (winner === 1 ? 'Ги Хун' : 'Игрок 2')
                        : `Игрок ${winner}`;
                    GC.setGameStatus(`🏆 ${winnerName} победил!`, 'alive');
                    squidInfo.textContent = `🏆 ${winnerName} выжил!`;
                    
                    // Ачивка
                    GC.checkAchievements(true, currentRound, 1, firstShot);
                } else {
                    loadSquidChambers();
                }
                
            } else {
                squidChambers[firedChamber].classList.add('highlight-safe');
                
                GC.setGameStatus(
                    memesEnabled ? `✅ ${targetName} выжил!` : `✅ Осечка! Игрок ${targetPlayer} выжил`, 
                    'alive'
                );
                GC.updateHistory({
                    round: currentRound,
                    hit: false,
                    text: memesEnabled
                        ? `Раунд ${currentRound}: ✅ ${targetName} — Осечка`
                        : `Раунд ${currentRound}: ✅ Игрок ${targetPlayer} — Осечка`
                });
                
                firstShot = false;
            }
            
            updatePlayerDisplay();
            updateChamberDisplay();
            
            if (!gameOver) {
                loseButtons.forEach(btn => btn.disabled = false);
            }
            
            isAnimating = false;
        }, 1000);
    }
    
    // ========== КНОПКИ ==========
    loseButtons.forEach(btn => {
        btn.onclick = () => {
            if (gameOver || isAnimating) return;
            
            const player = parseInt(btn.dataset.player);
            
            if (!playersAlive[player]) {
                alert(memesEnabled ? 'Он уже того...' : 'Этот игрок уже мёртв!');
                return;
            }
            
            const playerName = memesEnabled 
                ? (player === 1 ? 'Ги Хун' : 'Игрок 2')
                : `Игрок ${player}`;
            
            squidInfo.textContent = memesEnabled
                ? `🎲 ${playerName} проиграл КНБ...`
                : `🎲 Игрок ${player} проиграл КНБ...`;
            
            GC.updateHistory({
                round: currentRound,
                hit: false,
                text: memesEnabled
                    ? `🦑 ${playerName} проиграл КНБ`
                    : `🦑 Игрок ${player} проиграл КНБ`
            });
            
            setTimeout(() => fireSquid(player), 1500);
        };
    });
    
    // ========== СТАРТ ==========
    gameOver = false;
    currentRound = 0;
    playersAlive = { 1: true, 2: true };
    isAnimating = false;
    firstShot = true;
    
    GC.updateRound(0);
    GC.setGameStatus(
        memesEnabled ? '🦑 Камень-Ножницы-Каракатица!' : '🦑 Камень-Ножницы-Бумага!', 
        'alive'
    );
    
    loseButtons.forEach(btn => btn.disabled = false);
    
    loadSquidChambers();
    updatePlayerDisplay();
    squidInfo.textContent = memesEnabled 
        ? '🦑 Играйте в КНБ!' 
        : '🤼 Играйте в КНБ в реальности';
}
