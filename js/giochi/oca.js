/* 🪿 Gioco dell'Oca — Minigioco Classico con dadi e caselle personalizzate! */

const CASELLE_MINI_OCA = [
  { n: 0, nome: "Partenza", icona: "🚩", tipo: "start", colore: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
  { n: 1, nome: "Prato", icona: "🌱", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 2, nome: "Sentiero", icona: "🌿", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 3, nome: "Turbo Razzo", icona: "🚀", tipo: "turbo", delta: 3, desc: "+3 caselle!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 4, nome: "Boschetto", icona: "🌲", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 5, nome: "Oca Magica", icona: "🪿", tipo: "oca", desc: "Raddoppia i passi!", colore: "linear-gradient(135deg, #10b981, #047857)" },
  { n: 6, nome: "Ponte", icona: "🌉", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
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
  { n: 18, nome: "Radura", icona: "🌻", tipo: "normale", colore: "linear-gradient(135deg, #334155, #1e293b)" },
  { n: 19, nome: "Sprint Finale", icona: "⚡", tipo: "turbo", delta: 1, desc: "+1 sprint!", colore: "linear-gradient(135deg, #0284c7, #0369a1)" },
  { n: 20, nome: "TRAGUARDO", icona: "🏆", tipo: "traguardo", colore: "linear-gradient(135deg, #f59e0b, #d97706)" }
];

const FACCE_OCA = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

GIOCHI.push({
  id: "oca",
  nome: "Gioco dell'Oca",
  icona: "🪿",
  desc: "Lancia i dadi, sfrutta le caselle speciali e sfreccia verso il traguardo!",
  regole: [
    "A turno: <b>lancia il dado</b> per avanzare sul percorso verso la casella 20.",
    "🪿 <b>Oca (5, 9, 14)</b>: Raddoppia i passi e salta ancora avanti!",
    "🚀 <b>Turbo (3, 11, 19)</b>: Scatto propulsivo in avanti.",
    "🍌 <b>Banana (7, 16)</b>: Scivoli indietro di 2 caselle!",
    "🕳️ <b>Pozzo (13)</b>: Trappola profonda, torni indietro di 3 caselle.",
    "🎲 <b>Dado Extra (12)</b>: Tiro fortunato, tiri subito un'altra volta!",
    "Chi taglia per primo il <b>Traguardo</b> vince <b>500 punti</b>!"
  ],
  gara: false,
  solo: true,
  maxGiocatori: 6,
  durata: 65,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => ({}));
  },

  fantasma() {
    return { punti: 350, dettaglio: "Casella 18/20", tempo: 35 };
  },

  crea(api) {
    const isSolo = api.giocatori.length <= 1;
    let giocatori = api.giocatori.filter(g => g.online);
    if (isSolo) {
      giocatori = [
        api.giocatori[0] || { id: "p0", nome: "Tu", avatar: "😎" },
        { id: "bot", nome: "Oca Bot 🤖", avatar: "🪿" }
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
            Tua casella: <b id="oca-mia-pos" style="color: #38bdf8;">0</b>/20
          </div>
        </div>

        <!-- Banner Notifica Eventi Casella -->
        <div id="oca-event-banner" style="min-height: 38px; font-weight: bold; font-size: 1.1rem; text-align: center; color: #fff; padding: 6px 12px; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
          Benvenuto al Gioco dell'Oca!
        </div>

        <!-- Plancia / Percorso Caselle -->
        <div class="oca-track-wrapper" style="flex: 1; overflow-y: auto; padding: 6px 4px; margin-bottom: 10px; max-height: 48vh; border-radius: 14px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05);">
          <div id="oca-track" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; padding: 6px;">
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

    // Disegna tutte le 21 caselle
    function disegnaPercorso() {
      elTrack.innerHTML = "";
      CASELLE_MINI_OCA.forEach(c => {
        const isEnd = c.n === 20;
        const border = isEnd ? "#fbbf24" : c.tipo === "oca" ? "#34d399" : c.tipo === "turbo" ? "#38bdf8" : c.tipo === "malus" || c.tipo === "trappola" ? "#f87171" : "#475569";
        
        elTrack.innerHTML += `
          <div class="oca-tile" id="oca-tile-${c.n}" style="
            min-height: 74px; border-radius: 14px;
            background: ${c.colore}; color: #fff;
            display: flex; flex-direction: column; align-items: center; justify-content: space-between;
            padding: 6px 4px; position: relative; border: 2.5px solid ${border};
            box-shadow: 0 3px 6px rgba(0,0,0,0.35); text-align: center;
          ">
            <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.75rem; font-weight: bold; opacity: 0.85;">
              <span>#${c.n}</span>
              <span>${c.icona}</span>
            </div>
            <div class="oca-tile-slot" id="oca-slot-${c.n}" style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; min-height: 28px; width: 100%; align-items: center; pointer-events: none;"></div>
            <div style="font-size: 0.7rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; opacity: 0.9;">
              ${c.nome}
            </div>
          </div>
        `;
      });
    }

    // Aggiorna pedine sulle caselle
    function aggiornaPedine() {
      for (let i = 0; i <= 20; i++) {
        const slot = api.arena.querySelector("#oca-slot-" + i);
        if (slot) slot.innerHTML = "";
      }

      giocatori.forEach((g, idx) => {
        const pos = Math.min(Math.max(posizioni[idx] || 0, 0), 20);
        const slot = api.arena.querySelector("#oca-slot-" + pos);
        if (slot) {
          slot.innerHTML += `<div style="font-size: 1.6rem; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.8)); margin-top: -3px;" title="${g.nome}">${g.avatar}</div>`;
        }
      });

      if (elMiaPos) elMiaPos.textContent = posizioni[mioIndice] || 0;
      api.avanzo((posizioni[mioIndice] || 0) / 20);

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

      // Se tocca al bot in solo mode
      if (isSolo && turno === 1 && !inAnimazione && !concluso) {
        clearTimeout(timeoutBot);
        timeoutBot = setTimeout(() => {
          if (!concluso && turno === 1 && !inAnimazione) {
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

          // 2. Passo-passo
          setTimeout(() => {
            muoviPassoPasso(giocatoreIdx, dado);
          }, 600);
        }
      }, 75);
    }

    // Movimento pedina casella per casella
    function muoviPassoPasso(giocatoreIdx, dado) {
      let passi = dado;
      const g = giocatori[giocatoreIdx];

      const timerPassi = setInterval(() => {
        if (passi > 0 && posizioni[giocatoreIdx] < 20) {
          posizioni[giocatoreIdx]++;
          passi--;
          aggiornaPedine();
          if (window.Suoni) Suoni.playTick();
        } else {
          clearInterval(timerPassi);
          // Arrivato alla casella base: verifica effetto
          applicaEffettoCasella(giocatoreIdx, dado);
        }
      }, 250);
    }

    // Gestione caselle personalizzate (Oca, Turbo, Banana, Pozzo, Dado Extra)
    function applicaEffettoCasella(giocatoreIdx, dadoLanciato) {
      const g = giocatori[giocatoreIdx];
      const pos = posizioni[giocatoreIdx];
      const casella = CASELLE_MINI_OCA[pos];

      // Ha raggiunto il traguardo?
      if (pos >= 20) {
        terminaGioco(giocatoreIdx);
        return;
      }

      // 🪿 Casella Oca: raddoppia i passi del dado
      if (casella.tipo === "oca") {
        elEventBanner.innerHTML = `🪿 <b>OCA MAGICA!</b> ${g.nome} raddoppia il lancio (+${dadoLanciato} passi)!`;
        if (window.Suoni) Suoni.playDing();
        if (window.Vibrazione) Vibrazione.successo();

        setTimeout(() => {
          let passiBonus = dadoLanciato;
          const timerOca = setInterval(() => {
            if (passiBonus > 0 && posizioni[giocatoreIdx] < 20) {
              posizioni[giocatoreIdx]++;
              passiBonus--;
              aggiornaPedine();
              if (window.Suoni) Suoni.playTick();
            } else {
              clearInterval(timerOca);
              if (posizioni[giocatoreIdx] >= 20) {
                terminaGioco(giocatoreIdx);
              } else {
                chiudiTurno(giocatoreIdx, false);
              }
            }
          }, 250);
        }, 700);
        return;
      }

      // 🚀 Turbo Razzo
      if (casella.tipo === "turbo") {
        const delta = casella.delta || 3;
        elEventBanner.innerHTML = `🚀 <b>TURBO!</b> ${g.nome} scatta avanti di +${delta} caselle!`;
        if (window.Suoni) Suoni.playDing();

        setTimeout(() => {
          let passiTurbo = delta;
          const timerTurbo = setInterval(() => {
            if (passiTurbo > 0 && posizioni[giocatoreIdx] < 20) {
              posizioni[giocatoreIdx]++;
              passiTurbo--;
              aggiornaPedine();
              if (window.Suoni) Suoni.playTick();
            } else {
              clearInterval(timerTurbo);
              if (posizioni[giocatoreIdx] >= 20) {
                terminaGioco(giocatoreIdx);
              } else {
                chiudiTurno(giocatoreIdx, false);
              }
            }
          }, 250);
        }, 700);
        return;
      }

      // 🍌 Scivolo Banana (-2)
      if (casella.tipo === "malus") {
        elEventBanner.innerHTML = `🍌 <b>BUCCIA DI BANANA!</b> ${g.nome} scivola indietro di 2 caselle!`;
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();

        setTimeout(() => {
          let passiMalus = 2;
          const timerMalus = setInterval(() => {
            if (passiMalus > 0 && posizioni[giocatoreIdx] > 0) {
              posizioni[giocatoreIdx]--;
              passiMalus--;
              aggiornaPedine();
              if (window.Suoni) Suoni.playTick();
            } else {
              clearInterval(timerMalus);
              chiudiTurno(giocatoreIdx, false);
            }
          }, 250);
        }, 700);
        return;
      }

      // 🕳️ Pozzo (-3)
      if (casella.tipo === "trappola") {
        elEventBanner.innerHTML = `🕳️ <b>POZZO BUIO!</b> ${g.nome} cade nel pozzo e perde 3 caselle!`;
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();

        setTimeout(() => {
          let passiTrappola = 3;
          const timerPozzo = setInterval(() => {
            if (passiTrappola > 0 && posizioni[giocatoreIdx] > 0) {
              posizioni[giocatoreIdx]--;
              passiTrappola--;
              aggiornaPedine();
              if (window.Suoni) Suoni.playTick();
            } else {
              clearInterval(timerPozzo);
              chiudiTurno(giocatoreIdx, false);
            }
          }, 250);
        }, 700);
        return;
      }

      // 🎲 Dado Extra (Rilancia subito)
      if (casella.tipo === "extra") {
        elEventBanner.innerHTML = `🎲 <b>DADO EXTRA!</b> ${g.nome} ottiene un tiro bonus immediato!`;
        if (window.Suoni) Suoni.playDing();
        setTimeout(() => {
          chiudiTurno(giocatoreIdx, true); // tira ancora lo stesso
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

      if (!isSolo) {
        api.invia({ tipo: "tiroOca", turno: turno, dado: dado });
      }
      eseguiMossaConAnimazione(turno, dado);
    }

    // Fine partita: vittoria traguardo
    function terminaGioco(vincitoreIdx) {
      if (concluso) return;
      concluso = true;
      inAnimazione = false;
      clearTimeout(timeoutBot);

      const vincitore = giocatori[vincitoreIdx];
      const sonoIoVincitore = vincitoreIdx === mioIndice;

      elEventBanner.innerHTML = `🏆 <b>${vincitore.nome} TAGLIA IL TRAGUARDO E VINCE!</b>`;
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
          puntiMiei = Math.round((posizioni[mioIndice] / 20) * 350);
        }
        api.finito({
          punti: puntiMiei,
          dettaglio: sonoIoVincitore ? "1° al Traguardo! 🏆" : `Casella ${posizioni[mioIndice]}/20`
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
      const punti = sonoPrimo ? 400 : Math.round((posizioni[mioIndice] / 20) * 300);

      api.finito({
        punti: punti,
        dettaglio: `Tempo scaduto (Casella ${posizioni[mioIndice]}/20)`
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
