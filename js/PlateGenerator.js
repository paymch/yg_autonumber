const REGIONS = ['77', '99', '97', '177', '199', '197', '777', '799', '797', '50', '90', '150', '190', '750', '02', '102', '16', '116', '23', '93', '123', '54', '154', '78', '98', '178', '198'];
const LETTERS = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'];
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const PLATE_TYPES = {
    NORMAL: { id: 'normal', name: 'Обычный', weight: 85, basePrice: 150 },
    TAXI: { id: 'taxi', name: 'Такси', weight: 8, basePrice: 300 },
    POLICE: { id: 'police', name: 'Полиция', weight: 3, basePrice: 5000 },
    MILITARY: { id: 'military', name: 'Военный', weight: 3, basePrice: 5000 },
    DIPLOMAT: { id: 'diplomat', name: 'Дипломат', weight: 1, basePrice: 15000 }
};

const PLATE_FORMATS = {
    STANDARD: { id: 'standard', name: 'Стандарт', weight: 90, mult: 1.0 },
    SQUARE: { id: 'square', name: 'Квадратный (новый ГОСТ)', weight: 10, mult: 1.15 }
};

const PLATE_STATES = {
    NEW: { id: 'new', name: 'Идеальный', weight: 70, mult: 1.0 },
    DIRTY: { id: 'dirty', name: 'Грязный', weight: 15, mult: 0.8 },
    RUSTY: { id: 'rusty', name: 'Потертый', weight: 10, mult: 0.7 },
    GOLD: { id: 'gold', name: 'Золотая рамка', weight: 4, mult: 1.5 },
    CARBON: { id: 'carbon', name: 'Карбон', weight: 1, mult: 2.0 }
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
        const state = this.getRandomItem(PLATE_STATES, true);
        const region = this.getRandomItem(REGIONS);

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
            state,
            region,
            sequence,
            displayStr,
            fullStr: `${displayStr} | ${region}`
        };
    }
}

window.PlateGenerator = PlateGenerator;