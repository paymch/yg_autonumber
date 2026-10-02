class UIManager {
    constructor(economy) {
        this.eco = economy;
        this.currentPlate = null;
        this.currentEval = null;
        this.isSpinning = false;
        this.spinsSinceAd = 0;

        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        this.el = {
            balance: document.getElementById('balance-display'),
            plateWrapper: document.getElementById('plate-wrapper'),
            plateMain: document.querySelector('.plate-main-part'),
            plateRegionCode: document.querySelector('.region-code'),
            plateFrameBottom: document.querySelector('.plate-frame-bottom .frame-text'),
            plateStamp: document.getElementById('plate-stamp'),
            vfxContainer: document.getElementById('vfx-container'),
            scanLine: document.querySelector('.scan-line'),
            comboBadges: document.getElementById('combo-badges'),
            priceEval: document.getElementById('price-evaluation'),
            evalDetails: document.getElementById('eval-details'),
            evalTotal: document.getElementById('eval-total-price'),
            btnSpin: document.getElementById('btn-spin'),
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
            btnTuneFrame: document.getElementById('btn-tune-frame'),
            actionBtns: document.getElementById('action-buttons'),
            btnSell: document.getElementById('btn-sell'),
            btnSave: document.getElementById('btn-save'),
            btnInventory: document.getElementById('btn-inventory'),
            headerInvCount: document.getElementById('header-inv-count'),
            btnBank: document.getElementById('btn-bank'),
            btnReward: document.getElementById('btn-reward'),

            loanAlert: document.getElementById('loan-alert'),
            loanAmount: document.getElementById('loan-amount'),
            loanTimer: document.getElementById('loan-timer'),

            modalBank: document.getElementById('modal-bank'),
            modalInventory: document.getElementById('modal-inventory'),
            modalGameOver: document.getElementById('modal-gameover'),

            inventoryList: document.getElementById('inventory-list'),
            inventoryCount: document.getElementById('inventory-count'),
            bankStatus: document.getElementById('bank-status'),
            repaySection: document.getElementById('repay-section'),
            btnRepayLoan: document.getElementById('btn-repay-loan')
        };
    }

    bindEvents() {
        this.el.btnSpin.addEventListener('click', () => this.spin());

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
        }
        this.el.btnSell.addEventListener('click', () => this.skipCurrent());
        this.el.btnSave.addEventListener('click', () => this.saveCurrent());

        this.el.btnInventory.addEventListener('click', () => this.showInventory());
        this.el.btnBank.addEventListener('click', () => this.showBank());
        this.el.btnReward.addEventListener('click', () => this.watchRewardAd());

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        document.querySelectorAll('.take-loan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                if (this.eco.takeLoan(amount)) {
                    sounds.alert();
                    this.el.modalBank.classList.add('hidden');
                }
            });
        });


        const btnHalveDebt = document.getElementById('btn-halve-debt');
        if (btnHalveDebt) {
            btnHalveDebt.addEventListener('click', () => {
                if (window.ysdkManager) window.ysdkManager.stopGameplay();
                if (window.ysdkManager) {
                    window.ysdkManager.showRewardedVideo(
                        () => {
                            if(window.ysdkManager) window.ysdkManager.startGameplay();
                            if (this.eco.halveDebt()) {
                                sounds.alert();
                                this.showBank(); // refresh UI
                            }
                        },
                        () => {
                            if(window.ysdkManager) window.ysdkManager.startGameplay();
                        }
                    );
                } else {
                    if (this.eco.halveDebt()) {
                        sounds.alert();
                        this.showBank(); // refresh UI
                    }
                }
            });
        }

        this.el.btnRepayLoan.addEventListener('click', () => {
            if (this.eco.repayLoan()) {
                sounds.click();
                this.el.modalBank.classList.add('hidden');
            } else {
                alert("Недостаточно средств!");
            }
        });

        document.getElementById('btn-restart').addEventListener('click', async () => {
            await this.eco.reset();
            location.reload();
        });

        this.eco.onBalanceChange = (bal) => this.updateBalance(bal);
        this.eco.onLoanUpdate = (amt, time) => this.updateLoan(amt, time);
        this.eco.onGameOver = () => this.showGameOver();
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * (end - start) + start);
            element.innerText = current.toLocaleString('ru-RU');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = end.toLocaleString('ru-RU');
            }
        };
        window.requestAnimationFrame(step);
    }

    updateBalance(amount) {
        const currentStr = this.el.balance.innerText.replace(/\D/g, '');
        const currentNum = parseInt(currentStr) || 0;
        if (amount !== currentNum) {
            this.animateValue(this.el.balance, currentNum, amount, 500);
        } else {
            this.el.balance.innerText = amount.toLocaleString('ru-RU');
        }

        this.el.btnSpin.disabled = amount < this.eco.spinCost;
        if (this.el.headerInvCount) {
            this.el.headerInvCount.innerText = `(${this.eco.inventory.length})`;
        }
    }

    updateLoan(amount, remainingMs) {
        if (amount === 0) {
            this.el.loanAlert.classList.add('hidden');
            return;
        }
        this.el.loanAlert.classList.remove('hidden');
        this.el.loanAmount.innerText = amount.toLocaleString('ru-RU');

        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        this.el.loanTimer.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (remainingMs < 120000) { // < 2 mins
            this.el.loanAlert.classList.add('danger');
            if (seconds % 2 === 0 && seconds !== this.lastBeepSecond) {
                // optional: sounds.playTone(400, 'square', 0.1, 0.05);
                this.lastBeepSecond = seconds;
            }
        } else {
            this.el.loanAlert.classList.remove('danger');
        }
    }

    setMode(mode) {
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
        if (!this.currentPlate) {
            // Generate full plate first to replace the ??? state
            this.currentPlate = PlateGenerator.generatePlate();
        }
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

    async spin() {
        if (this.isSpinning) return;
        if (!this.eco.deduct(this.eco.spinCost)) {
            // Can't afford
            if (this.eco.balance < this.eco.spinCost && !this.el.btnReward.classList.contains('hidden')) {
                alert("Недостаточно средств. Воспользуйтесь банком или посмотрите рекламу за бонус!");
            }
            return;
        }

        this.spinsSinceAd++;
        if (this.spinsSinceAd >= 9) {
            this.spinsSinceAd = 0;
            if (window.ysdkManager) {
                window.ysdkManager.stopGameplay();
                window.ysdkManager.showInterstitial(
                    () => { window.ysdkManager.startGameplay(); },
                    () => { window.ysdkManager.startGameplay(); }
                );
            }
        }

        sounds.resume();
        this.isSpinning = true;
        this.el.btnSpin.classList.add('hidden');
        this.el.actionBtns.classList.add('hidden');
        this.el.priceEval.classList.add('hidden');
        this.el.comboBadges.innerHTML = '';
        this.el.plateStamp.classList.add('hidden');
        this.el.plateStamp.classList.remove('stamp-anim');
        this.el.plateWrapper.classList.add('spinning');
        this.el.vfxContainer.innerHTML = '';

        sounds.spin();

        // 1. Generate Data
        this.currentPlate = PlateGenerator.generatePlate();
        this.currentEval = ComboEvaluator.evaluate(this.currentPlate);

        // Animate random chars for a bit
        let spinTicks = 0;
        const spinInterval = setInterval(() => {
            const tempPlate = PlateGenerator.generatePlate();
            this.renderPlate(tempPlate);
            spinTicks++;
            if (spinTicks > 15) {
                clearInterval(spinInterval);
                this.finishSpin();
            }
        }, 50);
    }

    finishSpin() {
        this.el.plateWrapper.classList.remove('spinning');
        this.renderPlate(this.currentPlate);

        // Apply classes
        this.el.plateWrapper.className = `plate-wrapper ${this.currentPlate.type.id} ${this.currentPlate.wear.css} format-${this.currentPlate.format.id}`;

        // Frame text
        this.el.plateFrameBottom.innerText = this.currentPlate.frameText.text;
        this.el.plateFrameBottom.className = `frame-text text-${this.currentPlate.frameText.type}`;

        // Scan effect
        this.el.plateWrapper.classList.add('scanning');
        sounds.scan();

        setTimeout(() => {
            this.el.plateWrapper.classList.remove('scanning');
            this.showResults();
        }, 800);
    }

    renderPlate(plate) {
        // Parse sequence to HTML with exact GOST margins using gap/margin classes
        let html = '';
        if (plate.type.id === 'normal') {
            if (plate.format && plate.format.id === 'square') {
                html = `<div class="plate-row-top">
                            <span class="plate-char">${plate.sequence[0]}</span>
                            <div class="plate-group">
                                <span class="plate-digit">${plate.sequence[1]}</span>
                                <span class="plate-digit">${plate.sequence[2]}</span>
                                <span class="plate-digit">${plate.sequence[3]}</span>
                            </div>
                        </div>
                        <div class="plate-row-bottom">
                            <div class="plate-group-letters">
                                <span class="plate-char">${plate.sequence[4]}</span>
                                <span class="plate-char">${plate.sequence[5]}</span>
                            </div>
                        </div>`;
            } else {
                html = `<span class="plate-char">${plate.sequence[0]}</span>
                        <div class="plate-bolt inner-bolt left-bolt"></div>
                        <div class="plate-group">
                            <span class="plate-digit">${plate.sequence[1]}</span>
                            <span class="plate-digit">${plate.sequence[2]}</span>
                            <span class="plate-digit">${plate.sequence[3]}</span>
                        </div>
                        <div class="plate-group-letters">
                            <span class="plate-char">${plate.sequence[4]}</span>
                            <span class="plate-char">${plate.sequence[5]}</span>
                        </div>`;
            }
        } else if (plate.type.id === 'taxi') {
            html = `<div class="plate-group-letters">
                        <span class="plate-char">${plate.sequence[0]}</span>
                        <span class="plate-char">${plate.sequence[1]}</span>
                    </div>
                    <div class="plate-group taxi-digits">
                        <span class="plate-digit">${plate.sequence[2]}</span>
                        <span class="plate-digit">${plate.sequence[3]}</span>
                        <span class="plate-digit">${plate.sequence[4]}</span>
                    </div>`;
        } else if (plate.type.id === 'police') {
            html = `<span class="plate-char">${plate.sequence[0]}</span>
                    <div class="plate-group police-digits">
                        <span class="plate-digit">${plate.sequence[1]}</span>
                        <span class="plate-digit">${plate.sequence[2]}</span>
                        <span class="plate-digit">${plate.sequence[3]}</span>
                        <span class="plate-digit">${plate.sequence[4]}</span>
                    </div>`;
        } else if (plate.type.id === 'military') {
             html = `<div class="plate-group">
                        <span class="plate-digit">${plate.sequence[0]}</span>
                        <span class="plate-digit">${plate.sequence[1]}</span>
                        <span class="plate-digit">${plate.sequence[2]}</span>
                        <span class="plate-digit">${plate.sequence[3]}</span>
                    </div>
                    <div class="plate-group-letters military-letters">
                        <span class="plate-char">${plate.sequence[4]}</span>
                        <span class="plate-char">${plate.sequence[5]}</span>
                    </div>`;
        } else if (plate.type.id === 'diplomat') {
             const parts = plate.displayStr.split(' ');
             html = `<div class="plate-group">
                        <span class="plate-digit">${parts[0][0]}</span>
                        <span class="plate-digit">${parts[0][1]}</span>
                        <span class="plate-digit">${parts[0][2]}</span>
                     </div>
                     <span class="plate-char highlight dip-char">${parts[1]}</span>
                     <span class="plate-digit">${parts[2]}</span>`;
        }

        this.el.plateMain.innerHTML = html;
        this.el.plateRegionCode.innerText = plate.region;
    }

    spawnParticles(color1, color2, count) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = 5 + Math.random() * 8;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.backgroundColor = Math.random() > 0.5 ? color1 : color2;

            // Random position near center
            p.style.left = `calc(50% + ${(Math.random() - 0.5) * 50}px)`;
            p.style.top = `calc(50% + ${(Math.random() - 0.5) * 20}px)`;

            // Random trajectory
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

            this.el.vfxContainer.appendChild(p);
        }
    }

    showResults() {
        sounds.win(this.currentEval.rarity);

        if (this.currentEval.rarity !== 'common') {
            this.el.plateWrapper.classList.add('plate-shake');
            setTimeout(() => this.el.plateWrapper.classList.remove('plate-shake'), 500);
        }

        // VFX for high rarities
        if (this.currentEval.rarity === 'mythic') {
            this.el.plateWrapper.classList.add('plate-flare');
            setTimeout(() => this.el.plateWrapper.classList.remove('plate-flare'), 600);
            this.spawnParticles('#ef4444', '#fca5a5', 40);

            this.el.plateStamp.innerText = "БЛАТНОЙ!";
            this.el.plateStamp.classList.remove('hidden');
            this.el.plateStamp.classList.add('stamp-anim');

        } else if (this.currentEval.rarity === 'legendary') {
            this.el.plateWrapper.classList.add('plate-flare');
            setTimeout(() => this.el.plateWrapper.classList.remove('plate-flare'), 600);
            this.spawnParticles('#fbbf24', '#fef3c7', 60);

            this.el.plateStamp.innerText = "ДЖЕКПОТ!";
            this.el.plateStamp.classList.remove('hidden');
            this.el.plateStamp.classList.add('stamp-anim');
        } else if (this.currentEval.rarity === 'epic') {
            this.spawnParticles('#a855f7', '#d8b4fe', 20);
        }

        // Render Badges
        this.el.comboBadges.innerHTML = this.currentEval.badges.map(b =>
            `<span class="badge badge-${b.type}">${b.text}</span>`
        ).join('');

        // Render Price Breakdown
        const b = this.currentEval.breakdown;
        let detailsHtml = `<div class="eval-row"><span>Базовая оценка:</span><span>${b.base.toLocaleString()} ₽</span></div>`;
        if (b.comboBonus > 0) {
            detailsHtml += `<div class="eval-row"><span>Комбо-бонус:</span><span>+${b.comboBonus.toLocaleString()} ₽</span></div>`;
        }
        if (b.comboMult > 1) {
            detailsHtml += `<div class="eval-row"><span>Множитель комбинации:</span><span>x${b.comboMult}</span></div>`;
        }
        if (b.wearMult !== 1) {
            detailsHtml += `<div class="eval-row"><span>Износ (${this.currentPlate.wear.name}):</span><span>x${b.wearMult}</span></div>`;
        }
        if (b.frameMult !== 1) {
            detailsHtml += `<div class="eval-row"><span>Рамка:</span><span>x${b.frameMult}</span></div>`;
        }
        if (b.formatMult !== 1) {
            detailsHtml += `<div class="eval-row"><span>Формат ГОСТ:</span><span>x${b.formatMult}</span></div>`;
        }

        this.el.evalDetails.innerHTML = detailsHtml;

        this.el.priceEval.classList.remove('hidden');
        this.el.evalTotal.innerText = '0'; // reset for animation
        this.animateValue(this.el.evalTotal, 0, this.currentEval.finalPrice, 500);

        // Show Actions
        this.el.actionBtns.classList.remove('hidden');
        this.el.btnSave.disabled = !this.eco.canAfford(this.eco.saveCost);

        this.isSpinning = false;

        // 5% chance to show reward ad button
        if (Math.random() < 0.1 && window.ysdkManager && window.ysdkManager.ysdk) {
            this.el.btnReward.classList.remove('hidden');
        } else {
            this.el.btnReward.classList.add('hidden');
        }

        // Occasional interstitial ad
        if (Math.random() < 0.05) {
            if(window.ysdkManager) window.ysdkManager.stopGameplay();
            window.ysdkManager.showFullscreenAd((wasShown) => {
                if(wasShown) console.log("Ad shown");
                if(window.ysdkManager) window.ysdkManager.startGameplay();
            });
        }
    }

    skipCurrent() {
        if (!this.currentPlate) return;
        sounds.click();
        this.resetPlateArea();
    }

    saveCurrent() {
        if (!this.currentPlate) return;
        sounds.click();
        if (this.eco.savePlateToInventory(this.currentPlate, this.currentEval)) {
            this.resetPlateArea();
        }
    }

    resetPlateArea() {
        this.currentPlate = null;
        this.currentEval = null;
        this.el.actionBtns.classList.add('hidden');
        this.el.priceEval.classList.add('hidden');
        this.el.comboBadges.innerHTML = '';
        this.el.plateStamp.classList.add('hidden');
        this.el.plateStamp.classList.remove('stamp-anim');
        this.el.vfxContainer.innerHTML = '';
        this.el.btnSpin.classList.remove('hidden');
        this.el.plateWrapper.className = 'plate-wrapper normal state-fn format-standard';
        this.el.plateMain.innerHTML = `<span class="plate-char">?</span><div class="plate-group"><span class="plate-digit">?</span><span class="plate-digit">?</span><span class="plate-digit">?</span></div>`;
        this.el.plateRegionCode.innerText = '??';
        this.el.plateFrameBottom.innerText = '';
    }

    showInventory() {
        sounds.click();
        this.el.inventoryCount.innerText = this.eco.inventory.length;

        let totalValue = 0;
        this.el.inventoryList.innerHTML = '';

        if (this.eco.inventory.length === 0) {
            this.el.inventoryList.innerHTML = '<p class="text-center w-full mt-20 text-muted">Гараж пуст</p>';
        } else {
            this.eco.inventory.forEach((plate, idx) => {
                const evalData = ComboEvaluator.evaluate(plate);
                totalValue += evalData.finalPrice;

                const card = document.createElement('div');
                card.className = 'inv-card';
                card.innerHTML = `
                    <div class="plate-wrapper ${plate.type.id} ${plate.wear.css} ${plate.frame ? plate.frame.css : ''} format-${plate.format.id}">
                        <div class="plate-bolt inner-bolt left-bolt"></div>
                        <div class="plate-inner">
                            <div class="plate-main-part">
                                <span class="plate-char">${plate.sequence[0]}</span>
                                <div class="plate-group">
                                    <span class="plate-digit">${plate.sequence[1]}</span>
                                    <span class="plate-digit">${plate.sequence[2]}</span>
                                    <span class="plate-digit">${plate.sequence[3]}</span>
                                </div>
                                <div class="plate-group-letters">
                                    <span class="plate-char">${plate.sequence[4]}</span>
                                    <span class="plate-char">${plate.sequence[5]}</span>
                                </div>
                            </div>
                            <div class="plate-region-part">
                                <div class="region-code">${plate.region.code}</div>
                            </div>
                        </div>
                        <div class="plate-bolt inner-bolt right-bolt"></div>
                        <div class="plate-frame-bottom"><span class="frame-text ${plate.frameText.type}">${plate.frameText.text}</span></div>
                    </div>
                    <div class="inv-details">
                        <div class="inv-price">${evalData.finalPrice.toLocaleString('ru-RU')} ₽</div>
                        <div class="inv-wear">${plate.wear.name}</div>
                    </div>
                `;
                this.el.inventoryList.appendChild(card);
            });
        }

        document.getElementById('inventory-value').innerText = totalValue.toLocaleString('ru-RU');

        document.getElementById('modal-inventory').classList.remove('hidden');
    }

    showBank() {
        sounds.click();
        if (this.eco.loanAmount > 0) {
            this.el.bankStatus.innerHTML = `
                <p>Текущий долг: <span class="text-danger">${this.eco.loanAmount.toLocaleString()} ₽</span></p>
            `;
            document.querySelector('.bank-actions').classList.add('hidden');
            this.el.repaySection.classList.remove('hidden');
            this.el.btnRepayLoan.disabled = !this.eco.canAfford(this.eco.loanAmount);
        } else {
            this.el.bankStatus.innerHTML = '<p>У вас нет активных кредитов.</p>';
            document.querySelector('.bank-actions').classList.remove('hidden');
            this.el.repaySection.classList.add('hidden');
        }

        this.el.modalBank.classList.remove('hidden');
    }


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
            this.el.wheelTimer.innerText = `Колесо: ${m}:${s}`;
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
                el.style.transform = `rotate(${i * anglePerSegment}deg)`;
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

            this.el.wheelCircle.style.transform = `rotate(${this.wheelAngle}deg)`;

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
            alert(`Поздравляем!\n${message}`);
            this.el.modalWheel.classList.add('hidden');
        }, 500);
    }

    showGameOver() {
        this.el.modalGameOver.classList.remove('hidden');
    }

    watchRewardAd() {
        if(window.ysdkManager) window.ysdkManager.stopGameplay();
        window.ysdkManager.showRewardedVideo(
            () => {
                // Reward
                this.eco.add(10000);
                this.el.btnReward.classList.add('hidden');
            },
            () => {
                this.el.btnReward.classList.add('hidden');
                if(window.ysdkManager) window.ysdkManager.startGameplay();
            }
        );
    }
}

window.UIManager = UIManager;