class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(frequency, type, duration, vol = 0.1) {
        if (!this.enabled || this.ctx.state === 'suspended') return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    click() {
        this.playTone(600, 'sine', 0.1, 0.05);
    }

    spin() {
        // Fast repeating ticks
        if (!this.enabled) return;
        let time = this.ctx.currentTime;
        for (let i = 0; i < 8; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800 + (Math.random() * 200), time + (i * 0.1));
            gain.gain.setValueAtTime(0.05, time + (i * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.001, time + (i * 0.1) + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time + (i * 0.1));
            osc.stop(time + (i * 0.1) + 0.05);
        }
    }

    scan() {
        if (!this.enabled) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.linearRampToValueAtTime(800, time + 0.8);
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.8);
    }

    win(rarity) {
        if (!this.enabled) return;

        const time = this.ctx.currentTime;
        const playChord = (freqs, startTime, duration) => {
            freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.05, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + duration);
            });
        };

        if (rarity === 'legendary' || rarity === 'mythic') {
            playChord([440, 554, 659], time, 0.5); // A major
            playChord([554, 659, 830], time + 0.2, 0.8);
            playChord([659, 830, 1046], time + 0.4, 1.5);
        } else if (rarity === 'epic' || rarity === 'rare') {
            playChord([523, 659, 783], time, 0.5); // C major
            playChord([659, 783, 1046], time + 0.2, 1.0);
        } else {
            this.playTone(880, 'sine', 0.3, 0.05);
        }
    }

    alert() {
        this.playTone(300, 'square', 0.2, 0.1);
        setTimeout(() => this.playTone(300, 'square', 0.2, 0.1), 300);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

window.sounds = new SoundManager();