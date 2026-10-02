class ComboEvaluator {
    static getDigits(seq) {
        return seq.replace(/[^0-9]/g, '');
    }

    static getLetters(seq) {
        return seq.replace(/[^А-Я]/g, '');
    }

    static evaluate(plate) {
        let maxTier = { rarity: 'common', name: 'Обычный', priceBonus: 0, mult: 1, badges: [] };
        let basePrice = plate.basePrice; // Dynamically generated in PlateGenerator

        const updateTier = (tierStr, name, pBonus, mult, badgeText) => {
            const tiers = ['common', 'rare', 'epic', 'legendary', 'mythic'];
            if (tiers.indexOf(tierStr) >= tiers.indexOf(maxTier.rarity)) {
                maxTier.rarity = tierStr;
                maxTier.name = name;
                if (mult > maxTier.mult) maxTier.mult = mult;
                if (pBonus > maxTier.priceBonus) maxTier.priceBonus = pBonus;
            }
            if (badgeText) maxTier.badges.push({ type: tierStr, text: badgeText });
        };

        if (plate.type.id === 'normal') {
            const d = this.getDigits(plate.sequence);
            const l = this.getLetters(plate.sequence);

            // Digits checks
            if (d.length === 3) {
                if (d[0] === d[1] && d[1] === d[2]) {
                    updateTier('legendary', 'Три одинаковые цифры', 80000, 1.5, `ТРИ ТОПОРА ${d}`);
                } else if (d[0] === '0' && d[1] === '0') {
                    updateTier('epic', 'Первая сотня', 15000, 1.2, `КРУГЛОЕ ${d}`);
                } else if (d[1] === '0' && d[2] === '0') {
                    updateTier('epic', 'Сотни', 10000, 1.2, `КРУГЛОЕ ${d}`);
                } else if (d[0] === d[2]) {
                    updateTier('rare', 'Зеркалка', 3000, 1.1, `ЗЕРКАЛКА ${d}`);
                }

                // Cult combinations
                const cult = ['067', '052', '228', '148', '777', '404', '666'];
                if (cult.includes(d)) {
                    updateTier('epic', 'Молодежный код', 5000, 1.5, `КОД ${d}`);
                }
            }

            // Letters checks
            if (l.length === 3) {
                if (l[0] === l[1] && l[1] === l[2]) {
                    updateTier('legendary', 'Три одинаковые буквы', 100000, 1.5, `ТРИ БУКВЫ ${l}`);
                }

                const specialSeries = ['АМР', 'ЕКХ', 'СКР', 'ВОР', 'ХАМ', 'САС', 'КЕК'];
                if (specialSeries.includes(l)) {
                    updateTier('mythic', 'Блатная серия', 250000, 2, `СЕРИЯ ${l}`);
                }
            }

            // Full combo
            if (d[0] === d[1] && d[1] === d[2] && l[0] === l[1] && l[1] === l[2]) {
                updateTier('mythic', 'Ультра-Джекпот', 1500000, 3, 'ФУЛЛ-КОМБО!');
            }
        } else {
            // Non-normal plates have base high price, check if digits are same
            const d = this.getDigits(plate.sequence);
            if (d.length > 2 && d.split('').every(char => char === d[0])) {
                updateTier('legendary', 'Красивый спец. номер', 80000, 2, 'СПЕЦ. ТОПОРЫ');
            } else {
                updateTier('rare', plate.type.name, 0, 1, plate.type.name);
            }
        }

        // Apply badges for attributes
        if (plate.format.mult !== 1) {
            maxTier.badges.push({ type: 'rare', text: plate.format.name });
        }
        maxTier.badges.push({ type: plate.wear.mult > 1 ? 'epic' : 'common', text: plate.wear.name });

        if (plate.frameText.id !== 'none') {
            maxTier.badges.push({ type: plate.frameText.type, text: 'Рамка: ' + plate.frameText.text });
        }

        // Formula: Итого = (Base + Bonus) * WearMult * FrameTextMult * ComboMult * FormatMult
        let finalPrice = Math.round(
            (basePrice + maxTier.priceBonus) *
            plate.wear.mult *
            plate.frameText.mult *
            maxTier.mult *
            plate.format.mult
        );

        return {
            rarity: maxTier.rarity,
            basePrice: basePrice,
            bonus: maxTier.priceBonus,
            mult: maxTier.mult,
            finalPrice: finalPrice,
            badges: maxTier.badges,
            breakdown: {
                base: basePrice,
                comboBonus: maxTier.priceBonus,
                comboMult: maxTier.mult,
                wearMult: plate.wear.mult,
                frameMult: plate.frameText.mult,
                formatMult: plate.format.mult
            }
        };
    }
}

window.ComboEvaluator = ComboEvaluator;