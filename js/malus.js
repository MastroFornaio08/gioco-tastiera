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
      desc: 'Un banco di nebbia leggera copre l’arena: tocca o passa il cursore per illuminare il faro!',
      colore: '#a78bfa',
      giochiEsclusi: ['dattilo', 'caccia'],
      attiva(arena) {
        arena.classList.add('malus-nebbia-attiva');
        const canvas = document.createElement('canvas');
        canvas.className = 'malus-nebbia-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        arena.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const rect0 = arena.getBoundingClientRect();
        let w = (canvas.width = Math.round(rect0.width) || arena.clientWidth || window.innerWidth || 360);
        let h = (canvas.height = Math.round(rect0.height) || arena.clientHeight || window.innerHeight || 400);

        // Disegna nebbia atmosferica traslucida (visibile e misteriosa, NON accecante!)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(0, 0, w, h);

        const pulisciPunto = (clientX, clientY) => {
          const rect = canvas.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const x = (clientX - rect.left) * scaleX;
          const y = (clientY - rect.top) * scaleY;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          const rad = ctx.createRadialGradient(x, y, 15, x, y, 115);
          rad.addColorStop(0, 'rgba(0,0,0,1)');
          rad.addColorStop(0.65, 'rgba(0,0,0,0.85)');
          rad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(x, y, 115, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        const onPointer = (e) => pulisciPunto(e.clientX, e.clientY);
        const onTouch = (e) => {
          if (e.touches && e.touches[0]) {
            pulisciPunto(e.touches[0].clientX, e.touches[0].clientY);
          }
        };

        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('pointerdown', onPointer, { passive: true });
        window.addEventListener('touchmove', onTouch, { passive: true });
        window.addEventListener('touchstart', onTouch, { passive: true });

        // Riempimento lento e delicato della nebbia (~4 secondi prima che si richiuda)
        const interval = setInterval(() => {
          if (!canvas.parentNode) {
            clearInterval(interval);
            return;
          }
          ctx.fillStyle = 'rgba(15, 23, 42, 0.016)';
          ctx.fillRect(0, 0, w, h);
        }, 160);

        return () => {
          clearInterval(interval);
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('pointerdown', onPointer);
          window.removeEventListener('touchmove', onTouch);
          window.removeEventListener('touchstart', onTouch);
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
      giochiEsclusi: ['caccia', 'equilibrio'],
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
      giochiCompatibili: ['memory', 'fotografica', 'sequenza', 'simon', 'ordine', 'inverso'],
      attiva(arena) {
        arena.classList.add('malus-cieco');
        return () => arena.classList.remove('malus-cieco');
      }
    },
    {
      id: 'dado_lento',
      nome: 'Dado Maledetto',
      icona: '🎲',
      tag: 'TIRO DEPOTENZIATO',
      desc: 'Il dado è incantato: ottieni al massimo 3 ad ogni lancio!',
      colore: '#f59e0b',
      giochiCompatibili: ['oca', 'tabellone', 'yahtzee'],
      attiva(arena) {
        arena.classList.add('malus-panic');
        return () => arena.classList.remove('malus-panic');
      }
    },
    {
      id: 'tasti_ballerini',
      nome: 'Tasti Ballerini',
      icona: '🔤',
      tag: 'TESTO ONDEGGIA',
      desc: 'I testi e le parole rimbalzano e ballano rendendo difficile colpire!',
      colore: '#ec4899',
      giochiCompatibili: ['dattilo', 'anagrammi', 'calcolo', 'stroop', 'conta', 'intruso'],
      attiva(arena) {
        arena.classList.add('malus-shake-text');
        return () => arena.classList.remove('malus-shake-text');
      }
    },
    {
      id: 'falso_allarme',
      nome: 'Falso Allarme',
      icona: '⚠️',
      tag: 'DISTRAZIONE LAMPO',
      desc: 'Falsi lampi di colore e scosse per ingannare i tuoi riflessi!',
      colore: '#eab308',
      giochiCompatibili: ['riflessi', 'cronometro', 'bomba'],
      attiva(arena) {
        arena.classList.add('malus-falso-allarme');
        return () => arena.classList.remove('malus-falso-allarme');
      }
    },
    {
      id: 'super_attrito',
      nome: 'Super Attrito',
      icona: '🥊',
      tag: 'FATICA DOPPIA',
      desc: 'L’arena oppone forte resistenza e vibra ad ogni pressione!',
      colore: '#ef4444',
      giochiCompatibili: ['spam', 'fune', 'scuoti'],
      attiva(arena) {
        arena.classList.add('malus-attrito');
        return () => arena.classList.remove('malus-attrito');
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
      return this.pescaCasualiPerGioco(window.S?.giocoId, n);
    },

    pescaCasualiPerGioco(giocoId, n = 3) {
      const validi = CATALOGO_MALUS.filter(m => {
        if (!giocoId) {
          return !m.giochiCompatibili;
        }
        if (m.giochiEsclusi && m.giochiEsclusi.includes(giocoId)) return false;
        if (m.giochiCompatibili && !m.giochiCompatibili.includes(giocoId)) return false;
        return true;
      });

      // Metti in risalto i malus specifici del gioco se presenti
      const specifici = validi.filter(m => m.giochiCompatibili && m.giochiCompatibili.includes(giocoId));
      const universali = validi.filter(m => !m.giochiCompatibili);

      const scelti = [];
      if (specifici.length > 0) {
        const specShuffled = specifici.slice().sort(() => Math.random() - 0.5);
        scelti.push(specShuffled[0]);
      }
      const rimanenti = universali.slice().sort(() => Math.random() - 0.5);
      while (scelti.length < n && rimanenti.length > 0) {
        const p = rimanenti.pop();
        if (!scelti.some(s => s.id === p.id)) scelti.push(p);
      }
      return scelti;
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

      // Se siamo in modalità allenamento (solo), nessun Malus va assegnato
      if (window.S && window.S.ruolo === 'solo') {
        container.style.display = 'none';
        return;
      }

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
      
      // Chi ha fatto il punteggio minore (ultimo in tabella con almeno 2 partecipanti)
      const ultimoId = (tabella && tabella.length > 1) ? tabella[tabella.length - 1].id : null;
      const sonoIoUltimo = (window.S && window.S.io === ultimoId);

      // Il Malus è la "Vendetta dell'Ultimo": spetta ESCLUSIVAMENTE a chi ha perso / fatto il punteggio minore!
      // Se hai vinto (miaPos === 0) o non sei ultimo, nessun Malus viene assegnato.
      if (sonoIoUltimo) {
        this._renderPannelloScelta(container, false);
      } else {
        container.style.display = 'none';
      }
    },

    _renderPannelloScelta(container) {
      const proposte = this.pescaCasuali(3);
      const titolo = "💀 PUNTEGGIO MINORE: SCEGLI IL MALUS!";
      const desc = "Hai fatto il punteggio minore: clicca 1 Malus per scagliarlo su tutti! <b>Attenzione:</b> se ti battono con il Malus attivo, vincono automaticamente!";

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

    estraiId(malusObj) {
      if (!malusObj) return null;
      if (typeof malusObj === 'string') return malusObj;
      if (malusObj.id) return malusObj.id;
      if (malusObj.malusId) return malusObj.malusId;
      if (malusObj.malus) {
        if (typeof malusObj.malus === 'string') return malusObj.malus;
        if (malusObj.malus.id) return malusObj.malus.id;
        if (malusObj.malus.malusId) return malusObj.malus.malusId;
      }
      return null;
    },

    risolvi(malusObj) {
      if (!malusObj) return null;
      const id = this.estraiId(malusObj);
      return this.trova(id);
    },

    /* ------------------------------------------------------------------ Applicazione nel Round */
    mostraBadgeRound(malusObj) {
      if (!malusObj) return;
      const m = this.risolvi(malusObj);
      if (!m) return;
      const badge = document.getElementById('modifier-badge');
      const mittente = malusObj.nome || (malusObj.malus && malusObj.malus.nome) || 'Avversario';
      if (badge && m) {
        badge.classList.add('is-on', 'malus-badge-on');
        badge.innerHTML = `
          <div class="malus-active-pill">
            <span class="pulse-icon">🚨</span> 
            <b>MALUS ATTIVO:</b> ${m.icona || '⚡'} <b>${m.nome}</b> — <span>${m.desc || ''}</span> 
            <small class="malus-author">Sfidante: ${mittente} · Se battuto: VITTORIA AUTOMATICA!</small>
          </div>
        `;
      }
      if (window.Suoni && Suoni.playMalus) Suoni.playMalus();
    },

    applicaEffettiArena(malusObj) {
      if (!malusObj) return;
      const arena = document.getElementById('arena');
      if (!arena) return;

      const m = this.risolvi(malusObj);
      if (!m) {
        console.warn("[Malus] Impossibile trovare malus:", malusObj);
        return;
      }

      console.log("[Malus] Attivazione effetto schermo:", m.id, m.nome);

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
