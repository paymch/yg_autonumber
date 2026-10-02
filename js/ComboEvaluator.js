class ComboEvaluator {
    static getDigits(seq) {
        return seq.replace(/[^0-9]/g, '');
    }

    static getLetters(seq) {
        return seq.replace(/[^А-Я]/g, '');
    }

    static evaluate(plate) {
        let maxTier = { rarity: 'common', name: 'Обычный', priceBonus: 0, mult: 1, badges: [] };
        let basePrice = plate.type.basePrice;

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
                    updateTier('legendary', 'Три одинаковые цифры', 40000, 1, `ТРИ ТОПОРА ${d}`);
                } else if (d[0] === '0' && d[1] === '0') {
                    updateTier('epic', 'Первая сотня', 15000, 1, `КРУГЛОЕ ${d}`);
                } else if (d[1] === '0' && d[2] === '0') {
                    updateTier('epic', 'Сотни', 10000, 1, `КРУГЛОЕ ${d}`);
                } else if (d[0] === d[2]) {
                    updateTier('rare', 'Зеркалка', 3000, 1, `ЗЕРКАЛКА ${d}`);
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
                    updateTier('legendary', 'Три одинаковые буквы', 50000, 1, `ТРИ БУКВЫ ${l}`);
                }

                const specialSeries = ['АМР', 'ЕКХ', 'СКР', 'ВОР', 'ХАМ', 'САС', 'КЕК'];
                if (specialSeries.includes(l)) {
                    updateTier('mythic', 'Блатная серия', 0, 5, `СЕРИЯ ${l}`);
                }
            }

            // Full combo
            if (d[0] === d[1] && d[1] === d[2] && l[0] === l[1] && l[1] === l[2]) {
                updateTier('mythic', 'Ультра-Джекпот', 500000, 2, 'ФУЛЛ-КОМБО!');
            }
        } else {
            // Non-normal plates have base high price, check if digits are same
            const d = this.getDigits(plate.sequence);
            if (d.length > 2 && d.split('').every(char => char === d[0])) {
                updateTier('legendary', 'Красивый спец. номер', 20000, 2, 'СПЕЦ. ТОПОРЫ');
            } else {
                updateTier('rare', plate.type.name, 0, 1, plate.type.name);
            }
        }

        // Apply state and format
        if (plate.format.mult !== 1) {
            maxTier.badges.push({ type: 'rare', text: plate.format.name });
        }
        if (plate.state.mult !== 1) {
            maxTier.badges.push({ type: plate.state.mult > 1 ? 'epic' : 'common', text: plate.state.name });
        }

        // Calculate final price
        // Final = (Base + Bonus) * TypeMult * ComboMult * StateMult * FormatMult
        let finalPrice = Math.floor((basePrice + maxTier.priceBonus) * maxTier.mult * plate.state.mult * plate.format.mult);

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
                stateMult: plate.state.mult,
                formatMult: plate.format.mult
            }
        };
    }
}

window.ComboEvaluator = ComboEvaluator;