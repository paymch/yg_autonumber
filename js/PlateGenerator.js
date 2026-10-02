const REGIONS = {
    top: [{code:'777', bonus: 3.0}, {code:'999', bonus: 3.0}, {code:'799', bonus: 2.5}],
    capitals: [{code:'77', bonus: 2.0}, {code:'99', bonus: 2.0}, {code:'97', bonus: 1.8}, {code:'177', bonus: 1.8}, {code:'199', bonus: 1.8}, {code:'197', bonus: 1.8}, {code:'78', bonus: 2.0}, {code:'98', bonus: 2.0}, {code:'178', bonus: 1.8}, {code:'198', bonus: 1.8}],
    popular: [{code:'116', bonus: 1.5}, {code:'716', bonus: 1.5}, {code:'123', bonus: 1.5}, {code:'193', bonus: 1.5}, {code:'125', bonus: 1.5}, {code:'05', bonus: 1.5}, {code:'95', bonus: 1.5}],
    others: [{code:'50', bonus: 1.0}, {code:'90', bonus: 1.0}, {code:'150', bonus: 1.0}, {code:'190', bonus: 1.0}, {code:'750', bonus: 1.0}, {code:'02', bonus: 1.0}, {code:'102', bonus: 1.0}, {code:'16', bonus: 1.0}, {code:'23', bonus: 1.0}, {code:'93', bonus: 1.0}, {code:'54', bonus: 1.0}, {code:'154', bonus: 1.0}]
};
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

    RARE1: { id: 'rare1', text: 'РОССИЯ', weight: 8, mult: 1.15, type: 'rare' },
    RARE2: { id: 'rare2', text: 'РОССИЙСКАЯ ФЕДЕРАЦИЯ', weight: 5, mult: 1.25, type: 'rare' },
    RARE3: { id: 'rare3', text: 'DRIVE2', weight: 8, mult: 1.15, type: 'rare' },
    RARE4: { id: 'rare4', text: 'SMOTRA', weight: 5, mult: 1.2, type: 'rare' },
    RARE5: { id: 'rare5', text: 'MOTORSPORT', weight: 5, mult: 1.15, type: 'rare' },

    EPIC1: { id: 'epic1', text: 'ГОСУДАРСТВЕННАЯ ДУМА', weight: 3, mult: 1.4, type: 'epic' },
    EPIC2: { id: 'epic2', text: 'ГУОБДД МВД РОССИИ', weight: 2, mult: 1.45, type: 'epic' },
    EPIC3: { id: 'epic3', text: 'ОТДЕЛ ПО БОРЬБЕ С ПОНТАМИ', weight: 1.5, mult: 1.5, type: 'epic' },

    LEGEND1: { id: 'leg1', text: 'ВЕЛИКАЯ РОССИЯ', weight: 0.3, mult: 1.8, type: 'legendary' },
    LEGEND2: { id: 'leg2', text: 'ФСБ РОССИИ', weight: 0.1, mult: 2.0, type: 'legendary' },
    LEGEND3: { id: 'leg3', text: 'СПЕЦСВЯЗЬ', weight: 0.1, mult: 1.7, type: 'legendary' },
    LEGEND4: { id: 'leg4', text: 'АДМИНИСТРАЦИЯ ПРЕЗИДЕНТА', weight: 0.05, mult: 2.0, type: 'legendary' },
    LEGEND5: { id: 'leg5', text: 'УПРАВЛЕНИЕ ПО УПРАВЛЕНИЮ...', weight: 0.05, mult: 2.0, type: 'legendary' }
};

