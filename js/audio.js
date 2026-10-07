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
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playClick() { 
    this._suona(600, 'sine', 0.1, 0.05); 
    if (window.Vibrazione) Vibrazione.click();
  },
  playDing() { this._suona(880, 'sine', 0.3, 0.1); this._suona(1108, 'sine', 0.3, 0.1); },
  playBuzzer() { 
    this._suona(150, 'sawtooth', 0.4, 0.1); 
    if (window.Vibrazione) Vibrazione.errore();
  },
  playTick() { this._suona(1000, 'square', 0.05, 0.02); },
  playRouletteTick() { this._suona(900 + Math.random() * 200, 'triangle', 0.04, 0.05); },
  
  // Conto alla rovescia progressivo (3, 2, 1, VIA!)
  playCountdown(step) {
    if (step > 0 && window.Vibrazione) Vibrazione.tick();
    else if (step === 0 && window.Vibrazione) Vibrazione.successo();
    if (!this.attivo || !this.ctx) return;
    if (step === 3) {
      this._suona(523.25, 'sine', 0.18, 0.08); // Do5
    } else if (step === 2) {
      this._suona(659.25, 'sine', 0.18, 0.09); // Mi5
    } else if (step === 1) {
      this._suona(783.99, 'sine', 0.18, 0.10); // Sol5
    } else if (step === 0) { // VIA!
      const t = this.ctx.currentTime;
      [1046.50, 1318.51, 1567.98].forEach((f, idx) => { // Accordo Do6 maggiore
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    }
  },

  // Fanfara di vittoria (arpeggio glorioso Web Audio)
  playVittoria() {
    if (!this.attivo || !this.ctx) return;
    const note = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const t0 = this.ctx.currentTime;
    note.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === note.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, t0 + i * 0.1);
      gain.gain.setValueAtTime(0.12, t0 + i * 0.1);
      const dur = i === note.length - 1 ? 0.7 : 0.2;
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.1 + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0 + i * 0.1);
      osc.stop(t0 + i * 0.1 + dur);
    });
  },

  // Jingle di sconfitta / errore simpatico
  playSconfitta() {
    if (!this.attivo || !this.ctx) return;
    const note = [349.23, 329.63, 311.13, 293.66]; // F4, E4, Eb4, D4
    const t0 = this.ctx.currentTime;
    note.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t0 + i * 0.12);
      gain.gain.setValueAtTime(0.08, t0 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0 + i * 0.12);
      osc.stop(t0 + i * 0.12 + 0.25);
    });
  },

  // Suono sblocco Trofeo / Obiettivo
  playAchievement() {
    if (!this.attivo || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const accordo = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // Mi maggiore scintillante
    accordo.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0 + i * 0.08);
      gain.gain.setValueAtTime(0.09, t0 + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0 + i * 0.08);
      osc.stop(t0 + i * 0.08 + 0.6);
    });
  },
  
  // Suoni tematici per i giochi
  playTypewriter() { 
    this._suona(400, 'square', 0.03, 0.05); 
    this._suona(600, 'triangle', 0.03, 0.05); 
  },
  playTicTac() { 
    this._suona(800, 'square', 0.02, 0.02); 
  },
  playPew() {
    if (!this.attivo || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.2);
  }
};

const Vibrazione = {
  click() { if (navigator.vibrate) navigator.vibrate(15); },
  successo() { if (navigator.vibrate) navigator.vibrate([30, 20, 30, 20, 80]); },
  errore() { if (navigator.vibrate) navigator.vibrate([50, 30, 50]); },
  tick() { if (navigator.vibrate) navigator.vibrate(25); }
};

// --- Sintetizzatore procedurale Party/Lo-Fi (Fallback offline/online 100% garantito) ---
const PartySynth = {
  timer: null,
  step: 0,
  attivo: false,
  accordi: [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66]  // G
  ],
  bassi: [130.81, 110.00, 87.31, 98.00],

  start() {
    Suoni.inizializza();
    if (!Suoni.ctx) return;
    this.attivo = true;
    this.step = 0;
    this._loop();
  },

  _loop() {
    if (!this.attivo || !Suoni.ctx) return;
    if (Suoni.ctx.state === 'suspended') Suoni.ctx.resume();
    
    const accordoIdx = Math.floor(this.step / 4) % this.accordi.length;
    const beat = this.step % 4;
    const now = Suoni.ctx.currentTime;

    // Suona accordo soft
    if (beat === 0 || beat === 2) {
      const freq = this.accordi[accordoIdx];
      freq.forEach(f => {
        const osc = Suoni.ctx.createOscillator();
        const gain = Suoni.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(Suoni.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      });
    }

    // Basso morbido
    if (beat === 0 || beat === 3) {
      const bFreq = this.bassi[accordoIdx];
      const osc = Suoni.ctx.createOscillator();
      const gain = Suoni.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(bFreq, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(Suoni.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }

    // Hi-hat ritmico leggero
    const hat = Suoni.ctx.createOscillator();
    const hatGain = Suoni.ctx.createGain();
    hat.type = 'square';
    hat.frequency.setValueAtTime(2500 + Math.random() * 500, now);
    hatGain.gain.setValueAtTime(0.006, now);
    hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    hat.connect(hatGain);
    hatGain.connect(Suoni.ctx.destination);
    hat.start(now);
    hat.stop(now + 0.04);

    this.step++;
    this.timer = setTimeout(() => this._loop(), 450); // ~133 bpm tempo
  },

  stop() {
    this.attivo = false;
    clearTimeout(this.timer);
    this.timer = null;
  }
};

// --- Gestione Musica di Sottofondo (Audio MP3 con fallback Synth procedurale) ---
const musicaSottofondo = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smooth-jazz-114881.mp3");
musicaSottofondo.loop = true;
musicaSottofondo.volume = 0.22;
let musicaAttiva = false;
let usaSynthFallback = false;

musicaSottofondo.addEventListener('error', () => {
  console.log("Audio MP3 esterno non accessibile, attivo Synth Web Audio fallback.");
  usaSynthFallback = true;
});

function toggleMusica() {
  Suoni.inizializza();
  const btn = document.getElementById("btn-music");
  if (musicaAttiva) {
    musicaSottofondo.pause();
    PartySynth.stop();
    musicaAttiva = false;
    if (btn) btn.textContent = "🔇";
  } else {
    musicaAttiva = true;
    if (btn) btn.textContent = "🎷";

    if (!usaSynthFallback) {
      const p = musicaSottofondo.play();
      if (p !== undefined) {
        p.catch(() => {
          console.warn("Autoplay audio bloccato o rete assente: avvio synth procedurale.");
          usaSynthFallback = true;
          PartySynth.start();
        });
      }
    } else {
      PartySynth.start();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-music");
  if (btn) btn.addEventListener("click", toggleMusica);
});

// Attiva l'audio al primo tocco
document.addEventListener('click', () => { Suoni.inizializza(); }, { once: true });
