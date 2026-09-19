/* 🎨 Sequenza — il vecchio Simon: guarda la sequenza di colori e ripetila.
   Un solo errore e il round è chiuso. */

const COLORI_SEQ = [
  { id: 0, nome: "verde" },
  { id: 1, nome: "rosso" },
  { id: 2, nome: "giallo" },
  { id: 3, nome: "blu" }
];

GIOCHI.push({
  id: "sequenza",
  nome: "Sequenza",
  icona: "🎨",
  desc: "Memorizza la sequenza di colori e ripetila senza sbagliare.",
  regole: [
    "La sequenza si allunga a ogni round: da <b>4</b> a <b>8</b> colori.",
    "Ogni colore giusto vale <b>130 punti</b>.",
    "Al primo errore il round finisce: tieni quello che hai già preso.",
    "Sequenza completa = bonus di velocità."
  ],
  gara: true,
  solo: true,
  durata: 60,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => ({
      sequenza: Array.from({ length: 4 + r }, () => interoTra(0, 3))
    }));
  },

  fantasma(dati) {
    const n = dati.sequenza.length;
    const presi = Math.random() < 0.45 ? n : interoTra(1, n - 1);
    const tempo = 2 + n * 0.75 + interoTra(2, 8);
    let punti = presi * 130;
    if (presi === n) punti += Math.max(0, Math.round(300 - tempo * 6));
    return { punti, dettaglio: presi + "/" + n + " colori", tempo };
  },

  crea(api) {
    const seq = api.dati.sequenza;
    api.suggerimento("Guarda… poi ripeti.");

    api.arena.innerHTML =
      "<div class='seq-stato' id='seq-stato'>Guarda bene</div>" +
      "<div class='seq-griglia'>" + COLORI_SEQ.map(c =>
        "<button class='seq-tasto seq-" + c.nome + "' data-c='" + c.id + "' disabled></button>"
      ).join("") + "</div>";

    const elStato = api.arena.querySelector("#seq-stato");
    const tasti = Array.from(api.arena.querySelectorAll(".seq-tasto"));

    let passo = 0;
    let concluso = false;
    const timers = [];

    function illumina(id, durata = 420) {
      const t = tasti[id];
      t.classList.add("acceso");
      timers.push(setTimeout(() => t.classList.remove("acceso"), durata));
    }

    /* Prima mostra tutta la sequenza, poi sblocca i tasti. */
    function riproduci() {
      let ritardo = 350;
      seq.forEach((id) => {
        timers.push(setTimeout(() => illumina(id), ritardo));
        ritardo += 620;
      });
      timers.push(setTimeout(() => {
        if (concluso) return;
        elStato.textContent = "Tocca a te!";
        elStato.classList.add("pronto");
        tasti.forEach(t => { t.disabled = false; });
      }, ritardo + 150));
    }

    function concludi(motivo) {
      if (concluso) return;
      concluso = true;
      tasti.forEach(t => { t.disabled = true; });
      const tempo = api.tempo();
      let punti = passo * 130;
      if (passo === seq.length) punti += Math.max(0, Math.round(300 - tempo * 6));
      api.avanzo(1);
      api.finito({ punti, dettaglio: motivo || (passo + "/" + seq.length + " colori") });
    }

    tasti.forEach(t => {
      t.onclick = () => {
        if (concluso || t.disabled) return;
        const id = Number(t.dataset.c);
        illumina(id, 200);

        if (id === seq[passo]) {
          passo++;
          api.avanzo(passo / seq.length);
          if (passo >= seq.length) {
            elStato.textContent = "Sequenza completa!";
            concludi();
          }
        } else {
          elStato.textContent = "Colore sbagliato";
          concludi(passo + "/" + seq.length + " colori");
        }
      };
    });

    riproduci();

    return {
      scaduto() { concludi("tempo scaduto"); },
      chiudi() { timers.forEach(clearTimeout); }
    };
  }
});
