/* Duello a Due — motore comune a tutti i giochi.

   Qui sta tutto ciò che i giochi hanno in comune: connessione, lobby, i cinque
   round, il conto alla rovescia, i punteggi e le schermate. I singoli giochi si
   limitano a disegnare dentro l'arena e a dire quanti punti ha fatto il giocatore.

   Un modulo di gioco si registra così:

     GIOCHI.push({
       id, nome, icona, desc, regole,
       gara: true,        // i due giocano insieme (barre di avanzamento)
       solo: true,        // ammette l'allenamento contro il fantasma
       durata: 60,        // secondi massimi per round
       generaPartita(),   // -> array di 5 "dati", uno per round (li crea l'host)
       crea(api)          // -> { messaggio(m), scaduto(), chiudi() }
     });

   L'oggetto `api` passato a crea() offre:
     api.round      indice del round (0-4)
     api.dati       dati del round generati dall'host
     api.sonoHost   true se tocca a noi fare da arbitro
     api.arena      elemento in cui disegnare
     api.invia(m)   manda un messaggio all'avversario
     api.avanzo(p)  aggiorna la propria barra (0-1)
     api.finito(r)  dichiara il risultato: { punti, dettaglio }
     api.tempo()    secondi trascorsi dall'inizio del round
*/

const GIOCHI = [];
const $ = (id) => document.getElementById(id);

const MAX_ROUND = 5;
const BONUS_PRIMO = 100;   // a chi finisce per primo, nei giochi di velocità

/* ------------------------------------------------------------------ stato */

const S = {
  nome: "Giocatore",
  nomeAvv: "Avversario",
  ruolo: null,          // 'host' | 'ospite' | 'solo'
  latenza: 0,

  giocoId: null,
  gioco: null,
  partita: [],
  round: 0,
  punti: { io: 0, avv: 0 },
  storico: [],

  // round in corso
  t0: 0,
  attivo: false,
  tick: null,
  scadenza: null,
  conto: null,          // intervallo del conto alla rovescia
  istanza: null,        // handle restituito da gioco.crea()
  mio: null,
  suo: null,
  fantasma: null,
  ultimoPong: 0,
  pingInterval: null
};

/* ------------------------------------------------------- utilità generiche */

function mostra(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
  $(id).classList.add("is-active");
  $("app").classList.toggle("is-wide", id === "screen-round" || id === "screen-lobby");
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
}

function stato(id, msg, classe = "") {
  const el = $(id);
  el.textContent = msg;
  el.className = "status" + (classe ? " " + classe : "");
}

