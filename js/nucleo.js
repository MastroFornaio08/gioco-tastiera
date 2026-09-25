/* Duello a Due — motore comune a tutti i giochi, da 2 a 6 giocatori.

   Qui sta tutto ciò che i giochi hanno in comune: lobby, round, conto alla
   rovescia, punteggi e schermate. I singoli giochi disegnano dentro l'arena e
   dichiarano quanti punti ha fatto il giocatore; alla classifica pensa il motore.

   L'host è l'arbitro: sceglie il gioco, genera i dati dei round, raccoglie i
   risultati di tutti e distribuisce la classifica. Gli altri eseguono.

   Un modulo di gioco si registra così:

     GIOCHI.push({
       id, nome, icona, desc, regole,
       gara: true,          // tutti giocano insieme (barre di avanzamento)
       solo: true,          // ammette l'allenamento contro il fantasma
       maxGiocatori: 6,     // quanti ne regge (il Tris per esempio solo 2)
       durata: 60,          // secondi massimi per round
       generaPartita(),     // -> array di dati, uno per round (li crea l'host)
       crea(api)            // -> { messaggio(m, da), scaduto(), chiudi() }
     });

   L'oggetto `api` passato a crea() offre:
     api.round        indice del round
     api.dati         dati del round generati dall'host
     api.sonoHost     true se siamo noi l'arbitro
     api.arena        elemento in cui disegnare
     api.io           il proprio id di giocatore ('p0'…'p5')
     api.giocatori    elenco ordinato { id, nome, colore }
     api.indiceMio    la nostra posizione in quell'elenco
     api.invia(m)     manda un messaggio a tutti gli altri
     api.avanzo(p)    aggiorna la propria barra (0-1)
     api.finito(r)    dichiara il risultato: { punti, dettaglio }
     api.tempo()      secondi trascorsi dall'inizio del round
*/

const GIOCHI = [];
const $ = (id) => document.getElementById(id);

const MAX_ROUND = 3;
const BONUS_PRIMO = 100;   // a chi finisce per primo, nei giochi di velocità

/* Un colore per posto: serve a riconoscersi a colpo d'occhio fra sei. */
const COLORI = ["#ff3b6b", "#2dd4ff", "#ffd23b", "#5cff8f", "#c46bff", "#ff9a3b"];
const ID_FANTASMA = "gh";

/* ------------------------------------------------------------------ stato */

