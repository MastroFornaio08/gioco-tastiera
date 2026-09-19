/* 🔢 Calcolo Lampo — sei operazioni a testa, il più in fretta possibile.
   Le operazioni si fanno più cattive round dopo round. */

GIOCHI.push({
  id: "calcolo",
  nome: "Calcolo Lampo",
  icona: "🔢",
  desc: "Sei operazioni da risolvere a mente, contro il cronometro.",
  regole: [
    "Digita il risultato e premi <kbd>Invio</kbd>.",
    "Ogni risposta esatta vale <b>140 punti</b>.",
    "Se le azzecchi <b>tutte e sei</b> scatta un bonus di velocità.",
    "Gli sbagli non si possono correggere: si passa alla successiva."
  ],
  gara: true,
  solo: true,
  durata: 75,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => ({
      operazioni: Array.from({ length: 6 }, () => operazione(r))
    }));
  },

  fantasma(dati) {
    const corrette = interoTra(3, 6);
    const tempo = interoTra(16, 40);
    let punti = corrette * 140;
    if (corrette === 6) punti += Math.max(0, Math.round(300 - tempo * 10));
    return { punti, dettaglio: corrette + "/6 esatte", tempo };
  },

  crea(api) {
    const ops = api.dati.operazioni;
    api.suggerimento("Scrivi il risultato e premi <kbd>Invio</kbd>.");

    api.arena.innerHTML =
      "<div class='calc-conta' id='calc-conta'></div>" +
      "<div class='calc-op' id='calc-op'></div>" +
      "<input id='calc-input' class='calc-input' inputmode='numeric' autocomplete='off' " +
      "spellcheck='false' aria-label='Risultato'>" +
      "<div class='calc-esiti' id='calc-esiti'></div>";

    const elConta = api.arena.querySelector("#calc-conta");
    const elOp = api.arena.querySelector("#calc-op");
    const input = api.arena.querySelector("#calc-input");
    const elEsiti = api.arena.querySelector("#calc-esiti");

    let i = 0;
    let corrette = 0;
    const esiti = [];
    input.focus();

    function disegna() {
      elConta.textContent = "Operazione " + (i + 1) + " di " + ops.length;
      elOp.textContent = ops[i].testo + " =";
      elEsiti.innerHTML = esiti.map(e => "<span class='" + (e ? "giusto" : "sbagliato") + "'>" +
        (e ? "✓" : "✗") + "</span>").join("");
      api.avanzo(i / ops.length);
    }

    function conferma() {
      const dato = parseInt(input.value, 10);
      const giusto = dato === ops[i].ris;
      if (giusto) corrette++;
      esiti.push(giusto);
      input.value = "";
      i++;

      if (i >= ops.length) { concludi(); return; }
      disegna();
    }

    function concludi() {
      const tempo = api.tempo();
      let punti = corrette * 140;
      if (corrette === ops.length) punti += Math.max(0, Math.round(300 - tempo * 10));
      input.disabled = true;
      api.avanzo(1);
      api.finito({ punti, dettaglio: corrette + "/" + ops.length + " esatte" });
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); if (input.value !== "") conferma(); }
    });

    const rifocalizza = () => input.focus();
    api.arena.addEventListener("click", rifocalizza);
    disegna();

    return {
      scaduto: concludi,
      chiudi() { api.arena.removeEventListener("click", rifocalizza); }
    };
  }
});

/* Difficoltà crescente: al primo round somme facili, all'ultimo moltiplicazioni
   a due cifre e sottrazioni che non vanno mai sotto zero. */
function operazione(round) {
  const livello = round;   // 0..4
  const tipo = livello === 0 ? scegli(["+", "-"])
    : livello <= 2 ? scegli(["+", "-", "×"])
    : scegli(["+", "-", "×", "×"]);

  let a, b;
  if (tipo === "×") {
    a = interoTra(2, 4 + livello * 3);
    b = interoTra(2, 4 + livello * 2);
    return { testo: a + " × " + b, ris: a * b };
  }
  const max = 10 + livello * 22;
  a = interoTra(2, max);
  b = interoTra(2, max);
  if (tipo === "-") {
    if (b > a) [a, b] = [b, a];          // niente risultati negativi
    return { testo: a + " − " + b, ris: a - b };
  }
  return { testo: a + " + " + b, ris: a + b };
}
