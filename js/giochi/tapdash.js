/* 👆 Tocca & Vai — gioco touch: tocca 12 bersagli più in fretta possibile. */
GIOCHI.push({
  id: "tapdash",
  nome: "Tocca & Vai",
  icona: "👆",
  desc: "Tocca dodici bersagli: ogni tap li sposta sullo schermo.",
  regole: [
    "Tocca il bersaglio colorato appena compare.",
    "Completa 12 tocchi nel minor tempo possibile.",
    "Funziona con un dito, mouse o trackpad."
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
    let chiuso = false;
    api.suggerimento("Tocca il disco colorato!");

    api.arena.innerHTML = `
      <div class="tapdash">
        <div class="tapdash-top"><span id="tapdash-count">0 / ${totale}</span><span>TOCCA!</span></div>
        <button id="tapdash-target" class="tapdash-target" aria-label="Tocca il bersaglio">✦</button>
      </div>
    `;

    const area = api.arena.querySelector(".tapdash");
    const target = api.arena.querySelector("#tapdash-target");
    const count = api.arena.querySelector("#tapdash-count");
    const colori = ["#ff557f", "#0c8cf0", "#ffc928", "#25c786", "#9a6cff"];

    function sposta() {
      const x = 10 + Math.random() * 72;
      const y = 18 + Math.random() * 60;
      target.style.left = x + "%";
      target.style.top = y + "%";
      target.style.background = colori[tocchi % colori.length];
    }

    function tocca(e) {
      e.preventDefault();
      if (chiuso) return;
      tocchi++;
      count.textContent = tocchi + " / " + totale;
      api.avanzo(tocchi / totale);
      if (window.Suoni) Suoni.playClick();
      if (tocchi >= totale) {
        chiuso = true;
        const tempo = api.tempo();
        const punti = Math.max(150, Math.round(1200 - tempo * 65));
        target.textContent = "✓";
        target.disabled = true;
        api.finito({ punti, dettaglio: "12 tocchi", tempo });
      } else {
        sposta();
      }
    }

    target.addEventListener("click", tocca);
    target.addEventListener("touchstart", tocca, { passive: false });
    sposta();

    return {
      scaduto() {
        if (chiuso) return;
        chiuso = true;
        api.finito({ punti: tocchi * 70, dettaglio: tocchi + " tocchi" });
      },
      chiudi() { chiuso = true; }
    };
  }
});
