class UIManager {
    constructor(economy) {
        this.eco = economy;
        this.currentPlate = null;
        this.currentEval = null;
        this.isSpinning = false;

        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        this.el = {
            balance: document.getElementById('balance-display'),
            plateWrapper: document.getElementById('plate-wrapper'),
            plateMain: document.querySelector('.plate-main-part'),
            plateRegionCode: document.querySelector('.region-code'),
            plateStamp: document.getElementById('plate-stamp'),
            vfxContainer: document.getElementById('vfx-container'),
            scanLine: document.querySelector('.scan-line'),
            comboBadges: document.getElementById('combo-badges'),
            priceEval: document.getElementById('price-evaluation'),
            evalDetails: document.getElementById('eval-details'),
            evalTotal: document.getElementById('eval-total-price'),
            btnSpin: document.getElementById('btn-spin'),
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
        this.el.btnSell.addEventListener('click', () => this.sellCurrent());
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

    async spin() {
        if (this.isSpinning) return;
        if (!this.eco.deduct(this.eco.spinCost)) return;

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
        this.el.plateWrapper.className = `plate-wrapper ${this.currentPlate.type.id} state-${this.currentPlate.state.id} format-${this.currentPlate.format.id}`;

        // Scan effect
        this.el.plateWrapper.classList.add('scanning');
        sounds.scan();

        setTimeout(() => {
            this.el.plateWrapper.classList.remove('scanning');
            this.showResults();
        }, 800);
    }

    renderPlate(plate) {
        // Parse sequence to HTML
        let html = '';
        if (plate.type.id === 'normal') {
            html = `<span class="plate-char char-1">${plate.sequence[0]}</span>
                    <span class="plate-digit digit-1">${plate.sequence[1]}</span>
                    <span class="plate-digit digit-2">${plate.sequence[2]}</span>
                    <span class="plate-digit digit-3">${plate.sequence[3]}</span>
                    <span class="plate-char char-2">${plate.sequence[4]}</span>
                    <span class="plate-char char-3">${plate.sequence[5]}</span>`;
        } else if (plate.type.id === 'taxi') {
            html = `<span class="plate-char char-1">${plate.sequence[0]}</span>
                    <span class="plate-char char-2">${plate.sequence[1]}</span>
                    <span class="plate-digit digit-1">${plate.sequence[2]}</span>
                    <span class="plate-digit digit-2">${plate.sequence[3]}</span>
                    <span class="plate-digit digit-3">${plate.sequence[4]}</span>`;
        } else if (plate.type.id === 'police') {
            html = `<span class="plate-char char-1">${plate.sequence[0]}</span>
                    <span class="plate-digit digit-1">${plate.sequence[1]}</span>
                    <span class="plate-digit digit-2">${plate.sequence[2]}</span>
                    <span class="plate-digit digit-3">${plate.sequence[3]}</span>
                    <span class="plate-digit digit-4">${plate.sequence[4]}</span>`;
        } else if (plate.type.id === 'military') {
             html = `<span class="plate-digit digit-1">${plate.sequence[0]}</span>
                    <span class="plate-digit digit-2">${plate.sequence[1]}</span>
                    <span class="plate-digit digit-3">${plate.sequence[2]}</span>
                    <span class="plate-digit digit-4">${plate.sequence[3]}</span>
                    <span class="plate-char char-1">${plate.sequence[4]}</span>
                    <span class="plate-char char-2">${plate.sequence[5]}</span>`;
        } else if (plate.type.id === 'diplomat') {
             const parts = plate.displayStr.split(' ');
             html = `<span class="plate-digit">${parts[0]}</span>
                     <span class="plate-char highlight">${parts[1]}</span>
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
        let detailsHtml = `<div class="eval-row"><span>База:</span><span>${b.base.toLocaleString()} ₽</span></div>`;
        if (b.comboBonus > 0) {
            detailsHtml += `<div class="eval-row"><span>Бонус комбинации:</span><span>+${b.comboBonus.toLocaleString()} ₽</span></div>`;
        }
        if (b.comboMult > 1) {
            detailsHtml += `<div class="eval-row"><span>Множитель редкости:</span><span>x${b.comboMult}</span></div>`;
        }
        if (b.stateMult !== 1) {
            detailsHtml += `<div class="eval-row"><span>Состояние (${this.currentPlate.state.name}):</span><span>x${b.stateMult}</span></div>`;
        }
        if (b.formatMult !== 1) {
            detailsHtml += `<div class="eval-row"><span>Формат (${this.currentPlate.format.name}):</span><span>x${b.formatMult}</span></div>`;
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

    sellCurrent() {
        if (!this.currentPlate) return;
        sounds.click();
        this.eco.add(this.currentEval.finalPrice);
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
        this.el.plateWrapper.className = 'plate-wrapper normal state-new format-standard';
        this.el.plateMain.innerHTML = `<span class="plate-char char-1">?</span><span class="plate-digit digit-1">?</span><span class="plate-digit digit-2">?</span>`;
        this.el.plateRegionCode.innerText = '??';
    }

    showInventory() {
        sounds.click();
        this.el.inventoryCount.innerText = this.eco.inventory.length;

        if (this.eco.inventory.length === 0) {
            this.el.inventoryList.innerHTML = '<p class="text-center text-muted">В гараже пусто.</p>';
        } else {
            this.el.inventoryList.innerHTML = this.eco.inventory.map(item => `
                <div class="inventory-item">
                    <div>
                        <div class="inventory-plate-str">${item.plate.fullStr}</div>
                        <div class="inventory-price">${item.evaluation.finalPrice.toLocaleString()} ₽</div>
                    </div>
                    <button class="btn-success btn-sell-inv" data-id="${item.id}">Продать</button>
                </div>
            `).join('');

            this.el.inventoryList.querySelectorAll('.btn-sell-inv').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    if (this.eco.sellPlateFromInventory(id)) {
                        sounds.click();
                        this.showInventory(); // Refresh
                    }
                });
            });
        }

        this.el.modalInventory.classList.remove('hidden');
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