/* ⏱️ Cronometro — ferma il timer esatto! */
GIOCHI.push({
  id: "cronometro",
  nome: "Spaccasecondo",
  icona: "⏱️",
  desc: "Ferma il timer il più vicino possibile all'obiettivo al buio.",
  regole: [
    "Un timer inizierà a scorrere e poi <b>si nasconderà</b>.",
    "Il tuo obiettivo è fermarlo <b>esattamente</b> al tempo richiesto.",
    "Più sei vicino al tempo, più punti guadagni.",
    "Puoi premere la <kbd>Barra Spaziatrice</kbd> o cliccare lo schermo."
  ],
  gara: true,
  solo: true,
  durata: 15,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => {
      // Obiettivo tra 3.0 e 7.0 secondi
      return { target: (Math.floor(Math.random() * 40) + 30) / 10 }; 
    });
  },

  fantasma() {
    const error = Math.random() * 0.6; // Errore da 0 a 0.6s
    const score = Math.max(0, 1000 - Math.floor(error * 1500));
    return { punti: score, dettaglio: `Err: ${(error).toFixed(2)}s`, tempo: 5 };
  },

  crea(api) {
    const target = api.dati.target;
    api.suggerimento(`Ferma a ${target.toFixed(2)} secondi!`);

    api.arena.innerHTML = `
      <div style="font-size: 1.5rem; margin-bottom: 10px;">Obiettivo: <strong style="color: #ff3b6b;">${target.toFixed(2)}s</strong></div>
      <div id="chrono-display" style="font-size: 5rem; font-family: monospace; font-weight: bold; margin: 20px 0;">0.00</div>
      <button id="chrono-btn" class="btn btn-primary" style="width: 100%; font-size: 1.5rem; padding: 15px;">STOP</button>
    `;

    const display = api.arena.querySelector("#chrono-display");
    const btn = api.arena.querySelector("#chrono-btn");
    
    let startTime = performance.now();
    let concluso = false;
    let animFrame;

    function update() {
      if (concluso) return;
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      
      // Dopo 1.5 secondi, nascondi il testo per rendere più difficile
      if (elapsed < 1.5) {
        display.textContent = elapsed.toFixed(2);
      } else {
        display.textContent = "?.??";
      }
      
      animFrame = requestAnimationFrame(update);
    }
    
    animFrame = requestAnimationFrame(update);

    function ferma() {
      if (concluso) return;
      concluso = true;
      cancelAnimationFrame(animFrame);
      
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      display.textContent = elapsed.toFixed(2);
      
      const errore = Math.abs(target - elapsed);
      const diffStr = (elapsed > target ? "+" : "-") + errore.toFixed(2) + "s";
      
      // Punteggio: 1000 punti perfetti. Perdi punti in base all'errore. (1s di errore = 0 punti)
      const punti = Math.max(0, Math.floor(1000 - (errore * 1000)));
      
      if (errore < 0.05) {
        display.style.color = "#10b981"; // Verde (perfetto)
      } else if (errore < 0.3) {
        display.style.color = "#f59e0b"; // Giallo
      } else {
        display.style.color = "#ef4444"; // Rosso
      }
      
      api.avanzo(1);
      api.finito({ punti, dettaglio: diffStr });
    }

    btn.addEventListener("click", ferma);
    // Supporto per il touch
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      ferma();
    }, {passive: false});
    
    const keyHandler = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        ferma();
      }
    };
    document.addEventListener("keydown", keyHandler);

    return {
      scaduto() {
        if (concluso) return;
        concluso = true;
        cancelAnimationFrame(animFrame);
        api.finito({ punti: 0, dettaglio: "Tempo scaduto" });
      },
      chiudi() {
        concluso = true;
        cancelAnimationFrame(animFrame);
        document.removeEventListener("keydown", keyHandler);
      }
    };
  }
});
