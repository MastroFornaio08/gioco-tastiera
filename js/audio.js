const Suoni = {
  ctx: null,
  attivo: false,

  inizializza() {
    if (this.ctx) return;
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.attivo = true;
    } catch (e) {
      console.warn("Audio non supportato");
    }
  },

  _suona(freq, type, duration, vol = 0.1) {
    if (!this.attivo || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playClick() { this._suona(600, 'sine', 0.1, 0.05); },
  playDing() { this._suona(880, 'sine', 0.3, 0.1); this._suona(1108, 'sine', 0.3, 0.1); },
  playBuzzer() { this._suona(150, 'sawtooth', 0.4, 0.1); },
  playTick() { this._suona(1000, 'square', 0.05, 0.02); }
};

const Vibrazione = {
  click() { if (navigator.vibrate) navigator.vibrate(20); },
  successo() { if (navigator.vibrate) navigator.vibrate([50, 50, 50]); },
  errore() { if (navigator.vibrate) navigator.vibrate([100, 50, 100]); }
};

// Attiva l'audio al primo tocco
document.addEventListener('click', () => { Suoni.inizializza(); }, { once: true });
