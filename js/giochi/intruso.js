/* 🔍 L'Intruso — una griglia di simboli identici, uno solo è diverso. */

const SIMBOLI_INTRUSO = [
  ["😀", "😄"], ["🟦", "🟪"], ["🐶", "🐕"], ["🍎", "🍏"], ["★", "☆"],
  ["◼", "◾"], ["🌕", "🌖"], ["🔵", "🔷"], ["🧡", "❤️"], ["Ⅰ", "І"]
];

GIOCHI.push({
  id: "intruso",
  nome: "L'Intruso",
  icona: "🔍",
  desc: "In una griglia di simboli uguali, trovane uno diverso.",
  regole: [
    "Cinque griglie per round, sempre più fitte.",
    "Ogni intruso trovato vale <b>170 punti</b>.",
    "Cliccare il simbolo sbagliato costa <b>60 punti</b>.",
    "Le differenze si fanno sottili: guarda bene."
  ],
  gara: true,
  solo: true,
  durata: 75,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => ({
      griglie: Array.from({ length: 5 }, (_, i) => {
        const lato = 3 + r + Math.floor(i / 2);        // da 3x3 fino a 9x9
        const celle = lato * lato;
        const coppia = scegli(SIMBOLI_INTRUSO);
        return {
          lato,
          normale: coppia[0],
          intruso: coppia[1],
          dove: interoTra(0, celle - 1)
        };
      })
    }));
  },

  fantasma(dati) {
    const trovati = interoTra(2, dati.griglie.length);
    return {
      punti: trovati * 170,
      dettaglio: trovati + "/" + dati.griglie.length + " intrusi",
      tempo: interoTra(14, 45)
    };
  },

  crea(api) {
    const griglie = api.dati.griglie;
    api.suggerimento("Clicca il simbolo diverso dagli altri.");

    api.arena.innerHTML =
      "<div class='ana-conta' id='int-conta'></div>" +
      "<div class='int-griglia' id='int-griglia'></div>";

    const elConta = api.arena.querySelector("#int-conta");
    const elGriglia = api.arena.querySelector("#int-griglia");

    let i = 0, trovati = 0, punti = 0, concluso = false;

    function disegna() {
      const g = griglie[i];
      elConta.textContent = "Griglia " + (i + 1) + " di " + griglie.length +
        " · " + g.lato + "×" + g.lato;
      elGriglia.style.gridTemplateColumns = "repeat(" + g.lato + ", 1fr)";
      elGriglia.innerHTML = Array.from({ length: g.lato * g.lato }, (_, k) =>
        "<button class='int-cella' data-k='" + k + "'>" +
        (k === g.dove ? g.intruso : g.normale) + "</button>").join("");

      elGriglia.querySelectorAll(".int-cella").forEach(c => {
        c.onclick = () => {
          if (concluso) return;
          if (Number(c.dataset.k) === g.dove) {
            trovati++;
            punti += 170;
            avanti();
          } else {
            punti = Math.max(0, punti - 60);
            c.classList.add("errata");
            setTimeout(() => c.classList.remove("errata"), 280);
          }
        };
      });
      api.avanzo(i / griglie.length);
    }

    function avanti() {
      i++;
      if (i >= griglie.length) { concludi(); return; }
      disegna();
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      api.avanzo(1);
      api.finito({ punti, dettaglio: trovati + "/" + griglie.length + " intrusi" });
    }

    disegna();
    return { scaduto: concludi };
  }
});