function scegli(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

function interoTra(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function mescola(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Sceglie n elementi distinti da una lista. */
function scegliDistinti(lista, n) { return mescola(lista).slice(0, n); }

function fuggiHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function trovaGioco(id) { return GIOCHI.find(g => g.id === id); }

/* ------------------------------------------------------------ scelta gioco */

function disegnaGriglia() {
  const soloAmmessi = S.ruolo === "solo";
  $("griglia-giochi").innerHTML = GIOCHI.map(g => {
    const bloccato = soloAmmessi && !g.solo;
    return "<button class='carta-gioco" + (bloccato ? " bloccata" : "") + "'" +
      " data-gioco='" + g.id + "'" + (bloccato ? " disabled" : "") + ">" +
      "<span class='cg-icona'>" + g.icona + "</span>" +
      "<span class='cg-nome'>" + fuggiHtml(g.nome) + "</span>" +
      (bloccato ? "<span class='cg-tag'>solo in due</span>" : "") +
      "</button>";
  }).join("");

  $("griglia-giochi").querySelectorAll("[data-gioco]").forEach(b => {
    b.onclick = () => {
      if (S.ruolo === "ospite") return;
      selezionaGioco(b.dataset.gioco);
      if (S.ruolo === "host") Rete.invia("scelta", { giocoId: b.dataset.gioco });
    };
  });
}

function selezionaGioco(id) {
  const g = trovaGioco(id);
  if (!g) return;
  S.giocoId = id;
  S.gioco = g;

  $("griglia-giochi").querySelectorAll("[data-gioco]").forEach(b =>
    b.classList.toggle("scelta", b.dataset.gioco === id));

  $("scheda-gioco").innerHTML =
    "<div class='sg-testa'>" + g.icona + " <b>" + fuggiHtml(g.nome) + "</b></div>" +
    "<p class='sg-desc'>" + fuggiHtml(g.desc) + "</p>" +
    "<ul class='sg-regole'>" + g.regole.map(r => "<li>" + r + "</li>").join("") + "</ul>";

  $("btn-start").disabled = S.ruolo === "ospite";
}

/* --------------------------------------------------------- punti e round */

function aggiornaPunteggi() {
  $("hud-me-score").textContent = S.punti.io;
  $("hud-op-score").textContent = S.punti.avv;
}

function preparaRound() {
  const g = S.gioco;
  fermaOrologi();        // un round che comincia non deve ereditare timer del precedente
  S.mio = null;
  S.suo = null;
  S.attivo = false;
  chiudiIstanza();

  $("hud-round").textContent = S.round + 1;
  $("hud-me-name").textContent = S.nome;
  $("hud-op-name").textContent = S.nomeAvv;
  $("bar-me-label").textContent = S.nome;
  $("bar-op-label").textContent = S.nomeAvv;
  aggiornaPunteggi();

  $("bars").style.display = g.gara ? "" : "none";
  $("bar-me").style.width = "0%";
  $("bar-op").style.width = "0%";
  $("hud-timer").textContent = "0.0s";
  $("typing-hint").textContent = "";

  const badge = $("modifier-badge");
  badge.classList.remove("is-on");
  badge.innerHTML = "";

  $("arena").innerHTML = "";
  $("arena").className = "arena arena-" + g.id;

  mostra("screen-round");
  contoAllaRovescia();
}

/* Ferma ogni orologio del round: conto alla rovescia, cronometro, scadenza e
   fantasma. Va chiamato prima di far partire qualunque cosa nuova, altrimenti
   un timer rimasto indietro fa ripartire il round a tradimento. */
function fermaOrologi() {
  clearInterval(S.conto); S.conto = null;
  clearInterval(S.tick); S.tick = null;
  clearTimeout(S.scadenza); S.scadenza = null;
  clearInterval(S.fantasma); S.fantasma = null;
}

function azzeraRete() {
  clearInterval(S.pingInterval); S.pingInterval = null;
  S.ultimoPong = 0;
}

function contoAllaRovescia() {
  const el = $("countdown");
  el.classList.add("is-on");
  let n = 3;
  el.textContent = n;
  clearInterval(S.conto);
  S.conto = setInterval(() => {
    n--;
    if (n > 0) el.textContent = n;
    else if (n === 0) el.textContent = "VIA!";
    else {
      clearInterval(S.conto);
      S.conto = null;
      el.classList.remove("is-on");
      iniziaRound();
    }
  }, 750);
}

function iniziaRound() {
  const g = S.gioco;
  fermaOrologi();
  S.t0 = performance.now();
  S.attivo = true;

  S.tick = setInterval(() => {
    $("hud-timer").textContent = ((performance.now() - S.t0) / 1000).toFixed(1) + "s";
  }, 100);

  S.scadenza = setTimeout(() => {
    if (!S.attivo) return;
    if (S.istanza && S.istanza.scaduto) S.istanza.scaduto();
    else api.finito({ punti: 0, dettaglio: "tempo scaduto" });
  }, g.durata * 1000);

  S.istanza = g.crea(api);

  if (S.ruolo === "solo") avviaFantasma();
}

/* L'oggetto che i giochi ricevono. È sempre lo stesso: legge lo stato corrente. */
const api = {
  get round() { return S.round; },
  get dati() { return S.partita[S.round]; },
  get sonoHost() { return S.ruolo !== "ospite"; },
  get arena() { return $("arena"); },

  tempo() { return (performance.now() - S.t0) / 1000; },

  suggerimento(testo) { $("typing-hint").innerHTML = testo; },

  etichetta(html) {
    const b = $("modifier-badge");
    b.innerHTML = html;
    b.classList.add("is-on");
  },

  invia(m) {
    if (S.ruolo !== "solo") Rete.invia("g", { g: m });
  },

  avanzo(p) {
    p = Math.max(0, Math.min(1, p));
    $("bar-me").style.width = (p * 100).toFixed(1) + "%";
    const ora = performance.now();
    if (S.ruolo !== "solo" && ora - ultimoAvanzo > 90) {
      ultimoAvanzo = ora;
      Rete.invia("avanzo", { p });
    }
  },

  finito(ris) {
    if (!S.attivo) return;
    S.attivo = false;
    fermaOrologi();

    S.mio = {
      punti: Math.max(0, Math.round(ris.punti || 0)),
      dettaglio: ris.dettaglio || "",
      tempo: this.tempo()
    };
    $("hud-timer").textContent = S.mio.tempo.toFixed(1) + "s";

    if (S.ruolo === "solo") {
      forseChiudiRound();
    } else {
      Rete.invia("fine", S.mio);
      $("typing-hint").textContent = "Hai finito. Aspetto l'avversario…";
      if (S.ruolo === "host") forseChiudiRound();
    }
  }
};

let ultimoAvanzo = 0;

function chiudiIstanza() {
  if (S.istanza && S.istanza.chiudi) {
    try { S.istanza.chiudi(); } catch (e) { /* il gioco se n'è già andato */ }
  }
  S.istanza = null;
}

/* Il fantasma dell'allenamento: un avversario plausibile ma non imbattibile. */
function avviaFantasma() {
  const g = S.gioco;
  const sim = g.fantasma ? g.fantasma(S.partita[S.round]) : { punti: interoTra(300, 700), dettaglio: "—" };
  const durata = Math.min(sim.tempo || interoTra(6, 16), g.durata) * 1000;
  const inizio = performance.now();

  clearInterval(S.fantasma);
  S.fantasma = setInterval(() => {
    const p = Math.min((performance.now() - inizio) / durata, 1);
    $("bar-op").style.width = (p * 100).toFixed(1) + "%";
    if (p >= 1) {
      clearInterval(S.fantasma);
      S.fantasma = null;
      S.suo = { punti: sim.punti, dettaglio: sim.dettaglio, tempo: durata / 1000 };
      forseChiudiRound();
    }
  }, 90);
}

/* Solo l'arbitro chiude il round: raccoglie i due risultati e assegna i punti. */
function forseChiudiRound() {
  if (S.ruolo === "ospite") return;
  if (!S.mio || !S.suo) return;
  if (S.attivo) return; // Wait until round is fully inactive

  let pMio = S.mio.punti, pSuo = S.suo.punti;

  // nei giochi a durata fissa il "primo al traguardo" non significa nulla
  if (S.gioco.gara && S.gioco.bonusPrimo !== false && pMio > 0 && pSuo > 0) {
    if (S.mio.tempo < S.suo.tempo) pMio += BONUS_PRIMO;
    else if (S.suo.tempo < S.mio.tempo) pSuo += BONUS_PRIMO;
  }

  S.punti.io += pMio;
  S.punti.avv += pSuo;
  S.storico.push({ mio: S.mio, suo: S.suo, pMio, pSuo });

  if (S.ruolo === "host") {
    Rete.invia("esito", {
      round: S.round,
      mio: S.suo, suo: S.mio,          // invertiti: è il punto di vista dell'ospite
      pMio: pSuo, pSuo: pMio,
      totMio: S.punti.avv, totSuo: S.punti.io
    });
  }
  mostraRisultato(pMio, pSuo);
}

function applicaEsitoRemoto(m) {
  S.attivo = false;
  fermaOrologi();
  S.mio = m.mio;
  S.suo = m.suo;
  S.punti.io = m.totMio;
  S.punti.avv = m.totSuo;
  S.storico.push({ mio: m.mio, suo: m.suo, pMio: m.pMio, pSuo: m.pSuo });
  mostraRisultato(m.pMio, m.pSuo);
}

/* ------------------------------------------------------- schermata esito */

function rigaEsito(nome, esito, punti, vincitore) {
  return "<tr class='" + (vincitore ? "vinto" : "") + "'>" +
    "<td>" + fuggiHtml(nome) + (vincitore ? " 👑" : "") + "</td>" +
    "<td>" + fuggiHtml(esito.dettaglio || "—") + "</td>" +
    "<td>" + esito.tempo.toFixed(1) + "s</td>" +
    "<td class='punti'>" + punti + "</td></tr>";
}

function mostraRisultato(pMio, pSuo) {
  chiudiIstanza();
  aggiornaPunteggi();

  $("result-title").textContent =
    pMio > pSuo ? "Round vinto!" : pSuo > pMio ? "Round perso" : "Round in parità";

  $("result-table").innerHTML =
    "<tr><th>Giocatore</th><th>Risultato</th><th>Tempo</th><th>Punti</th></tr>" +
    rigaEsito(S.nome, S.mio, pMio, pMio > pSuo) +
    rigaEsito(S.nomeAvv, S.suo, pSuo, pSuo > pMio) +
    "<tr><td colspan='3'>Totale</td><td class='punti'>" +
      S.punti.io + " – " + S.punti.avv + "</td></tr>";

  const ultimo = S.round >= MAX_ROUND - 1;
  const btn = $("btn-next");
  btn.textContent = ultimo ? "Vedi il verdetto" : "Prossimo round";

  if (S.ruolo === "ospite") {
    btn.disabled = true;
    stato("result-status", "In attesa dell'host…");
  } else {
    btn.disabled = false;
    stato("result-status", "");
  }
  mostra("screen-result");
}

/* ------------------------------------------------------ avanzamento round */

function avanza() {
  if (S.round >= MAX_ROUND - 1) {
    if (S.ruolo === "host") Rete.invia("finale", {});
    mostraFinale();
    return;
  }
  S.round++;
  if (S.ruolo === "host") {
    Rete.invia("via", { round: S.round });
    setTimeout(preparaRound, S.latenza);
  } else {
    preparaRound();
  }
}

/* --------------------------------------------------------------- finale */

function mostraFinale() {
  chiudiIstanza();
  const io = S.punti.io, avv = S.punti.avv;

  $("final-title").textContent = io > avv ? "Hai vinto!" : avv > io ? "Hai perso" : "Pareggio";
  $("final-trophy").textContent = io > avv ? "🏆" : avv > io ? "💀" : "🤝";

  $("final-table").innerHTML =
    "<tr><th>Giocatore</th><th>Punti</th></tr>" +
    "<tr class='" + (io > avv ? "vinto" : "") + "'><td>" + fuggiHtml(S.nome) +
      "</td><td class='punti'>" + io + "</td></tr>" +
    "<tr class='" + (avv > io ? "vinto" : "") + "'><td>" + fuggiHtml(S.nomeAvv) +
      "</td><td class='punti'>" + avv + "</td></tr>";

  const vinti = S.storico.filter(r => r.pMio > r.pSuo).length;
  $("final-stats").innerHTML =
    S.gioco.icona + " " + fuggiHtml(S.gioco.nome) + "<br>" +
    "Round vinti: <b>" + vinti + " su " + S.storico.length + "</b>";

  const rematch = $("btn-rematch");
  const cambia = $("btn-change");
  if (S.ruolo === "ospite") {
    rematch.disabled = true;
    cambia.disabled = true;
    stato("final-status", "Solo l'host può decidere come proseguire.");
  } else {
    rematch.disabled = false;
    cambia.disabled = false;
    stato("final-status", "");
  }
  mostra("screen-final");
}

/* ---------------------------------------------------------- inizio partita */

function azzera() {
  S.round = 0;
  S.punti = { io: 0, avv: 0 };
  S.storico = [];
  S.mio = null;
  S.suo = null;
  S.attivo = false;
  fermaOrologi();
  chiudiIstanza();
}

function avviaPartita() {
  if (!S.gioco) { toast("Scegli prima un gioco."); return; }
  azzera();
  S.partita = S.gioco.generaPartita();

  if (S.ruolo === "host") {
    Rete.invia("partita", { giocoId: S.giocoId, partita: S.partita });
    Rete.invia("via", { round: 0 });
    setTimeout(preparaRound, S.latenza);
  } else {
    preparaRound();
  }
}

/* ------------------------------------------------------------------ rete */

function collegaRete() {
  Rete.on("stanzaPronta", ({ codice }) => {
    $("room-code").textContent = codice;
    stato("host-status", "Stanza aperta. Aspetto l'avversario…");
  });

  Rete.on("connesso", () => {
    Rete.invia("ciao", { nome: S.nome });
    if (S.ruolo === "host") misuraLatenza();
  });

  Rete.on("messaggio", (m) => {
    switch (m.tipo) {
      case "ciao":
        S.nomeAvv = (m.nome || "Avversario").slice(0, 14);
        entraInLobby();
        if (S.ruolo === "host" && S.giocoId) Rete.invia("scelta", { giocoId: S.giocoId });
        break;

      case "ping": 
        Rete.invia("pong", { t: m.t }); 
        S.ultimoPong = performance.now();
        break;
      case "pong": 
        S.latenza = Math.min(Math.round((performance.now() - m.t) / 2), 400); 
        S.ultimoPong = performance.now();
        break;

      case "scelta":
        selezionaGioco(m.giocoId);
        break;

      case "partita":
        azzera();
        selezionaGioco(m.giocoId);
        S.partita = m.partita;
        break;

      case "via":
        S.round = m.round;
        preparaRound();
        break;

      case "avanzo":
        $("bar-op").style.width = (m.p * 100).toFixed(1) + "%";
        break;

      case "g":   // messaggio interno al gioco
        if (S.istanza && S.istanza.messaggio) S.istanza.messaggio(m.g);
        break;

      case "fine":
        S.suo = m;
        if (S.ruolo === "host") forseChiudiRound();
        break;

      case "esito": applicaEsitoRemoto(m); break;
      case "finale": mostraFinale(); break;

      case "lobby":
        azzera();
        entraInLobby();
        break;
    }
  });

  Rete.on("disconnesso", () => {
    if (S.ruolo === "solo") return;
    azzera();
    azzeraRete();
    toast("Avversario disconnesso.");
    tornaAlMenu();
  });

  Rete.on("errore", ({ messaggio }) => {
    stato(S.ruolo === "host" ? "host-status" : "join-status", messaggio, "err");
  });
}

function misuraLatenza() {
  S.ultimoPong = performance.now();
  clearInterval(S.pingInterval);
  S.pingInterval = setInterval(() => {
    Rete.invia("ping", { t: performance.now() });
    
    // Check if we haven't received a pong (or ping from them) in 8 seconds
    if (performance.now() - S.ultimoPong > 8000) {
      if (S.ruolo !== "solo" && Rete.conn) {
        console.warn("Nessun pong ricevuto, disconnessione...");
        Rete.chiudi();
        Rete._emit("disconnesso", {});
      }
    }
  }, 2000);
}

function entraInLobby() {
  $("lobby-p1").textContent = S.ruolo === "ospite" ? S.nomeAvv : S.nome;
  $("lobby-p2").textContent = S.ruolo === "ospite" ? S.nome : S.nomeAvv;

  disegnaGriglia();
  if (S.giocoId) selezionaGioco(S.giocoId);

  if (S.ruolo === "ospite") {
    $("lobby-titolo").textContent = "L'host sta scegliendo";
    $("btn-start").disabled = true;
    stato("lobby-status", "Connesso. Il gioco lo sceglie l'host.");
  } else {
    $("lobby-titolo").textContent = "Scegli la sfida";
    $("btn-start").disabled = !S.giocoId;
    stato("lobby-status", S.ruolo === "solo" ? "" : "Avversario connesso!");
  }
  mostra("screen-lobby");
}

function tornaAlMenu() {
  Rete.chiudi();
  azzera();
  azzeraRete();
  S.ruolo = null;
  S.nomeAvv = "Avversario";
  S.latenza = 0;
  mostra("screen-menu");
}
