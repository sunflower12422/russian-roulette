// ============================================
// ЭКРАН МЕНЮ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');

    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');

    function showScreen(screen) {
        [menuScreen, setupScreen, gameScreen].forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    btnPlay.addEventListener('click', () => showScreen(setupScreen));
    btnSettings.addEventListener('click', () => showScreen(setupScreen));
});
