/* 🕵️ L'Impostore — tutti conoscono la parola segreta tranne uno.

   Il round ha quattro momenti:

     1. RUOLO    ognuno riceve, solo per sé, la parola o la notizia di essere
                 l'impostore. La categoria invece la vedono tutti.
     2. INDIZIO  ciascuno scrive UNA parola che c'entri con la propria.
                 L'impostore deve inventarsela partendo dalla sola categoria.
     3. VOTO     letti tutti gli indizi, si vota chi si pensa sia l'impostore.
     4. ESITO    si scopre chi era, e si contano i punti.

   La parola segreta e i voti viaggiano sul canale privato (api.aArbitro /
   api.aGiocatore): non passano mai dagli altri giocatori, quindi non si può
   barare guardando i messaggi in arrivo.

   Punteggi
     civile      +250 se ha votato l'impostore, +100 se l'impostore è stato
                 comunque scoperto dal gruppo
     impostore   +600 se la scampa, +150 se viene preso ma ha ricevuto meno
                 della metà dei voti (ha comunque confuso le acque)
*/

const SECONDI_RUOLO = 6;
const SECONDI_INDIZIO = 45;
const SECONDI_VOTO = 35;

GIOCHI.push({
  id: "impostore",
  nome: "L'Impostore",
  icona: "🕵️",
  desc: "Tutti conoscono la parola segreta tranne uno. Scoprite chi.",
  regole: [
    "Uno di voi non riceve la parola: sa solo la <b>categoria</b>.",
    "A turno scrivete <b>una sola parola</b> come indizio.",
    "Poi si vota. Il civile che becca l'impostore fa <b>250 punti</b>.",
    "L'impostore che la scampa ne fa <b>600</b>: conviene bluffare bene.",
    "Servono almeno <b>3 giocatori</b>."
  ],
  gara: false,
  solo: false,
  minGiocatori: 3,
  maxGiocatori: 6,
  durata: SECONDI_RUOLO + SECONDI_INDIZIO + SECONDI_VOTO + 30,

  /* Pubblica solo la categoria: la parola e l'impostore li decide l'host
     a round iniziato, e li spedisce uno per uno in privato. */
  generaPartita() {
    const scelte = scegliDistinti(CATEGORIE_IMPOSTORE, MAX_ROUND);
    return scelte.map(c => ({ categoria: c.nome }));
  },

  crea(api) {
    const categoria = api.dati.categoria;
    const giocatori = api.giocatori.filter(g => g.online);
    const io = api.io;

    let fase = "ruolo";
    let sonoImpostore = false;
    let miaParola = "";
    let concluso = false;
    const timers = [];

    // usati solo dall'arbitro
    let impostoreId = null;
    let parolaSegreta = "";
    const indizi = {};        // id -> parola
    const voti = {};          // id -> id votato

    api.arena.innerHTML =
      "<div class='imp-categoria'>Categoria: <b>" + fuggiHtml(categoria) + "</b></div>" +
      "<div class='imp-corpo' id='imp-corpo'></div>";
    const corpo = api.arena.querySelector("#imp-corpo");

    /* ---------------------------------------------------- l'arbitro decide */

    if (api.sonoHost) {
      const cat = CATEGORIE_IMPOSTORE.find(c => c.nome === categoria) || CATEGORIE_IMPOSTORE[0];
      parolaSegreta = scegli(cat.parole);
      impostoreId = scegli(giocatori).id;

      // Il proprio ruolo l'arbitro se lo assegna qui: passare da aGiocatore()
      // non funzionerebbe, perché l'istanza del gioco non esiste ancora
      // (crea() sta ancora girando e il suo valore di ritorno non è assegnato).
      sonoImpostore = io === impostoreId;
      miaParola = sonoImpostore ? "" : parolaSegreta;

      giocatori.filter(g => g.id !== io).forEach(g => {
        api.aGiocatore(g.id, g.id === impostoreId
          ? { t: "ruolo", impostore: true }
          : { t: "ruolo", impostore: false, parola: parolaSegreta });
      });

      // se qualcuno resta muto, si va avanti lo stesso
      timers.push(setTimeout(chiudiIndizi, (SECONDI_RUOLO + SECONDI_INDIZIO) * 1000));
    }

    /* ------------------------------------------------------- le schermate */

    function mostraRuolo() {
      corpo.innerHTML = sonoImpostore
        ? "<div class='imp-carta impostore'>" +
            "<div class='imp-titolo'>SEI TU L'IMPOSTORE</div>" +
            "<p>Non conosci la parola. Ascolta gli altri e inventa un indizio credibile.</p>" +
          "</div>"
        : "<div class='imp-carta'>" +
            "<div class='imp-etichetta'>La parola segreta è</div>" +
            "<div class='imp-parola'>" + fuggiHtml(miaParola) + "</div>" +
            "<p>Scrivi un indizio che la richiami, senza dirla.</p>" +
          "</div>";
      corpo.innerHTML += "<div class='imp-attesa' id='imp-conto'></div>";
      contoFase(SECONDI_RUOLO, "imp-conto", mostraIndizio);
    }

    function mostraIndizio() {
      if (concluso) return;
      fase = "indizio";
      corpo.innerHTML =
        "<div class='imp-istruzione'>Scrivi <b>una sola parola</b> come indizio.</div>" +
        "<input id='imp-input' class='calc-input imp-input' maxlength='18' autocomplete='off' " +
        "spellcheck='false' placeholder='il tuo indizio'>" +
        "<button class='btn btn-primary btn-small' id='imp-invia'>Conferma</button>" +
        "<div class='imp-attesa' id='imp-conto'></div>";

      const input = corpo.querySelector("#imp-input");
      input.focus();

      const manda = () => {
        const testo = (input.value || "").trim().split(/\s+/)[0].slice(0, 18);
        if (!testo) { input.classList.add("scossa"); setTimeout(() => input.classList.remove("scossa"), 400); return; }
        input.disabled = true;
        corpo.querySelector("#imp-invia").disabled = true;
        api.aArbitro({ t: "indizio", testo });
        corpo.querySelector("#imp-istruzione-ok") ||
          corpo.insertAdjacentHTML("beforeend", "<div class='imp-ok' id='imp-istruzione-ok'>Indizio inviato. Aspetto gli altri…</div>");
      };

      corpo.querySelector("#imp-invia").onclick = manda;
      input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); manda(); } };

      contoFase(SECONDI_INDIZIO, "imp-conto", () => {
        if (!input.disabled) manda();      // chi non ha confermato manda quel che c'è
      });
    }

    function mostraVoto(lista) {
      if (concluso) return;
      fase = "voto";
      corpo.innerHTML =
        "<div class='imp-istruzione'>Chi è l'impostore?</div>" +
        "<div class='imp-indizi'>" + lista.map(v =>
          "<div class='imp-riga'>" +
            "<i class='pastiglia' style='background:" + coloreDi(v.id) + "'></i>" +
            "<span class='imp-nome'>" + fuggiHtml(nomeDi(v.id)) + "</span>" +
            "<span class='imp-indizio'>" + fuggiHtml(v.testo || "—") + "</span>" +
          "</div>").join("") + "</div>" +
        "<div class='imp-voti' id='imp-voti'>" + giocatori.filter(g => g.id !== io).map(g =>
          "<button class='btn btn-small imp-voto' data-v='" + g.id + "'>" +
            fuggiHtml(g.nome) + "</button>").join("") + "</div>" +
        "<div class='imp-attesa' id='imp-conto'></div>";

      let votato = false;
      corpo.querySelectorAll(".imp-voto").forEach(b => {
        b.onclick = () => {
          if (votato) return;
          votato = true;
          corpo.querySelectorAll(".imp-voto").forEach(x => {
            x.disabled = true;
            x.classList.toggle("scelto", x === b);
          });
          api.aArbitro({ t: "voto", chi: b.dataset.v });
        };
      });

      contoFase(SECONDI_VOTO, "imp-conto", () => {
        if (!votato) {
          votato = true;
          api.aArbitro({ t: "voto", chi: null });   // astenuto
        }
      });
    }

    function mostraEsito(e) {
      if (concluso) return;
      concluso = true;
      timers.forEach(clearTimeout);

      const preso = e.piuVotato === e.impostore;
      corpo.innerHTML =
        "<div class='imp-carta " + (preso ? "preso" : "scampato") + "'>" +
          "<div class='imp-titolo'>" + (preso ? "Impostore smascherato!" : "L'impostore l'ha fatta franca") + "</div>" +
          "<div class='imp-rivelazione'>Era <b>" + fuggiHtml(nomeDi(e.impostore)) + "</b>" +
            (e.impostore === io ? " — cioè tu" : "") + "</div>" +
          "<div class='imp-etichetta'>La parola era</div>" +
          "<div class='imp-parola'>" + fuggiHtml(e.parola) + "</div>" +
        "</div>" +
        "<div class='imp-indizi'>" + e.conteggio.map(c =>
          "<div class='imp-riga'>" +
            "<i class='pastiglia' style='background:" + coloreDi(c.id) + "'></i>" +
            "<span class='imp-nome'>" + fuggiHtml(nomeDi(c.id)) + "</span>" +
            "<span class='imp-indizio'>" + c.voti + " vot" + (c.voti === 1 ? "o" : "i") + "</span>" +
          "</div>").join("") + "</div>";

      if (e.impostore === io ? !preso : preso) coriandoli(40);

      const mio = e.punti[io] || 0;
      api.finito({
        punti: mio,
        dettaglio: e.impostore === io
          ? (preso ? "impostore scoperto" : "impostore in fuga")
          : (e.mioVotoGiusto ? "l'ha beccato" : "ha sbagliato voto")
      });
    }

    /* ------------------------------------------- conteggio dell'arbitro */

    function chiudiIndizi() {
      if (concluso || fase === "voto") return;
      const lista = giocatori.map(g => ({ id: g.id, testo: indizi[g.id] || "—" }));
      api.invia({ t: "indizi", lista });      // gli indizi sono pubblici
      mostraVoto(lista);
      timers.push(setTimeout(chiudiVoti, SECONDI_VOTO * 1000 + 1500));
    }

    function chiudiVoti() {
      if (concluso) return;

      const conteggio = giocatori.map(g => ({
        id: g.id,
        voti: Object.values(voti).filter(v => v === g.id).length
      })).sort((a, b) => b.voti - a.voti);

      // pareggio in testa = nessuno smascherato
      const massimo = conteggio[0] ? conteggio[0].voti : 0;
      const inTesta = conteggio.filter(c => c.voti === massimo && massimo > 0);
      const piuVotato = inTesta.length === 1 ? inTesta[0].id : null;
      const preso = piuVotato === impostoreId;
      const votiSullImpostore = conteggio.find(c => c.id === impostoreId).voti;

      const punti = {};
      giocatori.forEach(g => {
        if (g.id === impostoreId) {
          punti[g.id] = preso
            ? (votiSullImpostore * 2 <= giocatori.length - 1 ? 150 : 0)
            : 600;
        } else {
          punti[g.id] = (voti[g.id] === impostoreId ? 250 : 0) + (preso ? 100 : 0);
        }
      });

      const esito = {
        t: "esito", impostore: impostoreId, parola: parolaSegreta,
        piuVotato, conteggio, punti
      };
      giocatori.forEach(g => {
        api.aGiocatore(g.id, { ...esito, mioVotoGiusto: voti[g.id] === impostoreId });
      });
    }

    /* ------------------------------------------------------- utilità */

    function contoFase(secondi, idEl, poi) {
      let n = secondi;
      const el = () => corpo.querySelector("#" + idEl);
      if (el()) el().textContent = n + "s";
      const t = setInterval(() => {
        n--;
        if (el()) el().textContent = n + "s";
        if (n <= 0) { clearInterval(t); poi(); }
      }, 1000);
      timers.push(t);
    }

    mostraRuolo();

    return {
      messaggio(m, da) {
        if (!m || concluso) return;
        switch (m.t) {
          case "ruolo":
            sonoImpostore = !!m.impostore;
            miaParola = m.parola || "";
            mostraRuolo();
            break;

          case "indizio":                    // arriva solo all'arbitro
            if (!api.sonoHost) return;
            indizi[da] = m.testo;
            if (giocatori.every(g => indizi[g.id] !== undefined)) chiudiIndizi();
            break;

          case "indizi":
            mostraVoto(m.lista);
            break;

          case "voto":                       // arriva solo all'arbitro
            if (!api.sonoHost) return;
            voti[da] = m.chi;
            if (giocatori.every(g => voti[g.id] !== undefined)) chiudiVoti();
            break;

          case "esito":
            mostraEsito(m);
            break;
        }
      },

      scaduto() {
        if (concluso) return;
        concluso = true;
        api.finito({ punti: 0, dettaglio: "round non concluso" });
      },

      chiudi() { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); }
    };
  }
});
