const REGIONS = ['77', '99', '97', '177', '199', '197', '777', '799', '797', '50', '90', '150', '190', '750', '02', '102', '16', '116', '23', '93', '123', '54', '154', '78', '98', '178', '198'];
const LETTERS = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'];
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const PLATE_TYPES = {
    NORMAL: { id: 'normal', name: 'Обычный', weight: 85, minBase: 120, maxBase: 350 },
    TAXI: { id: 'taxi', name: 'Такси', weight: 6, minBase: 15000, maxBase: 25000 },
    POLICE: { id: 'police', name: 'Полиция', weight: 4, minBase: 15000, maxBase: 30000 },
    MILITARY: { id: 'military', name: 'Военный', weight: 4, minBase: 15000, maxBase: 25000 },
    DIPLOMAT: { id: 'diplomat', name: 'Дипломат', weight: 1, minBase: 20000, maxBase: 35000 }
};

const PLATE_FORMATS = {
    STANDARD: { id: 'standard', name: 'Стандарт', weight: 90, mult: 1.0 },
    SQUARE: { id: 'square', name: 'Квадратный', weight: 10, mult: 1.15 }
};

const WEAR_LEVELS = {
    FN: { id: 'fn', name: 'Прямо с завода', weight: 10, mult: 1.25, css: 'state-fn' },
    MW: { id: 'mw', name: 'Немного поношенное', weight: 30, mult: 1.0, css: 'state-mw' },
    FT: { id: 'ft', name: 'После полевых испытаний', weight: 35, mult: 0.85, css: 'state-ft' },
    WW: { id: 'ww', name: 'Поношенное', weight: 15, mult: 0.7, css: 'state-ww' },
    BS: { id: 'bs', name: 'Закаленное в боях', weight: 10, mult: 0.55, css: 'state-bs' }
};

const FRAME_TEXTS = {
    NONE: { id: 'none', text: '', weight: 40, mult: 1.0, type: 'common' },
    DEALER1: { id: 'dealer1', text: 'РОЛЬФ', weight: 15, mult: 1.0, type: 'common' },
    DEALER2: { id: 'dealer2', text: 'АВТОМИР', weight: 15, mult: 1.0, type: 'common' },
    DEALER3: { id: 'dealer3', text: 'MAJOR', weight: 10, mult: 1.0, type: 'common' },

    RARE1: { id: 'rare1', text: 'РОССИЯ', weight: 8, mult: 1.2, type: 'rare' },
    RARE2: { id: 'rare2', text: 'RUSSIAN FEDERATION', weight: 5, mult: 1.25, type: 'rare' },

    EPIC1: { id: 'epic1', text: 'СЛУЖБА БЕЗОПАСНОСТИ', weight: 3, mult: 1.4, type: 'epic' },
    EPIC2: { id: 'epic2', text: 'МВД РОССИИ', weight: 2, mult: 1.45, type: 'epic' },
    EPIC3: { id: 'epic3', text: 'УПРАВЛЕНИЕ ПО УПРАВЛЕНИЮ...', weight: 1.5, mult: 1.5, type: 'epic' },

    LEGEND1: { id: 'leg1', text: 'ВЕЛИКАЯ РОССИЯ', weight: 0.3, mult: 2.5, type: 'legendary' },
    LEGEND2: { id: 'leg2', text: 'ФЕДЕРАЛЬНАЯ СЛУЖБА БЕЗОПАСНОСТИ', weight: 0.1, mult: 2.0, type: 'legendary' },
    LEGEND3: { id: 'leg3', text: 'СПЕЦСВЯЗЬ ПРЕЗИДЕНТА РФ', weight: 0.1, mult: 2.2, type: 'legendary' }
};

class PlateGenerator {
    static getRandomItem(objOrArr, useWeights = false) {
        if (Array.isArray(objOrArr)) {
            return objOrArr[Math.floor(Math.random() * objOrArr.length)];
        }

        if (useWeights) {
            const items = Object.values(objOrArr);
            const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;

            for (const item of items) {
                if (random < item.weight) return item;
                random -= item.weight;
            }
        }

        const keys = Object.keys(objOrArr);
        return objOrArr[keys[Math.floor(Math.random() * keys.length)]];
    }

    static generateSequence(pattern) {
        let res = '';
        for (const char of pattern) {
            if (char === 'L') res += this.getRandomItem(LETTERS);
            else if (char === 'D') res += this.getRandomItem(DIGITS);
            else res += char;
        }
        return res;
    }

    static generatePlate() {
        const type = this.getRandomItem(PLATE_TYPES, true);
        const format = this.getRandomItem(PLATE_FORMATS, true);
        const wear = this.getRandomItem(WEAR_LEVELS, true);
        const frameText = this.getRandomItem(FRAME_TEXTS, true);
        const region = this.getRandomItem(REGIONS);

        const basePrice = Math.floor(Math.random() * (type.maxBase - type.minBase + 1)) + type.minBase;

        let sequence = '';
        let displayStr = '';

        switch (type.id) {
            case 'normal':
                // X 000 XX
                sequence = this.generateSequence('LDDDLL');
                displayStr = `${sequence[0]} ${sequence.slice(1, 4)} ${sequence.slice(4)}`;
                break;
            case 'taxi':
                // XX 000
                sequence = this.generateSequence('LLDDD');
                displayStr = `${sequence.slice(0, 2)} ${sequence.slice(2)}`;
                break;
            case 'police':
                // X 0000
                sequence = this.generateSequence('LDDDD');
                displayStr = `${sequence[0]} ${sequence.slice(1)}`;
                break;
            case 'military':
                // 0000 XX
                sequence = this.generateSequence('DDDDLL');
                displayStr = `${sequence.slice(0, 4)} ${sequence.slice(4)}`;
                break;
            case 'diplomat':
                // 000 CD 0
                const dipCode = this.getRandomItem(['D', 'CD', 'T']);
                const dipSeq1 = this.generateSequence('DDD');
                const dipSeq2 = this.generateSequence('D');
                sequence = dipSeq1 + dipCode + dipSeq2;
                displayStr = `${dipSeq1} ${dipCode} ${dipSeq2}`;
                break;
        }

        return {
            type,
            format,
            wear,
            frameText,
            region,
            sequence,
            displayStr,
            basePrice,
            fullStr: `${displayStr} | ${region}`
        };
    }
}

window.PlateGenerator = PlateGenerator;