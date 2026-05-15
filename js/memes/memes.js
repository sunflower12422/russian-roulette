// ============================================
// МЕМ-РЕЖИМ + ПАСХАЛКИ
// ============================================

const Memes = {
    enabled: false,
    versionClicks: 0,
    revolverClicks: 0,
    
    init() {
        // Проверяем сохранённый режим
        if (localStorage.getItem('rr_memes') === 'true') {
            this.enable();
        }
        
        this.bindEvents();
    },
    
    bindEvents() {
        const versionText = document.getElementById('version-text');
        const menuRevolver = document.getElementById('menu-revolver');
        const menuSubtitle = document.getElementById('menu-subtitle');
        
        // Клик по версии
        if (versionText) {
            versionText.addEventListener('click', () => {
                this.versionClicks++;
                
                if (this.versionClicks >= 5 && !this.enabled) {
                    this.enable();
                }
                
                if (this.versionClicks === 3 && this.enabled) {
                    versionText.textContent = '🐱?';
                    setTimeout(() => {
                        if (this.enabled) versionText.textContent = 'v6.9.0 🐸';
                    }, 2000);
                }
            });
        }
        
        // Клик по револьверу
        if (menuRevolver) {
            menuRevolver.addEventListener('click', () => {
                this.revolverClicks++;
                
                if (typeof Achievements !== 'undefined') {
                    Achievements.onRevolverClick();
                }
                
                // Пасхалка с котом
                if (this.enabled && this.versionClicks >= 3) {
                    this.showCatEasterEgg();
                }
            });
        }
        
        // Клик по "Test your luck"
        if (menuSubtitle) {
            menuSubtitle.addEventListener('click', () => {
                if (this.enabled && menuSubtitle.textContent === 'Test your luck') {
                    this.openYugenVideo();
                }
            });
        }
        
        // Пасхалка "конь" в настройке
        document.addEventListener('keydown', (e) => {
            this.handleKonTyping(e.key);
        });
    },
    
    enable() {
        if (this.enabled) return;
        this.enabled = true;
        this.versionClicks = 5;
        
        // Добавляем класс на body
        document.body.classList.add('meme-mode');
        
        // Тряска
        document.body.classList.add('meme-shake');
        setTimeout(() => document.body.classList.remove('meme-shake'), 600);
        
        // Меняем тексты
        this.changeTexts();
        
        // Сохраняем
        localStorage.setItem('rr_memes', 'true');
        
        // Ачивки
        if (typeof Achievements !== 'undefined') {
            Achievements.enableMemes();
        }
        
        console.log('🐸 Мем-режим активирован!');
    },
    
    changeTexts() {
        // Меню
        const title1 = document.getElementById('menu-title');
        const title2 = document.getElementById('menu-title2');
        const subtitle = document.getElementById('menu-subtitle');
        const version = document.getElementById('version-text');
        
        if (title1) title1.textContent = '☭ РУССКАЯ';
        if (title2) title2.textContent = 'КОТЛЕТКА ☭';
        if (subtitle) {
            subtitle.textContent = 'Test your luck';
            subtitle.style.cursor = 'pointer';
        }
        if (version) version.textContent = 'v6.9.0 🐸';
        
        // Режимы
        const modeNames = {
            'mode-name-classic': 'Котлетка',
            'mode-name-nospin': 'Без шансов',
            'mode-name-buckshot': 'Шлёп-шлёп',
            'mode-name-squid': 'Каракатица'
        };
        
        Object.entries(modeNames).forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
        
        // Заголовки
        const modesTitle = document.getElementById('modes-title');
        if (modesTitle) modesTitle.textContent = '🤡 РЕЖИМ МЕМОВ';
        
        const setupTitle = document.getElementById('setup-title');
        if (setupTitle) setupTitle.textContent = '🥒 ЗАРЯДИ ОГУРЦЫ';
        
        const setupLabel = document.getElementById('setup-label');
        if (setupLabel) setupLabel.textContent = '🥒 Зарядите огурцы:';
        
        const spinLabel = document.getElementById('spin-label');
        if (spinLabel) spinLabel.textContent = '🎰 Крутить или не крутить:';
        
        // Кнопка выстрела
        const btnShoot = document.getElementById('btn-shoot');
        if (btnShoot) btnShoot.textContent = '💨 ПУКНУТЬ';
    },
    
    showCatEasterEgg() {
        const meow = document.createElement('div');
        meow.textContent = '🐱 МЯУ!';
        meow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            z-index: 999;
            pointer-events: none;
            animation: fadeIn 0.5s ease;
        `;
        document.body.appendChild(meow);
        
        setTimeout(() => meow.remove(), 2000);
        
        if (typeof Achievements !== 'undefined') {
            Achievements.onEasterEgg('cat');
        }
    },
    
    showHorseEasterEgg() {
        const horse = document.createElement('div');
        horse.textContent = '🐴';
        horse.className = 'horse-easter-egg';
        document.body.appendChild(horse);
        
        setTimeout(() => horse.remove(), 2000);
        
        if (typeof Achievements !== 'undefined') {
            Achievements.onEasterEgg('horse');
        }
    },
    
    openYugenVideo() {
        window.open('https://rutube.ru/video/530f0d755fcf5ef0997bac7484220bc2/', '_blank');
    },
    
    handleKonTyping(key) {
        // Сохраняем последние нажатия
        if (!this.konBuffer) this.konBuffer = '';
        this.konBuffer += key.toLowerCase();
        if (this.konBuffer.length > 4) this.konBuffer = this.konBuffer.slice(-4);
        
        if (this.konBuffer === 'конь' || this.konBuffer === 'kohn' || this.konBuffer === 'rjyb') {
            this.konBuffer = '';
            this.showHorseEasterEgg();
            
            // Заряжаем все патроны
            if (typeof window.GameController !== 'undefined') {
                const chambers = [1, 1, 1, 1, 1, 1];
                window.GameController.setChambers(chambers);
            }
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Memes.init();
});
