const fs = require('fs');

let content = fs.readFileSync('js/UIManager.js', 'utf8');

// 1. Add new elements to bindElements
content = content.replace(
    "btnSpin: document.getElementById('btn-spin'),",
    `btnSpin: document.getElementById('btn-spin'),
            btnWheel: document.getElementById('btn-wheel'),
            modalWheel: document.getElementById('modal-wheel'),
            wheelCircle: document.getElementById('wheel-circle'),
            btnSpinWheel: document.getElementById('btn-spin-wheel'),
            wheelTimer: document.getElementById('wheel-timer'),
            modeNormal: document.getElementById('mode-normal'),
            modeTuning: document.getElementById('mode-tuning'),
            normalControls: document.getElementById('normal-controls'),
            tuningControls: document.getElementById('tuning-controls'),
            btnTuneLetters: document.getElementById('btn-tune-letters'),
            btnTuneDigits: document.getElementById('btn-tune-digits'),
            btnTuneRegion: document.getElementById('btn-tune-region'),
            btnTuneFrame: document.getElementById('btn-tune-frame'),`
);

// 2. Add events to bindEvents
content = content.replace(
    "this.el.btnSpin.addEventListener('click', () => this.spin());",
    `this.el.btnSpin.addEventListener('click', () => this.spin());

        // Mode toggle
        if(this.el.modeNormal) {
            this.el.modeNormal.addEventListener('click', () => this.setMode('normal'));
            this.el.modeTuning.addEventListener('click', () => this.setMode('tuning'));

            // Tuning buttons
            this.el.btnTuneLetters.addEventListener('click', () => this.spinPartial('letters'));
            this.el.btnTuneDigits.addEventListener('click', () => this.spinPartial('digits'));
            this.el.btnTuneRegion.addEventListener('click', () => this.spinPartial('region'));
            this.el.btnTuneFrame.addEventListener('click', () => this.spinPartial('frame'));
        }

        // Wheel events
        if(this.el.btnWheel) {
            this.el.btnWheel.addEventListener('click', () => this.showWheel());
            this.el.btnSpinWheel.addEventListener('click', () => this.spinWheel());

            // Setup wheel UI periodically
            setInterval(() => this.updateWheelTimer(), 1000);
        }`
);

// 3. Add Tuning Mode Logic
content = content.replace(
    "async spin() {",
    `setMode(mode) {
        if (!this.currentPlate && mode === 'tuning') {
            // Need a plate first
            return;
        }

        sounds.click();

        if (mode === 'normal') {
            this.el.modeNormal.classList.add('active');
            this.el.modeTuning.classList.remove('active');
            this.el.normalControls.classList.remove('hidden');
            this.el.tuningControls.classList.add('hidden');

            if (this.currentPlate) {
               this.el.actionBtns.classList.remove('hidden');
            } else {
               this.el.btnSpin.classList.remove('hidden');
            }
        } else {
            this.el.modeTuning.classList.add('active');
            this.el.modeNormal.classList.remove('active');
            this.el.normalControls.classList.add('hidden');
            this.el.tuningControls.classList.remove('hidden');
            this.el.actionBtns.classList.remove('hidden'); // Show save/skip below tuning

            // Disable tuning buttons if invalid format
            const isNormal = this.currentPlate && this.currentPlate.type.id === 'normal';
            this.el.btnTuneLetters.disabled = !isNormal;
            this.el.btnTuneDigits.disabled = !isNormal;
        }
    }

    async spinPartial(part) {
        if (this.isSpinning) return;

        let cost = 0;
        if (part === 'letters') cost = 1500;
        else if (part === 'digits') cost = 1200;
        else if (part === 'region') cost = 800;
        else if (part === 'frame') cost = 600;

        if (!this.eco.deduct(cost)) return;

        sounds.resume();
        this.isSpinning = true;
        this.el.actionBtns.classList.add('hidden');
        this.el.priceEval.classList.add('hidden');
        this.el.comboBadges.innerHTML = '';
        this.el.plateStamp.classList.add('hidden');
        this.el.plateStamp.classList.remove('stamp-anim');
        this.el.plateWrapper.classList.add('spinning');
        this.el.vfxContainer.innerHTML = '';

        sounds.spin();

        // Generate the partially updated plate
        this.currentPlate = PlateGenerator.generatePartial(this.currentPlate, part);
        this.currentEval = ComboEvaluator.evaluate(this.currentPlate);

        // Spin animation
        let spinTicks = 0;
        const spinInterval = setInterval(() => {
            const tempPlate = PlateGenerator.generatePartial(this.currentPlate, part);
            this.renderPlate(tempPlate);
            spinTicks++;
            if (spinTicks > 15) {
                clearInterval(spinInterval);
                this.finishSpin();
            }
        }, 50);
    }

    async spin() {`
);

