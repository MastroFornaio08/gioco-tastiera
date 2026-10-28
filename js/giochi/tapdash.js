/* 👆 Tocca & Vai — gioco touch: combo e bersagli bonus. */
GIOCHI.push({
  id: "tapdash",
  nome: "Tocca & Vai",
  icona: "👆",
  desc: "Fai combo e colpisci i bersagli bonus prima che scappino.",
  regole: [
    "Tocca il bersaglio colorato appena compare.",
    "Ogni quarto bersaglio vale punti bonus.",
    "Mantieni il ritmo: una combo veloce aumenta il punteggio."
  ],
  gara: true,
  solo: true,
  durata: 18,

  generaPartita() {
    return Array.from({ length: typeof MAX_ROUND !== "undefined" ? MAX_ROUND : 3 }, () => ({}));
  },

  fantasma() {
    const secondi = 7 + Math.random() * 4;
    return { punti: Math.round(900 - secondi * 55), dettaglio: "12 tocchi", tempo: secondi };
  },

  crea(api) {
    const totale = 12;
    let tocchi = 0;
    let bonus = 0;
    let combo = 0;
    let ultimoTocco = -Infinity;
    let chiuso = false;
    api.suggerimento("Tocca i bersagli bonus e mantieni la combo!");

    api.arena.innerHTML = `
      <div class="tapdash">
        <div class="tapdash-top">
          <span id="tapdash-count">0 / ${totale}</span>
          <span id="tapdash-combo">COMBO x1</span>
        </div>
        <div id="tapdash-hint" aria-live="polite">TOCCA!</div>
        <button id="tapdash-target" class="tapdash-target" aria-label="Tocca il bersaglio">✦</button>
      </div>
    `;

    const area = api.arena.querySelector(".tapdash");
    const target = api.arena.querySelector("#tapdash-target");
    const count = api.arena.querySelector("#tapdash-count");
    const comboLabel = api.arena.querySelector("#tapdash-combo");
    const hint = api.arena.querySelector("#tapdash-hint");
    const colori = ["#ff557f", "#0c8cf0", "#ffc928", "#25c786", "#9a6cff"];

    function sposta() {
      const x = 10 + Math.random() * 72;
      const y = 24 + Math.random() * 54;
      const prossimo = tocchi + 1;
      const isBonus = prossimo % 4 === 0;
      target.style.left = x + "%";
      target.style.top = y + "%";
      target.style.background = isBonus ? "#ffb800" : colori[tocchi % colori.length];
      target.textContent = isBonus ? "★" : "✦";
      target.setAttribute("aria-label", isBonus ? "Tocca il bersaglio bonus" : "Tocca il bersaglio");
      hint.textContent = isBonus ? "BERSAGLIO BONUS +120" : "TOCCA!";
      hint.style.color = isBonus ? "#ffb800" : "";
    }

    function tocca(e) {
      e.preventDefault();
      if (chiuso) return;
      const adesso = api.tempo();
      combo = adesso - ultimoTocco <= 1.35 ? combo + 1 : 1;
      ultimoTocco = adesso;
      if ((tocchi + 1) % 4 === 0) bonus++;
      tocchi++;
      count.textContent = tocchi + " / " + totale;
      comboLabel.textContent = "COMBO x" + Math.min(combo, 5);
      api.avanzo(tocchi / totale);
      if (window.Suoni) Suoni.playClick();
      if (tocchi >= totale) {
        chiuso = true;
        const tempo = api.tempo();
        const puntiCombo = Math.min(combo, 5) * 25;
        const punti = Math.max(150, Math.round(1200 - tempo * 65) + bonus * 120 + puntiCombo);
        target.textContent = "✓";
        target.disabled = true;
        hint.textContent = "BONUS: +" + (bonus * 120);
        api.finito({ punti, dettaglio: "12 tocchi · " + bonus + " bonus · combo x" + Math.min(combo, 5), tempo });
      } else {
        sposta();
      }
    }

    target.addEventListener("click", tocca);
    sposta();

    return {
      scaduto() {
        if (chiuso) return;
        chiuso = true;
        api.finito({ punti: tocchi * 70 + bonus * 120, dettaglio: tocchi + " tocchi · " + bonus + " bonus" });
      },
      chiudi() { chiuso = true; }
    };
  }
});
