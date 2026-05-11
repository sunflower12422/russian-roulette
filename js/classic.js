// ============================================
// РЕЖИМ: КЛАССИЧЕСКАЯ РУЛЕТКА + БЕЗ ВРАЩЕНИЯ
// ============================================

function initClassicGame(bulletPositions, spinMode) {
    
    const GC = window.GameController;
    const elements = GC.getGameElements();
    
    const drum = elements.drum;
    const chamberGame = elements.chamberGame;
    const muzzleFlash = elements.muzzleFlash;
    const btnShoot = elements.btnShoot;
    const gameButtonsNormal = elements.gameButtonsNormal;
    
    let chambers = [...bulletPositions.map((_, i) => bulletPositions.includes(i) ? 1 : 0)];
    // Дополняем до 6 если нужно
    while (chambers.length < 6) chambers.push(0);
    
    let currentChamber = 0;
    let alive = true;
    let round = 0;
    let isAnimating = false;
    
    // Показываем обычные кнопки
    gameButtonsNormal.style.display = 'flex';
    btnShoot.style.display = 'inline-block';
    btnShoot.disabled = false;
    
    // Отображаем патроны
    function updateChamberDisplay() {
        chamberGame.forEach((ch, i) => {
            ch.classList.remove('highlight', 'bullet-mark');
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
        
        if (spinMode === 'spin') {
            drum.classList.add('spinning');
            setTimeout(() => {
                drum.classList.remove('spinning');
                doShoot();
            }, 700 + Math.random() * 500);
        } else {
            doShoot();
        }
    };
    
    function doShoot() {
        round++;
        GC.updateRound(round);
        
        let firedChamber;
        if (spinMode === 'spin') {
            firedChamber = Math.floor(Math.random() * 6);
        } else {
            firedChamber = currentChamber % 6;
            currentChamber++;
        }
        
        const hit = chambers[firedChamber] === 1;
        
        chamberGame.forEach(ch => ch.classList.remove('highlight'));
        chamberGame[firedChamber].classList.add('highlight');
        
        if (hit) {
            chambers[firedChamber] = 0;
            chamberGame[firedChamber].classList.remove('bullet-mark');
            
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
            
            GC.updateHistory({
                round: round,
                firedChamber: firedChamber,
                hit: false,
                text: `Раунд ${round}: ✅ Гнездо ${firedChamber + 1} — Осечка`
            });
        }
        
        isAnimating = false;
    }
}
