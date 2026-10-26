/* ==========================================================================
   Zaltergames — Motore di Effetti Particellari Neo-Arcade
   ==========================================================================
   Sistema particellare ad alte prestazioni su canvas fullscreen trasparente:
   - Coriandoli 3D svolazzanti (rettangoli con rotazione 3D, stelle, cerchi, nastri)
   - Cannoni laterali da festa (Party Cannons) con getto parabolico ad arco
   - Fuochi d'artificio Neo-Arcade con razzo, scia luminosa e scoppio a raggiera neon
   - Scintille (Sparks) e onde d'urto (Shockwaves) per feedback al tocco e traguardi
   - Presets dedicati: vittoria round, vittoria finale torneo, sblocco trofei
   - Micro-interazione arcade automatica sui bottoni interattivi
   - Zero garbage collection spike, 60-120 FPS fluidi
   - Rispetta le preferenze di sistema prefers-reduced-motion
   ========================================================================== */

(function () {
  'use strict';

  // Palette Neon di default (Ciano, Fucsia, Giallo, Verde, Viola, Arancio, Oro, Bianco)
  const TAVOLOZZA_NEON = [
    '#00f0ff', // Cyber Cyan
    '#ff0055', // Neon Magenta
    '#ffe600', // Electric Yellow
    '#00ff66', // Matrix Green
    '#b026ff', // Ultra Violet
    '#ff7a00', // Plasma Orange
    '#ffd700', // Royal Gold
    '#ffffff'  // Pure White
  ];

  const PI2 = Math.PI * 2;
  const RIDOTTO = () => typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class ParticleEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particelle = [];
      this.animId = null;
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
      this._ready = false;
      this._spettacoloTimer = null;
      const pochiCore = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      const pocaMemoria = typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4;
      const schermoPiccolo = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
      this.qualitaAutomatica = (pochiCore || pocaMemoria || schermoPiccolo) ? 0.55 : 1;
      try { this.modalita = localStorage.getItem('zg-effetti') || 'auto'; } catch (e) { this.modalita = 'auto'; }
      this._applicaModalita();
    }

    _init() {
      if (this._ready) return true;
      if (typeof document === 'undefined') return false;

      this.canvas = document.getElementById('coriandoli');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'coriandoli';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60;';
        document.body.appendChild(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
      this._ridimensiona();
      window.addEventListener('resize', () => this._ridimensiona());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this._ferma();
      });
      this._agganciaClickInterattivi();
      this._ready = true;
      return true;
    }

    _ridimensiona() {
      if (!this.canvas || !this.ctx) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, this.qualita < 1 ? 1 : 1.5);
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    _avviaLoop() {
      if (!this.animId) {
        this.animId = requestAnimationFrame(() => this._render());
      }
    }

    _coloreCasuale(colori) {
      const palette = (colori && colori.length) ? colori : TAVOLOZZA_NEON;
      return palette[Math.floor(Math.random() * palette.length)];
    }

    _ferma() {
      if (this._spettacoloTimer) clearInterval(this._spettacoloTimer);
      this._spettacoloTimer = null;
      if (this.animId) cancelAnimationFrame(this.animId);
      this.animId = null;
      this.particelle.length = 0;
      if (this.ctx) this.ctx.clearRect(0, 0, this.w, this.h);
    }

    _quantita(valore, minimo = 4) {
      return Math.max(minimo, Math.round(valore * this.qualita));
    }

    _applicaModalita() {
      this.qualita = this.modalita === 'completi' ? 1 : this.modalita === 'ridotti' ? 0.45 : this.qualitaAutomatica;
      this.limiteParticelle = this.qualita < 1 ? 130 : 280;
    }

    impostaModalita(modalita) {
      if (!['auto', 'completi', 'ridotti', 'disattivati'].includes(modalita)) modalita = 'auto';
      this.modalita = modalita;
      try { localStorage.setItem('zg-effetti', modalita); } catch (e) {}
      this._applicaModalita();
      if (modalita === 'disattivati') this._ferma();
    }

    /* ------------------------------------------------------------------ API: Coriandoli */
    coriandoli(quanti = 65, opzioni = {}) {
      if (this.modalita === 'disattivati' || RIDOTTO() || !this._init()) return;
      quanti = this._quantita(quanti);
      const colori = opzioni.colori || null;
      const w = this.w;

      for (let i = 0; i < quanti; i++) {
        if (this.particelle.length >= this.limiteParticelle) break;
        const forma = Math.random() < 0.4 ? 'rect' : (Math.random() < 0.7 ? 'star' : 'circle');
        this.particelle.push({
          tipo: 'confetti',
          forma: forma,
          x: w * (0.15 + Math.random() * 0.7),
          y: -20 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 4.5,
          dim: 7 + Math.random() * 8,
          spessore: 4 + Math.random() * 6,
          rotX: Math.random() * PI2,
          rotY: Math.random() * PI2,
          rotZ: Math.random() * PI2,
          vRotX: (Math.random() - 0.5) * 0.25,
          vRotY: (Math.random() - 0.5) * 0.2,
          vRotZ: (Math.random() - 0.5) * 0.15,
          wobble: Math.random() * PI2,
          vWobble: 0.05 + Math.random() * 0.08,
          wobbleAmp: 1.5 + Math.random() * 2.5,
          colore: this._coloreCasuale(colori),
          alpha: 1,
          decay: 0.0015 + Math.random() * 0.003
        });
      }
      this._avviaLoop();
    }

    /* ------------------------------------------------------------------ API: Cannoni Laterali */
    cannoni(quantiPerCannone = 45, colori) {
      if (this.modalita === 'disattivati' || RIDOTTO() || !this._init()) return;
      quantiPerCannone = this._quantita(quantiPerCannone);
      const w = this.w;
      const h = this.h;

      // Cannone di sinistra (spara verso l'alto a destra, 55°-75°)
      for (let i = 0; i < quantiPerCannone; i++) {
        if (this.particelle.length >= this.limiteParticelle) break;
        const angolo = (Math.PI / 180) * (50 + Math.random() * 30);
        const velocita = 14 + Math.random() * 14;
        this.particelle.push(this._creaParticellaCannone(
          -10, h * 0.85 + Math.random() * 30,
          Math.cos(angolo) * velocita,
          -Math.sin(angolo) * velocita,
          this._coloreCasuale(colori)
        ));
      }

      // Cannone di destra (spara verso l'alto a sinistra, 105°-125°)
      for (let i = 0; i < quantiPerCannone; i++) {
        if (this.particelle.length >= this.limiteParticelle) break;
        const angolo = (Math.PI / 180) * (100 + Math.random() * 30);
        const velocita = 14 + Math.random() * 14;
        this.particelle.push(this._creaParticellaCannone(
          w + 10, h * 0.85 + Math.random() * 30,
          Math.cos(angolo) * velocita,
          -Math.sin(angolo) * velocita,
          this._coloreCasuale(colori)
        ));
      }

      // Onde d'urto all'innesco dei cannoni
      this.onda(20, h * 0.85, '#00f0ff', 90);
      this.onda(w - 20, h * 0.85, '#ff0055', 90);

      this._avviaLoop();
    }

    _creaParticellaCannone(x, y, vx, vy, colore) {
      const forma = Math.random() < 0.45 ? 'rect' : (Math.random() < 0.75 ? 'ribbon' : 'star');
      return {
        tipo: 'confetti',
        forma: forma,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        dim: 7 + Math.random() * 9,
        spessore: 4 + Math.random() * 5,
        rotX: Math.random() * PI2,
        rotY: Math.random() * PI2,
        rotZ: Math.random() * PI2,
        vRotX: (Math.random() - 0.5) * 0.3,
        vRotY: (Math.random() - 0.5) * 0.25,
        vRotZ: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * PI2,
        vWobble: 0.08 + Math.random() * 0.06,
        wobbleAmp: 2 + Math.random() * 3,
        colore: colore,
        alpha: 1,
        decay: 0.0015 + Math.random() * 0.002
      };
    }

    /* ------------------------------------------------------------------ API: Fuochi d'Artificio */
    fuoco(x, y, opzioni = {}) {
      if (this.modalita === 'disattivati' || RIDOTTO() || !this._init()) return;
      const targetX = x !== undefined ? x : this.w * (0.2 + Math.random() * 0.6);
      const targetY = y !== undefined ? y : this.h * (0.18 + Math.random() * 0.35);
      const colore = opzioni.colore || this._coloreCasuale(opzioni.colori);

      if (opzioni.immediato) {
        this._esplosioneFuoco(targetX, targetY, colore, opzioni);
      } else {
        // Razzo che sale
        const startX = targetX + (Math.random() - 0.5) * 40;
        const startY = this.h + 10;
        const dy = targetY - startY;
        const durataTick = 28 + Math.floor(Math.random() * 10);
        const vy = dy / durataTick;
        const vx = (targetX - startX) / durataTick;

        this.particelle.push({
          tipo: 'rocket',
          x: startX,
          y: startY,
          vx: vx,
          vy: vy,
          targetY: targetY,
          colore: colore,
          alpha: 1,
          sciaContatore: 0,
          opzioniEsplosione: opzioni
        });
      }

      this._avviaLoop();
    }

    _esplosioneFuoco(x, y, coloreBase, opzioni = {}) {
      const quanti = this._quantita(opzioni.quanti || (45 + Math.floor(Math.random() * 25)), 12);
      const raggioOnda = opzioni.raggioOnda || 85;

      // Onda d'urto neon centrale
      this.onda(x, y, coloreBase, raggioOnda);

      // Scintille a raggiera sferica/anulare
      for (let i = 0; i < quanti; i++) {
        if (this.particelle.length >= this.limiteParticelle) break;
        const angolo = Math.random() * PI2;
        const vel = 3 + Math.random() * 8.5;
        const colore = Math.random() < 0.25 ? '#ffffff' : (Math.random() < 0.2 ? '#ffd700' : coloreBase);
        this.particelle.push({
          tipo: 'spark',
          x: x,
          y: y,
          vx: Math.cos(angolo) * vel,
          vy: Math.sin(angolo) * vel,
          raggio: 2 + Math.random() * 2.2,
          colore: colore,
          alpha: 1,
          decay: 0.016 + Math.random() * 0.018,
          gravity: 0.08 + Math.random() * 0.06,
          drag: 0.94 + Math.random() * 0.03,
          flicker: Math.random() < 0.6,
          glow: this.qualita === 1,
          coda: this.qualita === 1 ? [] : null
        });
      }
    }

    /* ------------------------------------------------------------------ API: Spettacolo Fuochi Continuo */
    spettacoloFuochi(durataMs = 3500, intervalloMs = 380) {
      if (this.modalita === 'disattivati' || RIDOTTO()) return;
      if (this._spettacoloTimer) clearInterval(this._spettacoloTimer);

      const inizio = Date.now();
      this.cannoni(40);
      this.fuoco();

      if (this.qualita < 1) {
        durataMs = Math.min(durataMs, 2400);
        intervalloMs = Math.max(intervalloMs, 600);
      }
      this._spettacoloTimer = setInterval(() => {
        if (Date.now() - inizio >= durataMs) {
          clearInterval(this._spettacoloTimer);
          this._spettacoloTimer = null;
          return;
        }
        this.fuoco();
        if (Math.random() < 0.45) {
          setTimeout(() => this.fuoco(), 120);
        }
      }, intervalloMs);
    }

    /* ------------------------------------------------------------------ API: Scintille (Sparks al tocco) */
    scintille(x, y, colore, quanti = 14) {
      if (this.modalita === 'disattivati' || RIDOTTO() || !this._init()) return;
      quanti = this._quantita(quanti);
      const c = colore || this._coloreCasuale();

      for (let i = 0; i < quanti; i++) {
        if (this.particelle.length >= this.limiteParticelle) break;
        const angolo = Math.random() * PI2;
        const vel = 2 + Math.random() * 6.5;
        this.particelle.push({
          tipo: 'spark',
          x: x,
          y: y,
          vx: Math.cos(angolo) * vel,
          vy: Math.sin(angolo) * vel,
          raggio: 1.8 + Math.random() * 1.8,
          colore: Math.random() < 0.3 ? '#ffffff' : c,
          alpha: 1,
          decay: 0.03 + Math.random() * 0.035,
          gravity: 0.12,
          drag: 0.92,
          flicker: true,
          glow: this.qualita === 1,
          coda: this.qualita === 1 ? [] : null
        });
      }
      this._avviaLoop();
    }

    /* ------------------------------------------------------------------ API: Onda d'Urto (Shockwave) */
    onda(x, y, colore = '#00f0ff', raggioMax = 80) {
      if (this.modalita === 'disattivati' || RIDOTTO() || !this._init()) return;
      this.particelle.push({
        tipo: 'shockwave',
        x: x,
        y: y,
        r: 6,
        rMax: raggioMax,
        vr: 5 + Math.random() * 4,
        colore: colore,
        alpha: 0.9,
        spessore: 3.5
      });
      this._avviaLoop();
    }

    /* ------------------------------------------------------------------ API: Preset Vittoria */
    vittoria(tipo = 'round') {
      if (this.modalita === 'disattivati' || RIDOTTO()) return;
      if (tipo === 'partita' || tipo === 'torneo') {
        // Gran finale: cannoni a raffica + spettacolo di fuochi d'artificio
        this.cannoni(60);
        this.spettacoloFuochi(4000, 320);
      } else if (tipo === 'trofeo') {
        // Sblocco achievement: onde dorate + scintille intense
        const cx = this.w * 0.5;
        const cy = Math.min(180, this.h * 0.25);
        this.onda(cx, cy, '#ffd700', 140);
        this.scintille(cx, cy, '#ffd700', 36);
        this.coriandoli(35, ['#ffd700', '#ffffff', '#ff9a3b', '#ffe600']);
      } else {
        // Round normale: cannoni laterali + 2 fuochi festosi
        this.cannoni(45);
        setTimeout(() => this.fuoco(this.w * 0.3, this.h * 0.25), 200);
        setTimeout(() => this.fuoco(this.w * 0.7, this.h * 0.28), 450);
      }
    }

    /* ------------------------------------------------------------------ Micro-Interazioni sui Click */
    _agganciaClickInterattivi() {
      if (typeof document === 'undefined') return;

      document.addEventListener('pointerdown', (e) => {
        if (!e.isTrusted) return;
        const target = e.target;
        if (!target) return;

        // Se clicchiamo su un pulsante o elemento interattivo
        const btn = target.closest('.btn, .avatar-btn, .records-tab-btn, [data-click-sparks]');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const cx = e.clientX || (rect.left + rect.width / 2);
          const cy = e.clientY || (rect.top + rect.height / 2);
          this.scintille(cx, cy, null, 10);
        }
      }, { passive: true });
    }

    /* ------------------------------------------------------------------ Render Loop */
    _render() {
      const ctx = this.ctx;
      if (!ctx) return;

      ctx.clearRect(0, 0, this.w, this.h);

      if (this.particelle.length === 0) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
        return;
      }

      const h = this.h;
      const w = this.w;
      const rimaste = [];

      for (let i = 0; i < this.particelle.length; i++) {
        const p = this.particelle[i];

        // 1. Confetti 3D / Nastri / Stelle
        if (p.tipo === 'confetti') {
          p.vy += 0.16; // gravità
          p.vx *= 0.99; // attrito aria
          p.wobble += p.vWobble;
          p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp;
          p.y += p.vy;

          p.rotX += p.vRotX;
          p.rotY += p.vRotY;
          p.rotZ += p.vRotZ;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.y > h + 50) continue;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotZ);
          // Effetto prospettico 3D tramite scaleX / scaleY
          const scaleX = Math.cos(p.rotX);
          const scaleY = Math.sin(p.rotY);
          ctx.scale(scaleX, scaleY);
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fillStyle = p.colore;

          if (p.forma === 'star') {
            this._disegnaStella(ctx, 0, 0, p.dim * 0.7);
          } else if (p.forma === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.dim * 0.45, 0, PI2);
            ctx.fill();
          } else if (p.forma === 'ribbon') {
            ctx.fillRect(-p.dim * 0.8, -p.spessore * 0.3, p.dim * 1.6, p.spessore * 0.6);
          } else {
            ctx.fillRect(-p.dim / 2, -p.spessore / 2, p.dim, p.spessore);
          }
          ctx.restore();
          rimaste.push(p);

        // 2. Razzo Fuoco d'Artificio
        } else if (p.tipo === 'rocket') {
          p.x += p.vx;
          p.y += p.vy;
          p.sciaContatore++;

          // Rilascia scintille di scia ogni 2 tick
          if (p.sciaContatore % (this.qualita < 1 ? 4 : 2) === 0 && rimaste.length < this.limiteParticelle) {
            rimaste.push({
              tipo: 'spark',
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 0.8 + Math.random() * 1.2,
              raggio: 1.2,
              colore: '#ffd700',
              alpha: 0.8,
              decay: 0.05,
              gravity: 0.04,
              drag: 0.95,
              flicker: false,
              glow: this.qualita === 1,
              coda: this.qualita === 1 ? [] : null
            });
          }

          // Disegna il razzo luminoso
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, PI2);
          ctx.fillStyle = p.colore;
          ctx.shadowColor = p.colore;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();

          // Raggiunto l'apice? Esplosione!
          if (p.y <= p.targetY || p.vy >= 0) {
            this._esplosioneFuoco(p.x, p.y, p.colore, p.opzioniEsplosione);
          } else {
            rimaste.push(p);
          }

        // 3. Scintille ad Alta Luminosità (Sparks)
        } else if (p.tipo === 'spark') {
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.y > h + 20) continue;

          // Memorizza breve cronologia per la scia
          if (p.coda) {
            p.coda.push({ x: p.x, y: p.y });
            if (p.coda.length > 3) p.coda.shift();
          }

          ctx.save();
          if (p.glow) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowColor = p.colore;
            ctx.shadowBlur = 6;
          }

          const currentAlpha = p.flicker
            ? Math.max(0, p.alpha * (0.6 + Math.random() * 0.4))
            : Math.max(0, p.alpha);

          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = p.colore;
          ctx.strokeStyle = p.colore;

          // Disegna scia
          if (p.coda && p.coda.length > 1) {
            ctx.lineWidth = p.raggio * 0.8;
            ctx.beginPath();
            ctx.moveTo(p.coda[0].x, p.coda[0].y);
            for (let cIdx = 1; cIdx < p.coda.length; cIdx++) {
              ctx.lineTo(p.coda[cIdx].x, p.coda[cIdx].y);
            }
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.raggio * p.alpha), 0, PI2);
          ctx.fill();
          ctx.restore();
          rimaste.push(p);

        // 4. Onda d'urto (Shockwave)
        } else if (p.tipo === 'shockwave') {
          p.r += p.vr;
          p.alpha = Math.max(0, 1 - (p.r / p.rMax));

          if (p.r >= p.rMax || p.alpha <= 0) continue;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.colore;
          ctx.lineWidth = Math.max(1, p.spessore * p.alpha);
          ctx.shadowColor = p.colore;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, PI2);
          ctx.stroke();
          ctx.restore();
          rimaste.push(p);
        }
      }

      this.particelle = rimaste;
      this.animId = requestAnimationFrame(() => this._render());
    }

    _disegnaStella(ctx, cx, cy, raggio) {
      const punte = 4;
      const rInt = raggio * 0.35;
      ctx.beginPath();
      for (let i = 0; i < punte * 2; i++) {
        const r = (i % 2 === 0) ? raggio : rInt;
        const a = (i * Math.PI) / punte;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Istanza Singleton globale
  const istanza = new ParticleEngine();

  // Oggetto pubblico Effetti
  const Effetti = {
    coriandoli(quanti, opzioni) { istanza.coriandoli(quanti, opzioni); },
    cannoni(quanti, colori) { istanza.cannoni(quanti, colori); },
    fuoco(x, y, opzioni) { istanza.fuoco(x, y, opzioni); },
    spettacoloFuochi(durata, intervallo) { istanza.spettacoloFuochi(durata, intervallo); },
    scintille(x, y, colore, quanti) { istanza.scintille(x, y, colore, quanti); },
    onda(x, y, colore, raggioMax) { istanza.onda(x, y, colore, raggioMax); },
    vittoria(tipo) { istanza.vittoria(tipo); },
    impostaModalita(modalita) { istanza.impostaModalita(modalita); },
    get modalita() { return istanza.modalita; }
  };

  // Funzione coriandoli globale per retrocompatibilità 100%
  function coriandoli(quanti, colori) {
    istanza.coriandoli(quanti, { colori });
  }

  /* Fa salire un numero fino al valore finale con interpolazione cubica morbida */
  function conteggio(el, da, a, durata = 700) {
    if (!el) return;
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const passo = (ora) => {
      const k = Math.min((ora - t0) / durata, 1);
      const morbido = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(da + (a - da) * morbido);
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // Esportazione nell'ambiente globale (Browser / Window / GlobalThis)
  if (typeof window !== 'undefined') {
    window.Effetti = Effetti;
    window.Coriandoli = { lancia: (q, c) => coriandoli(q, c) };
    window.coriandoli = coriandoli;
    window.conteggio = conteggio;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.Effetti = Effetti;
    globalThis.coriandoli = coriandoli;
    globalThis.conteggio = conteggio;
  }
})();