const S = {
  nome: "Giocatore",
  ruolo: null,          // 'host' | 'ospite' | 'solo'
  io: "p0",             // il proprio id di giocatore
  latenza: 0,

  giocatori: [],        // [{ id, nome, colore, punti, online }]
  esiti: {},            // id -> { punti, dettaglio, tempo }   (round corrente)
  avanzamenti: {},      // id -> 0..1

  giocoId: null,
  gioco: null,
  partita: [],
  round: 0,
  storico: [],
  isTorneo: false,
  corone: {}, // id -> numero di vittorie

  // round in corso
  t0: 0,
  attivo: false,
  tick: null,
  scadenza: null,
  conto: null,
  istanza: null,
  fantasma: null,
  fantasmaDati: null,
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
  if (!el) return;
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

function scegliDistinti(lista, n) { return mescola(lista).slice(0, n); }

function fuggiHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function trovaGioco(id) { return GIOCHI.find(g => g.id === id); }

/* Distribuisce le fasce di difficoltà sul numero di round effettivo, così la
   partita parte facile e finisce difficile qualunque sia MAX_ROUND. */
function fasceScalate(n, fasce = ["corte", "medie", "lunghe"]) {
  if (n <= 1) return [fasce[Math.floor(fasce.length / 2)]];
  return Array.from({ length: n }, (_, i) =>
    fasce[Math.round(i * (fasce.length - 1) / (n - 1))]);
}

/* ------------------------------------------------------ elenco giocatori */

function gioc(id) { return S.giocatori.find(g => g.id === id); }
function nomeDi(id) { const g = gioc(id); return g ? g.nome : "—"; }
function coloreDi(id) { const g = gioc(id); return g ? g.colore : COLORI[0]; }
function attivi() { return S.giocatori.filter(g => g.online); }

function aggiungiGiocatore(id, nome) {
  let g = gioc(id);
  if (g) { g.nome = nome; g.online = true; return g; }
  g = {
    id, nome,
    colore: COLORI[S.giocatori.length % COLORI.length],
    punti: 0,
    online: true
  };
  S.giocatori.push(g);
  return g;
}

/* L'elenco che viaggia sulla rete: solo ciò che serve agli altri. */
function elencoDaSpedire() {
  return S.giocatori.map(g => ({ id: g.id, nome: g.nome, colore: g.colore, punti: g.punti, online: g.online }));
}

function applicaElenco(lista) {
  S.giocatori = lista.map(g => ({ ...g }));
}

/* ------------------------------------------------------------ scelta gioco */

/* Un gioco è disponibile se regge il numero di giocatori presenti
   (e, in allenamento, se ha senso da soli). */
function motivoBlocco(g) {
  if (S.ruolo === "solo") return g.solo ? null : "solo in gruppo";
  const n = Math.max(S.giocatori.length, 2);
  const max = g.maxGiocatori || 6;
  const min = g.minGiocatori || 2;
  if (n > max) return "max " + max + " giocatori";
  if (n < min) return "servono almeno " + min;
  return null;
}

function disegnaGriglia() {
  $("lista-giochi").innerHTML = GIOCHI.map(g => {
    const blocco = motivoBlocco(g);
    return "<div class='riga-gioco" + (blocco ? " bloccata" : "") + "' data-gioco='" + g.id + "'>" +
      "<div class='rg-icona'>" + g.icona + "</div>" +
      "<div class='rg-info'>" +
        "<div class='rg-nome'>" + fuggiHtml(g.nome) + "</div>" +
        (blocco ? "<div class='rg-tag'>" + fuggiHtml(blocco) + "</div>" : "") +
      "</div>" +
      "</div>";
  }).join("");

  $("lista-giochi").querySelectorAll("[data-gioco]").forEach(b => {
    b.onclick = () => {
      if (S.ruolo === "ospite") { toast("Il gioco lo sceglie l'host."); return; }
      if (b.classList.contains("bloccata")) {
        toast("Non si può giocare in " + S.giocatori.length + ".");
        return;
      }
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

  $("lista-giochi").querySelectorAll("[data-gioco]").forEach(b =>
    b.classList.toggle("scelta", b.dataset.gioco === id));

  $("scheda-gioco").innerHTML =
    "<div class='sg-testa'>" + g.icona + " <b>" + fuggiHtml(g.nome) + "</b></div>" +
    "<p class='sg-desc'>" + fuggiHtml(g.desc) + "</p>" +
    "<ul class='sg-regole'>" + g.regole.map(r => "<li>" + r + "</li>").join("") + "</ul>";

  aggiornaTastoInizia();
}

function aggiornaTastoInizia() {
  const btn = $("btn-start");
  if (S.ruolo === "ospite") { btn.disabled = true; return; }
  const blocco = S.gioco ? motivoBlocco(S.gioco) : "nessun gioco";
  const pochi = S.ruolo !== "solo" && attivi().length < 2;
  btn.disabled = !S.gioco || !!blocco || pochi;
}

/* --------------------------------------------------------- HUD e barre */

function disegnaPunteggiHud() {
  $("hud-punti").innerHTML = S.giocatori.map(g =>
    "<div class='hud-p" + (g.id === S.io ? " mio" : "") + (g.online ? "" : " fuori") + "'>" +
      "<i style='background:" + g.colore + "'></i>" +
      "<span>" + fuggiHtml(g.nome) + "</span>" +
      "<b data-punti='" + g.id + "'>" + g.punti + "</b>" +
    "</div>").join("");
}

function disegnaBarre() {
  const mostraBarre = S.gioco && S.gioco.gara;
  $("bars").style.display = mostraBarre ? "" : "none";
  if (!mostraBarre) return;

  $("bars").innerHTML = S.giocatori.map(g =>
    "<div class='bar-row'>" +
      "<span class='bar-label'>" + fuggiHtml(g.nome) + "</span>" +
      "<div class='bar'><i data-barra='" + g.id + "' style='background:" + g.colore + "'></i></div>" +
    "</div>").join("");
}

function aggiornaBarra(id, p) {
  S.avanzamenti[id] = p;
  const el = $("bars").querySelector("[data-barra='" + id + "']");
  if (el) el.style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(1) + "%";
}

/* --------------------------------------------------------------- round */

function preparaRound() {
  const g = S.gioco;
  fermaOrologi();
  S.esiti = {};
  S.avanzamenti = {};
  S.attivo = false;
  clearInterval(S.fantasma); S.fantasma = null;
  chiudiIstanza();

  $("hud-round").textContent = S.round + 1;
  $("hud-round-tot").textContent = MAX_ROUND;
  disegnaPunteggiHud();
  disegnaBarre();

  $("hud-timer").textContent = "0.0s";
  $("hud-timer").classList.remove("urgente");
  $("typing-hint").textContent = "";

  const badge = $("modifier-badge");
  badge.classList.remove("is-on");
  badge.innerHTML = "";

  $("arena").innerHTML = "";
  $("arena").className = "arena arena-" + g.id;

  mostra("screen-round");
  contoAllaRovescia();
}

/* Ferma gli orologi del round. Il fantasma no: in allenamento deve finire
   la sua corsa anche se noi abbiamo già consegnato. */
function fermaOrologi() {
  clearInterval(S.conto); S.conto = null;
  clearInterval(S.tick); S.tick = null;
  clearTimeout(S.scadenza); S.scadenza = null;
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
  el.classList.remove("via");
  clearInterval(S.conto);
  S.conto = setInterval(() => {
    n--;
    el.classList.remove("battito");
    void el.offsetWidth;            // forza il riavvio dell'animazione
    el.classList.add("battito");
    if (n > 0) {
      el.textContent = n;
      if (window.Suoni) Suoni.playTick();
    }
    else if (n === 0) { 
      el.textContent = "VIA!"; 
      el.classList.add("via");
      if (window.Suoni) Suoni.playDing();
      if (window.Vibrazione) Vibrazione.successo();
    }
    else {
      clearInterval(S.conto);
      S.conto = null;
      el.classList.remove("is-on", "via", "battito");
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
    const t = (performance.now() - S.t0) / 1000;
    $("hud-timer").textContent = t.toFixed(1) + "s";
    $("hud-timer").classList.toggle("urgente", g.durata - t <= 5);
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
  get io() { return S.io; },
  get giocatori() { return S.giocatori; },
  get indiceMio() { return Math.max(0, S.giocatori.findIndex(g => g.id === S.io)); },
  get nGiocatori() { return S.giocatori.length; },

  tempo() { return (performance.now() - S.t0) / 1000; },

  suggerimento(testo) { $("typing-hint").innerHTML = testo; },

  etichetta(html) {
    const b = $("modifier-badge");
    b.innerHTML = html;
    b.classList.add("is-on");
  },

  nome(id) { return nomeDi(id); },

  invia(m) {
    if (S.ruolo !== "solo") Rete.invia("g", { g: m });
  },

  /* Canale privato verso l'arbitro: nessun altro giocatore lo vede.
     Serve ai giochi in cui qualcosa deve restare segreto (voti, ruoli). */
  aArbitro(m) {
    if (S.ruolo === "ospite") Rete.invia("gp", { g: m });
    else if (S.istanza && S.istanza.messaggio) S.istanza.messaggio(m, S.io);
  },

  /* Canale privato dall'arbitro a un singolo giocatore. */
  aGiocatore(id, m) {
    if (id === S.io) {
      if (S.istanza && S.istanza.messaggio) S.istanza.messaggio(m, S.io);
    } else if (S.ruolo === "host") {
      Rete.inviaA(id, "gp", { g: m });
    }
  },

  avanzo(p) {
    p = Math.max(0, Math.min(1, p));
    aggiornaBarra(S.io, p);
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

    const mio = {
      punti: Math.max(0, Math.round(ris.punti || 0)),
      dettaglio: ris.dettaglio || "",
      tempo: this.tempo()
    };
    S.esiti[S.io] = mio;
    $("hud-timer").textContent = mio.tempo.toFixed(1) + "s";

    if (S.ruolo === "solo") {
      if (!S.esiti[ID_FANTASMA] && S.fantasmaDati) S.esiti[ID_FANTASMA] = S.fantasmaDati;
      forseChiudiRound();
    } else if (S.ruolo === "host") {
      forseChiudiRound();
    } else {
      Rete.invia("fine", mio);
      $("typing-hint").textContent = "Hai finito. Aspetto gli altri…";
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
  S.fantasmaDati = { punti: sim.punti, dettaglio: sim.dettaglio, tempo: durata / 1000 };

  clearInterval(S.fantasma);
  S.fantasma = setInterval(() => {
    const p = Math.min((performance.now() - inizio) / durata, 1);
    aggiornaBarra(ID_FANTASMA, p);
    if (p >= 1) {
      clearInterval(S.fantasma);
      S.fantasma = null;
      S.esiti[ID_FANTASMA] = S.fantasmaDati;
      forseChiudiRound();
    }
  }, 90);
}

/* ------------------------------------------------------ chiusura del round */

/* Solo l'arbitro chiude il round, e solo quando hanno consegnato tutti
   quelli ancora collegati. */
function forseChiudiRound() {
  if (S.ruolo === "ospite") return;
  if (S.attivo) return;

  const presenti = attivi();
  if (!presenti.every(g => S.esiti[g.id])) return;

  // punti grezzi del round
  const tabella = presenti.map(g => ({
    id: g.id,
    punti: S.esiti[g.id].punti,
    dettaglio: S.esiti[g.id].dettaglio,
    tempo: S.esiti[g.id].tempo,
    guadagno: S.esiti[g.id].punti
  }));

  // nei giochi di velocità il primo al traguardo prende un premio
  if (S.gioco.gara && S.gioco.bonusPrimo !== false) {
    const validi = tabella.filter(r => r.punti > 0);
    if (validi.length > 1) {
      const migliore = validi.reduce((a, b) => (b.tempo < a.tempo ? b : a));
      migliore.guadagno += BONUS_PRIMO;
      migliore.primo = true;
    }
  }

  tabella.forEach(r => { const g = gioc(r.id); if (g) g.punti += r.guadagno; });
  tabella.sort((a, b) => b.guadagno - a.guadagno);

  S.storico.push(tabella);

  if (S.isTorneo && tabella[0]) {
    // In torneo, il vincitore del round prende una corona
    const vincitoreId = tabella[0].id;
    S.corone[vincitoreId] = (S.corone[vincitoreId] || 0) + 1;
  }

  if (S.ruolo === "host") {
    Rete.invia("esito", { round: S.round, tabella, totali: elencoDaSpedire(), corone: S.corone });
  }
  mostraRisultato(tabella);
}

function applicaEsitoRemoto(m) {
  S.attivo = false;
  fermaOrologi();
  applicaElenco(m.totali);
  S.storico.push(m.tabella);
  if (m.corone) S.corone = m.corone;
  mostraRisultato(m.tabella);
}

/* ------------------------------------------------------- schermata esito */

function medaglia(i) { return ["🥇", "🥈", "🥉"][i] || ""; }

function mostraRisultato(tabella) {
  chiudiIstanza();
  disegnaPunteggiHud();

  const mia = tabella.findIndex(r => r.id === S.io);
  const titolo = mia === 0
    ? (tabella.length > 2 ? "Primo posto!" : "Round vinto!")
    : mia === tabella.length - 1 ? "Ultimo… si rimonta" : "Round chiuso";
  $("result-title").textContent = titolo;

  $("result-table").innerHTML =
    "<tr><th></th><th>Giocatore</th><th>Risultato</th><th>Tempo</th><th>Punti</th></tr>" +
    tabella.map((r, i) =>
      "<tr class='" + (i === 0 ? "vinto " : "") + (r.id === S.io ? "mio" : "") + "'>" +
        "<td class='pos'>" + (medaglia(i) || (i + 1)) + "</td>" +
        "<td><i class='pastiglia' style='background:" + coloreDi(r.id) + "'></i>" +
          fuggiHtml(nomeDi(r.id)) + "</td>" +
        "<td>" + fuggiHtml(r.dettaglio || "—") + "</td>" +
        "<td>" + r.tempo.toFixed(1) + "s</td>" +
        "<td class='punti'>+" + r.guadagno + (r.primo ? " ⚡" : "") + (S.isTorneo && i === 0 ? " 👑" : "") + "</td>" +
      "</tr>").join("");

  // Salva il record locale se è il mio punteggio migliore in questo gioco
  if (mia !== -1 && S.giocoId) {
    const mioRisultato = tabella[mia];
    if (mioRisultato && mioRisultato.guadagno > 0) {
      try {
        const records = JSON.parse(localStorage.getItem("dd-records") || "{}");
        const curr = records[S.giocoId] || 0;
        if (mioRisultato.guadagno > curr) {
          records[S.giocoId] = mioRisultato.guadagno;
          localStorage.setItem("dd-records", JSON.stringify(records));
        }
      } catch (e) { /* silent fail per incognito */ }
    }
  }

  if (mia === 0) {
    coriandoli();
    if (window.Suoni) Suoni.playDing();
    if (window.Vibrazione) Vibrazione.successo();
  } else {
    if (window.Suoni) Suoni.playBuzzer();
    if (window.Vibrazione) Vibrazione.errore();
  }

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
  if (S.isTorneo) {
    // In torneo, si torna alla lobby se nessuno ha vinto
    const maxCorone = Math.max(...Object.values(S.corone || {}), 0);
    if (maxCorone >= 3) {
      if (S.ruolo === "host") Rete.invia("finale", {});
      mostraFinale();
      return;
    }
    // Altrimenti torniamo in lobby per un altro gioco
    if (S.ruolo === "host") Rete.invia("lobby", {});
    entraInLobby();
    return;
  }

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
  const classifica = S.giocatori.slice().sort((a, b) => {
    if (S.isTorneo) return (S.corone[b.id] || 0) - (S.corone[a.id] || 0);
    return b.punti - a.punti;
  });
  const mia = classifica.findIndex(g => g.id === S.io);

  $("final-title").textContent =
    mia === 0 ? (S.isTorneo ? "Re della Collina!" : "Hai vinto!") : mia === 1 ? "Secondo posto" : "Fine partita";
  $("final-trophy").textContent = mia === 0 ? "👑" : mia === classifica.length - 1 ? "💀" : "🎖️";

  $("final-table").innerHTML =
    "<tr><th></th><th>Giocatore</th><th>" + (S.isTorneo ? "Corone" : "Punti") + "</th></tr>" +
    classifica.map((g, i) =>
      "<tr class='" + (i === 0 ? "vinto " : "") + (g.id === S.io ? "mio" : "") + "'>" +
        "<td class='pos'>" + (medaglia(i) || (i + 1)) + "</td>" +
        "<td><i class='pastiglia' style='background:" + g.colore + "'></i>" +
          fuggiHtml(g.nome) + "</td>" +
        "<td class='punti'>" + (S.isTorneo ? (S.corone[g.id] || 0) + " 👑" : g.punti) + "</td>" +
      "</tr>").join("");

  const vinti = S.storico.filter(t => t.length && t[0].id === S.io).length;
  $("final-stats").innerHTML = S.isTorneo 
    ? "Torneo Re della Collina terminato!"
    : (S.gioco.icona + " " + fuggiHtml(S.gioco.nome) + " · " + S.giocatori.length + " giocatori<br>" +
       "Round vinti: <b>" + vinti + " su " + S.storico.length + "</b>");

  if (mia === 0) {
    coriandoli(90);
    if (window.Suoni) { Suoni.playDing(); setTimeout(() => Suoni.playDing(), 200); }
    if (window.Vibrazione) Vibrazione.successo();
  } else {
    if (window.Suoni) Suoni.playBuzzer();
  }

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

function azzera(resetTotale = true) {
  S.round = 0;
  S.storico = [];
  S.esiti = {};
  S.avanzamenti = {};
  S.attivo = false;
  if (resetTotale) {
    S.giocatori.forEach(g => { g.punti = 0; });
    S.corone = {};
    S.isTorneo = false;
  }
  fermaOrologi();
  clearInterval(S.fantasma); S.fantasma = null;
  chiudiIstanza();
}

function avviaPartita(torneo = false) {
  if (torneo) {
    if (Object.keys(S.corone || {}).length === 0) azzera(true);
    else azzera(false); // Mantieni le corone intatte per i round successivi!
    S.isTorneo = true;
    const giochiValidi = GIOCHI.filter(g => !motivoBlocco(g));
    if (giochiValidi.length === 0) { toast("Nessun gioco supporta questo numero di giocatori."); return; }
    S.gioco = scegli(giochiValidi);
    S.giocoId = S.gioco.id;
    // In torneo gioca 1 solo round di un gioco a caso
    S.partita = [S.gioco.generaPartita()[0]]; 
  } else {
    azzera(true);
    if (!S.gioco) { toast("Scegli prima un gioco."); return; }
    if (motivoBlocco(S.gioco)) { toast("Questo gioco non regge " + S.giocatori.length + " giocatori."); return; }
    S.partita = S.gioco.generaPartita();
  }

  if (S.ruolo === "host") {
    Rete.invia("partita", {
      giocoId: S.giocoId,
      partita: S.partita,
      giocatori: elencoDaSpedire(),
      isTorneo: S.isTorneo,
      corone: S.corone
    });
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
    S.io = "p0";
    S.giocatori = [];
    aggiungiGiocatore("p0", S.nome);
    disegnaSalaAttesa();
    stato("host-status", "Stanza aperta. Aspetto i giocatori…");
  });

  // l'ospite, appena il canale si apre, si presenta
  Rete.on("connesso", () => {
    if (S.ruolo === "ospite") Rete.invia("ciao", { nome: S.nome });
    else misuraLatenza();
  });

  Rete.on("messaggio", (m) => {
    switch (m.tipo) {

      case "ciao": {                     // solo l'host lo riceve
        if (S.ruolo !== "host") break;
        aggiungiGiocatore(m.da, (m.nome || "Giocatore").slice(0, 14));
        Rete.inviaA(m.da, "benvenuto", { tuoId: m.da, giocoId: S.giocoId });
        Rete.invia("giocatori", { lista: elencoDaSpedire() });
        disegnaSalaAttesa();
        entraInLobby();
        toast(nomeDi(m.da) + " è entrato!");
        break;
      }

      case "benvenuto":
        S.io = m.tuoId;
        if (m.giocoId) S.giocoId = m.giocoId;
        break;

      case "giocatori":
        applicaElenco(m.lista);
        if (S.giocoId) selezionaGioco(S.giocoId);
        entraInLobby();
        break;

      case "pieno":
        stato("join-status", "Stanza piena: sono già in sei.", "err");
        Rete.chiudi();
        break;

      case "ping": Rete.invia("pong", { t: m.t }); S.ultimoPong = performance.now(); break;
      case "pong": S.latenza = Math.min(Math.round((performance.now() - m.t) / 2), 400);
                   S.ultimoPong = performance.now(); break;

      case "scelta":
        selezionaGioco(m.giocoId);
        break;

      case "partita":
        applicaElenco(m.giocatori);
        azzera(false);
        S.isTorneo = !!m.isTorneo;
        S.corone = m.corone || {};
        selezionaGioco(m.giocoId);
        S.partita = m.partita;
        break;

      case "via":
        S.round = m.round;
        preparaRound();
        break;

      case "avanzo":
        aggiornaBarra(m.da, m.p);
        break;

      case "g":   // messaggio interno al gioco, visibile a tutti
      case "gp":  // idem, ma privato fra un giocatore e l'arbitro
        if (S.istanza && S.istanza.messaggio) S.istanza.messaggio(m.g, m.da);
        break;

      case "fine":                        // solo l'host lo riceve
        if (S.ruolo !== "host") break;
        S.esiti[m.da] = { punti: m.punti, dettaglio: m.dettaglio, tempo: m.tempo };
        forseChiudiRound();
        break;

      case "esito": applicaEsitoRemoto(m); break;
      case "finale": mostraFinale(); break;

      case "lobby":
        azzera();
        entraInLobby();
        break;
    }
  });

  Rete.on("disconnesso", ({ id }) => {
    if (S.ruolo === "solo") return;

    if (S.ruolo === "ospite" && id === "p0") {
      azzera(); azzeraRete();
      toast("L'host ha chiuso la partita.");
      tornaAlMenu();
      return;
    }

    // un ospite se n'è andato: la partita continua fra i rimasti
    const g = gioc(id);
    if (g) g.online = false;
    toast((g ? g.nome : "Un giocatore") + " si è disconnesso.");
    disegnaPunteggiHud();     // lo si vede subito barrato, senza aspettare il round dopo

    if (S.ruolo === "host") {
      Rete.invia("giocatori", { lista: elencoDaSpedire() });
      if (attivi().length < 2) {
        toast("Sei rimasto solo. Torno in sala d'attesa.");
        azzera();
        entraInLobby();
        return;
      }
      disegnaSalaAttesa();
      aggiornaTastoInizia();
      forseChiudiRound();   // magari mancava solo lui per chiudere il round
    }
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
  }, 2000);
}

/* ------------------------------------------------------- sala d'attesa */

function disegnaSalaAttesa() {
  const el = $("host-giocatori");
  if (!el) return;
  const posti = [];
  S.giocatori.forEach(g => {
    posti.push("<div class='posto pieno'>" +
      "<i class='pastiglia' style='background:" + g.colore + "'></i>" +
      fuggiHtml(g.nome) + (g.id === "p0" ? " <small>host</small>" : "") + "</div>");
  });
  for (let i = S.giocatori.length; i < MAX_GIOCATORI; i++) {
    posti.push("<div class='posto vuoto'>in attesa…</div>");
  }
  el.innerHTML = posti.join("");
  const n = S.giocatori.length;
  $("btn-host-start").disabled = n < 2;
  $("btn-host-start").textContent = n < 2 ? "Serve almeno un altro giocatore" : "Vai alla scelta del gioco (" + n + ")";
}

function entraInLobby() {
  $("lobby-giocatori").innerHTML = S.giocatori.map(g =>
    "<div class='gioc" + (g.id === S.io ? " mio" : "") + (g.online ? "" : " fuori") + "'>" +
      "<div class='gioc-avatar' style='background:" + g.colore + "'>" +
        fuggiHtml((g.nome || "?").slice(0, 1).toUpperCase()) + "</div>" +
      "<div class='gioc-nome'>" + fuggiHtml(g.nome) + "</div>" +
    "</div>").join("");

  disegnaGriglia();
  if (S.giocoId) selezionaGioco(S.giocoId);
  aggiornaTastoInizia();

  if (S.ruolo === "ospite") {
    $("lobby-titolo").textContent = "L'host sta scegliendo";
    stato("lobby-status", "Connesso. Il gioco lo sceglie l'host.");
  } else {
    $("lobby-titolo").textContent = "Scegli la sfida";
    stato("lobby-status", S.ruolo === "solo" ? "" :
      attivi().length < 2 ? "Aspetto che rientri qualcuno…" :
      "In " + attivi().length + ". Si può cominciare.");
  }
  mostra("screen-lobby");
}

function tornaAlMenu() {
  Rete.chiudi();
  azzera();
  azzeraRete();
  S.ruolo = null;
  S.io = "p0";
  S.giocatori = [];
  S.giocoId = null;
  S.gioco = null;
  S.latenza = 0;
  mostra("screen-menu");
}
