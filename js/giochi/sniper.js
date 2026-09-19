GIOCHI.push({
  id: "sniper",
  nome: "Tiro al Bersaglio",
  icona: "🎯",
  desc: "Ferma l'indicatore esattamente al centro della zona verde!",
  regole: [
    "Un cursore si muove velocemente da destra a sinistra",
    "Clicca/tappa per fermarlo quando è al centro esatto",
    "Più sei preciso, più punti fai (massimo 100 per round)"
  ],
  gara: true, // we want bars, but maybe points? It's fine.
  solo: true,
  durata: 10,
  generaPartita() {
    // La velocità aumenta man mano che i round avanzano
    return Array.from({ length: MAX_ROUND }, (_, i) => ({
      velocita: 1500 - (i * 200) // MS per un giro completo
    }));
  },
  fantasma(dati) {
    // il fantasma fa da 50 a 95 punti, finisce in 2-5 secondi
    return { punti: interoTra(50, 95), dettaglio: "—", tempo: interoTra(2, 5) };
  },
  crea(api) {
    let fermato = false;
    let t0 = performance.now();
    const durata = api.dati.velocita;

    api.arena.innerHTML = `
      <div class="arena" id="sniper-arena" style="cursor: crosshair; justify-content: center; user-select: none;">
        <div style="width: 100%; max-width: 400px; height: 50px; background: rgba(255,255,255,0.05); border: 2px solid var(--linea); border-radius: 25px; position: relative; overflow: hidden;">
          <!-- Zona verde centrale -->
          <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 40px; transform: translateX(-50%); background: rgba(46, 213, 115, 0.3); border-left: 2px dashed var(--successo); border-right: 2px dashed var(--successo);"></div>
          
          <!-- Il cursore (mirino) -->
          <div id="sniper-cur" style="position: absolute; left: 0%; top: -5px; bottom: -5px; width: 6px; background: var(--primario); box-shadow: 0 0 15px var(--primario); border-radius: 3px;"></div>
        </div>
        <div id="sniper-msg" style="margin-top: 20px; font-size: 1.5rem; font-weight: 900; height: 30px;">Tappa per fermare!</div>
      </div>
    `;

    const cur = $("sniper-cur");
    const msg = $("sniper-msg");
    const arena = $("sniper-arena");
    let anim;

    function loop() {
      if (fermato) return;
      const t = performance.now() - t0;
      // Oscillazione triangolare 0 -> 100 -> 0
      const prog = (t % durata) / durata; 
      let pos = prog * 200;
      if (pos > 100) pos = 200 - pos;
      
      cur.style.left = pos + "%";
      anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);

    function ferma() {
      if (fermato) return;
      fermato = true;
      cancelAnimationFrame(anim);
      
      const px = parseFloat(cur.style.left);
      // Il centro esatto è 50%. Distanza massima = 50.
      const dist = Math.abs(50 - px);
      
      // Calcolo punti: centro esatto = 100, bordo = 0
      let punti = Math.max(0, 100 - (dist * 2.5));
      punti = Math.round(punti);

      if (dist < 2) {
        msg.textContent = "CENTRO PERFETTO!";
        msg.style.color = "var(--successo)";
        punti = 100;
      } else if (dist < 10) {
        msg.textContent = "OTTIMO!";
        msg.style.color = "var(--primario)";
      } else {
        msg.textContent = "Lontano...";
        msg.style.color = "var(--errore)";
      }

      cur.style.boxShadow = "0 0 30px white";
      cur.style.background = "white";

      setTimeout(() => {
        api.finito({ punti, dettaglio: punti + " pt" });
      }, 1000); // 1 secondo di pausa per vedere il risultato
    }

    arena.addEventListener('mousedown', ferma);
    arena.addEventListener('touchstart', (e) => { e.preventDefault(); ferma(); }, {passive: false});

    return {
      messaggio(m) {},
      scaduto() {
        if (!fermato) {
          fermato = true;
          cancelAnimationFrame(anim);
          api.finito({ punti: 0, dettaglio: "Scaduto" });
        }
      },
      chiudi() {
        fermato = true;
        cancelAnimationFrame(anim);
      }
    };
  }
});
