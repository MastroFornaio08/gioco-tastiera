/* 🌈 Stroop — c'è scritto ROSSO ma è dipinto di blu: conta il colore, non la parola.
   Il cervello legge prima di guardare, ed è esattamente il problema. */

const COLORI_STROOP = [
  { nome: "ROSSO", css: "#f87171" },
  { nome: "VERDE", css: "#4ade80" },
  { nome: "BLU", css: "#60a5fa" },
  { nome: "GIALLO", css: "#fbbf24" },
  { nome: "VIOLA", css: "#c084fc" }
];

GIOCHI.push({
  id: "stroop",
  nome: "Stroop",
  icona: "🌈",
  desc: "Scegli il colore con cui è scritta la parola, non quello che c'è scritto.",
  regole: [
    "Otto parole per round. Conta <b>l'inchiostro</b>, non il testo.",
    "Risposta giusta <b>+120 punti</b>, sbagliata <b>−70</b>.",
    "Tutte e otto giuste = bonus di velocità.",
    "Dal terzo round la parola e il colore coincidono quasi mai."
  ],
  gara: true,
  solo: true,
  durata: 60,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => ({
      prove: Array.from({ length: 8 }, () => {
        const inchiostro = interoTra(0, COLORI_STROOP.length - 1);
        // nei primi round ogni tanto parola e colore coincidono: è una trappola gentile
        const coincide = r < 2 && Math.random() < 0.3;
        let parola = inchiostro;
        if (!coincide) {
          do { parola = interoTra(0, COLORI_STROOP.length - 1); } while (parola === inchiostro);
        }
        return { parola, inchiostro };
      })
    }));
  },

  fantasma() {
    const giuste = interoTra(5, 8);
    const tempo = interoTra(9, 26);
    let punti = giuste * 120 - (8 - giuste) * 70;
    if (giuste === 8) punti += Math.max(0, Math.round(300 - tempo * 8));
    return { punti: Math.max(0, punti), dettaglio: giuste + "/8 giuste", tempo };
  },

  crea(api) {
    const prove = api.dati.prove;
    api.suggerimento("Clicca il <b>colore dell'inchiostro</b>.");

    api.arena.innerHTML =
      "<div class='ana-conta' id='st-conta'></div>" +
      "<div class='st-parola' id='st-parola'></div>" +
      "<div class='st-tasti' id='st-tasti'></div>" +
      "<div class='calc-esiti' id='st-esiti'></div>";

    const elConta = api.arena.querySelector("#st-conta");
    const elParola = api.arena.querySelector("#st-parola");
    const elTasti = api.arena.querySelector("#st-tasti");
    const elEsiti = api.arena.querySelector("#st-esiti");

    let i = 0, giuste = 0, punti = 0, concluso = false;
    const esiti = [];

    elTasti.innerHTML = COLORI_STROOP.map((c, k) =>
      "<button class='st-tasto' data-k='" + k + "' style='background:" + c.css + "'>" +
      c.nome + "</button>").join("");

    elTasti.querySelectorAll(".st-tasto").forEach(b => {
      b.onclick = () => {
        if (concluso) return;
        const giusto = Number(b.dataset.k) === prove[i].inchiostro;
        if (giusto) { giuste++; punti += 120; }
        else { punti = Math.max(0, punti - 70); }
        esiti.push(giusto);
        i++;
        if (i >= prove.length) { concludi(); return; }
        disegna();
      };
    });

    function disegna() {
      const p = prove[i];
      elConta.textContent = "Parola " + (i + 1) + " di " + prove.length;
      elParola.textContent = COLORI_STROOP[p.parola].nome;
      elParola.style.color = COLORI_STROOP[p.inchiostro].css;
      elEsiti.innerHTML = esiti.map(e => "<span class='" + (e ? "giusto" : "sbagliato") + "'>" +
        (e ? "✓" : "✗") + "</span>").join("");
      api.avanzo(i / prove.length);
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      const tempo = api.tempo();
      if (giuste === prove.length) punti += Math.max(0, Math.round(300 - tempo * 8));
      api.avanzo(1);
      api.finito({ punti, dettaglio: giuste + "/" + prove.length + " giuste" });
    }

    disegna();
    return { scaduto: concludi };
  }
});
