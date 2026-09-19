GIOCHI.push({
  id: "inverso",
  nome: "Simon Inverso",
  icona: "🔄",
  desc: "Fai quello che ti viene detto, a meno che non ci sia scritto INVERSO!",
  regole: [
    "Appariranno un'istruzione (ROSSO o BLU) e due bottoni",
    "Clicca il bottone indicato",
    "Se in alto appare la scritta INVERSO, devi cliccare l'altro bottone!",
    "Massima velocità, 0 errori ammessi"
  ],
  gara: true,
  solo: true,
  durata: 15,
  generaPartita() {
    return Array.from({ length: MAX_ROUND }, () => {
      // 5-8 step per round
      const steps = [];
      for(let i=0; i<interoTra(6, 10); i++) {
        const colore = Math.random() < 0.5 ? "ROSSO" : "BLU";
        const inverso = Math.random() < 0.3; // 30% probabilità di inverso
        steps.push({ colore, inverso });
      }
      return { steps };
    });
  },
  fantasma(dati) {
    return { punti: interoTra(400, 800), dettaglio: "—", tempo: interoTra(4, 9) };
  },
  crea(api) {
    const steps = api.dati.steps;
    let curr = 0;
    let finito = false;
    let t0 = performance.now();

    api.arena.innerHTML = `
      <div class="arena" style="justify-content: center;">
        <div id="inv-mod" style="font-size: 1.5rem; font-weight: 900; height: 30px; margin-bottom: 5px; color: var(--oro); text-shadow: 0 0 10px var(--oro);"></div>
        <div id="inv-cmd" style="font-size: 3.5rem; font-weight: 900; margin-bottom: 20px; text-transform: uppercase;"></div>
        <div style="display: flex; gap: 20px;">
          <button class="btn btn-primary" id="inv-rosso" style="background: #ff4757; border-color: #ff4757; box-shadow: 0 0 20px #ff4757; font-size: 1.5rem; width: 120px; height: 100px;">ROSSO</button>
          <button class="btn btn-primary" id="inv-blu" style="background: #1e90ff; border-color: #1e90ff; box-shadow: 0 0 20px #1e90ff; font-size: 1.5rem; width: 120px; height: 100px;">BLU</button>
        </div>
      </div>
    `;

    const mod = $("inv-mod");
    const cmd = $("inv-cmd");
    const bRosso = $("inv-rosso");
    const bBlu = $("inv-blu");

    function mostraStep() {
      if (curr >= steps.length) {
        finito = true;
        const tempo = (performance.now() - t0) / 1000;
        let punti = Math.max(100, 1000 - (tempo * 80));
        api.finito({ punti: Math.round(punti), dettaglio: tempo.toFixed(1) + "s" });
        return;
      }
      const s = steps[curr];
      mod.textContent = s.inverso ? "INVERSO!" : "";
      cmd.textContent = s.colore;
      cmd.style.color = Math.random() < 0.5 ? "#ff4757" : "#1e90ff"; // colore testo casuale per confondere ulteriormente
      cmd.style.textShadow = `0 0 15px ${cmd.style.color}`;
    }

    function check(cliccato) {
      if (finito) return;
      const s = steps[curr];
      let corretto = s.colore;
      if (s.inverso) {
        corretto = (corretto === "ROSSO") ? "BLU" : "ROSSO";
      }

      if (cliccato === corretto) {
        curr++;
        api.avanzo(curr / steps.length);
        mostraStep();
      } else {
        finito = true;
        api.finito({ punti: 0, dettaglio: "Errore" });
      }
    }

    const mR = (e) => { e.preventDefault(); check("ROSSO"); };
    const mB = (e) => { e.preventDefault(); check("BLU"); };

    bRosso.addEventListener("mousedown", mR);
    bRosso.addEventListener("touchstart", mR, {passive: false});
    
    bBlu.addEventListener("mousedown", mB);
    bBlu.addEventListener("touchstart", mB, {passive: false});

    mostraStep();

    return {
      messaggio(m) {},
      scaduto() {
        if (finito) return;
        finito = true;
        api.finito({ punti: 0, dettaglio: "Scaduto" });
      },
      chiudi() {}
    };
  }
});
