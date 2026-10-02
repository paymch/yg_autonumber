class EconomyManager {
    constructor(sdk) {
        this.sdk = sdk;
        this.balance = 30000;
        this.inventory = [];
        this.loanAmount = 0;
        this.loanStartTime = null;
        this.loanDuration = 10 * 60 * 1000; // 10 minutes
        this.spinCost = 500;
        this.saveCost = 5000;

        this.wheelLastSpinTime = null;

        this.onBalanceChange = null;
        this.onLoanUpdate = null;
        this.onGameOver = null;

        this.loanTimerInterval = null;
    }

    async init() {
        const data = await this.sdk.loadData();
        this.balance = data.balance ?? 30000;

        if (this.balance > 50000) {
            this.balance = 30000;
        }

        this.inventory = data.inventory ?? [];
        this.loanAmount = data.loanAmount ?? 0;
        this.loanStartTime = data.loanStartTime ?? null;
        this.wheelLastSpinTime = data.wheelLastSpinTime ?? null;

        this._triggerBalanceChange();
        if (this.loanAmount > 0) {
            this.startLoanTimer();
        }
    }

    async save() {
        await this.sdk.saveData({
            balance: this.balance,
            inventory: this.inventory,
            loanAmount: this.loanAmount,
            loanStartTime: this.loanStartTime,
            wheelLastSpinTime: this.wheelLastSpinTime
        });
    }

    canAfford(amount) {
        return this.balance >= amount;
    }

    deduct(amount) {
        if (this.canAfford(amount)) {
            this.balance -= amount;
            this._triggerBalanceChange();
            this.save();
            return true;
        }
        return false;
    }

    add(amount) {
        this.balance += amount;
        this._triggerBalanceChange();
        this.save();
    }

    savePlateToInventory(plateData, evalData) {
        if (this.deduct(this.saveCost)) {
            this.inventory.push({
                id: Date.now().toString(),
                plate: plateData,
                evaluation: evalData,
                savedAt: Date.now()
            });
            this.save();
            return true;
        }
        return false;
    }

    sellPlateFromInventory(id) {
        const index = this.inventory.findIndex(item => item.id === id);
        if (index !== -1) {
            const item = this.inventory[index];
            this.add(item.evaluation.finalPrice);
            this.inventory.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }


    takeLoan(amount) {
        if (this.loanAmount > 0) return false; // Already has loan

        let toReturn = amount;
        if (amount === 50000) toReturn = 60000;
        else if (amount === 100000) toReturn = 120000;
        else if (amount === 150000) toReturn = 185000;
        else if (amount === 250000) toReturn = 300000;
        else if (amount === 500000) toReturn = 650000;
        else toReturn = amount * 1.2;

        this.loanAmount = toReturn;
        this.loanStartTime = Date.now();
        this.add(amount);
        this.startLoanTimer();
        this.save();
        return true;
    }

    halveDebt() {
        if (this.loanAmount > 0) {
            this.loanAmount = Math.floor(this.loanAmount / 2);
            this.save();
            return true;
        }
        return false;
    }


    repayLoan() {
        if (this.loanAmount > 0 && this.canAfford(this.loanAmount)) {
            this.deduct(this.loanAmount);
            this.loanAmount = 0;
            this.loanStartTime = null;
            this.stopLoanTimer();
            if (this.onLoanUpdate) this.onLoanUpdate(0, 0);
            this.save();
            return true;
        }
        return false;
    }

    startLoanTimer() {
        this.stopLoanTimer();
        this.loanTimerInterval = setInterval(() => {
            if (!this.loanStartTime) return;

            const elapsed = Date.now() - this.loanStartTime;
            const remaining = Math.max(0, this.loanDuration - elapsed);

            if (remaining <= 0) {
                this.handleBankruptcy();
            } else {
                if (this.onLoanUpdate) this.onLoanUpdate(this.loanAmount, remaining);
            }
        }, 1000);
    }

    async reset() {
        this.balance = 30000;
        this.inventory = [];
        this.loanAmount = 0;
        this.loanStartTime = null;
        this.wheelLastSpinTime = null;
        this.stopLoanTimer();
        await this.save();
    }

    stopLoanTimer() {
        if (this.loanTimerInterval) {
            clearInterval(this.loanTimerInterval);
            this.loanTimerInterval = null;
        }
    }

    handleBankruptcy() {
        this.stopLoanTimer();

        // Auto repay if enough money
        if (this.balance >= this.loanAmount) {
            this.repayLoan();
            return;
        }

        // Sell inventory automatically to cover debt
        let totalInventoryValue = this.inventory.reduce((sum, item) => sum + item.evaluation.finalPrice, 0);

        if (this.balance + totalInventoryValue >= this.loanAmount) {
            // Need to sell plates
            while(this.balance < this.loanAmount && this.inventory.length > 0) {
                // Sell most expensive first
                this.inventory.sort((a,b) => b.evaluation.finalPrice - a.evaluation.finalPrice);
                this.sellPlateFromInventory(this.inventory[0].id);
            }
            this.repayLoan();
        } else {
            // Bankrupt
            this.balance = 0;
            this.inventory = [];
            this.loanAmount = 0;
            this.loanStartTime = null;
            this.save();
            if (this.onGameOver) this.onGameOver();
        }
    }

    _triggerBalanceChange() {
        if (this.onBalanceChange) {
            this.onBalanceChange(this.balance);
        }
    }
}

window.EconomyManager = EconomyManager;