/* ==========================================================================
   Zaltergames — Sistema Malus & Vendetta dell'Ultimo (Chaos Modifiers)
   ==========================================================================
   Meccanica di recupero e party chaos:
   - Se perdi o arrivi ultimo nel round, ricevi la "Vendetta dell'Ultimo"
   - Puoi scegliere 1 tra 3 Malus casuali:
     * Usarlo subito nel round successivo per tutti i giocatori!
     * Conservarlo nel tuo inventario (fino a max 2 malus accumulati)
   - Chi ha malus conservati può scagliarli prima di qualsiasi round futuro!
   ========================================================================== */

(function () {
  'use strict';

  const MAX_MALUS_ACCUMULABILI = 2;

  const CATALOGO_MALUS = [
    {
      id: 'nebbia',
      nome: 'Nebbia Fitta',
      icona: '🌫️',
      tag: 'VISUALE OSCURATA',
      desc: 'Un denso banco di nebbia copre l’arena: passa il cursore o il dito per farti strada!',
      colore: '#a78bfa',
      attiva(arena) {
        arena.classList.add('malus-nebbia-attiva');
        const canvas = document.createElement('canvas');
        canvas.className = 'malus-nebbia-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        arena.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let w = (canvas.width = arena.clientWidth || 360);
        let h = (canvas.height = arena.clientHeight || 400);

        // Disegna nebbia iniziale
        ctx.fillStyle = 'rgba(13, 14, 21, 0.94)';
        ctx.fillRect(0, 0, w, h);

        const pulisciPunto = (clientX, clientY) => {
          const rect = canvas.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          const rad = ctx.createRadialGradient(x, y, 10, x, y, 65);
          rad.addColorStop(0, 'rgba(0,0,0,1)');
          rad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(x, y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        const onPointer = (e) => pulisciPunto(e.clientX, e.clientY);
        arena.addEventListener('pointermove', onPointer, { passive: true });
        arena.addEventListener('pointerdown', onPointer, { passive: true });

        // Timer lento che fa richiudere leggermente la nebbia
        const interval = setInterval(() => {
          if (!canvas.parentNode) {
            clearInterval(interval);
            return;
          }
          ctx.fillStyle = 'rgba(13, 14, 21, 0.035)';
          ctx.fillRect(0, 0, w, h);
        }, 120);

        return () => {
          clearInterval(interval);
          arena.removeEventListener('pointermove', onPointer);
          arena.removeEventListener('pointerdown', onPointer);
          arena.classList.remove('malus-nebbia-attiva');
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
      }
    },
    {
      id: 'sottosopra',
      nome: 'Sottosopra',
      icona: '🙃',
      tag: 'PROSPETTIVA INVERTITA',
      desc: 'L’arena è capovolta a 180°: gioca a testa in giù!',
      colore: '#ff0055',
      attiva(arena) {
        arena.classList.add('malus-sottosopra');
        return () => arena.classList.remove('malus-sottosopra');
      }
    },
    {
      id: 'panic',
      nome: 'Panic Mode',
      icona: '⚡',
      tag: 'TEMPO ACCELERATO',
      desc: 'Bordo d’emergenza stroboscopico e battito cardiaco al cardiopalma!',
      colore: '#ffe600',
      attiva(arena) {
        arena.classList.add('malus-panic');
        const timerEl = document.getElementById('hud-timer');
        if (timerEl) timerEl.classList.add('panic-timer');
        return () => {
          arena.classList.remove('malus-panic');
          if (timerEl) timerEl.classList.remove('panic-timer');
        };
      }
    },
    {
      id: 'glitch',
      nome: 'Cyber Glitch',
      icona: '🔲',
      tag: 'DISTURBO OLOGRAFICO',
      desc: 'Linee di scansione glitch e scosse arcade che disturbano la visuale!',
      colore: '#00f0ff',
      attiva(arena) {
        arena.classList.add('malus-glitch');
        return () => arena.classList.remove('malus-glitch');
      }
    },
    {
      id: 'congelamento',
      nome: 'Blocco di Ghiaccio',
      icona: '🥶',
      tag: 'FREEZE STUN',
      desc: 'L’arena è congelata: fai 4 tap/click rapidi per rompere il ghiaccio e sbloccarla!',
      colore: '#38bdf8',
      attiva(arena) {
        arena.classList.add('malus-congelamento-wrap');
        const overlay = document.createElement('div');
        overlay.className = 'malus-freeze-overlay';
        overlay.innerHTML = `
          <div class="freeze-icon">🧊</div>
          <div class="freeze-title">CONGELAMENTO!</div>
          <div class="freeze-sub">Tocca <b><span id="freeze-colpi">4</span></b> volte per rompere il ghiaccio!</div>
          <div class="freeze-hint">CLICCA VELOCE! 💥</div>
        `;
        arena.appendChild(overlay);

        let colpi = 4;
        const rompiGhiaccio = (e) => {
          e.stopPropagation();
          e.preventDefault();
          colpi--;
          const cnt = overlay.querySelector('#freeze-colpi');
          if (cnt) cnt.textContent = colpi;

          if (window.Suoni && Suoni.playTick) Suoni.playTick();
          if (window.Effetti && Effetti.scintille) {
            Effetti.scintille(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, '#38bdf8', 12);
          }

          overlay.classList.remove('freeze-hit');
          void overlay.offsetWidth;
          overlay.classList.add('freeze-hit');

          if (colpi <= 0) {
            if (window.Suoni && Suoni.playDing) Suoni.playDing();
            if (window.Effetti && Effetti.onda) {
              Effetti.onda(window.innerWidth / 2, window.innerHeight / 2, '#38bdf8', 120);
            }
            overlay.classList.add('freeze-shattered');
            setTimeout(() => {
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 250);
          }
        };

        overlay.addEventListener('pointerdown', rompiGhiaccio);

        return () => {
          arena.classList.remove('malus-congelamento-wrap');
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };
      }
    },
    {
      id: 'cieco',
      nome: 'Alla Cieca',
      icona: '🙈',
      tag: 'BLACKOUT LAMPO',
      desc: 'Lo schermo si oscura a intervalli regolari: devi andare a memoria!',
      colore: '#f43f5e',
      attiva(arena) {
        arena.classList.add('malus-cieco');
        return () => arena.classList.remove('malus-cieco');
      }
    }
  ];

  let _puliziaMalusCorrente = null;

  const Malus = {
    MAX_ACCUMULABILI: MAX_MALUS_ACCUMULABILI,
    catalogo: CATALOGO_MALUS,

    trova(id) {
      return CATALOGO_MALUS.find(m => m.id === id) || null;
    },

    pescaCasuali(n = 3) {
      const mescolati = CATALOGO_MALUS.slice().sort(() => Math.random() - 0.5);
      return mescolati.slice(0, n);
    },

    /* ------------------------------------------------------------------ Gestione Inventario */
    ottieniInventario() {
      if (!window.S) return [];
      if (!Array.isArray(window.S.mieiMalus)) window.S.mieiMalus = [];
      return window.S.mieiMalus;
    },

    aggiungiAInventario(malusId) {
      const inv = this.ottieniInventario();
      if (inv.length >= MAX_MALUS_ACCUMULABILI) return false;
      const m = this.trova(malusId);
      if (!m) return false;
      inv.push(m);
      return true;
    },

    rimuoviDaInventario(malusId) {
      const inv = this.ottieniInventario();
      const idx = inv.findIndex(m => m.id === malusId);
      if (idx !== -1) {
        inv.splice(idx, 1);
        return true;
      }
      return false;
    },

    /* ------------------------------------------------------------------ Attivazione Malus */
    prenotaMalus(malusId, daChiId, daChiNome) {
      const m = this.trova(malusId);
      if (!m) return;

      const payload = {
        da: daChiId,
        nome: daChiNome,
        malus: {
          id: m.id,
          nome: m.nome,
          icona: m.icona,
          tag: m.tag,
          desc: m.desc,
          colore: m.colore
        }
      };

      if (window.S) window.S.malusInCoda = payload;

      // Invia via rete a tutti
      if (window.Rete && typeof window.Rete.invia === 'function') {
        window.Rete.invia('malus_prenotato', payload);
      }

      // Feedback sonoro e visivo
      if (window.Suoni && Suoni.playMalus) Suoni.playMalus();
      this.mostraBannerPrenotato(payload);
    },

    mostraBannerPrenotato(payload) {
      const banner = document.getElementById('malus-banner-prenotato');
      if (!banner) return;

      const m = payload.malus;
      const eMio = window.S && window.S.io === payload.da;
      const mittente = eMio ? 'Tu' : (payload.nome || 'Un avversario');

      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="malus-alert-box">
          <span class="malus-alert-pulse">🚨</span>
          <div class="malus-alert-text">
            <b>${mittente}</b> ha scagliato il Malus: 
            <span class="malus-pill" style="border-color:${m.colore}; color:${m.colore}">
              ${m.icona} ${m.nome}
            </span> 
            per il prossimo round!
          </div>
        </div>
      `;
    },

    /* ------------------------------------------------------------------ UI Fine Round */
    gestisciFineRound(tabella) {
      const container = document.getElementById('malus-container');
      const banner = document.getElementById('malus-banner-prenotato');
      if (banner) banner.style.display = 'none';
      if (!container) return;

      // Se è l'ultimo round della partita o torneo finito, niente malus
      if (window.S && window.S.round >= (window.MAX_ROUND || 3) - 1) {
        container.style.display = 'none';
        return;
      }

      const inv = this.ottieniInventario();
      const miaPos = tabella.findIndex(r => r.id === window.S?.io);
      const isSolo = window.S?.ruolo === 'solo';
      const isUltimo = (miaPos !== -1 && miaPos === tabella.length - 1 && tabella.length > 1) || isSolo;

      // Se c'è già un malus prenotato per il prossimo round, mostralo
      if (window.S && window.S.malusInCoda) {
        this.mostraBannerPrenotato(window.S.malusInCoda);
      }

      if (isUltimo) {
        // Sei ultimo (o in solo): Pesca 3 malus a scelta
        this._renderPannelloSceltaUltimo(container, inv, isSolo && miaPos === 0);
      } else if (inv.length > 0) {
        // Non sei ultimo, ma hai malus salvati nell'inventario
        this._renderPannelloInventario(container, inv);
      } else {
        // Mostra pulsante discreto per testare i malus anche se hai vinto
        container.style.display = 'block';
        container.innerHTML = `
          <button class="btn btn-ghost btn-small" id="btn-force-test-malus" style="border-color: #b026ff; color: #b026ff; margin: 6px auto; display: block; font-size: 0.8rem;">
            🧪 Vuoi provare un Malus? Clicca qui!
          </button>
        `;
        const testBtn = container.querySelector('#btn-force-test-malus');
        if (testBtn) {
          testBtn.onclick = () => this._renderPannelloSceltaUltimo(container, inv, false);
        }
      }
    },

    _renderPannelloSceltaUltimo(container, inv, isVincitoreSolo = false) {
      const proposte = this.pescaCasuali(3);
      const spazioLibero = inv.length < MAX_MALUS_ACCUMULABILI;
      const titolo = isVincitoreSolo ? "😈 SFIDA IL FANTASMA!" : "💀 VENDETTA DELL'ULTIMO!";
      const desc = isVincitoreSolo 
        ? "Vuoi rendere il prossimo round più caotico? Scegli un Malus da lanciare o conservare!" 
        : "Sei arrivato ultimo: scegli un Malus da scagliare su tutti o conservalo!";

      container.style.display = 'block';
      container.innerHTML = `
        <div class="malus-revenge-card">
          <div class="malus-revenge-header">
            <span class="malus-revenge-badge">${titolo}</span>
            <span class="malus-inv-count">🎒 Inventario: <b>${inv.length}/${MAX_MALUS_ACCUMULABILI}</b></span>
          </div>
          <p class="malus-revenge-desc">${desc}</p>
          
          <div class="malus-cards-grid">
            ${proposte.map(m => `
              <div class="malus-pick-card" data-malus-id="${m.id}" style="border-color:${m.colore}">
                <div class="mp-icon">${m.icona}</div>
                <div class="mp-info">
                  <div class="mp-nome" style="color:${m.colore}">${m.nome}</div>
                  <div class="mp-tag">${m.tag}</div>
                  <div class="mp-desc">${m.desc}</div>
                </div>
                <div class="mp-actions">
                  <button class="btn btn-small btn-malus-launch" data-launch="${m.id}">
                    🚀 Lancia Subito
                  </button>
                  <button class="btn btn-small btn-ghost btn-malus-keep" data-keep="${m.id}" ${!spazioLibero ? 'disabled title="Inventario pieno (max 2)"' : ''}>
                    🎒 Conserva (${inv.length}/${MAX_MALUS_ACCUMULABILI})
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Event listeners sui pulsanti
      container.querySelectorAll('[data-launch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const malusId = btn.getAttribute('data-launch');
          this.prenotaMalus(malusId, window.S.io, window.S.nome);
          container.style.display = 'none';
        });
      });

      container.querySelectorAll('[data-keep]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const malusId = btn.getAttribute('data-keep');
          if (this.aggiungiAInventario(malusId)) {
            if (window.Suoni && Suoni.playClick) Suoni.playClick();
            if (window.Trofei && window.Trofei.mostraNotifica) {
              const m = this.trova(malusId);
              window.Trofei.mostraNotifica({
                icona: '🎒',
                nome: 'Malus Conservato!',
                desc: `${m.icona} ${m.nome} aggiunto al tuo zaino (max 2).`
              });
            }
            container.style.display = 'none';
          }
        });
      });
    },

    _renderPannelloInventario(container, inv) {
      container.style.display = 'block';
      container.innerHTML = `
        <div class="malus-revenge-card is-inventory-only">
          <div class="malus-revenge-header">
            <span class="malus-revenge-badge" style="background:rgba(176,38,255,0.2); border-color:#b026ff; color:#b026ff;">
              🎒 I TUOI MALUS ACCUMULATI (${inv.length}/${MAX_MALUS_ACCUMULABILI})
            </span>
          </div>
          <p class="malus-revenge-desc">Vuoi scagliare uno dei tuoi malus conservati per il prossimo round?</p>
          <div class="malus-cards-grid">
            ${inv.map(m => `
              <div class="malus-pick-card" style="border-color:${m.colore}">
                <div class="mp-icon">${m.icona}</div>
                <div class="mp-info">
                  <div class="mp-nome" style="color:${m.colore}">${m.nome}</div>
                  <div class="mp-desc">${m.desc}</div>
                </div>
                <div class="mp-actions">
                  <button class="btn btn-small btn-malus-launch" data-launch-inv="${m.id}">
                    💥 Scaglia Ora!
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('[data-launch-inv]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const malusId = btn.getAttribute('data-launch-inv');
          this.rimuoviDaInventario(malusId);
          this.prenotaMalus(malusId, window.S.io, window.S.nome);
          container.style.display = 'none';
        });
      });
    },

    /* ------------------------------------------------------------------ Applicazione nel Round */
    applicaNelRound(malusObj) {
      this.rimuoviDalRound();
      if (!malusObj) return;

      const arena = document.getElementById('arena');
      const badge = document.getElementById('modifier-badge');
      const m = this.trova(malusObj.id || malusObj.malusId) || malusObj;

      if (badge) {
        badge.classList.add('is-on', 'malus-badge-on');
        badge.innerHTML = `
          <div class="malus-active-pill">
            <span class="pulse-icon">🚨</span> 
            <b>MALUS ATTIVO:</b> ${m.icona} <b>${m.nome}</b> — <span>${m.desc}</span> 
            <small class="malus-author">Lanciato da: ${malusObj.nome || 'Avversario'}</small>
          </div>
        `;
      }

      if (arena && m && typeof m.attiva === 'function') {
        _puliziaMalusCorrente = m.attiva(arena);
      }

      if (window.Suoni && Suoni.playMalus) Suoni.playMalus();
      if (window.Effetti && Effetti.onda) {
        Effetti.onda(window.innerWidth / 2, window.innerHeight / 3, m.colore || '#ff0055', 150);
      }
    },

    rimuoviDalRound() {
      if (typeof _puliziaMalusCorrente === 'function') {
        try { _puliziaMalusCorrente(); } catch (e) { console.error(e); }
        _puliziaMalusCorrente = null;
      }
      const arena = document.getElementById('arena');
      if (arena) {
        arena.classList.remove('malus-sottosopra', 'malus-panic', 'malus-glitch', 'malus-cieco', 'malus-nebbia-attiva', 'malus-congelamento-wrap');
      }
      const badge = document.getElementById('modifier-badge');
      if (badge) {
        badge.classList.remove('malus-badge-on');
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.Malus = Malus;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.Malus = Malus;
  }
})();
