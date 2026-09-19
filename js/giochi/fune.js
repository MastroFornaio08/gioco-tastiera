GIOCHI.push({
  id: "fune",
  nome: "Tira alla Fune",
  icona: "🪢",
  desc: "Clicca (o tappa) il bottone il più velocemente possibile per 10 secondi!",
  regole: [
    "Premi ripetutamente il bottone gigante",
    "Hai solo 10 secondi",
    "Chi totalizza più clic vince!"
  ],
  gara: true,
  solo: true,
  durata: 10,
  generaPartita() {
    return Array.from({ length: MAX_ROUND }, () => ({}));
  },
  fantasma(dati) {
    return { punti: interoTra(45, 80), dettaglio: "—" };
  },
  crea(api) {
    let clickCount = 0;
    let clickPerSecond = 0;

    api.arena.innerHTML = `
      <div class="arena" style="justify-content: center;">
        <div style="font-size: 2rem; font-weight: 900; color: var(--primario); margin-bottom: 20px; text-shadow: 0 0 10px var(--primario);" id="fune-count">0 CLIC</div>
        <button class="btn btn-primary" id="fune-btn" style="font-size: 3rem; padding: 40px; border-radius: 50%; width: 200px; height: 200px; box-shadow: 0 0 30px var(--primario); outline: none; touch-action: manipulation;">
          TIRA!
        </button>
      </div>
    `;

    const btn = $("fune-btn");
    const countDisplay = $("fune-count");

    // Impedisce lo zoom su mobile facendo tap veloce
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault(); // prevents mouse emulation
      registraClick();
    }, {passive: false});

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      registraClick();
    });

    function registraClick() {
      if (btn.disabled) return;
      clickCount++;
      countDisplay.textContent = clickCount + " CLIC";
      
      // Feedback visivo immediato
      btn.style.transform = `scale(0.9)`;
      setTimeout(() => btn.style.transform = "scale(1)", 50);

      // Aggiorna la barra (usiamo max 100 per la grafica, ma non c'è un vero limite di punti)
      api.avanzo(Math.min(clickCount / 100, 1));
    }

    return {
      messaggio(m) {},
      scaduto() {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        api.finito({ punti: clickCount, dettaglio: clickCount + " clic" });
      },
      chiudi() {}
    };
  }
});
