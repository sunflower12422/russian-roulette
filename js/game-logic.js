// ============================================
// ЛОГИКА ИГРЫ (ядро)
// ============================================

const GameLogic = {
    chambers: [0, 0, 0, 0, 0, 0],
    bulletCount: 1,
    mode: 'spin',
    alive: true,
    round: 0,
    currentChamber: 0,
    history: [],
    bulletPositions: [],

    // Ручная зарядка
    manualLoad(positions) {
        this.chambers = [0, 0, 0, 0, 0, 0];
        this.bulletPositions = positions;
        positions.forEach(pos => {
            if (pos >= 0 && pos < 6) {
                this.chambers[pos] = 1;
            }
        });
        this.bulletCount = positions.length;
    },

    // Случайная зарядка
    randomLoad(count) {
        this.chambers = [0, 0, 0, 0, 0, 0];
        this.bulletPositions = [];
        const positions = [];
        while (positions.length < count) {
            const pos = Math.floor(Math.random() * 6);
            if (!positions.includes(pos)) {
                positions.push(pos);
            }
        }
        positions.forEach(pos => {
            this.chambers[pos] = 1;
        });
        this.bulletPositions = positions;
        this.bulletCount = count;
    },

    // Установить режим
    setMode(mode) {
        this.mode = mode;
    },

    // Выстрел
    shoot() {
        if (!this.alive) return { status: 'already_dead', round: this.round };

        this.round++;

        let firedChamber;
        if (this.mode === 'spin') {
            firedChamber = Math.floor(Math.random() * 6);
        } else {
            firedChamber = this.currentChamber % 6;
            this.currentChamber++;
        }

        const hit = this.chambers[firedChamber] === 1;

        if (hit) {
            this.chambers[firedChamber] = 0;
            this.alive = false;
        }

        const result = {
            status: hit ? 'dead' : 'alive',
            round: this.round,
            firedChamber: firedChamber,
            hit: hit
        };

        this.history.push(result);
        return result;
    },

    // Сброс
    reset() {
        this.chambers = [0, 0, 0, 0, 0, 0];
        this.bulletCount = 0;
        this.alive = true;
        this.round = 0;
        this.currentChamber = 0;
        this.history = [];
        this.bulletPositions = [];
    },

    // Состояние
    getState() {
        return {
            alive: this.alive,
            round: this.round,
            mode: this.mode,
            bulletCount: this.bulletCount,
            chambers: [...this.chambers],
            history: [...this.history].slice(-10),
            bulletPositions: [...this.bulletPositions]
        };
    }
};
