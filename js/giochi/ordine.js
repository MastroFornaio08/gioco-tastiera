/* 🔟 Ordine — numeri sparsi sul campo, da toccare in ordine crescente.
   Dal terzo round i numeri già presi spariscono, e la mappa mentale salta. */

GIOCHI.push({
  id: "ordine",
  nome: "Ordine",
  icona: "🔟",
  desc: "Tocca i numeri in ordine crescente, dal più piccolo al più grande.",
  regole: [
    "Da <b>12</b> numeri del primo round a <b>24</b> dell'ultimo.",
    "Ogni numero preso vale <b>60 punti</b>, più il bonus se finisci.",
    "Toccare il numero sbagliato costa <b>40 punti</b>.",
    "Dal terzo round in poi i numeri presi <b>svaniscono</b>."
  ],
  gara: true,
  solo: true,
  durata: 75,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      const quanti = 12 + r * 3;
      return {
        quanti,
        svaniscono: r >= 2,
        posizioni: disponi(quanti)
      };
    });
  },

  fantasma(dati) {
    const presi = Math.random() < 0.5 ? dati.quanti : interoTra(4, dati.quanti - 1);
    const tempo = presi * interoTra(7, 13) / 10;
    let punti = presi * 60;
    if (presi === dati.quanti) punti += Math.max(0, Math.round(400 - tempo * 12));
    return { punti, dettaglio: presi + "/" + dati.quanti, tempo };
  },

  crea(api) {
    const { quanti, svaniscono, posizioni } = api.dati;
    api.suggerimento("Dal più piccolo al più grande, senza sbagliare.");

    api.arena.innerHTML =
      "<div class='ana-conta' id='ord-conta'></div>" +
      "<div class='campo' id='ord-campo'></div>";

    const elConta = api.arena.querySelector("#ord-conta");
    const campo = api.arena.querySelector("#ord-campo");

    let atteso = 1, punti = 0, concluso = false;

    campo.innerHTML = posizioni.map((p, k) =>
      "<button class='ord-num' data-n='" + (k + 1) + "' style='left:" + p.x +
      "%;top:" + p.y + "%'>" + (k + 1) + "</button>").join("");

    const bottoni = Array.from(campo.querySelectorAll(".ord-num"));

    function aggiorna() {
      elConta.textContent = "Prossimo: " + (atteso <= quanti ? atteso : "—") +
        "  ·  " + (atteso - 1) + "/" + quanti;
      api.avanzo((atteso - 1) / quanti);
    }

    bottoni.forEach(b => {
      b.onclick = () => {
        if (concluso) return;
        const n = Number(b.dataset.n);
        if (n === atteso) {
          punti += 60;
          atteso++;
          if (svaniscono) b.remove();
          else { b.classList.add("preso"); b.disabled = true; }
          aggiorna();
          if (atteso > quanti) concludi();
        } else {
          punti = Math.max(0, punti - 40);
          b.classList.add("errata");
          setTimeout(() => b.classList.remove("errata"), 280);
        }
      };
    });

    function concludi() {
      if (concluso) return;
      concluso = true;
      const presi = atteso - 1;
      if (presi === quanti) punti += Math.max(0, Math.round(400 - api.tempo() * 12));
      api.avanzo(1);
      api.finito({ punti, dettaglio: presi + "/" + quanti });
    }

    aggiorna();
    return { scaduto: concludi };
  }
});

/* Sparge n punti sul campo evitando che si sovrappongano troppo. */
function disponi(n) {
  const punti = [];
  for (let i = 0; i < n; i++) {
    let p, tentativi = 0;
    do {
      p = { x: interoTra(6, 92), y: interoTra(8, 90) };
      tentativi++;
    } while (tentativi < 40 && punti.some(q =>
      Math.abs(q.x - p.x) < 11 && Math.abs(q.y - p.y) < 15));
    punti.push(p);
  }
  return punti;
}
