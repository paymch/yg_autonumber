document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Yandex SDK
    await window.ysdkManager.init();

    // 2. Initialize Economy with loaded data
    const economy = new EconomyManager(window.ysdkManager);
    await economy.init();

    // 3. Initialize UI
    const ui = new UIManager(economy);

    // 4. Start gameplay reporting to Yandex SDK
    if (window.ysdkManager) {
        window.ysdkManager.startGameplay();
    }

    // Initial interaction requirement for AudioContext
    const initAudio = () => {
        sounds.resume();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
});