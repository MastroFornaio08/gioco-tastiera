/* Effetti visivi che non c'entrano con le regole dei giochi.

   Coriandoli: una pioggia di rettangoli colorati disegnata su un canvas a
   tutto schermo. Niente librerie: una manciata di particelle con gravità,
   attrito e rotazione, ridisegnate a ogni fotogramma finché non escono.
   Il canvas resta trasparente ai clic, quindi non intralcia il gioco. */

const Coriandoli = {
  canvas: null,
  ctx: null,
  pezzi: [],
  anim: null,

  _prepara() {
    if (this.canvas) return;
    this.canvas = document.getElementById("coriandoli");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this._ridimensiona();
    window.addEventListener("resize", () => this._ridimensiona());
  },

  _ridimensiona() {
    const d = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * d;
    this.canvas.height = window.innerHeight * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  },

  lancia(quanti = 55, colori) {
    this._prepara();
    if (!this.ctx) return;

    // chi ha impostato "meno animazioni" nel sistema operativo non le vuole
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tavolozza = colori && colori.length ? colori
      : ["#ff3b6b", "#2dd4ff", "#ffd23b", "#5cff8f", "#c46bff", "#ff9a3b"];
    const larghezza = window.innerWidth;

    for (let i = 0; i < quanti; i++) {
      this.pezzi.push({
        x: larghezza * (0.2 + Math.random() * 0.6),
        y: -20 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        l: 6 + Math.random() * 7,
        h: 9 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.35,
        colore: tavolozza[i % tavolozza.length]
      });
    }
    if (!this.anim) this._passo();
  },

  _passo() {
    const c = this.ctx;
    const alt = window.innerHeight;
    c.clearRect(0, 0, window.innerWidth, alt);

    this.pezzi = this.pezzi.filter(p => {
      p.vy += 0.16;            // gravità
      p.vx *= 0.995;           // attrito dell'aria
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;

      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.colore;
      c.fillRect(-p.l / 2, -p.h / 2, p.l, p.h);
      c.restore();

      return p.y < alt + 40;
    });

    if (this.pezzi.length) {
      this.anim = requestAnimationFrame(() => this._passo());
    } else {
      cancelAnimationFrame(this.anim);
      this.anim = null;
      c.clearRect(0, 0, window.innerWidth, alt);
    }
  }
};

function coriandoli(quanti, colori) { Coriandoli.lancia(quanti, colori); }

/* Fa salire un numero fino al valore finale, invece di farlo apparire secco.
   Usato per i punteggi: rende evidente quanto si è guadagnato. */
function conteggio(el, da, a, durata = 700) {
  if (!el) return;
  const t0 = performance.now();
  const passo = (ora) => {
    const k = Math.min((ora - t0) / durata, 1);
    const morbido = 1 - Math.pow(1 - k, 3);        // rallenta verso la fine
    el.textContent = Math.round(da + (a - da) * morbido);
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
