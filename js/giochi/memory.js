/* 🧠 Memory — le classiche coppie di carte, giocate a turni sulla stessa plancia.
   Ogni mossa viaggia sulla rete: le due plance restano identiche perché entrambi
   eseguono la stessa logica sullo stesso messaggio. Chi indovina, rigioca. */

const FIGURE_MEMORY = [
  "🍎", "🍋", "🍇", "🍓", "🥝", "🍌", "🍑", "🥑",
  "🐶", "🐱", "🦊", "🐼", "🐸", "🐧", "🦉", "🐢"
];

GIOCHI.push({
  id: "memory",
  nome: "Memory",
  icona: "🧠",
  desc: "Scopri le coppie di figure. Chi ne trova di più vince il round.",
  regole: [
    "Si gioca <b>a turni</b>: chi trova una coppia rigioca subito.",
    "Ogni coppia vale <b>150 punti</b>, vincere il round ne vale <b>250</b>.",
    "La plancia cresce: da <b>6</b> a <b>10</b> coppie.",
    "Chi comincia cambia a ogni round."
  ],
  gara: false,
  solo: false,
  durata: 240,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      const coppie = 6 + r;
      const figure = scegliDistinti(FIGURE_MEMORY, coppie);
      return { coppie, carte: mescola(figure.concat(figure)) };
    });
  },

  crea(api) {
    const { carte, coppie } = api.dati;
    const io = api.sonoHost ? 0 : 1;
    let turno = api.round % 2;          // a round pari comincia l'host

    const trovate = [0, 0];
    const scoperte = new Set();         // indici già conquistati
    let girate = [];                    // indici attualmente a faccia in su
    let bloccato = false;
    let concluso = false;
    let attesa = null;

    api.arena.innerHTML =
      "<div class='mem-testa' id='mem-testa'></div>" +
      "<div class='mem-griglia' id='mem-griglia'></div>";

    const elTesta = api.arena.querySelector("#mem-testa");
    const elGriglia = api.arena.querySelector("#mem-griglia");

    const colonne = coppie <= 6 ? 4 : coppie <= 8 ? 5 : 5;
    elGriglia.style.gridTemplateColumns = "repeat(" + colonne + ", 1fr)";
    elGriglia.innerHTML = carte.map((f, i) =>
      "<button class='mem-carta' data-i='" + i + "'>" +
      "<span class='mem-retro'>?</span>" +
      "<span class='mem-fronte'>" + f + "</span></button>").join("");

    const celle = Array.from(elGriglia.querySelectorAll(".mem-carta"));

    function testa() {
      const mio = turno === io;
      elTesta.innerHTML =
        "<span class='mem-turno " + (mio ? "attivo" : "") + "'>" +
        (mio ? "Tocca a te" : "Tocca a " + fuggiHtml(S.nomeAvv)) + "</span>" +
        "<span class='mem-conta'>" + fuggiHtml(S.nome) + " " + trovate[io] +
        " — " + trovate[1 - io] + " " + fuggiHtml(S.nomeAvv) + "</span>";
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
          turno = 1 - turno;
          testa();
        }, 900);
      }
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      const mie = trovate[io], sue = trovate[1 - io];
      let punti = mie * 150;
      if (mie > sue) punti += 250;
      api.finito({ punti, dettaglio: mie + " coppie su " + coppie });
    }

    celle.forEach(c => {
      c.onclick = () => {
        if (turno !== io || bloccato || concluso) return;
        const i = Number(c.dataset.i);
        if (scoperte.has(i) || girate.includes(i)) return;
        api.invia({ i });      // l'avversario applica la stessa mossa
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
