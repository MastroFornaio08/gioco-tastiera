/* 🎯 Bersagli — quindici secondi, bersagli che compaiono e svaniscono.
   I due giocatori vedono comparire gli stessi bersagli negli stessi istanti. */

const DURATA_BERSAGLI = 15;

GIOCHI.push({
  id: "bersagli",
  nome: "Bersagli",
  icona: "🎯",
  desc: "Colpisci più bersagli che puoi prima che svaniscano.",
  regole: [
    "Quindici secondi fissi: il round non finisce prima.",
    "Ogni bersaglio colpito vale <b>70 punti</b>, quelli d'oro <b>150</b>.",
    "I bersagli svaniscono da soli: più tardi li prendi, più si rimpiccioliscono.",
    "Entrambi vedete <b>gli stessi bersagli</b> negli stessi istanti."
  ],
  gara: true,
  bonusPrimo: false,   // dura sempre 15 secondi: nessuno "arriva primo"
  solo: true,
  durata: DURATA_BERSAGLI + 3,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      // round dopo round: più bersagli, vita più breve
      const quanti = 14 + r * 4;
      const vita = 1500 - r * 170;
      const passo = (DURATA_BERSAGLI * 1000 - 600) / quanti;
      return {
        vita,
        bersagli: Array.from({ length: quanti }, (_, i) => ({
          t: Math.round(300 + i * passo + interoTra(-120, 120)),
          x: interoTra(6, 94),
          y: interoTra(10, 90),
          oro: Math.random() < 0.18
        }))
      };
    });
  },

  fantasma(dati) {
    const presi = interoTra(Math.round(dati.bersagli.length * 0.35),
                            Math.round(dati.bersagli.length * 0.85));
    return {
      punti: presi * 80,
      dettaglio: presi + " bersagli",
      tempo: DURATA_BERSAGLI
    };
  },

  crea(api) {
    const { bersagli, vita } = api.dati;
    api.suggerimento("Colpisci tutto quello che compare.");

    api.arena.innerHTML = "<div class='campo' id='campo'></div>";
    const campo = api.arena.querySelector("#campo");

    let presi = 0, punti = 0, concluso = false;
    const timers = [];

    bersagli.forEach(b => {
      timers.push(setTimeout(() => {
        if (concluso) return;
        const el = document.createElement("button");
        el.className = "bersaglio" + (b.oro ? " oro" : "");
        el.style.left = b.x + "%";
        el.style.top = b.y + "%";
        el.style.setProperty("--vita", vita + "ms");
        el.textContent = b.oro ? "★" : "●";

        el.onclick = (e) => {
          e.stopPropagation();
          if (concluso || el.classList.contains("colpito")) return;
          el.classList.add("colpito");
          presi++;
          punti += b.oro ? 150 : 70;
          api.avanzo(presi / bersagli.length);
          setTimeout(() => el.remove(), 180);
        };

        campo.appendChild(el);
        timers.push(setTimeout(() => el.remove(), vita));
      }, b.t));
    });

    function concludi() {
      if (concluso) return;
      concluso = true;
      campo.innerHTML = "";
      api.finito({ punti, dettaglio: presi + " bersagli" });
    }

    timers.push(setTimeout(concludi, DURATA_BERSAGLI * 1000));

    return {
      scaduto: concludi,
      chiudi() { timers.forEach(clearTimeout); }
    };
  }
});
