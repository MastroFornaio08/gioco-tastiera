/* 🧠 Memory — le coppie di figure, giocate a turno sulla stessa plancia.

   Funziona da 2 a 6. Ogni mossa viaggia sulla rete e viene eseguita
   identica da tutti: le plance restano allineate perché ognuno applica la
   stessa logica allo stesso messaggio, non perché qualcuno mandi lo stato.
   Chi indovina una coppia rigioca; altrimenti il turno passa al successivo. */

const FIGURE_MEMORY = [
  "🍎", "🍋", "🍇", "🍓", "🥝", "🍌", "🍑", "🥑",
  "🐶", "🐱", "🦊", "🐼", "🐸", "🐧", "🦉", "🐢",
  "🚀", "⚽", "🎸", "🎩", "💡", "🔔", "🎲", "🧲"
];

GIOCHI.push({
  id: "memory",
  nome: "Memory",
  icona: "🧠",
  desc: "Scopri le coppie di figure. Chi ne trova di più vince il round.",
  regole: [
    "Si gioca <b>a turno</b>: chi trova una coppia rigioca subito.",
    "Ogni coppia vale <b>150 punti</b>, il primato del round ne vale <b>250</b>.",
    "La plancia cresce con il numero di giocatori.",
    "Chi comincia cambia a ogni round."
  ],
  gara: false,
  solo: false,
  maxGiocatori: 6,
  durata: 300,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      const coppie = 8 + r * 2;
      const figure = scegliDistinti(FIGURE_MEMORY, coppie);
      return { coppie, carte: mescola(figure.concat(figure)) };
    });
  },

  crea(api) {
    const { carte, coppie } = api.dati;
    const giocatori = api.giocatori;
    const n = giocatori.length;
    const io = api.indiceMio;

    let turno = api.round % n;            // chi comincia ruota a ogni round
    const trovate = new Array(n).fill(0);
    const scoperte = new Set();
    let girate = [];
    let bloccato = false;
    let concluso = false;
    let attesa = null;

    api.arena.innerHTML =
      "<div class='mem-testa' id='mem-testa'></div>" +
      "<div class='mem-punti' id='mem-punti'></div>" +
      "<div class='mem-griglia' id='mem-griglia'></div>";

    const elTesta = api.arena.querySelector("#mem-testa");
    const elPunti = api.arena.querySelector("#mem-punti");
    const elGriglia = api.arena.querySelector("#mem-griglia");

    const colonne = carte.length <= 16 ? 4 : carte.length <= 24 ? 6 : 6;
    elGriglia.style.gridTemplateColumns = "repeat(" + colonne + ", 1fr)";
    elGriglia.innerHTML = carte.map((f, i) =>
      "<button class='mem-carta' data-i='" + i + "'>" +
      "<span class='mem-retro'>?</span>" +
      "<span class='mem-fronte'>" + f + "</span></button>").join("");

    const celle = Array.from(elGriglia.querySelectorAll(".mem-carta"));

    function testa() {
      const mio = turno === io;
      elTesta.innerHTML = "<span class='mem-turno " + (mio ? "attivo" : "") + "'>" +
        (mio ? "Tocca a te!" : "Tocca a " + fuggiHtml(giocatori[turno].nome)) + "</span>";

      elPunti.innerHTML = giocatori.map((g, k) =>
        "<span class='mem-p" + (k === turno ? " ora" : "") + "'>" +
          "<i class='pastiglia' style='background:" + g.colore + "'></i>" +
          fuggiHtml(g.nome) + " <b>" + trovate[k] + "</b></span>").join("");

      elGriglia.classList.toggle("non-mio", !mio);
    }

    function gira(i) {
      if (concluso || bloccato) return;
      if (scoperte.has(i) || girate.includes(i)) return;

      girate.push(i);
      celle[i].classList.add("su");
      if (girate.length < 2) return;

      bloccato = true;
      const [a, b] = girate;

      if (carte[a] === carte[b]) {
        trovate[turno]++;
        scoperte.add(a); scoperte.add(b);
        celle[a].classList.add("presa");
        celle[b].classList.add("presa");
        girate = [];
        bloccato = false;
        testa();
        if (scoperte.size >= carte.length) concludi();
        // chi indovina tiene il turno
      } else {
        attesa = setTimeout(() => {
          celle[a].classList.remove("su");
          celle[b].classList.remove("su");
          girate = [];
          bloccato = false;
          turno = (turno + 1) % n;
          testa();
        }, 900);
      }
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      const mie = trovate[io];
      const massimo = Math.max(...trovate);
      let punti = mie * 150;
      if (mie === massimo && mie > 0) punti += 250;
      api.finito({ punti, dettaglio: mie + " coppie su " + coppie });
    }

    celle.forEach(c => {
      c.onclick = () => {
        if (turno !== io || bloccato || concluso) return;
        const i = Number(c.dataset.i);
        if (scoperte.has(i) || girate.includes(i)) return;
        api.invia({ i });
        gira(i);
      };
    });

    testa();

    return {
      messaggio(m) { if (typeof m.i === "number") gira(m.i); },
      scaduto: concludi,
      chiudi() { clearTimeout(attesa); }
    };
  }
});
