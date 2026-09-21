/* ⭕ Tris — tre partite lampo per round: vince chi ne porta a casa di più.
   Cinque round da tre partite: il primo a muovere si alterna ogni partita,
   così nessuno tiene il vantaggio della prima mossa per tutto il gioco. */

const LINEE_TRIS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

GIOCHI.push({
  id: "tris",
  nome: "Tris",
  icona: "⭕",
  desc: "Tre file di tre. Tre partite lampo per round.",
  regole: [
    "Ogni round sono <b>tre partite</b> di tris.",
    "Vittoria <b>300 punti</b>, pareggio <b>120</b>, sconfitta <b>0</b>.",
    "Chi muove per primo <b>si alterna</b> a ogni partita.",
    "Vincere il round dà <b>150 punti</b> di premio."
  ],
  gara: false,
  solo: false,
  maxGiocatori: 2,          // tre file di tre non reggono più di due simboli
  durata: 240,

  generaPartita() {
    // niente da sorteggiare: la plancia è sempre la stessa
    return Array.from({ length: MAX_ROUND }, (_, r) => ({ partite: 3, offset: r % 2 }));
  },

  crea(api) {
    const { partite, offset } = api.dati;
    const io = api.indiceMio;
    const avversario = api.giocatori[1 - io] || { nome: "Avversario" };

    let partita = 0;
    let griglia = Array(9).fill(-1);
    let turno = offset;                 // 0 = host
    let punti = 0;
    let vinte = 0, pari = 0;
    let concluso = false;
    let pausa = false;          // tra una partita e l'altra la plancia è congelata
    let attesa = null;

    api.arena.innerHTML =
      "<div class='mem-testa' id='tris-testa'></div>" +
      "<div class='tris-griglia' id='tris-griglia'></div>" +
      "<div class='tris-esiti' id='tris-esiti'></div>";

    const elTesta = api.arena.querySelector("#tris-testa");
    const elGriglia = api.arena.querySelector("#tris-griglia");
    const elEsiti = api.arena.querySelector("#tris-esiti");

    const segno = (g) => g === io ? "✕" : "◯";

    function disegna() {
      const mio = turno === io;
      elTesta.innerHTML =
        "<span class='mem-turno " + (mio ? "attivo" : "") + "'>" +
        (mio ? "Tocca a te (✕)" : "Tocca a " + fuggiHtml(avversario.nome) + " (◯)") + "</span>" +
        "<span class='mem-conta'>Partita " + (partita + 1) + " di " + partite + "</span>";

      elGriglia.innerHTML = griglia.map((v, i) =>
        "<button class='tris-cella" + (v === -1 ? "" : " piena") + "' data-i='" + i + "'>" +
        (v === -1 ? "" : segno(v)) + "</button>").join("");
      elGriglia.classList.toggle("non-mio", !mio);

      elGriglia.querySelectorAll(".tris-cella").forEach(c => {
        c.onclick = () => {
          if (concluso || pausa || turno !== io) return;
          const i = Number(c.dataset.i);
          if (griglia[i] !== -1) return;
          api.invia({ i });
          muovi(i);
        };
      });
    }

    function vincitore() {
      for (const l of LINEE_TRIS) {
        const [a, b, c] = l;
        if (griglia[a] !== -1 && griglia[a] === griglia[b] && griglia[b] === griglia[c]) {
          return { chi: griglia[a], linea: l };
        }
      }
      return griglia.every(v => v !== -1) ? { chi: -1, linea: null } : null;
    }

    function muovi(i) {
      if (concluso || pausa || griglia[i] !== -1) return;
      griglia[i] = turno;
      const esito = vincitore();

      if (!esito) {
        turno = 1 - turno;
        disegna();
        return;
      }

      // partita chiusa: punti e passaggio alla successiva
      if (esito.chi === io) { punti += 300; vinte++; }
      else if (esito.chi === -1) { punti += 120; pari++; }

      disegna();
      if (esito.linea) {
        esito.linea.forEach(k => {
          const c = elGriglia.querySelector("[data-i='" + k + "']");
          if (c) c.classList.add("linea");
        });
      }
      elEsiti.innerHTML += "<span class='" +
        (esito.chi === io ? "giusto" : esito.chi === -1 ? "pari" : "sbagliato") + "'>" +
        (esito.chi === io ? "✓" : esito.chi === -1 ? "=" : "✗") + "</span>";

      partita++;
      pausa = true;                       // niente mosse finché non riparte la plancia
      if (partita >= partite) { attesa = setTimeout(concludi, 900); return; }

      attesa = setTimeout(() => {
        griglia = Array(9).fill(-1);
        turno = (offset + partita) % 2;   // il primo a muovere si alterna
        pausa = false;
        disegna();
      }, 1100);
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      const perse = partita - vinte - pari;
      if (vinte > perse) punti += 150;
      api.finito({ punti, dettaglio: vinte + "V " + pari + "P " + perse + "S" });
    }

    disegna();

    return {
      messaggio(m) { if (typeof m.i === "number") muovi(m.i); },
      scaduto: concludi,
      chiudi() { clearTimeout(attesa); }
    };
  }
});
