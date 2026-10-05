/* 🔴🔵🟢🟡 Simon Dice — ripeti la sequenza! */
GIOCHI.push({
  id: "simon",
  nome: "Simon Dice",
  icona: "🧠",
  desc: "Osserva la sequenza di colori e ripetila senza sbagliare.",
  regole: [
    "I bottoni si illumineranno in <b>sequenza</b>.",
    "Ripeti la sequenza <b>esatta</b>.",
    "Ogni turno la sequenza si allunga di uno.",
    "Un errore o tempo scaduto = eliminato."
  ],
  gara: true,
  solo: true,
  durata: 20, 
  
  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => {
      const seq = [];
      for (let i = 0; i < 8; i++) seq.push(Math.floor(Math.random() * 4));
      return { sequenza: seq };
    });
  },

  fantasma() {
    const score = Math.floor(Math.random() * 5) + 3; 
    return { punti: score * 100, dettaglio: `Memoria: ${score}`, tempo: score * 2 };
  },

  crea(api) {
    api.suggerimento("Guarda e ripeti!");
    
    api.arena.innerHTML = `
      <div class="simon-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 220px; margin: 0 auto;">
        <div id="sim-0" class="sim-btn" style="background: #ef4444; height: 100px; border-radius: 10px; cursor: pointer; transition: opacity 0.1s, transform 0.1s; box-shadow: 0 4px 0 #991b1b;"></div>
        <div id="sim-1" class="sim-btn" style="background: #3b82f6; height: 100px; border-radius: 10px; cursor: pointer; transition: opacity 0.1s, transform 0.1s; box-shadow: 0 4px 0 #1e40af;"></div>
        <div id="sim-2" class="sim-btn" style="background: #10b981; height: 100px; border-radius: 10px; cursor: pointer; transition: opacity 0.1s, transform 0.1s; box-shadow: 0 4px 0 #065f46;"></div>
        <div id="sim-3" class="sim-btn" style="background: #f59e0b; height: 100px; border-radius: 10px; cursor: pointer; transition: opacity 0.1s, transform 0.1s; box-shadow: 0 4px 0 #92400e;"></div>
      </div>
      <div id="sim-stato" style="margin-top: 20px; font-weight: bold; font-size: 1.2rem;">Fase: Osserva...</div>
    `;

    const btns = [
      api.arena.querySelector("#sim-0"),
      api.arena.querySelector("#sim-1"),
      api.arena.querySelector("#sim-2"),
      api.arena.querySelector("#sim-3")
    ];
    const stato = api.arena.querySelector("#sim-stato");
    
    const seq = api.dati.sequenza;
    let livello = 1; 
    let fase = "guarda"; 
    let indexCliccato = 0;
    let concluso = false;

    function illumina(btn, delay) {
      return new Promise(res => {
        setTimeout(() => {
          if (concluso) return res();
          btn.style.opacity = "0.3";
          btn.style.transform = "scale(0.95)";
          setTimeout(() => {
            btn.style.opacity = "1";
            btn.style.transform = "scale(1)";
            res();
          }, 350);
        }, delay);
      });
    }

    async function mostraSequenza() {
      fase = "guarda";
      stato.textContent = "Osserva...";
      indexCliccato = 0;
      
      await new Promise(r => setTimeout(r, 600));
      for (let i = 0; i < livello; i++) {
        if(concluso) return;
        await illumina(btns[seq[i]], 250);
      }
      if(concluso) return;
      
      fase = "gioca";
      stato.textContent = "Ora tocca a te!";
    }

    function checkClick(bIdx) {
      if (fase !== "gioca" || concluso) return;
      
      // Feedback visivo immediato
      btns[bIdx].style.opacity = "0.5";
      btns[bIdx].style.transform = "scale(0.95)";
      setTimeout(() => {
        btns[bIdx].style.opacity = "1";
        btns[bIdx].style.transform = "scale(1)";
      }, 150);

      if (bIdx !== seq[indexCliccato]) {
        // Sbagliato
        concluso = true;
        stato.textContent = "Errore!";
        api.finito({ punti: (livello - 1) * 125, dettaglio: `Sbagliato (Liv. ${livello})` });
        return;
      }

      indexCliccato++;
      api.avanzo((indexCliccato / seq.length) + (livello - 1)/seq.length * 0.1);

      if (indexCliccato === livello) {
        if (livello === seq.length) {
          concluso = true;
          stato.textContent = "Bravissimo!";
          api.finito({ punti: 1000, dettaglio: `Tutto esatto!` });
        } else {
          livello++;
          mostraSequenza();
        }
      }
    }

    btns.forEach((btn, idx) => {
      btn.addEventListener("click", () => checkClick(idx));
      // Supporto per il touch
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        checkClick(idx);
      }, {passive: false});
    });

    mostraSequenza();

    return {
      scaduto() {
        if (concluso) return;
        concluso = true;
        api.finito({ punti: (livello - 1) * 125, dettaglio: `Scaduto (Liv. ${livello})` });
      },
      chiudi() {
        concluso = true;
      }
    };
  }
});
