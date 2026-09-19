GIOCHI.push({
  id: "fotografica",
  nome: "Memoria Fotografica",
  icona: "🧠",
  desc: "Memorizza le celle illuminate e ricliccale velocemente!",
  regole: [
    "Apparirà una griglia 5x5",
    "Alcune celle si illumineranno per un solo secondo",
    "Cliccale tutte senza sbagliare, il più in fretta possibile!"
  ],
  gara: true,
  solo: true,
  durata: 15,
  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      // number of cells increases per round
      const celle = 5 + r; 
      const indici = [];
      while(indici.length < celle) {
        let n = interoTra(0, 24);
        if(!indici.includes(n)) indici.push(n);
      }
      return { indici };
    });
  },
  fantasma(dati) {
    return { punti: interoTra(300, 600), dettaglio: "—", tempo: interoTra(4, 8) };
  },
  crea(api) {
    const bersagli = api.dati.indici;
    let cliccati = 0;
    let fase = 0; // 0=attesa/memorizza, 1=gioca
    let t0 = performance.now();
    let errori = 0;

    api.arena.innerHTML = `
      <div class="arena" style="justify-content: center; user-select: none;">
        <div id="foto-msg" style="font-size: 1.2rem; font-weight: 900; color: var(--primario); margin-bottom: 10px; height: 24px;">MEMORIZZA...</div>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%; max-width: 320px;" id="foto-grid">
          ${Array.from({length: 25}, (_, i) => `<div class="foto-cella" data-idx="${i}" style="aspect-ratio: 1; background: rgba(255,255,255,0.05); border: 2px solid var(--linea); border-radius: 8px; cursor: pointer; transition: all 0.2s;"></div>`).join("")}
        </div>
      </div>
    `;

    const grid = $("foto-grid");
    const msg = $("foto-msg");
    const celle = grid.querySelectorAll(".foto-cella");

    // Mostra le celle per 1.5 secondi
    bersagli.forEach(idx => {
      celle[idx].style.background = "var(--primario)";
      celle[idx].style.boxShadow = "0 0 15px var(--primario)";
      celle[idx].style.borderColor = "#fff";
    });

    const timeoutMemoria = setTimeout(() => {
      fase = 1;
      msg.textContent = "RIPETI!";
      msg.style.color = "var(--testo)";
      t0 = performance.now();
      
      // Nascondi tutto
      celle.forEach(c => {
        c.style.background = "rgba(255,255,255,0.05)";
        c.style.boxShadow = "none";
        c.style.borderColor = "var(--linea)";
      });
    }, 1500);

    celle.forEach(c => {
      const aziona = (e) => {
        if(e) e.preventDefault();
        if (fase !== 1) return;
        const idx = parseInt(c.dataset.idx);
        if (c.dataset.premuto) return;
        c.dataset.premuto = "1";

        if (bersagli.includes(idx)) {
          // Corretto
          c.style.background = "var(--successo)";
          c.style.boxShadow = "0 0 15px var(--successo)";
          c.style.borderColor = "#fff";
          cliccati++;
          api.avanzo(cliccati / bersagli.length);
          
          if (cliccati === bersagli.length) {
            fase = 2; // finito
            msg.textContent = "COMPLETATO!";
            const tempo = (performance.now() - t0) / 1000;
            let punti = Math.max(100, 1000 - (tempo * 100) - (errori * 200));
            punti = Math.round(punti);
            setTimeout(() => api.finito({ punti, dettaglio: tempo.toFixed(1) + "s" }), 500);
          }
        } else {
          // Errato
          errori++;
          c.style.background = "var(--errore)";
          c.style.boxShadow = "0 0 15px var(--errore)";
          c.style.borderColor = "#fff";
          // animazione shake su msg
          msg.textContent = "ERRORE!";
          msg.style.color = "var(--errore)";
          setTimeout(() => {
             if (fase === 1) { msg.textContent = "RIPETI!"; msg.style.color = "var(--testo)"; }
          }, 500);
        }
      };
      c.addEventListener("mousedown", aziona);
      c.addEventListener("touchstart", aziona, {passive: false});
    });

    return {
      messaggio(m) {},
      scaduto() {
        if (fase === 2) return;
        fase = 2;
        api.finito({ punti: 0, dettaglio: "Scaduto" });
      },
      chiudi() {
        clearTimeout(timeoutMemoria);
      }
    };
  }
});