// 4. Update action buttons hide/show in finishSpin
content = content.replace(
    `this.el.btnSpin.classList.remove('hidden');
        this.el.actionBtns.classList.remove('hidden');`,
    `if (this.el.modeNormal && this.el.modeNormal.classList.contains('active')) {
            // Hide spin btn, show action btns
            this.el.btnSpin.classList.add('hidden');
        } else if (!this.el.modeNormal) {
            this.el.btnSpin.classList.remove('hidden');
        }
        this.el.actionBtns.classList.remove('hidden');`
);

// 5. Add Wheel of fortune logic
const wheelLogic = `
    /* --- Wheel of Fortune Logic --- */

    updateWheelTimer() {
        if (!this.eco.wheelLastSpinTime) {
            this.el.btnSpinWheel.disabled = false;
            this.el.wheelTimer.classList.add('hidden');
            this.el.btnWheel.classList.add('pulse-glow');
            return;
        }

        const now = Date.now();
        const elapsed = now - this.eco.wheelLastSpinTime;
        const cooldown = 10 * 60 * 1000; // 10 minutes

        if (elapsed >= cooldown) {
            this.el.btnSpinWheel.disabled = false;
            this.el.wheelTimer.classList.add('hidden');
            this.el.btnWheel.classList.add('pulse-glow');
        } else {
            this.el.btnSpinWheel.disabled = true;
            this.el.wheelTimer.classList.remove('hidden');
            this.el.btnWheel.classList.remove('pulse-glow');

            const remaining = cooldown - elapsed;
            const m = Math.floor(remaining / 60000).toString().padStart(2, '0');
            const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
            this.el.wheelTimer.innerText = \`Колесо: \${m}:\${s}\`;
        }
    }

    showWheel() {
        sounds.click();

        // Build wheel UI if empty
        if (this.el.wheelCircle.children.length === 0) {
            const segments = [
                { id: 'prize_7500', name: '+7 500 ₽', color: '#6c757d' },
                { id: 'prize_20000', name: '+20 000 ₽', color: '#28a745' },
                { id: 'prize_elite', name: 'ЭЛИТНЫЙ', color: '#17a2b8' },
                { id: 'prize_frame', name: 'РАМКА', color: '#007bff' },
                { id: 'prize_50000', name: '+50 000 ₽', color: '#fd7e14' },
                { id: 'prize_jackpot', name: 'ДЖЕКПОТ', color: '#ffc107' }
            ];

            const anglePerSegment = 360 / segments.length;

            segments.forEach((seg, i) => {
                const el = document.createElement('div');
                el.className = 'wheel-segment';
                el.style.backgroundColor = seg.color;
                el.style.transform = \`rotate(\${i * anglePerSegment}deg)\`;
                el.innerText = seg.name;
                this.el.wheelCircle.appendChild(el);
            });

            this.wheelSegments = segments;
            this.wheelAngle = 0;
        }

        this.updateWheelTimer();
        this.el.modalWheel.classList.remove('hidden');
    }

    async spinWheel() {
        if (this.el.btnSpinWheel.disabled) return;

        if(window.ysdkManager) window.ysdkManager.stopGameplay();

        const onAdSuccess = () => {
            if(window.ysdkManager) window.ysdkManager.startGameplay();

            this.el.btnSpinWheel.disabled = true;
            this.eco.wheelLastSpinTime = Date.now();
            this.eco.save();

            // Determine prize based on probabilities
            const r = Math.random();
            let targetPrize;
            // ДЖЕКПОТ (Шанс 1.5%)
            // Элитный номер (Шанс 6%)
            // Денежный куш (Шанс 15%)
            // Солидный бонус (Шанс 25%)
            // Утешительный приз (Шанс 35%)
            // Редкая рамка (Шанс 17.5%)

            if (r < 0.015) targetPrize = 'prize_jackpot';
            else if (r < 0.075) targetPrize = 'prize_elite';
            else if (r < 0.225) targetPrize = 'prize_50000';
            else if (r < 0.475) targetPrize = 'prize_20000';
            else if (r < 0.825) targetPrize = 'prize_7500';
            else targetPrize = 'prize_frame';

            const targetIndex = this.wheelSegments.findIndex(s => s.id === targetPrize);

            // Calculate rotation
            const spins = 5; // Spin 5 times
            const anglePerSegment = 360 / this.wheelSegments.length;

            // We want the target segment to be at the TOP (0 degrees).
            // When segment i is at top, wheel rotation should be 360 - (i * anglePerSegment)
            // Add a slight random offset within the segment
            const randomOffset = (Math.random() - 0.5) * (anglePerSegment * 0.8);
            const targetAngle = (360 - (targetIndex * anglePerSegment)) + randomOffset;

            this.wheelAngle += (spins * 360) + targetAngle - (this.wheelAngle % 360);

            this.el.wheelCircle.style.transform = \`rotate(\${this.wheelAngle}deg)\`;

            // Play ticking sound
            let ticks = 0;
            const tickInterval = setInterval(() => {
                sounds.click();
                ticks++;
                if (ticks > 20) clearInterval(tickInterval);
            }, 200);

            setTimeout(() => {
                this.grantWheelPrize(targetPrize);
            }, 4200); // Wait for transition
        };

        if (window.ysdkManager) {
            window.ysdkManager.showRewardedVideo(onAdSuccess, () => {
                if(window.ysdkManager) window.ysdkManager.startGameplay();
                console.log("Ad closed or failed");
            });
        } else {
            onAdSuccess();
        }
    }

    grantWheelPrize(prizeId) {
        sounds.alert();
        let message = '';

        switch (prizeId) {
            case 'prize_7500':
                this.eco.add(7500);
                message = 'Утешительный приз: 7 500 ₽';
                break;
            case 'prize_20000':
                this.eco.add(20000);
                message = 'Солидный бонус: 20 000 ₽';
                break;
            case 'prize_50000':
                this.eco.add(50000);
                message = 'Денежный куш: 50 000 ₽';
                break;
            case 'prize_frame':
                this.eco.add(10000); // Placeholder for frame coupon
                message = 'Купон на рамку (выдана компенсация 10 000 ₽)';
                break;
            case 'prize_elite':
                const elitePlate = PlateGenerator.generateWheelReward('elite');
                this.eco.inventory.push(elitePlate);
                this.eco.save();
                message = 'Элитный номер получен в Гараж!';
                break;
            case 'prize_jackpot':
                const jackpotPlate = PlateGenerator.generateWheelReward('jackpot');
                this.eco.inventory.push(jackpotPlate);
                this.eco.save();
                message = 'ДЖЕКПОТ! Легендарный номер Ваш!';
                break;
        }

        setTimeout(() => {
            alert(\`Поздравляем!\\n\${message}\`);
            this.el.modalWheel.classList.add('hidden');
        }, 500);
    }
`;

content = content.replace("showGameOver() {", wheelLogic + "\n    showGameOver() {");

fs.writeFileSync('js/UIManager.js', content);
