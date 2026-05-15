// ============================================
// РЕЖИМ: КЛАССИЧЕСКАЯ РУЛЕТКА + БЕЗ ВРАЩЕНИЯ
// ============================================

function initClassicGame(bulletPositions, spinMode) {
    
    const GC = window.GameController;
    
    const drum = document.getElementById('game-drum');
    const chamberGame = document.querySelectorAll('#normal-drum-container .chamber-game');
    const muzzleFlash = document.getElementById('muzzle-flash');
    const btnShoot = document.getElementById('btn-shoot');
    const gameButtonsNormal = document.getElementById('game-buttons-normal');
    const normalDrumContainer = document.getElementById('normal-drum-container');
    
    // Создаём массив камор
    let chambers = [0, 0, 0, 0, 0, 0];
    bulletPositions.forEach(pos => {
        if (pos >= 0 && pos < 6) chambers[pos] = 1;
    });
    
    let currentChamber = 0;
    let alive = true;
    let round = 0;
    let isAnimating = false;
    
    console.log('🔫 Классика запущена:', { chambers, spinMode });
    
    // Показываем обычный интерфейс
    if (normalDrumContainer) normalDrumContainer.style.display = 'block';
    if (gameButtonsNormal) gameButtonsNormal.style.display = 'flex';
    btnShoot.style.display = 'inline-block';
    btnShoot.disabled = false;
    
    // Отображаем патроны на барабане
    function updateChamberDisplay() {
        chamberGame.forEach((ch, i) => {
            ch.classList.remove('highlight', 'highlight-safe', 'bullet-mark');
            if (chambers[i] === 1) {
                ch.classList.add('bullet-mark');
            }
        });
    }
    
    updateChamberDisplay();
    
    // Выстрел
    btnShoot.onclick = () => {
        if (isAnimating || !alive) return;
        isAnimating = true;
        btnShoot.disabled = true;
        
        // Анимация вращения (только для режима spin)
        if (spinMode === 'spin') {
            drum.classList.add('spinning');
            setTimeout(() => {
                drum.classList.remove('spinning');
                doShoot();
            }, 700 + Math.random() * 500);
        } else {
            // Без вращения — сразу стреляем
            doShoot();
        }
    };
    
    function doShoot() {
        round++;
        GC.updateRound(round);
        
        let firedChamber;
        
        if (spinMode === 'spin') {
            // Случайное гнездо
            firedChamber = Math.floor(Math.random() * 6);
        } else {
            // Последовательно
            firedChamber = currentChamber % 6;
            currentChamber++;
        }
        
        const hit = chambers[firedChamber] === 1;
        
        console.log(`Выстрел ${round}: гнездо ${firedChamber + 1}, попадание: ${hit}`);
        
        // Подсветка
        chamberGame.forEach(ch => ch.classList.remove('highlight', 'highlight-safe'));
        chamberGame[firedChamber].classList.add(hit ? 'highlight' : 'highlight-safe');
        
        if (hit) {
            // Убираем использованный патрон
            chambers[firedChamber] = 0;
            chamberGame[firedChamber].classList.remove('bullet-mark');
            
            // Эффекты
            muzzleFlash.classList.add('active');
            setTimeout(() => muzzleFlash.classList.remove('active'), 150);
            
            GC.setGameStatus('☠️ ВЫ ПРОИГРАЛИ! ☠️', 'dead');
            GC.showBlood();
            alive = false;
            btnShoot.disabled = true;
            
            GC.updateHistory({
                round: round,
                firedChamber: firedChamber,
                hit: true,
                text: `Раунд ${round}: 💀 Гнездо ${firedChamber + 1} — ПРОИГРЫШ`
            });
        } else {
            GC.setGameStatus('✅ Осечка! Вы выжили!', 'alive');
            btnShoot.disabled = false;
            
            GC.updateHistory({
                round: round,
                firedChamber: firedChamber,
                hit: false,
                text: `Раунд ${round}: ✅ Гнездо ${firedChamber + 1} — Осечка`
            });
        }
        
        isAnimating = false;
    }
    
    // Пробел для выстрела
    document.addEventListener('keydown', function spaceHandler(e) {
        if (e.code === 'Space' && alive && !isAnimating) {
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen.classList.contains('active')) {
                e.preventDefault();
                btnShoot.click();
            }
        }
    });
}
