/* ⚖️ Equilibrio — tieni in centro! */
GIOCHI.push({
  id: "equilibrio",
  nome: "Equilibrista",
  icona: "⚖️",
  desc: "Tieni il pallino in centro compensando il vento. Non farlo cadere nei bordi rossi!",
  regole: [
    "Il cursore cercherà di cadere verso i lati e il vento cambierà spesso.",
    "Usa le <kbd>Frecce ⬅️ ➡️</kbd> o i pulsanti a schermo per bilanciarlo.",
    "Se tocca il bordo rosso sei caduto.",
    "Resisti i 10 secondi interi per vincere!"
  ],
  gara: true,
  solo: true,
  durata: 10,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== 'undefined' ? MAX_ROUND : 3 }, () => ({
      ventoIniziale: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.3 + 0.3)
    }));
  },

  fantasma() {
    const time = Math.random() * 4 + 6; // 6 a 10 secondi
    return { punti: Math.floor((time/10) * 1000), dettaglio: `Caduto a ${time.toFixed(1)}s`, tempo: time };
  },

  crea(api) {
    api.suggerimento("Non farlo cadere!");

    api.arena.innerHTML = `
      <div style="width: 100%; height: 50px; background: #1e293b; border-radius: 25px; position: relative; overflow: hidden; border: 3px solid #334155; margin-top: 10px;">
        <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 8%; background: #ef4444; opacity: 0.8;"></div>
        <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 8%; background: #ef4444; opacity: 0.8;"></div>
        <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.2); transform: translateX(-50%);"></div>
        <div id="eq-ball" style="width: 30px; height: 30px; background: #10b981; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px #10b981;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 30px; gap: 10px;">
        <button id="eq-sx" class="btn" style="flex: 1; padding: 25px; font-size: 2rem; background: rgba(255,255,255,0.1);">⬅️</button>
        <button id="eq-dx" class="btn" style="flex: 1; padding: 25px; font-size: 2rem; background: rgba(255,255,255,0.1);">➡️</button>
      </div>
    `;

    const ball = api.arena.querySelector("#eq-ball");
    const btnSx = api.arena.querySelector("#eq-sx");
    const btnDx = api.arena.querySelector("#eq-dx");
    
    let pos = 50; 
    let velocity = api.dati.ventoIniziale;
    let concluso = false;
    let animFrame;
    let startTime = performance.now();

    function update() {
      if (concluso) return;
      
      const elapsed = (performance.now() - startTime) / 1000;
      
      // Vento casuale continuo
      velocity += (Math.random() - 0.5) * 0.15; 
      
      // Gravità: si accelera la caduta man mano che ci si allontana dal centro
      velocity += (pos - 50) * 0.005; 
      
      // Attrito (altrimenti schizza via)
      velocity *= 0.95; 

      pos += velocity;
      ball.style.left = Math.max(0, Math.min(pos, 100)) + "%";
      
      api.avanzo(elapsed / 10);
      
      if (pos <= 5 || pos >= 95) {
        cadi(elapsed);
        return;
      }
      
      animFrame = requestAnimationFrame(update);
    }
    
    animFrame = requestAnimationFrame(update);

    function spingi(verso) {
      if (concluso) return;
      velocity += verso * 3; // Impulso
    }

    function cadi(time) {
      concluso = true;
      ball.style.background = "#ef4444";
      ball.style.boxShadow = "none";
      const punti = Math.floor((time / 10) * 1000);
      api.finito({ punti, dettaglio: `Caduto a ${time.toFixed(1)}s` });
    }

    // Controlli touch/mouse
    const pressSx = (e) => { e.preventDefault(); spingi(-1); };
    const pressDx = (e) => { e.preventDefault(); spingi(1); };
    
    btnSx.addEventListener("touchstart", pressSx, {passive: false});
    btnSx.addEventListener("mousedown", pressSx);
    
    btnDx.addEventListener("touchstart", pressDx, {passive: false});
    btnDx.addEventListener("mousedown", pressDx);

    const keyHandler = (e) => {
      if (e.key === "ArrowLeft") spingi(-1);
      if (e.key === "ArrowRight") spingi(1);
    };
    document.addEventListener("keydown", keyHandler);

    return {
      scaduto() {
        if (concluso) return;
        concluso = true;
        cancelAnimationFrame(animFrame);
        api.finito({ punti: 1000, dettaglio: "Perfetto!" });
      },
      chiudi() {
        concluso = true;
        cancelAnimationFrame(animFrame);
        document.removeEventListener("keydown", keyHandler);
      }
    };
  }
});
