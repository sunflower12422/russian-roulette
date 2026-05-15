// ============================================
// СИСТЕМА ДОСТИЖЕНИЙ (ОБЩАЯ ЛОГИКА)
// ============================================

const Achievements = {
    
    list: [],
    
    unlocked: [],
    
    stats: {
        roundsSurvived: 0,
        maxRoundsSurvived: 0,
        deaths: 0,
        classicWins: 0,
        nospinWins: 0,
        buckshotWins: 0,
        squidWins: 0,
        selfShoots: 0,
        skipsInGame: 0,
        totalSkips: 0,
        randomClicks: 0,
        revolverClicks: 0,
        shootClicks: 0,
        justGotLucky: false,
        versionClicks: 0,
        memesEnabled: false,
        currentMode: null,
        bulletCount: 0,
        firstShotKill: false
    },
    
    init() {
        // Загружаем ачивки из модулей
        if (typeof NormalAchievements !== 'undefined') {
            this.list = [...this.list, ...NormalAchievements];
        }
        if (typeof SecretAchievements !== 'undefined') {
            this.list = [...this.list, ...SecretAchievements];
        }
        if (typeof MemeAchievements !== 'undefined') {
            this.list = [...this.list, ...MemeAchievements];
        }
        
        // Загружаем сохранения
        const saved = localStorage.getItem('rr_achievements');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.unlocked = data.unlocked || [];
                this.stats = { ...this.stats, ...(data.stats || {}) };
            } catch(e) {
                console.log('Ошибка загрузки достижений, сброс');
                this.unlocked = [];
                this.save();
            }
        }
        
        console.log('🏆 Достижения загружены:', this.unlocked.length, 'получено');
    },
    
    save() {
        localStorage.setItem('rr_achievements', JSON.stringify({
            unlocked: this.unlocked,
            stats: this.stats
        }));
    },
    
    unlock(id) {
        if (this.unlocked.includes(id)) return;
        
        const ach = this.list.find(a => a.id === id);
        if (!ach) return;
        
        if (ach.memesOnly && !this.stats.memesEnabled) return;
        
        this.unlocked.push(id);
        this.save();
        
        this.showNotification(ach);
        
        console.log('🏆 Получена ачивка:', ach.icon, ach.name);
    },
    
    showNotification(ach) {
        // Удаляем старые уведомления
        document.querySelectorAll('.achievement-notification').forEach(n => n.remove());
        
        const notif = document.createElement('div');
        notif.className = 'achievement-notification';
        
        let name = ach.name;
        let desc = ach.desc;
        
        // Мем-названия
        if (this.stats.memesEnabled && ach.memeName) {
            name = ach.memeName;
        }
        
        notif.innerHTML = `
            <span class="ach-icon">${ach.icon}</span>
            <div class="ach-text">
                <div class="ach-name">${name}</div>
                <div class="ach-desc">${desc}</div>
            </div>
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 100);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    },
    
    // Проверка после игры
    checkAfterGame(mode, won, rounds, bulletCount, firstShot) {
        this.stats.currentMode = mode;
        this.stats.bulletCount = bulletCount;
        this.stats.firstShotKill = firstShot && !won && rounds === 1;
        
        if (won) {
            switch(mode) {
                case 'classic': this.stats.classicWins++; break;
                case 'nospin': this.stats.nospinWins++; break;
                case 'buckshot': this.stats.buckshotWins++; break;
                case 'squid': this.stats.squidWins++; break;
            }
            
            // Проверяем обычные ачивки
            this.checkNormalAfterWin(mode);
            
            // Джекпот
            if (bulletCount === 5) this.unlock('jackpot');
            
            // Огурец
            if (bulletCount === 3 && this.stats.memesEnabled) this.unlock('cucumber');
            
        } else {
            this.stats.deaths++;
            this.stats.roundsSurvived = rounds - 1;
            if (this.stats.roundsSurvived > this.stats.maxRoundsSurvived) {
                this.stats.maxRoundsSurvived = this.stats.roundsSurvived;
            }
            
            // Лох
            if (this.stats.deaths >= 3) this.unlock('loser');
            
            // Клоун
            if (this.stats.justGotLucky) {
                this.unlock('clown');
            }
            this.stats.justGotLucky = false;
            
            // Цирк уехал
            if (bulletCount === 5 && this.stats.memesEnabled) {
                this.unlock('circus');
            }
        }
        
        // Везунчик
        if (this.stats.roundsSurvived >= 5 && !won) {
            this.unlock('lucky');
            this.stats.justGotLucky = true;
        }
        if (won && rounds - 1 >= 5) {
            this.unlock('lucky');
        }
        
        // Король рулетки
        if (mode === 'classic' && rounds > 10) {
            this.unlock('king');
        }
        
        // Да ты снайпер
        if (this.stats.firstShotKill && bulletCount === 1) this.unlock('sniper');
        
        // Сброс скипов
        this.stats.skipsInGame = 0;
        
        this.save();
    },
    
    checkNormalAfterWin(mode) {
        if (mode === 'squid') this.unlock('gihun');
        if (mode === 'buckshot') this.unlock('bothunter');
        
        if (this.stats.classicWins > 0 && 
            this.stats.nospinWins > 0 && 
            this.stats.buckshotWins > 0 && 
            this.stats.squidWins > 0) {
            this.unlock('collector');
        }
    },
    
    // События
    onSelfShoot(survived) {
        if (survived) {
            this.stats.selfShoots++;
            this.unlock('kamikaze');
        }
        this.save();
    },
    
    onSkip() {
        this.stats.skipsInGame++;
        this.stats.totalSkips++;
        
        if (this.stats.skipsInGame >= 3) this.unlock('lazysausage');
        if (this.stats.skipsInGame >= 5) this.unlock('intelligent');
        
        this.save();
    },
    
    onRandomClick() {
        this.stats.randomClicks++;
        if (this.stats.randomClicks >= 20) this.unlock('luckycrap');
        this.save();
    },
    
    onRevolverClick() {
        this.stats.revolverClicks++;
        if (this.stats.revolverClicks >= 10) this.unlock('frog');
        this.save();
    },
    
    onShootClick() {
        this.stats.shootClicks++;
        if (this.stats.shootClicks >= 10 && this.stats.memesEnabled) {
            this.unlock('fartshooter');
        }
        this.save();
    },
    
    onCrownClick() {
        if (this.unlocked.includes('king')) {
            this.unlock('sofaking');
        }
    },
    
    onEasterEgg(type) {
        switch(type) {
            case 'horse': this.unlock('pedalhorse'); break;
            case 'cat': this.unlock('catinbag'); break;
        }
    },
    
    enableMemes() {
        this.stats.memesEnabled = true;
        this.save();
    },
    
    isMemesEnabled() {
        return this.stats.memesEnabled;
    },
    
    getAllForDisplay() {
        return this.list.map(ach => ({
            ...ach,
            unlocked: this.unlocked.includes(ach.id),
            visible: !ach.secret || this.unlocked.includes(ach.id),
            available: !ach.memesOnly || this.stats.memesEnabled
        }));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Achievements.init();
});
