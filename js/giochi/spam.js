/* 👆 Spam Clic — premi più veloce che puoi! */
GIOCHI.push({
  id: "spam",
  nome: "Tritadita",
  icona: "⚡",
  desc: "Premi il bottone (o la barra spaziatrice) il maggior numero di volte possibile.",
  regole: [
    "Hai <b>6 secondi</b> di tempo.",
    "Premi il pulsante rosso più velocemente che puoi.",
    "Più clic fai, più punti guadagni!"
  ],
  gara: true,
  solo: true,
  durata: 6,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => ({}));
  },

  fantasma() {
    const score = Math.floor(Math.random() * 20) + 35; // 35-55 click
    return { punti: score * 18, dettaglio: `${score} clic`, tempo: 6 };
  },

  crea(api) {
    api.suggerimento("Spamma il bottone!");

    api.arena.innerHTML = `
      <div id="spam-counter" style="font-size: 5rem; font-weight: bold; color: #ff3b6b; margin-bottom: 20px; transition: transform 0.05s;">0</div>
      <button id="spam-btn" style="width: 150px; height: 150px; border-radius: 50%; font-size: 2rem; box-shadow: 0 10px 0 #991b1b; background: #ef4444; border: none; cursor: pointer; transition: transform 0.05s, box-shadow 0.05s; user-select: none; color: white; font-weight: bold;">CLICCA!</button>
    `;

    const counter = api.arena.querySelector("#spam-counter");
    const btn = api.arena.querySelector("#spam-btn");
    
    let clic = 0;
    let concluso = false;

    function premi() {
      if (concluso) return;
      clic++;
      counter.textContent = clic;
      
      // Feedback visivo contatore
      counter.style.transform = "scale(1.1)";
      setTimeout(() => counter.style.transform = "scale(1)", 50);

      // Feedback visivo bottone
      btn.style.transform = "translateY(5px)";
      btn.style.boxShadow = "0 5px 0 #991b1b";
      
      setTimeout(() => {
        if (!concluso) {
          btn.style.transform = "translateY(0)";
          btn.style.boxShadow = "0 10px 0 #991b1b";
        }
      }, 50);
      
      api.avanzo(Math.min(clic / 60, 1));
    }

    btn.addEventListener("click", premi);
    
    // Supporto touch
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Previene il doppio tap zoom o click
      for (let i = 0; i < e.changedTouches.length; i++) premi();
    }, {passive: false});

    const keyHandler = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if(!e.repeat) premi(); // Evita l'auto-spam tenendo premuto
      }
    };
    document.addEventListener("keydown", keyHandler);

    return {
      scaduto() {
        if (concluso) return;
        concluso = true;
        
        // Punteggio: 18 punti per clic, cap 1000 punti (~55 clic).
        const punti = Math.min(1000, clic * 18);
        api.finito({ punti, dettaglio: `${clic} clic` });
      },
      chiudi() {
        concluso = true;
        document.removeEventListener("keydown", keyHandler);
      }
    };
  }
});