const FRAME_MATERIALS = {
    BLACK: { id: 'black', name: 'Черный мат', weight: 40, mult: 1.0, css: 'mat-black' },
    GREY: { id: 'grey', name: 'Серый пластик', weight: 25, mult: 1.0, css: 'mat-grey' },
    WHITE: { id: 'white', name: 'Белый', weight: 15, mult: 1.05, css: 'mat-white' },
    BLUE: { id: 'blue', name: 'Синий металлик', weight: 10, mult: 1.1, css: 'mat-blue' },
    CHROME: { id: 'chrome', name: 'Темный хром', weight: 5, mult: 1.25, css: 'mat-chrome' },
    CARBON: { id: 'carbon', name: 'Карбон', weight: 3, mult: 1.5, css: 'mat-carbon' },
    GOLD: { id: 'gold', name: 'Золото', weight: 1, mult: 2.0, css: 'mat-gold' }
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
        // Square format is currently only supported in layout for 'normal' type plates
        const format = type.id === 'normal' ? this.getRandomItem(PLATE_FORMATS, true) : PLATE_FORMATS.STANDARD;
        const wear = this.getRandomItem(WEAR_LEVELS, true);
        const frameText = this.getRandomItem(FRAME_TEXTS, true);
        const frame = this.getRandomItem(FRAME_MATERIALS, true);
        const regionPool = [...REGIONS.top, ...REGIONS.capitals, ...REGIONS.popular, ...REGIONS.others];
        const region = this.getRandomItem(regionPool, false);

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
            frame,
            region,
            sequence,
            displayStr,
            basePrice,
            fullStr: `${displayStr} | ${region}`
        };
    }


    static generatePartial(plate, part) {
        // part: 'letters', 'digits', 'region', 'frame'
        let newPlate = { ...plate };

        if (part === 'letters' && newPlate.type.id === 'normal') {
            const letter1 = this.getRandomItem(LETTERS);
            const letter2 = this.getRandomItem(LETTERS);
            const letter3 = this.getRandomItem(LETTERS);
            newPlate.sequence = `${letter1}${newPlate.sequence.substring(1, 4)}${letter2}${letter3}`;
            newPlate.displayStr = `${newPlate.sequence[0]} ${newPlate.sequence.slice(1, 4)} ${newPlate.sequence.slice(4)}`;
        } else if (part === 'digits' && newPlate.type.id === 'normal') {
            const newDigits = this.generateSequence('DDD');
            newPlate.sequence = `${newPlate.sequence[0]}${newDigits}${newPlate.sequence.substring(4, 6)}`;
            newPlate.displayStr = `${newPlate.sequence[0]} ${newPlate.sequence.slice(1, 4)} ${newPlate.sequence.slice(4)}`;
        } else if (part === 'region') {
            const regions = [...REGIONS.top, ...REGIONS.capitals, ...REGIONS.popular, ...REGIONS.others];
            newPlate.region = this.getRandomItem(regions, false);
        } else if (part === 'frame') {
            newPlate.frameText = this.getRandomItem(FRAME_TEXTS, true);
            newPlate.frame = this.getRandomItem(FRAME_MATERIALS, true);
        }

        newPlate.fullStr = `${newPlate.displayStr} | ${newPlate.region.code || newPlate.region}`;
        return newPlate;
    }

    static generateWheelReward(tier) {
        // tier: 'jackpot' or 'elite'
        const type = PLATE_TYPES.NORMAL;
        const format = PLATE_FORMATS.STANDARD;
        let sequence, regionCode, wear, frame, basePrice;
        let region;

        if (tier === 'jackpot') {
            wear = WEAR_LEVELS.FN; // Factory new
            frame = FRAME_MATERIALS.GOLD; // Gold frame

            // Generate a 777 or AAA with 777 region
            const p = Math.random();
            if (p < 0.5) {
                // X 777 XX 777
                const letter = this.getRandomItem(LETTERS);
                const secondLetter = this.getRandomItem(LETTERS);
                sequence = `${letter}777${secondLetter}${secondLetter}`;
            } else {
                // A 001 MR 777
                sequence = `А001МР`;
            }
            regionCode = '777';
        } else if (tier === 'elite') {
            wear = WEAR_LEVELS.FN;
            frame = FRAME_MATERIALS.CARBON;

            const eliteSeries = ['АМР', 'ЕКХ', 'ВОР', 'СКР', 'ХАМ'];
            const randomSeries = this.getRandomItem(eliteSeries);
            const digits = this.generateSequence('DDD');
            sequence = `${randomSeries[0]}${digits}${randomSeries[1]}${randomSeries[2]}`;
            regionCode = '77';
        }

        const regions = [
            ...REGIONS.top, ...REGIONS.capitals, ...REGIONS.popular, ...REGIONS.others
        ];
        region = regions.find(r => r.code === regionCode) || REGIONS.others[0];
        basePrice = Math.floor(Math.random() * (type.maxBase - type.minBase + 1)) + type.minBase;

        let displayStr = `${sequence[0]} ${sequence.slice(1, 4)} ${sequence.slice(4)}`;

        return {
            type,
            format,
            sequence,
            region,
            wear,
            frameText: {text: tier === 'jackpot' ? 'ВЕЛИКАЯ РОССИЯ' : 'СПЕЦСВЯЗЬ', type: 'gold'},
            frame,
            displayStr,
            basePrice,
            fullStr: `${displayStr} | ${regionCode}`
        };
    }
}

window.PlateGenerator = PlateGenerator;
