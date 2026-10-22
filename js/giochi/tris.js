/* ⭕ Tris Dinamico (Infinito) — tre partite lampo per round.
   Ogni giocatore può avere massimo 3 segni sulla griglia.
   Il 4° segno fa sparire il 1° piazzato dal giocatore. */

const LINEE_TRIS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

GIOCHI.push({
  id: "tris",
  nome: "Tris Infinito",
  icona: "⭕",
  desc: "Massimo 3 segni a testa: il quarto fa sparire il primo!",
  regole: [
    "Ogni round sono <b>tre partite</b> di tris.",
    "Hai a disposizione <b>massimo 3 segni</b> sulla griglia.",
    "Quando metti il 4° segno, il tuo <b>segno più vecchio scompare</b>.",
    "Vittoria <b>300 punti</b>, pareggio <b>120</b>, sconfitta <b>0</b>.",
    "Chi muove per primo <b>si alterna</b> a ogni partita.",
    "Vincere il round dà <b>150 punti</b> di premio."
  ],
  gara: false,
  solo: false,
  maxGiocatori: 2,
  durata: 240,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => ({ partite: 3, offset: r % 2 }));
  },

  crea(api) {
    const { partite, offset } = api.dati;
    const io = api.indiceMio;
    const avversario = api.giocatori[1 - io] || { nome: "Avversario" };

    let partita = 0;
    let griglia = Array(9).fill(-1);
    // Traccia lo storico delle mosse di ciascun giocatore: mosseGiocatore[0] e mosseGiocatore[1]
    let mosseGiocatore = [[], []];
    let turno = offset;                 // 0 = host, 1 = guest
    let punti = 0;
    let vinte = 0, pari = 0;
    let concluso = false;
    let pausa = false;
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

      // Individua i segni prossimi alla scomparsa (il più vecchio per ciascun giocatore, se ne ha già 3)
      const prossimiASparire = [
        mosseGiocatore[0].length === 3 ? mosseGiocatore[0][0] : null,
        mosseGiocatore[1].length === 3 ? mosseGiocatore[1][0] : null
      ];

      elGriglia.innerHTML = griglia.map((v, i) => {
        const isProssimo = (v !== -1 && prossimiASparire[v] === i);
        const classi = "tris-cella" +
          (v === -1 ? "" : " piena") +
          (isProssimo ? " imminente-scomparsa" : "");

        return "<button class='" + classi + "' data-i='" + i + "'>" +
          (v === -1 ? "" : segno(v)) + "</button>";
      }).join("");

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
      return null; // Con la regola dei 3 segni non si finisce mai la griglia in pareggio "stallo"
    }

    function muovi(i) {
      if (concluso || pausa || griglia[i] !== -1) return;

      // 1. Aggiungi la nuova mossa sulla griglia e nello storico del giocatore corrente
      griglia[i] = turno;
      mosseGiocatore[turno].push(i);

      // 2. Se il giocatore ha piazzato più di 3 segni, rimuovi il primo piazzato
      if (mosseGiocatore[turno].length > 3) {
        const primaMossa = mosseGiocatore[turno].shift();
        griglia[primaMossa] = -1;
      }

      // 3. Controlla se c'è un vincitore
      const esito = vincitore();

      if (!esito) {
        turno = 1 - turno;
        disegna();
        return;
      }

      // Partita chiusa
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
      pausa = true;
      if (partita >= partite) { attesa = setTimeout(concludi, 900); return; }

      attesa = setTimeout(() => {
        griglia = Array(9).fill(-1);
        mosseGiocatore = [[], []];         // Reset dello storico mosse
        turno = (offset + partita) % 2;   // Alterna chi parte
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