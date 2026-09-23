/* 🎯 Bersaglio — tempismo e riflessi.
   Una freccia oscilla e bisogna fermarla esattamente al centro. */

const ROUND_BERSAGLIO = 5;

GIOCHI.push({
  id: "bersagli",
  nome: "Bersaglio",
  icona: "🎯",
  desc: "Ferma la freccia esattamente al centro del bersaglio.",
  regole: [
    "La freccia oscilla da destra a sinistra.",
    "Premi COLPISCI! per fermarla.",
    "Più ti avvicini al centro, più punti ottieni (max 100 a round).",
    "Sono 5 round, la velocità aumenta ad ogni round!"
  ],
  gara: true,
  bonusPrimo: false,
  solo: true,
  durata: 30, // Tempo abbondante, la partita finisce in base ai 5 round

  generaPartita() {
    return Array.from({ length: ROUND_BERSAGLIO }, (_, r) => {
      // Velocità crescente
      const cycleTime = 2500 - (r * 400); // 2500, 2100, 1700, 1300, 900 ms per ciclo completo
      return {
        cycleTime: Math.max(600, cycleTime)
      };
    });
  },

  fantasma(dati) {
    // Un bot farebbe mediamente 60-90 punti a round
    return {
      punti: ROUND_BERSAGLIO * (Math.floor(Math.random() * (90 - 60 + 1)) + 60),
      dettaglio: "Bot",
      tempo: 10
    };
  },

  crea(api) {
    let roundCorrente = 0;
    let punti = 0;
    let concluso = false;
    let inMovimento = false;
    let startTime = 0;
    let animFrame = null;
    let cycleTime = api.dati[roundCorrente].cycleTime;

    api.suggerimento("Premi 'COLPISCI!' quando la freccia è sul giallo.");

    api.arena.innerHTML = `
      <div class="bersaglio-round-info">Round ${roundCorrente + 1} / ${ROUND_BERSAGLIO}</div>
      <div class="bersaglio-container">
        <div class="bersaglio-barra">
          <div class="bersaglio-zona-centro"></div>
          <div class="bersaglio-cursore" id="bersaglio-cursore">▼</div>
        </div>
      </div>
      <button class="bersaglio-btn" id="bersaglio-btn">COLPISCI!</button>
      <div id="bersaglio-risultato" class="bersaglio-risultato"></div>
    `;

    const cursore = api.arena.querySelector("#bersaglio-cursore");
    const btn = api.arena.querySelector("#bersaglio-btn");
    const infoRound = api.arena.querySelector(".bersaglio-round-info");
    const risultato = api.arena.querySelector("#bersaglio-risultato");

    function muovi() {
      if (!inMovimento || concluso) return;
      const elapsed = Date.now() - startTime;
      
      const phase = (elapsed % cycleTime) / cycleTime; // da 0 a 1
      // Oscillazione sinusoidale per movimento fluido destra-sinistra
      const x = (Math.sin(phase * Math.PI * 2) + 1) / 2 * 100; // da 0 a 100
      
      cursore.style.left = x + "%";
      cursore.dataset.x = x;
      
      animFrame = requestAnimationFrame(muovi);
    }

    function avviaRound() {
      cycleTime = api.dati[roundCorrente].cycleTime;
      infoRound.textContent = \`Round \${roundCorrente + 1} / \${ROUND_BERSAGLIO}\`;
      risultato.textContent = "Preparati...";
      btn.disabled = false;
      startTime = Date.now();
      inMovimento = true;
      muovi();
    }

    btn.onclick = () => {
      if (!inMovimento || concluso) return;
      inMovimento = false;
      cancelAnimationFrame(animFrame);
      btn.disabled = true;

      const x = parseFloat(cursore.dataset.x);
      const distanza = Math.abs(x - 50); // Il centro è 50%
      
      // Calcolo punteggio: 
      // Se distanza = 0 -> 100 punti
      // La zona verde va dal 35% al 65% (distanza max 15 per i punti base)
      let puntiRound = 0;
      if (distanza <= 2) {
        puntiRound = 100; // Perfetto
      } else if (distanza <= 15) {
        // Scala da 90 a 10 punti proporzionalmente
        puntiRound = Math.round(90 - (distanza / 15) * 80);
      }
      
      punti += puntiRound;
      
      if (puntiRound === 100) {
        risultato.textContent = "PERFETTO! +100";
        risultato.style.color = "#ffeb3b";
      } else if (puntiRound > 0) {
        risultato.textContent = \`Colpito! +\${puntiRound}\`;
        risultato.style.color = "var(--primario)";
      } else {
        risultato.textContent = "Mancato! +0";
        risultato.style.color = "var(--avversario)";
      }
      
      setTimeout(() => {
        roundCorrente++;
        if (roundCorrente >= ROUND_BERSAGLIO) {
          concludi();
        } else {
          risultato.style.color = "var(--primario)";
          avviaRound();
        }
      }, 1200);
    };

    function concludi() {
      if (concluso) return;
      concluso = true;
      inMovimento = false;
      cancelAnimationFrame(animFrame);
      api.finito({ punti, dettaglio: punti + " punti" });
    }

    // Inizia un attimo dopo l'apertura dell'arena
    setTimeout(avviaRound, 500);

    return {
      scaduto: concludi,
      chiudi() { 
        inMovimento = false; 
        cancelAnimationFrame(animFrame); 
      }
    };
  }
});
