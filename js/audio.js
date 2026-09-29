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
  playTick() { this._suona(1000, 'square', 0.05, 0.02); },
  
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
  click() { if (navigator.vibrate) navigator.vibrate(20); },
  successo() { if (navigator.vibrate) navigator.vibrate([50, 50, 50]); },
  errore() { if (navigator.vibrate) navigator.vibrate([100, 50, 100]); }
};

// --- Musica di sottofondo ---
// Inserisci qui il link al tuo file MP3 o il percorso (es: 'audio/jazz.mp3')
const musicaSottofondo = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smooth-jazz-114881.mp3");
musicaSottofondo.loop = true;
musicaSottofondo.volume = 0.25; // Volume basso, ideale per sottofondo da pub
let musicaAttiva = false;

function toggleMusica() {
  const btn = document.getElementById("btn-music");
  if (musicaAttiva) {
    musicaSottofondo.pause();
    musicaAttiva = false;
    if (btn) btn.textContent = "🔇";
  } else {
    musicaSottofondo.play().catch(() => console.warn("Autoplay bloccato dal browser"));
    musicaAttiva = true;
    if (btn) btn.textContent = "🎷";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-music");
  if (btn) btn.addEventListener("click", toggleMusica);
});

// Attiva l'audio al primo tocco
document.addEventListener('click', () => { Suoni.inizializza(); }, { once: true });
