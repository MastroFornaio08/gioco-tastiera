/* ⌨️ Dattilo Duello — scrivere una frase italiana il più in fretta possibile.
   Dal secondo round entrano in gioco le regole speciali. */

const PRECISIONE_MINIMA = 0.75;

GIOCHI.push({
  id: "dattilo",
  nome: "Dattilo Duello",
  icona: "⌨️",
  desc: "Scrivi la frase più in fretta che puoi, senza sbagliare.",
  regole: [
    "Le frasi si allungano round dopo round.",
    "I punti sono <b>parole al minuto × precisione²</b>: correre sbagliando non paga.",
    "Sotto il <b>75% di precisione</b> il round è nullo.",
    "<kbd>Invio</kbd> consegna anche a frase incompleta."
  ],
  gara: true,
  solo: true,
  durata: 90,

  generaPartita() {
    const speciali = mescola(MODIFICATORI.filter(m => m.id !== "normale" && m.id !== "turbo"));
    const usate = new Set();
    return FASCE_ROUND.map((fascia, i) => {
      let frase;
      do { frase = scegli(FRASI[fascia]); } while (usate.has(frase));
      usate.add(frase);
      const modId = i === 0 ? "normale"
        : i === MAX_ROUND - 1 ? "turbo"
        : speciali[i - 1].id;
      return { frase, modId };
    });
  },

  fantasma(dati) {
    const wpm = 30 + Math.random() * 28;
    const prec = 0.88 + Math.random() * 0.12;
    const mod = modificatore(dati.modId);
    const bersaglio = mod.id === "maiuscole" ? dati.frase.toUpperCase() : dati.frase;
    const tempo = (bersaglio.length / 5) / wpm * 60;
    return {
      punti: Math.round(wpm * prec * prec * 10 * mod.mult),
      dettaglio: Math.round(wpm) + " PPM · " + Math.round(prec * 100) + "%",
      tempo
    };
  },

  crea(api) {
    const mod = modificatore(api.dati.modId);
    const bersaglio = mod.id === "maiuscole" ? api.dati.frase.toUpperCase() : api.dati.frase;

    if (mod.id !== "normale") {
      api.etichetta(mod.icona + " <b>" + mod.nome + "</b> — <span>" + mod.desc + "</span>");
    }
    api.suggerimento(mod.id === "precisione"
      ? "Backspace disattivato. <kbd>Invio</kbd> per consegnare."
      : "Scrivi la frase. <kbd>Invio</kbd> per consegnare.");

    api.arena.innerHTML =
      "<div class='frase' id='frase'></div>" +
      "<input id='typer' class='typer' autocomplete='off' autocorrect='off' " +
      "autocapitalize='none' spellcheck='false' aria-label='Area di scrittura'>";

    const cont = api.arena.querySelector("#frase");
    cont.innerHTML = bersaglio.split("").map(c =>
      "<c>" + (c === " " ? "&nbsp;" : fuggiHtml(c)) + "</c>").join("");
    const lettere = Array.from(cont.children);

    const typer = api.arena.querySelector("#typer");
    typer.classList.toggle("cieco", mod.id === "invisibile");
    typer.focus();

    function ridisegna(scritto) {
      const nebbia = mod.id === "nebbia";
      for (let i = 0; i < lettere.length; i++) {
        let cls = "";
        if (i < scritto.length) {
          cls = scritto[i] === bersaglio[i] ? "ok" : "ko";
          if (nebbia) cls += " sfuma";
        } else if (i === scritto.length) cls = "cur";
        if (lettere[i].className !== cls) lettere[i].className = cls;
      }
    }
    ridisegna("");

    function consegna() {
      const scritto = typer.value;
      let corretti = 0;
      for (let i = 0; i < bersaglio.length; i++) if (scritto[i] === bersaglio[i]) corretti++;

      const prec = corretti / bersaglio.length;
      const tempo = Math.max(api.tempo(), 0.5);
      const wpm = (bersaglio.length / 5) / (tempo / 60);
      const punti = prec < PRECISIONE_MINIMA ? 0
        : Math.round(wpm * prec * prec * 10 * mod.mult);

      typer.disabled = true;
      api.avanzo(1);
      api.finito({
        punti,
        dettaglio: prec < PRECISIONE_MINIMA
          ? "nullo (" + Math.round(prec * 100) + "%)"
          : Math.round(wpm) + " PPM · " + Math.round(prec * 100) + "%"
      });
    }

    typer.addEventListener("input", () => {
      ridisegna(typer.value);
      api.avanzo(typer.value.length / bersaglio.length);
      if (typer.value.length >= bersaglio.length) consegna();
    });

    typer.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); consegna(); return; }
      if (mod.id === "precisione" && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
        toast("Backspace bloccato in questo round!");
      }
    });

    typer.addEventListener("paste", (e) => { e.preventDefault(); toast("Niente copia-incolla."); });

    const rifocalizza = () => typer.focus();
    api.arena.addEventListener("click", rifocalizza);

    return {
      scaduto: consegna,
      chiudi() { api.arena.removeEventListener("click", rifocalizza); }
    };
  }
});
