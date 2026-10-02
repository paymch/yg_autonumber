class YandexSDKManager {
    constructor() {
        this.ysdk = null;
        this.player = null;
        this.isReady = false;
    }

    async init() {
        try {
            if (typeof YaGames !== 'undefined') {
                this.ysdk = await YaGames.init();
                this.ysdk.features.LoadingAPI?.ready();

                try {
                    this.player = await this.ysdk.getPlayer();
                } catch (err) {
                    console.log("Player init failed, using local storage fallback", err);
                }

                this.isReady = true;
                console.log("Yandex SDK initialized");
            } else {
                console.warn("Yandex SDK not found, running in local dev mode");
                this.isReady = true;
            }
        } catch (e) {
            console.error("SDK Init error", e);
            this.isReady = true;
        }
    }

    async loadData() {
        const defaultData = {
            balance: 30000,
            inventory: [],
            loanAmount: 0,
            loanStartTime: null
        };

        if (this.player) {
            try {
                const data = await this.player.getData();
                return Object.keys(data).length > 0 ? data : defaultData;
            } catch (e) {
                console.error("Cloud load failed, using local");
            }
        }

        // Fallback to localStorage
        const localData = localStorage.getItem('auto_plates_save');
        return localData ? JSON.parse(localData) : defaultData;
    }

    async saveData(data) {
        if (this.player) {
            try {
                await this.player.setData(data);
                return;
            } catch (e) {
                console.error("Cloud save failed, using local");
            }
        }

        // Fallback
        localStorage.setItem('auto_plates_save', JSON.stringify(data));
    }

    startGameplay() {
        if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
            try {
                this.ysdk.features.GameplayAPI.start();
            } catch (e) { console.error(e); }
        }
    }

    stopGameplay() {
        if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
            try {
                this.ysdk.features.GameplayAPI.stop();
            } catch (e) { console.error(e); }
        }
    }

    showFullscreenAd(onClose) {
        if (this.ysdk && this.ysdk.adv) {
            this.ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onClose: function(wasShown) { onClose(wasShown); },
                    onError: function(error) { console.error("Ad error", error); onClose(false); }
                }
            });
        } else {
            console.log("Mock Fullscreen Ad showed");
            onClose(true);
        }
    }

    showRewardedVideo(onReward, onClose) {
        if (this.ysdk && this.ysdk.adv) {
            this.ysdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => { console.log('Video ad open.'); },
                    onRewarded: () => { onReward(); },
                    onClose: () => { onClose(); },
                    onError: (e) => { console.error('Error while open video ad:', e); onClose(); }
                }
            });
        } else {
            console.log("Mock Rewarded Ad showed");
            onReward();
            onClose();
        }
    }
}

window.ysdkManager = new YandexSDKManager();