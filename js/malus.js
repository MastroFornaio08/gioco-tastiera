/* ==========================================================================
   Zaltergames — Sistema Malus (Regola della Sfida ad Alto Rischio)
   ==========================================================================
   Nuova logica:
   1. Chi fa il punteggio minore nel round ha diritto a scegliere 1 Malus.
   2. Niente conservazione: scegli 1 Malus con 1 click e la schermata si chiude subito.
   3. Se gli avversari ti battono con il Malus attivo, il round vale DOPPIO
      e porta alla VITTORIA AUTOMATICA della partita per chi ti ha battuto!
   4. Altrimenti, se perde chi ha subito il malus, il giocatore con il punteggio
      minore ha a sua volta diritto a scegliere il Malus per il round successivo.
   ========================================================================== */

(function () {
  'use strict';

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
          const rad = ctx.createRadialGradient(x, y, 10, x, y, 70);
          rad.addColorStop(0, 'rgba(0,0,0,1)');
          rad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(x, y, 70, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        const onPointer = (e) => pulisciPunto(e.clientX, e.clientY);
        arena.addEventListener('pointermove', onPointer, { passive: true });
        arena.addEventListener('pointerdown', onPointer, { passive: true });

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
    catalogo: CATALOGO_MALUS,

    trova(id) {
      return CATALOGO_MALUS.find(m => m.id === id) || null;
    },

    pescaCasuali(n = 3) {
      const mescolati = CATALOGO_MALUS.slice().sort(() => Math.random() - 0.5);
      return mescolati.slice(0, n);
    },

    /* ------------------------------------------------------------------ Attivazione Malus */
    prenotaMalus(malusId, daChiId, daChiNome) {
      const m = this.trova(malusId);
      if (!m) return;

      const da = daChiId || (window.S && window.S.io) || 'io';
      const nome = daChiNome || (window.S && window.S.nome) || 'Giocatore';

      const payload = {
        da: da,
        nome: nome,
        malus: {
          id: m.id,
          nome: m.nome,
          icona: m.icona,
          tag: m.tag,
          desc: m.desc,
          colore: m.colore
        }
      };

      if (window.S) {
        window.S.malusInCoda = payload;
      }

      // Se multiplayer, invia via rete
      if (window.Rete && typeof window.Rete.invia === 'function' && window.S && window.S.ruolo !== 'solo') {
        try { window.Rete.invia('malus_prenotato', payload); } catch (e) {}
      }

      // Feedback sonoro e visivo
      if (window.Suoni && Suoni.playMalus) Suoni.playMalus();

      // Chiudi subito la schermata di selezione
      const container = document.getElementById('malus-container');
      if (container) container.style.display = 'none';

      // Mostra il banner di conferma prenotazione
      this.mostraBannerPrenotato(payload);
    },

    mostraBannerPrenotato(payload) {
      const banner = document.getElementById('malus-banner-prenotato');
      if (!banner) return;

      const m = payload.malus || payload;
      const eMio = window.S && window.S.io === payload.da;
      const mittente = eMio ? 'Tu' : (payload.nome || 'Un avversario');

      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="malus-alert-box">
          <span class="malus-alert-pulse">🚨</span>
          <div class="malus-alert-text">
            <b>${mittente}</b> ha attivato il Malus: 
            <span class="malus-pill" style="border-color:${m.colore || '#ff0055'}; color:${m.colore || '#ff0055'}">
              ${m.icona || '⚡'} ${m.nome}
            </span> 
            per il prossimo round!
            <div style="font-size:0.78rem; color:#fca5a5; margin-top:2px;">
              ⚠️ <b>Regola Sfida:</b> Se gli avversari battono chi ha lanciato il Malus, vincono automaticamente la partita!
            </div>
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

      // Se la partita è terminata o c'è stata vittoria automatica, niente malus
      if (window.S && (window.S.vittoriaAutomatica || window.S.round >= (window.MAX_ROUND || 3) - 1)) {
        container.style.display = 'none';
        return;
      }

      // Se c'è già un malus prenotato per il prossimo round, mostralo
      if (window.S && window.S.malusInCoda) {
        this.mostraBannerPrenotato(window.S.malusInCoda);
        container.style.display = 'none';
        return;
      }

      const miaPos = tabella ? tabella.findIndex(r => r.id === window.S?.io) : -1;
      const isSolo = window.S?.ruolo === 'solo';
      
      // Chi ha fatto il punteggio minore (ultimo in tabella)
      const ultimoId = (tabella && tabella.length > 0) ? tabella[tabella.length - 1].id : null;
      const sonoIoUltimo = (window.S && window.S.io === ultimoId);

      if (sonoIoUltimo || isSolo) {
        // Sei tu ad aver fatto il punteggio minore: scegli 1 Malus con 1 click
        this._renderPannelloScelta(container, isSolo && miaPos === 0);
      } else {
        container.style.display = 'none';
      }
    },

    _renderPannelloScelta(container, isVincitoreSolo = false) {
      const proposte = this.pescaCasuali(3);
      const titolo = isVincitoreSolo ? "😈 SFIDA CON UN MALUS!" : "💀 PUNTEGGIO MINORE: SCEGLI IL MALUS!";
      const desc = isVincitoreSolo 
        ? "Scegli un Malus da infliggere al Fantasma per il prossimo round (1 solo click)!" 
        : "Hai fatto il punteggio minore: clicca 1 Malus per scagliarlo su tutti! <b>Attenzione:</b> se ti battono con il Malus attivo, vincono automaticamente!";

      container.style.display = 'block';
      container.innerHTML = `
        <div class="malus-revenge-card">
          <div class="malus-revenge-header">
            <span class="malus-revenge-badge">${titolo}</span>
          </div>
          <p class="malus-revenge-desc">${desc}</p>
          
          <div class="malus-cards-grid">
            ${proposte.map(m => `
              <div class="malus-pick-card" id="card-malus-${m.id}" data-malus-id="${m.id}" style="border-color:${m.colore}; cursor:pointer;">
                <div class="mp-icon">${m.icona}</div>
                <div class="mp-info">
                  <div class="mp-nome" style="color:${m.colore}">${m.nome}</div>
                  <div class="mp-tag">${m.tag}</div>
                  <div class="mp-desc">${m.desc}</div>
                </div>
                <div class="mp-actions">
                  <button type="button" class="btn btn-small btn-malus-launch" data-launch="${m.id}">
                    ⚡ SCAGLIA MALUS
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Cliccando su qualsiasi carta o sul bottone SCAGLIA MALUS:
      // Si attiva subito e la schermata di selezione si toglie all'istante!
      const attivaScelta = (malusId) => {
        this.prenotaMalus(malusId, window.S?.io, window.S?.nome);
      };

      container.querySelectorAll('.malus-pick-card').forEach(card => {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const malusId = card.getAttribute('data-malus-id');
          attivaScelta(malusId);
        });
      });
    },

    /* ------------------------------------------------------------------ Applicazione nel Round */
    mostraBadgeRound(malusObj) {
      if (!malusObj) return;
      const m = this.trova(malusObj.id || malusObj.malusId) || malusObj.malus || malusObj;
      const badge = document.getElementById('modifier-badge');
      if (badge && m) {
        badge.classList.add('is-on', 'malus-badge-on');
        badge.innerHTML = `
          <div class="malus-active-pill">
            <span class="pulse-icon">🚨</span> 
            <b>MALUS ATTIVO:</b> ${m.icona || '⚡'} <b>${m.nome}</b> — <span>${m.desc || ''}</span> 
            <small class="malus-author">Sfidante: ${malusObj.nome || 'Avversario'} · Se battuto: VITTORIA AUTOMATICA!</small>
          </div>
        `;
      }
      if (window.Suoni && Suoni.playMalus) Suoni.playMalus();
    },

    applicaEffettiArena(malusObj) {
      if (!malusObj) return;
      const arena = document.getElementById('arena');
      if (!arena) return;

      const m = this.trova(malusObj.id || malusObj.malusId) || malusObj.malus || malusObj;
      if (!m) return;

      if (typeof m.attiva === 'function') {
        _puliziaMalusCorrente = m.attiva(arena);
      }

      if (window.Effetti && Effetti.onda) {
        Effetti.onda(window.innerWidth / 2, window.innerHeight / 3, m.colore || '#ff0055', 140);
      }
    },

    applicaNelRound(malusObj) {
      this.rimuoviDalRound();
      this.mostraBadgeRound(malusObj);
      this.applicaEffettiArena(malusObj);
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
