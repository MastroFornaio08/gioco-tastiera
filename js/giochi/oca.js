/* 🪿 Gioco dell'Oca — Minigioco Classico con dadi, 30 caselle, rimbalzo al traguardo ed effetti a catena! */

const CASELLE_MINI_OCA = [
  { n: 0, nome: "Partenza", icona: "🚩", tipo: "start", colore: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
  { n: 1, nome: "Prato", icona: "🌱", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 2, nome: "Sentiero", icona: "🌿", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 3, nome: "Turbo Razzo", icona: "🚀", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 4, nome: "Boschetto", icona: "🌲", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 5, nome: "Oca Magica", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 6, nome: "Ponte Turbo", icona: "🌉", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 7, nome: "Scivolo Banana", icona: "🍌", tipo: "malus", delta: -2, desc: "-2 caselle!", colore: "linear-gradient(135deg, #ef4444, #b91c1c)" },
  { n: 8, nome: "Fiume", icona: "🌊", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 9, nome: "Oca Reale", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 10, nome: "Mulino", icona: "🌾", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 11, nome: "Super Turbo", icona: "🚀", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 12, nome: "Dado Extra", icona: "🎲", tipo: "extra", desc: "Tira di nuovo!", colore: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
  { n: 13, nome: "Pozzo Buio", icona: "🕳️", tipo: "trappola", delta: -3, desc: "-3 caselle!", colore: "linear-gradient(135deg, #b91c1c, #7f1d1d)" },
  { n: 14, nome: "Oca Dorata", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 15, nome: "Castello", icona: "🏰", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 16, nome: "Buccia Banana", icona: "🍌", tipo: "malus", delta: -2, desc: "-2 caselle!", colore: "linear-gradient(135deg, #ef4444, #b91c1c)" },
  { n: 17, nome: "Labirinto", icona: "🧭", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 18, nome: "Oca Alata", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 19, nome: "Turbo Stellare", icona: "🚀", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 20, nome: "Giardino Fiorito", icona: "🌻", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 21, nome: "Pozzo Profondo", icona: "🕳️", tipo: "trappola", delta: -3, desc: "-3 caselle!", colore: "linear-gradient(135deg, #b91c1c, #7f1d1d)" },
  { n: 22, nome: "Super Salto", icona: "⚡", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 23, nome: "Oca Mistica", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 24, nome: "Scivolo Fango", icona: "🍌", tipo: "malus", delta: -2, desc: "-2 caselle!", colore: "linear-gradient(135deg, #ef4444, #b91c1c)" },
  { n: 25, nome: "Dado Extra", icona: "🎲", tipo: "extra", desc: "Tira di nuovo!", colore: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
  { n: 26, nome: "Vento Rapido", icona: "🌪️", tipo: "turbo", delta: 2, desc: "+2 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 27, nome: "Oca Suprema", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 28, nome: "Trappola Ragnatela", icona: "🕸️", tipo: "trappola", delta: -3, desc: "-3 caselle!", colore: "linear-gradient(135deg, #b91c1c, #7f1d1d)" },
  { n: 29, nome: "Ultimo Balzo", icona: "✨", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 30, nome: "TRAGUARDO", icona: "🏆", tipo: "traguardo", desc: "Numero esatto!", colore: "linear-gradient(135deg, #f59e0b, #d97706)" }
];

const FACCE_OCA = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

GIOCHI.push({
  id: "oca",
  nome: "Gioco dell'Oca",
  icona: "🪿",
  desc: "Lancia i dadi, sfrutta le caselle speciali e sfreccia verso il traguardo a 30 caselle!",
  regole: [
    "A turno: <b>lancia il dado</b> per avanzare sul percorso verso la casella 30.",
    "🎯 <b>Numero esatto per vincere</b>: per vincere devi atterrare esattamente sul 30! Se superi il traguardo, <b>rimbalzi indietro</b> delle caselle in eccesso!",
    "🪿 <b>Effetti a Catena</b>: se atterri su caselle speciali consecutive (Oca, Turbo, Scivoli), gli effetti continuano a moltiplicarsi e concatenarsi!",
    "🪿 <b>Oca (5, 9, 14, 18, 23, 27)</b>: Raddoppia i passi e salta ancora avanti!",
    "🚀 <b>Turbo</b>: Scatto propulsivo in avanti.",
    "🍌 <b>Banana & Trappola</b>: Scivoli indietro!",
    "🎲 <b>Dado Extra (12, 25)</b>: Tiro bonus immediato!",
    "Chi taglia per primo il <b>Traguardo</b> vince <b>500 punti</b>!"
  ],
  gara: false,
  solo: true,
  maxGiocatori: 6,
  durata: 85,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => ({}));
  },

  fantasma() {
    return { punti: 350, dettaglio: "Casella 27/30", tempo: 42 };
  },

  crea(api) {
    const isSolo = S.ruolo === "solo" || api.giocatori.length <= 1 || api.giocatori.some(g => g.id === "gh" || g.id === "bot");
    let giocatori = api.giocatori.filter(g => g.online);
    if (giocatori.length <= 1) {
      giocatori = [
        api.giocatori[0] || { id: "p0", nome: "Tu", avatar: "😎" },
        { id: "gh", nome: "Fantasma", avatar: "👻" }
      ];
    }

    const n = giocatori.length;
    const mioIndice = isSolo ? 0 : Math.max(0, giocatori.findIndex(g => g.id === api.io));
    let turno = 0;
    let concluso = false;
    let inAnimazione = false;
    let timeoutBot = null;

    const posizioni = new Array(n).fill(0);

    // Costruzione UI Arena
    api.arena.innerHTML = `
      <div class="oca-arena" style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 600px; margin: 0 auto; user-select: none;">
        <!-- Header Turno e Info -->
        <div id="oca-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(15, 23, 42, 0.7); border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);">
          <div id="oca-turno-badge" style="font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; gap: 6px;">
            <span>Tocca a:</span> <span id="oca-turno-nome" style="color: #ffd23b;">...</span>
          </div>
          <div id="oca-pos-badge" style="font-size: 0.95rem; opacity: 0.9;">
            Tua casella: <b id="oca-mia-pos" style="color: #38bdf8;">0</b>/30
          </div>
        </div>

        <!-- Banner Notifica Eventi Casella -->
        <div id="oca-event-banner" style="min-height: 40px; font-weight: bold; font-size: 1.05rem; text-align: center; color: #fff; padding: 6px 12px; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
          Benvenuto al Gioco dell'Oca! Raggiungi il 30 esatto!
        </div>

        <!-- Plancia / Percorso Caselle -->
        <div class="oca-track-wrapper" style="flex: 1; overflow-y: auto; padding: 6px 4px; margin-bottom: 10px; max-height: 46vh; border-radius: 14px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05);">
          <div id="oca-track" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 6px; padding: 4px;">
            <!-- generato da js -->
          </div>
        </div>

        <!-- Area Dado e Controlli -->
        <div id="oca-controls" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px 0;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div id="oca-dice-cube" style="font-size: 3.8rem; line-height: 1; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transition: transform 0.15s ease;">🎲</div>
            <button id="oca-roll-btn" class="btn btn-primary" style="padding: 12px 24px; font-size: 1.2rem; font-weight: bold; background: #eab308; color: #000; border-radius: 12px; box-shadow: 0 4px 10px rgba(234, 179, 8, 0.4); cursor: pointer;">
              🎲 TIRA IL DADO!
            </button>
          </div>
        </div>
      </div>
    `;

    const elTrack = api.arena.querySelector("#oca-track");
    const elTurnoNome = api.arena.querySelector("#oca-turno-nome");
    const elMiaPos = api.arena.querySelector("#oca-mia-pos");
    const elEventBanner = api.arena.querySelector("#oca-event-banner");
    const elDiceCube = api.arena.querySelector("#oca-dice-cube");
    const btnRoll = api.arena.querySelector("#oca-roll-btn");

    // Disegna tutte le 31 caselle (da 0 a 30)
    function disegnaPercorso() {
      elTrack.innerHTML = "";
      CASELLE_MINI_OCA.forEach(c => {
        const isEnd = c.n === 30;
        const isOca = c.tipo === "oca";
        const isTurbo = c.tipo === "turbo";
        const isBad = c.tipo === "malus" || c.tipo === "trappola";
        const isExtra = c.tipo === "extra";
        
        const border = isEnd ? "#fbbf24" : isOca ? "#34d399" : isTurbo ? "#38bdf8" : isBad ? "#f87171" : isExtra ? "#c084fc" : "#475569";
        const badgeColor = isEnd ? "background: #f59e0b; color: #000;" : isOca ? "background: #10b981; color: #fff;" : isTurbo ? "background: #0284c7; color: #fff;" : isBad ? "background: #ef4444; color: #fff;" : isExtra ? "background: #8b5cf6; color: #fff;" : "background: rgba(255,255,255,0.15); color: #fff;";

        elTrack.innerHTML += `
          <div class="oca-tile" id="oca-tile-${c.n}" style="
            min-height: 70px; border-radius: 12px;
            background: ${c.colore}; color: #fff;
            display: flex; flex-direction: column; align-items: center; justify-content: space-between;
            padding: 5px 3px; position: relative; border: 2.5px solid ${border};
            box-shadow: 0 3px 6px rgba(0,0,0,0.35); text-align: center;
          ">
            <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.72rem; font-weight: bold; opacity: 0.9; padding: 0 2px;">
              <span style="border-radius: 4px; padding: 1px 4px; ${badgeColor}">#${c.n}</span>
              <span style="font-size: 1.1rem; line-height: 1;">${c.icona}</span>
            </div>
            <div class="oca-tile-slot" id="oca-slot-${c.n}" style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; min-height: 24px; width: 100%; align-items: center; pointer-events: none;"></div>
            <div style="font-size: 0.68rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; opacity: 0.95;">
              ${c.nome}
            </div>
          </div>
        `;
      });
    }

    // Aggiorna pedine sulle caselle
    function aggiornaPedine() {
      for (let i = 0; i <= 30; i++) {
        const slot = api.arena.querySelector("#oca-slot-" + i);
        if (slot) slot.innerHTML = "";
      }

      giocatori.forEach((g, idx) => {
        const pos = Math.min(Math.max(posizioni[idx] || 0, 0), 30);
        const slot = api.arena.querySelector("#oca-slot-" + pos);
        if (slot) {
          slot.innerHTML += `<div style="font-size: 1.5rem; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.8)); margin-top: -3px;" title="${g.nome}">${g.avatar}</div>`;
        }
      });

      if (elMiaPos) elMiaPos.textContent = posizioni[mioIndice] || 0;
      api.avanzo((posizioni[mioIndice] || 0) / 30);

      // Scroll verso la casella del turno corrente
      const targetTile = api.arena.querySelector("#oca-tile-" + (posizioni[turno] || 0));
      if (targetTile) targetTile.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Aggiorna header e stato comandi
    function aggiornaStato() {
      if (concluso) return;
      const giocatoreCorrente = giocatori[turno] || { nome: "..." };
      const eIlMioTurno = turno === mioIndice;

      if (elTurnoNome) {
        elTurnoNome.textContent = eIlMioTurno ? "TE! 🎯" : giocatoreCorrente.nome;
      }

      if (eIlMioTurno && !inAnimazione) {
        btnRoll.disabled = false;
        btnRoll.style.opacity = "1";
        btnRoll.textContent = "🎲 TIRA IL DADO!";
        elDiceCube.style.cursor = "pointer";
      } else {
        btnRoll.disabled = true;
        btnRoll.style.opacity = "0.5";
        btnRoll.textContent = inAnimazione ? "Dado in volo..." : `In attesa di ${giocatoreCorrente.nome}...`;
        elDiceCube.style.cursor = "default";
      }

      // Se tocca al bot / fantasma in modalità allenamento o bot
      const eBot = !eIlMioTurno && (isSolo || giocatoreCorrente.id === "gh" || giocatoreCorrente.id === "bot");
      if (eBot && !inAnimazione && !concluso) {
        clearTimeout(timeoutBot);
        timeoutBot = setTimeout(() => {
          if (!concluso && !inAnimazione) {
            eseguiTiroLogica();
          }
        }, 900);
      }
    }

    // Animazione di rotolamento del dado e sequenza mossa
    function eseguiMossaConAnimazione(giocatoreIdx, dado) {
      inAnimazione = true;
      btnRoll.disabled = true;
      btnRoll.style.opacity = "0.5";

      const g = giocatori[giocatoreIdx];
      elEventBanner.textContent = `${g.nome} sta lanciando il dado...`;

      // 1. Rotolamento dado
      let count = 0;
      const timerDado = setInterval(() => {
        count++;
        const fRandom = Math.floor(Math.random() * 6);
        elDiceCube.textContent = FACCE_OCA[fRandom];
        elDiceCube.style.transform = `rotate(${(count % 4) * 20 - 20}deg) scale(1.2)`;
        if (window.Suoni && count % 2 === 0) Suoni.playTick();

        if (count >= 10) {
          clearInterval(timerDado);
          elDiceCube.textContent = FACCE_OCA[dado - 1];
          elDiceCube.style.transform = "rotate(0deg) scale(1)";
          if (window.Suoni) Suoni.playDing();

          elEventBanner.innerHTML = `🎲 <b>${g.nome}</b> ha ottenuto un <b>${dado}</b>!`;

          // 2. Movimento passo-passo con rimbalzo al traguardo
          setTimeout(() => {
            muoviPassi(giocatoreIdx, dado, 1, () => {
              applicaEffettoCasella(giocatoreIdx, dado, 0);
            });
          }, 600);
        }
      }, 75);
    }

    // Movimento passo-passo universale con rimbalzo esatto dal 30
    function muoviPassi(giocatoreIdx, quantiPassi, versoIniziale, callback) {
      let passi = quantiPassi;
      let verso = versoIniziale; // 1 = avanti, -1 = indietro
      const g = giocatori[giocatoreIdx];

      const timerPassi = setInterval(() => {
        if (passi > 0) {
          if (verso === 1) {
            if (posizioni[giocatoreIdx] < 30) {
              posizioni[giocatoreIdx]++;
            } else {
              // Ha toccato il 30 ma ha ancora passi: RIMBALZO INDIETRO!
              verso = -1;
              posizioni[giocatoreIdx]--;
              elEventBanner.innerHTML = `↩️ <b>RIMBALZO!</b> Superato il 30! ${g.nome} torna indietro!`;
              if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
              if (window.Vibrazione) Vibrazione.errore();
            }
          } else {
            // Movimento all'indietro
            if (posizioni[giocatoreIdx] > 0) {
              posizioni[giocatoreIdx]--;
            }
          }
          passi--;
          aggiornaPedine();
          if (window.Suoni) Suoni.playTick();
        } else {
          clearInterval(timerPassi);
          callback();
        }
      }, 230);
    }

    // Gestione caselle personalizzate con EFFETTI A CATENA moltiplicati / concatenati
    function applicaEffettoCasella(giocatoreIdx, dadoLanciato, catena = 0) {
      const g = giocatori[giocatoreIdx];
      const pos = posizioni[giocatoreIdx];
      const casella = CASELLE_MINI_OCA[pos] || CASELLE_MINI_OCA[0];

      // Ha raggiunto il traguardo con il numero esatto?
      if (pos === 30) {
        terminaGioco(giocatoreIdx);
        return;
      }

      // Protezione loop infinito
      if (catena >= 6) {
        chiudiTurno(giocatoreIdx, false);
        return;
      }

      const comboText = catena > 0 ? "🔥 <b>COMBO A CATENA!</b> " : "";

      // 🪿 Casella Oca: raddoppia i passi del dado e continua a saltare
      if (casella.tipo === "oca") {
        elEventBanner.innerHTML = `${comboText}🪿 <b>OCA!</b> ${g.nome} raddoppia il lancio: salta avanti di <b>+${dadoLanciato}</b> passi!`;
        if (window.Suoni) Suoni.playDing();
        if (window.Vibrazione) Vibrazione.successo();

        setTimeout(() => {
          muoviPassi(giocatoreIdx, dadoLanciato, 1, () => {
            // Rilancia la verifica sulla nuova casella raggiunta (concatenazione a catena!)
            applicaEffettoCasella(giocatoreIdx, dadoLanciato, catena + 1);
          });
        }, 700);
        return;
      }

      // 🚀 Turbo Razzo: avanza di delta e concatena se atterra su altra speciale
      if (casella.tipo === "turbo") {
        const delta = casella.delta || 3;
        elEventBanner.innerHTML = `${comboText}🚀 <b>TURBO!</b> ${g.nome} scatta avanti di <b>+${delta}</b> caselle!`;
        if (window.Suoni) Suoni.playDing();

        setTimeout(() => {
          muoviPassi(giocatoreIdx, delta, 1, () => {
            applicaEffettoCasella(giocatoreIdx, dadoLanciato, catena + 1);
          });
        }, 700);
        return;
      }

      // 🍌 Scivolo Banana (Malus indietro)
      if (casella.tipo === "malus") {
        const delta = Math.abs(casella.delta || 2);
        elEventBanner.innerHTML = `${comboText}🍌 <b>BUCCIA DI BANANA!</b> ${g.nome} scivola indietro di <b>-${delta}</b> caselle!`;
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
        if (window.Vibrazione) Vibrazione.errore();

        setTimeout(() => {
          muoviPassi(giocatoreIdx, delta, -1, () => {
            applicaEffettoCasella(giocatoreIdx, dadoLanciato, catena + 1);
          });
        }, 700);
        return;
      }

      // 🕳️ Pozzo / Trappola (Malus indietro)
      if (casella.tipo === "trappola") {
        const delta = Math.abs(casella.delta || 3);
        elEventBanner.innerHTML = `${comboText}🕳️ <b>TRAPPOLA!</b> ${g.nome} cade e arretra di <b>-${delta}</b> caselle!`;
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
        if (window.Vibrazione) Vibrazione.errore();

        setTimeout(() => {
          muoviPassi(giocatoreIdx, delta, -1, () => {
            applicaEffettoCasella(giocatoreIdx, dadoLanciato, catena + 1);
          });
        }, 700);
        return;
      }

      // 🎲 Dado Extra (Rilancia subito)
      if (casella.tipo === "extra") {
        elEventBanner.innerHTML = `${comboText}🎲 <b>DADO EXTRA!</b> ${g.nome} ottiene un tiro bonus immediato!`;
        if (window.Suoni) Suoni.playDing();
        setTimeout(() => {
          chiudiTurno(giocatoreIdx, true); // tira ancora lo stesso giocatore
        }, 1000);
        return;
      }

      // Casella normale
      chiudiTurno(giocatoreIdx, false);
    }

    // Conclusione del turno e passaggio al prossimo
    function chiudiTurno(giocatoreIdx, tiraAncora) {
      if (concluso) return;
      inAnimazione = false;

      if (!tiraAncora) {
        turno = (turno + 1) % n;
      }
      aggiornaStato();
    }

    // Lancio logico generato dal giocatore corrente
    function eseguiTiroLogica() {
      if (concluso || inAnimazione) return;
      const dado = Math.floor(Math.random() * 6) + 1;

      if (!isSolo && S.ruolo !== "solo") {
        api.invia({ tipo: "tiroOca", turno: turno, dado: dado });
      }
      eseguiMossaConAnimazione(turno, dado);
    }

    // Fine partita: vittoria traguardo a 30 con numero esatto
    function terminaGioco(vincitoreIdx) {
      if (concluso) return;
      concluso = true;
      inAnimazione = false;
      clearTimeout(timeoutBot);

      const vincitore = giocatori[vincitoreIdx];
      const sonoIoVincitore = vincitoreIdx === mioIndice;

      elEventBanner.innerHTML = `🏆 <b>${vincitore.nome} TAGLIA IL TRAGUARDO SUL 30 E VINCE!</b>`;
      if (sonoIoVincitore) {
        if (window.Suoni) Suoni.playVittoria && Suoni.playVittoria();
        if (window.Vibrazione) Vibrazione.successo();
      }

      setTimeout(() => {
        let puntiMiei = 0;
        if (sonoIoVincitore) {
          puntiMiei = 500;
        } else {
          // Punti proporzionali alla casella raggiunta (fino a 350)
          puntiMiei = Math.round((posizioni[mioIndice] / 30) * 350);
        }

        if (isSolo) {
          const ghIdx = giocatori.findIndex(g => g.id === "gh" || g.id === "bot");
          const posGh = ghIdx >= 0 ? posizioni[ghIdx] : 0;
          const sonoGhVincitore = vincitoreIdx === ghIdx;
          S.fantasmaDati = {
            punti: sonoGhVincitore ? 500 : Math.round((posGh / 30) * 350),
            dettaglio: sonoGhVincitore ? "1° al Traguardo! 🏆" : `Casella ${posGh}/30`,
            tempo: api.tempo ? api.tempo() : 30
          };
          S.esiti[ID_FANTASMA] = S.fantasmaDati;
        }

        api.finito({
          punti: puntiMiei,
          dettaglio: sonoIoVincitore ? "1° al Traguardo! 🏆" : `Casella ${posizioni[mioIndice]}/30`
        });
      }, 1800);
    }

    // Tempo scaduto: vince chi è più avanti
    function tempoScaduto() {
      if (concluso) return;
      concluso = true;
      clearTimeout(timeoutBot);

      const maxPos = Math.max(...posizioni);
      const sonoPrimo = posizioni[mioIndice] === maxPos && maxPos > 0;
      const punti = sonoPrimo ? 400 : Math.round((posizioni[mioIndice] / 30) * 300);

      if (isSolo) {
        const ghIdx = giocatori.findIndex(g => g.id === "gh" || g.id === "bot");
        const posGh = ghIdx >= 0 ? posizioni[ghIdx] : 0;
        const ghPrimo = posGh === maxPos && maxPos > 0;
        S.fantasmaDati = {
          punti: ghPrimo ? 400 : Math.round((posGh / 30) * 300),
          dettaglio: `Casella ${posGh}/30`,
          tempo: api.tempo ? api.tempo() : 30
        };
        S.esiti[ID_FANTASMA] = S.fantasmaDati;
      }

      api.finito({
        punti: punti,
        dettaglio: `Tempo scaduto (Casella ${posizioni[mioIndice]}/30)`
      });
    }

    // Listener pulsante e dado
    btnRoll.onclick = () => {
      if (turno === mioIndice && !inAnimazione && !concluso) {
        eseguiTiroLogica();
      }
    };

    elDiceCube.onclick = () => {
      if (turno === mioIndice && !inAnimazione && !concluso) {
        eseguiTiroLogica();
      }
    };

    // Inizializzazione plancia
    disegnaPercorso();
    aggiornaPedine();
    aggiornaStato();

    return {
      messaggio(m, da) {
        if (!m || concluso) return;
        if (m.tipo === "tiroOca") {
          // Ricevuto tiro da un altro giocatore in multiplayer
          eseguiMossaConAnimazione(m.turno, m.dado);
        }
      },
      scaduto: tempoScaduto,
      chiudi() {
        concluso = true;
        clearTimeout(timeoutBot);
      }
    };
  }
});
