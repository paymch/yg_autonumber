class ComboEvaluator {
    static getDigits(seq) {
        return seq.replace(/[^0-9]/g, '');
    }

    static getLetters(seq) {
        return seq.replace(/[^А-Я]/g, '');
    }


    static evaluate(plate) {
        let basePrice = plate.basePrice || 500;
        let multipliers = 1.0;
        let badges = [];
        let rarityTier = 'common'; // common, rare, epic, mythic, legendary

        // 1. Wear state
        multipliers *= plate.wear.mult;
        if (plate.wear.id === 'fn') badges.push({ text: 'ИДЕАЛ', type: 'rare' });

        // 2. Format
        if (plate.format && plate.format.mult > 1.0) {
            multipliers *= plate.format.mult;
            badges.push({ text: 'НОВЫЙ ФОРМАТ', type: 'rare' });
        }

        // 3. Frame text
        if (plate.frameText && plate.frameText.mult > 1.0) {
            multipliers *= plate.frameText.mult;
            badges.push({ text: plate.frameText.text, type: plate.frameText.type });
        }

        // 4. Frame material
        if (plate.frame && plate.frame.mult > 1.0) {
            multipliers *= plate.frame.mult;
            badges.push({ text: plate.frame.name.toUpperCase(), type: plate.frame.mult > 1.4 ? 'legendary' : 'epic' });
        }

        // 5. Region multiplier
        if (plate.region && plate.region.bonus) {
            multipliers *= plate.region.bonus;
            if (plate.region.bonus >= 2.0) badges.push({ text: 'ЭЛИТНЫЙ РЕГИОН', type: 'epic' });
            else if (plate.region.bonus >= 1.5) badges.push({ text: 'ТОП РЕГИОН', type: 'rare' });
        }

        // Sequence combinations (Normal plates)
        if (plate.type.id === 'normal') {
            const digits = plate.sequence.slice(1, 4);
            const letters = plate.sequence[0] + plate.sequence.slice(4);

            // Bingo Region
            if (plate.region && digits === plate.region.code.padStart(3, '0')) {
                multipliers *= 1.5;
                badges.push({ text: 'БИНГО РЕГИОНА!', type: 'epic' });
                rarityTier = 'epic';
            }

            // Same letters
            if (letters[0] === letters[1] && letters[1] === letters[2]) {
                multipliers *= 5.0;
                basePrice += 50000;
                badges.push({ text: 'ТРИ БУКВЫ', type: 'legendary' });
                rarityTier = 'legendary';
            }

            // Digits combinations
            if (digits[0] === digits[1] && digits[1] === digits[2]) {
                // Same digits (e.g. 777, 111)
                multipliers *= 3.0;
                basePrice += 40000;
                badges.push({ text: `ТРИ ТОПОРА (${digits})`, type: 'legendary' });
                if (rarityTier !== 'legendary') rarityTier = 'legendary';
            } else if (digits === '001' || digits === '007') {
                multipliers *= 2.5;
                basePrice += 20000;
                badges.push({ text: `АГЕНТ ${digits}`, type: 'epic' });
                if (rarityTier === 'common') rarityTier = 'epic';
            } else if (digits[1] === '0' && digits[2] === '0') {
                // Round hundreds (100, 200...)
                multipliers *= 2.0;
                basePrice += 10000;
                badges.push({ text: 'КРУГЛОЕ ЧИСЛО', type: 'epic' });
                if (rarityTier === 'common') rarityTier = 'epic';
            } else if (digits[0] === digits[2]) {
                // Mirror (181, 707)
                multipliers *= 1.5;
                basePrice += 2500;
                badges.push({ text: 'ЗЕРКАЛКА', type: 'rare' });
                if (rarityTier === 'common') rarityTier = 'rare';
            }

            // Elite series (letters)
            const eliteSeries = ['АМР', 'ЕКХ', 'СКР', 'ВОР', 'ХАМ', 'САС', 'КЕК'];
            if (eliteSeries.includes(letters)) {
                multipliers *= 5.0;
                badges.push({ text: `БЛАТНАЯ СЕРИЯ ${letters}`, type: 'mythic' });
                rarityTier = 'mythic';
            }

            // Cult youth codes (digits)
            const youthCodes = ['067', '052', '228', '148', '777', '404'];
            if (youthCodes.includes(digits)) {
                multipliers *= 1.5;
                badges.push({ text: `КОД ${digits}`, type: 'rare' });
            }

            // Full combo check (Three letters + Three digits)
            if (letters[0] === letters[1] && letters[1] === letters[2] &&
                digits[0] === digits[1] && digits[1] === digits[2]) {
                multipliers *= 10.0;
                basePrice += 500000;
                badges.push({ text: 'ФУЛЛ-КОМБО!', type: 'legendary' });
                rarityTier = 'legendary';
            }
        }

        const finalPrice = Math.round(basePrice * multipliers);

        return {
            basePrice: Math.round(basePrice),
            multipliers: parseFloat(multipliers.toFixed(2)),
            finalPrice,
            badges,
            rarityTier
        };
    }
}

window.ComboEvaluator = ComboEvaluator;