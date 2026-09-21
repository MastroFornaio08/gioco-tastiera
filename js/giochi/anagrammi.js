/* 🔤 Anagrammi — tre parole italiane con le lettere rimescolate. */

GIOCHI.push({
  id: "anagrammi",
  nome: "Anagrammi",
  icona: "🔤",
  desc: "Rimetti in ordine le lettere e ricostruisci la parola.",
  regole: [
    "Tre parole per round, sempre più lunghe.",
    "Ogni parola indovinata vale <b>250 punti</b>.",
    "Se le prendi tutte e tre scatta il bonus di velocità.",
    "<kbd>Invio</kbd> conferma, il tasto <b>Passo</b> rinuncia alla parola."
  ],
  gara: true,
  solo: true,
  durata: 90,

  generaPartita() {
    const fasce = fasceScalate(MAX_ROUND);
    const usate = new Set();
    return fasce.map(fascia => ({
      parole: Array.from({ length: 3 }, () => {
        let p;
        do { p = scegli(PAROLE[fascia]); } while (usate.has(p));
        usate.add(p);
        return { parola: p, mescolata: mescolaLettere(p) };
      })
    }));
  },

  fantasma() {
    const prese = interoTra(1, 3);
    const tempo = interoTra(18, 55);
    let punti = prese * 250;
    if (prese === 3) punti += Math.max(0, Math.round(350 - tempo * 5));
    return { punti, dettaglio: prese + "/3 parole", tempo };
  },

  crea(api) {
    const parole = api.dati.parole;
    api.suggerimento("Scrivi la parola e premi <kbd>Invio</kbd>.");

    api.arena.innerHTML =
      "<div class='ana-conta' id='ana-conta'></div>" +
      "<div class='ana-lettere' id='ana-lettere'></div>" +
      "<input id='ana-input' class='calc-input' autocomplete='off' spellcheck='false' " +
      "autocapitalize='off' aria-label='Parola'>" +
      "<div class='calc-esiti' id='ana-esiti'></div>" +
      "<button class='btn btn-small btn-ghost' id='ana-passo'>Passo</button>";

    const elConta = api.arena.querySelector("#ana-conta");
    const elLettere = api.arena.querySelector("#ana-lettere");
    const input = api.arena.querySelector("#ana-input");
    const elEsiti = api.arena.querySelector("#ana-esiti");

    let i = 0, prese = 0;
    const esiti = [];
    input.focus();

    function disegna() {
      elConta.textContent = "Parola " + (i + 1) + " di " + parole.length;
      elLettere.innerHTML = parole[i].mescolata.split("")
        .map(l => "<span class='ana-l'>" + fuggiHtml(l) + "</span>").join("");
      elEsiti.innerHTML = esiti.map(e => "<span class='" + (e ? "giusto" : "sbagliato") + "'>" +
        (e ? "✓" : "✗") + "</span>").join("");
      api.avanzo(i / parole.length);
    }

    function avanti(preso) {
      if (preso) prese++;
      esiti.push(preso);
      input.value = "";
      i++;
      if (i >= parole.length) { concludi(); return; }
      disegna();
    }

    function conferma() {
      const dato = input.value.trim().toLowerCase();
      if (!dato) return;
      if (dato === parole[i].parola) {
        avanti(true);
      } else {
        elLettere.classList.add("scossa");
        setTimeout(() => elLettere.classList.remove("scossa"), 300);
      }
    }

    function concludi() {
      const tempo = api.tempo();
      let punti = prese * 250;
      if (prese === parole.length) punti += Math.max(0, Math.round(350 - tempo * 5));
      input.disabled = true;
      api.avanzo(1);
      api.finito({ punti, dettaglio: prese + "/" + parole.length + " parole" });
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); conferma(); }
    });
    api.arena.querySelector("#ana-passo").onclick = () => avanti(false);

    disegna();
    return { scaduto: concludi };
  }
});
