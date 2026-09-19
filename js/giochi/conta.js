GIOCHI.push({
  id: "conta",
  nome: "Conta-Oggetti",
  icona: "🍎",
  desc: "Conta a vista quanti oggetti specifici ci sono sullo schermo!",
  regole: [
    "Apparirà un mucchio caotico di emoji",
    "Ti verrà chiesto di contare una specifica emoji",
    "Usa la tastiera per digitare il numero esatto, e premi Invio!",
    "Più sei veloce, più punti fai (se indovini)"
  ],
  gara: true,
  solo: true,
  durata: 20,
  generaPartita() {
    const emojis = ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🍩", "🍕", "🍔"];
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      // 3 tipi di emoji
      const pool = [...emojis].sort(() => 0.5 - Math.random()).slice(0, 3);
      const target = pool[0];
      const countTarget = interoTra(5 + r, 12 + r*2);
      const distrattori = [];
      for(let i=0; i<interoTra(10+r*2, 20+r*3); i++) {
        distrattori.push(pool[1]);
      }
      for(let i=0; i<interoTra(10+r*2, 20+r*3); i++) {
        distrattori.push(pool[2]);
      }
      const tutto = Array(countTarget).fill(target).concat(distrattori);
      tutto.sort(() => 0.5 - Math.random());
      
      // per ogni emoji generiamo una pos x/y e rotazione
      const renderList = tutto.map(e => ({
        char: e,
        x: interoTra(5, 85),
        y: interoTra(5, 85),
        rot: interoTra(-45, 45),
        size: interoTra(15, 30) // fontSize in px
      }));

      return { target, countTarget, renderList };
    });
  },
  fantasma(dati) {
    return { punti: interoTra(300, 800), dettaglio: "—", tempo: interoTra(5, 12) };
  },
  crea(api) {
    let finito = false;
    let t0 = performance.now();
    const d = api.dati;

    api.arena.innerHTML = `
      <div class="arena" style="flex-direction: column;">
        <div style="font-size: 1.2rem; font-weight: 900; color: var(--testo); margin-bottom: 10px;">Quanti <span style="font-size:2rem; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));">${d.target}</span> ci sono?</div>
        
        <div style="position: relative; width: 100%; height: 200px; background: rgba(0,0,0,0.5); border: 2px solid var(--linea); border-radius: var(--raggio-sm); overflow: hidden; margin-bottom: 15px;">
          ${d.renderList.map(e => `<div style="position: absolute; left: ${e.x}%; top: ${e.y}%; font-size: ${e.size}px; transform: rotate(${e.rot}deg); user-select: none;">${e.char}</div>`).join("")}
        </div>

        <input type="number" id="conta-input" class="typer" placeholder="Scrivi il numero..." style="width: 200px;">
      </div>
    `;

    const input = $("conta-input");
    setTimeout(() => input.focus(), 100);

    input.onkeydown = (e) => {
      if (finito) return;
      if (e.key === "Enter") {
        const val = parseInt(input.value);
        if (isNaN(val)) return;
        finito = true;
        input.disabled = true;

        const tempo = (performance.now() - t0) / 1000;
        
        if (val === d.countTarget) {
          input.style.borderColor = "var(--successo)";
          input.style.boxShadow = "0 0 20px var(--successo)";
          let punti = Math.max(100, 1000 - (tempo * 50));
          api.finito({ punti: Math.round(punti), dettaglio: tempo.toFixed(1) + "s" });
        } else {
          input.style.borderColor = "var(--errore)";
          input.style.boxShadow = "0 0 20px var(--errore)";
          // Mostra il numero corretto
          input.value = "Era " + d.countTarget + "!";
          api.finito({ punti: 0, dettaglio: "Errato" });
        }
      }
    };

    return {
      messaggio(m) {},
      scaduto() {
        if (finito) return;
        finito = true;
        input.disabled = true;
        api.finito({ punti: 0, dettaglio: "Scaduto" });
      },
      chiudi() {}
    };
  }
});
