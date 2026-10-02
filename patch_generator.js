const fs = require('fs');

let content = fs.readFileSync('js/PlateGenerator.js', 'utf8');

const partialGenerateFunction = `
    static generatePartial(plate, part) {
        // part: 'letters', 'digits', 'region', 'frame'
        let newPlate = { ...plate };

        if (part === 'letters' && newPlate.type.id === 'normal') {
            const letter1 = this.getRandomItem(LETTERS);
            const letter2 = this.getRandomItem(LETTERS);
            const letter3 = this.getRandomItem(LETTERS);
            newPlate.sequence = \`\${letter1}\${newPlate.sequence.substring(1, 4)}\${letter2}\${letter3}\`;
            newPlate.displayStr = \`\${newPlate.sequence[0]} \${newPlate.sequence.slice(1, 4)} \${newPlate.sequence.slice(4)}\`;
        } else if (part === 'digits' && newPlate.type.id === 'normal') {
            const newDigits = this.generateSequence('DDD');
            newPlate.sequence = \`\${newPlate.sequence[0]}\${newDigits}\${newPlate.sequence.substring(4, 6)}\`;
            newPlate.displayStr = \`\${newPlate.sequence[0]} \${newPlate.sequence.slice(1, 4)} \${newPlate.sequence.slice(4)}\`;
        } else if (part === 'region') {
            newPlate.region = this.getRandomItem(REGIONS);
        } else if (part === 'frame') {
            newPlate.frameText = this.getRandomItem(FRAME_TEXTS, true);
            // newPlate.frame = this.getRandomItem(FRAME_MATERIALS, true); // Keep frame as we only have one type for now
        }

        newPlate.fullStr = \`\${newPlate.displayStr} | \${newPlate.region}\`;
        return newPlate;
    }
`;

content = content.replace('static generateWheelReward(tier) {', partialGenerateFunction + '\n    static generateWheelReward(tier) {');

fs.writeFileSync('js/PlateGenerator.js', content);
