/* 🚦 Riflessi — il semaforo diventa verde a tradimento: clicca per primo.
   Partire prima è la tentazione, e costa il round. */

GIOCHI.push({
  id: "riflessi",
  nome: "Riflessi",
  icona: "🚦",
  desc: "Aspetta il verde e colpisci. Chi parte in anticipo brucia il round.",
  regole: [
    "Il semaforo diventa verde dopo un'attesa <b>imprevedibile</b>.",
    "Punti = <b>1000 meno i millisecondi</b> di reazione.",
    "Cliccare sul rosso è <b>partenza falsa</b>: zero punti.",
    "Vale anche la <kbd>barra spaziatrice</kbd>."
  ],
  gara: true,
  solo: true,
  durata: 15,

  generaPartita() {
    // attese diverse a ogni round, così non si impara il ritmo
    return Array.from({ length: MAX_ROUND }, () => ({ attesa: interoTra(1400, 5200) }));
  },

  fantasma() {
    const ms = interoTra(190, 420);
    return { punti: Math.max(0, 1000 - ms), dettaglio: ms + " ms", tempo: 3 };
  },

  crea(api) {
    api.suggerimento("Non cliccare finché non diventa verde.");
    api.arena.innerHTML =
      "<div class='semaforo rosso' id='semaforo'>" +
      "<div class='sem-testo' id='sem-testo'>Aspetta…</div></div>";

    const sem = api.arena.querySelector("#semaforo");
    const testo = api.arena.querySelector("#sem-testo");
    let verdeA = 0;
    let concluso = false;

    const timer = setTimeout(() => {
      verdeA = performance.now();
      sem.classList.remove("rosso");
      sem.classList.add("verde");
      testo.textContent = "ORA!";
      api.avanzo(0.5);
    }, api.dati.attesa);

    function colpisci() {
      if (concluso) return;
      concluso = true;
      clearTimeout(timer);

      if (!verdeA) {
        sem.classList.remove("rosso");
        sem.classList.add("falsa");
        testo.textContent = "Partenza falsa!";
        api.avanzo(1);
        api.finito({ punti: 0, dettaglio: "partenza falsa" });
        return;
      }

      const ms = Math.round(performance.now() - verdeA);
      testo.textContent = ms + " ms";
      api.avanzo(1);
      api.finito({ punti: Math.max(0, 1000 - ms), dettaglio: ms + " ms" });
    }

    const tasto = (e) => {
      if (e.code === "Space" || e.key === " ") { e.preventDefault(); colpisci(); }
    };
    sem.addEventListener("click", colpisci);
    document.addEventListener("keydown", tasto);

    return {
      scaduto() {
        if (concluso) return;
        concluso = true;
        clearTimeout(timer);
        testo.textContent = "Troppo lento";
        api.finito({ punti: 0, dettaglio: "nessuna reazione" });
      },
      chiudi() {
        clearTimeout(timer);
        document.removeEventListener("keydown", tasto);
      }
    };
  }
});
