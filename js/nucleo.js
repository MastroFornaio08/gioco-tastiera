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

/* 6 colori neon per slot giocatore (Ciano, Fucsia, Giallo, Verde, Viola, Arancio) */
const COLORI = ["#00F0FF", "#FF0055", "#FFE600", "#00FF66", "#B026FF", "#FF7A00"];
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
  const switchScreen = () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
    $(id).classList.add("is-active");
    $("app").classList.toggle("is-wide", id === "screen-round" || id === "screen-lobby");
  };

  if (document.startViewTransition) {
    document.startViewTransition(switchScreen);
  } else {
    switchScreen();
  }
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

function aggiungiGiocatore(id, nome, avatar) {
  let g = gioc(id);
  if (g) { g.nome = nome; g.avatar = avatar || g.avatar || "🦁"; g.online = true; return g; }
  g = {
    id, nome,
    avatar: avatar || "🦁",
    colore: COLORI[S.giocatori.length % COLORI.length],
    punti: 0,
    online: true
  };
  S.giocatori.push(g);
  return g;
}

/* L'elenco che viaggia sulla rete: solo ciò che serve agli altri. */
function elencoDaSpedire() {
  return S.giocatori.map(g => ({ id: g.id, nome: g.nome, avatar: g.avatar, colore: g.colore, punti: g.punti, online: g.online }));
}

function applicaElenco(lista) {
  S.giocatori = lista.map(g => ({ ...g }));
}

/* ------------------------------------------------------------ scelta gioco */

/* Mappatura categorie per i 27 giochi attivi */
const CATEGORIE_MAP = {
  // ⚡ Azione & Riflessi
  riflessi: "azione",
  cronometro: "azione",
  scuoti: "azione",
  bomba: "azione",
  spam: "azione",
  equilibrio: "azione",
  fune: "azione",

  // 🧠 Mente & Logica
  calcolo: "mente",
  anagrammi: "mente",
  stroop: "mente",
  ordine: "mente",
  memory: "mente",
  inverso: "mente",
  sequenza: "mente",
  simon: "mente",
  intruso: "mente",

  // 🎯 Precisione & Abilità
  dattilo: "precisione",
  sniper: "precisione",
  bersagli: "precisione",
  fotografica: "precisione",
  conta: "precisione",
  tris: "precisione",
  yahtzee: "precisione",

  // 🎭 Party & Bluff
  impostore: "party",
  caccia: "party",
  urlo: "party",
  oca: "party"
};

let categoriaAttiva = "tutti";

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
  const listaEl = $("lista-giochi");
  if (!listaEl) return;

  const giochiFiltrati = GIOCHI.filter(g => {
    if (categoriaAttiva === "tutti") return true;
    return (CATEGORIE_MAP[g.id] || "party") === categoriaAttiva;
  });

  if (giochiFiltrati.length === 0) {
    listaEl.innerHTML = "<p class='muted centrato' style='padding:20px 0;'>Nessun gioco in questa categoria.</p>";
    return;
  }

  listaEl.innerHTML = giochiFiltrati.map(g => {
    const blocco = motivoBlocco(g);
    const cat = CATEGORIE_MAP[g.id] || "party";
    const tagCat = cat === "azione" ? "⚡ Azione" : cat === "mente" ? "🧠 Mente" : cat === "precisione" ? "🎯 Abilità" : "🎭 Party";
    return "<div class='riga-gioco" + (blocco ? " bloccata" : "") + (S.giocoId === g.id ? " scelta" : "") + "' data-gioco='" + g.id + "'>" +
      "<div class='rg-icona'>" + g.icona + "</div>" +
      "<div class='rg-info'>" +
        "<div class='rg-nome'>" + fuggiHtml(g.nome) + " <span style='font-size:0.75rem; opacity:0.7; font-weight:normal;'>(" + tagCat + ")</span></div>" +
        "<div class='rg-desc'>" + fuggiHtml(g.desc) + "</div>" +
        (blocco ? "<div class='rg-tag'>" + fuggiHtml(blocco) + "</div>" : "") +
      "</div>" +
      "</div>";
  }).join("");

  listaEl.querySelectorAll("[data-gioco]").forEach(b => {
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

  const sg = $("scheda-gioco");
  if (sg) sg.innerHTML = "";

  aggiornaTastoInizia();
}

function aggiornaTastoInizia() {
  const btn = $("btn-start");
  if (!btn) return;
  if (S.ruolo === "ospite") { btn.disabled = true; return; }
  const blocco = S.gioco ? motivoBlocco(S.gioco) : "nessun gioco";
  const pochi = S.ruolo !== "solo" && attivi().length < 2;
  btn.disabled = !S.gioco || !!blocco || pochi;
}

/* -------------------------------------------------- Ruota della Fortuna / Roulette */
let rouletteInCorso = false;
function avviaRoulette() {
  if (rouletteInCorso) return;
  if (S.ruolo === "ospite") { toast("Solo l'host può attivare la ruota casuale."); return; }

  const validi = GIOCHI.filter(g => !motivoBlocco(g));
  if (validi.length === 0) { toast("Nessun gioco disponibile."); return; }

  rouletteInCorso = true;
  let count = 0;
  const maxSteps = 18 + Math.floor(Math.random() * 8);
  let delay = 60;

  function step() {
    const g = validi[count % validi.length];
    
    // Evidenzia visivamente nella lista
    const righe = document.querySelectorAll(".riga-gioco");
    righe.forEach(el => {
      el.classList.toggle("roulette-spin", el.dataset.gioco === g.id);
    });

    if (window.Suoni && Suoni.playRouletteTick) Suoni.playRouletteTick();

    count++;
    if (count < maxSteps) {
      delay += 14;
      setTimeout(step, delay);
    } else {
      rouletteInCorso = false;
      document.querySelectorAll(".riga-gioco").forEach(el => el.classList.remove("roulette-spin"));
      selezionaGioco(g.id);
      if (S.ruolo === "host") Rete.invia("scelta", { giocoId: g.id });
      if (window.Suoni && Suoni.playDing) Suoni.playDing();
      toast("🎲 Scelto: " + g.nome + "!");
    }
  }

  step();
}

/* -------------------------------------------------- Votazione Democratica Party */
const Votazione = {
  attiva: false,
  timer: null,
  secondiRimasti: 10,
  candidati: [],
  voti: {},

  avviaHost() {
    if (S.ruolo !== "host") { toast("Solo l'host può avviare la votazione."); return; }
    const validi = GIOCHI.filter(g => !motivoBlocco(g));
    if (validi.length < 2) { toast("Troppi pochi giochi disponibili per votare."); return; }

    const candidati = scegliDistinti(validi, Math.min(3, validi.length)).map(g => g.id);
    this.candidati = candidati;
    this.voti = {};
    this.attiva = true;
    this.secondiRimasti = 10;

    Rete.invia("votoInizia", { candidati: this.candidati, durata: 10 });
    this.mostraModale(this.candidati, 10);
    this.avviaTimerHost();
  },

  avviaTimerHost() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.secondiRimasti--;
      const timerEl = $("voto-timer");
      if (timerEl) timerEl.textContent = this.secondiRimasti + "s";
      Rete.invia("votoTick", { secondi: this.secondiRimasti });

      if (this.secondiRimasti <= 0) {
        clearInterval(this.timer);
        this.concludiHost();
      }
    }, 1000);
  },

  registraVoto(daId, candidatoId) {
    if (!this.attiva) return;
    this.voti[daId] = candidatoId;
    if (S.ruolo === "host") {
      Rete.invia("votoAggiorna", { voti: this.voti });
      this.aggiornaUI();
    }
  },

  concludiHost() {
    this.attiva = false;
    clearInterval(this.timer);

    const conteggi = {};
    this.candidati.forEach(c => conteggi[c] = 0);
    Object.values(this.voti).forEach(c => {
      if (conteggi[c] !== undefined) conteggi[c]++;
    });

    let vincitore = this.candidati[0];
    let maxVoti = -1;
    this.candidati.forEach(c => {
      if (conteggi[c] > maxVoti) {
        maxVoti = conteggi[c];
        vincitore = c;
      }
    });

    Rete.invia("votoFine", { vincitoreId: vincitore });
    this.mostraVincitore(vincitore);
  },

  mostraModale(candidati, durata) {
    this.candidati = candidati;
    this.attiva = true;
    const timerEl = $("voto-timer");
    if (timerEl) timerEl.textContent = durata + "s";
    const statusEl = $("voto-status");
    if (statusEl) statusEl.textContent = "";

    const opzioniEl = $("voto-opzioni");
    if (!opzioniEl) return;

    opzioniEl.innerHTML = candidati.map(id => {
      const g = trovaGioco(id);
      return `
        <div class="voto-card" data-voto="${id}">
          <div class="voto-barra" id="voto-bar-${id}" style="width: 0%"></div>
          <div class="voto-icona">${g ? g.icona : "🎮"}</div>
          <div class="voto-info">
            <div class="voto-nome">${fuggiHtml(g ? g.nome : id)}</div>
            <small class="muted">${fuggiHtml(g ? g.desc : "")}</small>
          </div>
          <div class="voto-voti" id="voto-cnt-${id}">0</div>
        </div>
      `;
    }).join("");

    opzioniEl.querySelectorAll(".voto-card").forEach(card => {
      card.onclick = () => {
        const id = card.dataset.voto;
        opzioniEl.querySelectorAll(".voto-card").forEach(c => c.classList.remove("scelto"));
        card.classList.add("scelto");

        if (window.Suoni && Suoni.playClick) Suoni.playClick();
        if (S.ruolo === "host") {
          this.registraVoto(S.io, id);
        } else {
          Rete.invia("votoScelta", { sceltaId: id });
        }
      };
    });

    const modal = $("modal-voto");
    if (modal) modal.style.display = "flex";
  },

  aggiornaUI() {
    const totaleVoti = Object.keys(this.voti).length || 1;
    const conteggi = {};
    this.candidati.forEach(c => conteggi[c] = 0);
    Object.values(this.voti).forEach(c => {
      if (conteggi[c] !== undefined) conteggi[c]++;
    });

    this.candidati.forEach(c => {
      const cntEl = $("voto-cnt-" + c);
      const barEl = $("voto-bar-" + c);
      if (cntEl) cntEl.textContent = conteggi[c];
      if (barEl) barEl.style.width = Math.round((conteggi[c] / totaleVoti) * 100) + "%";
    });
  },

  mostraVincitore(vincitoreId) {
    const g = trovaGioco(vincitoreId);
    const statusEl = $("voto-status");
    if (statusEl) statusEl.innerHTML = `🎉 Vincitore: <b>${g ? g.nome : vincitoreId}</b>!`;
    if (window.Suoni && Suoni.playDing) Suoni.playDing();

    setTimeout(() => {
      const modal = $("modal-voto");
      if (modal) modal.style.display = "none";
      selezionaGioco(vincitoreId);
      if (S.ruolo === "host") Rete.invia("scelta", { giocoId: vincitoreId });
    }, 2000);
  }
};


/* --------------------------------------------------------- HUD e barre */

function disegnaPunteggiHud() {
  $("hud-punti").innerHTML = S.giocatori.map(g =>
    "<div class='hud-p" + (g.id === S.io ? " mio" : "") + (g.online ? "" : " fuori") + "'>" +
      "<i style='background:" + g.colore + "'>" + (g.avatar || "") + "</i>" +
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
  if (window.Suoni && Suoni.playCountdown) Suoni.playCountdown(3);
  else if (window.Suoni) Suoni.playTick();

  clearInterval(S.conto);
  S.conto = setInterval(() => {
    n--;
    el.classList.remove("battito");
    void el.offsetWidth;            // forza il riavvio dell'animazione
    el.classList.add("battito");
    if (n > 0) {
      el.textContent = n;
      if (window.Suoni && Suoni.playCountdown) Suoni.playCountdown(n);
      else if (window.Suoni) Suoni.playTick();
    }
    else if (n === 0) { 
      el.textContent = "VIA!"; 
      el.classList.add("via");
      if (window.Suoni && Suoni.playCountdown) Suoni.playCountdown(0);
      else if (window.Suoni) Suoni.playDing();
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
    $("hud-timer").classList.toggle("urgente", g.durata - t <= 3);
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
        "<td><i class='pastiglia' style='background:" + coloreDi(r.id) + "'>" + (gioc(r.id)?.avatar || "") + "</i>" +
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
    if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
    else if (window.Suoni) Suoni.playDing();
    if (window.Vibrazione) Vibrazione.successo();
  } else {
    if (window.Suoni && Suoni.playSconfitta) Suoni.playSconfitta();
    else if (window.Suoni) Suoni.playBuzzer();
    if (window.Vibrazione) Vibrazione.errore();
  }

  // Verifica sblocco trofei e traguardi
  if (mia !== -1 && window.Trofei) {
    Trofei.incrementaContatore("partite", 10, "vita_party");
    const mr = tabella[mia];
    if (mr) {
      if (S.giocoId === "dattilo" && mr.guadagno >= 280) Trofei.sblocca("dita_fuoco");
      if ((S.giocoId === "riflessi" || S.giocoId === "cronometro") && mr.tempo <= 0.25) Trofei.sblocca("riflessi_lampo");
      if (S.giocoId === "calcolo" && mr.guadagno >= 500) Trofei.sblocca("cervellone");
      if ((S.giocoId === "bersagli" || S.giocoId === "sniper") && mr.guadagno >= 400) Trofei.sblocca("cecchino");
      if (S.giocoId === "stroop" && mr.guadagno >= 450) Trofei.sblocca("stroop_master");
      if (S.giocoId === "simon" && mr.guadagno >= 600) Trofei.sblocca("cyborg_simon");
      if (S.giocoId === "bomba" && mr.guadagno > 0) Trofei.sblocca("disinnescatore");
      if (S.giocoId === "tris" && mia === 0) Trofei.sblocca("maestro_tris");
    }
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
  if (S.isBoard) {
    if (S.ruolo === "host" || S.ruolo === "solo") {
      preparaTurnoBoard();
      
      // Invia lo stato iniziale del tabellone post-round
      if (S.ruolo === "host") {
        Rete.invia("partita", {
          boardInit: true,
          posizioni: S.posizioni,
          boardVincitore: S.boardVincitore,
          boardUltimo: S.boardUltimo,
          giocatori: elencoDaSpedire()
        });
      }
      entraInBoard();
    }
    return;
  }

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
    if (S.isBoard) return (S.posizioni[b.id] || 0) - (S.posizioni[a.id] || 0);
    if (S.isTorneo) return (S.corone[b.id] || 0) - (S.corone[a.id] || 0);
    return b.punti - a.punti;
  });
  const mia = classifica.findIndex(g => g.id === S.io);

  $("final-title").textContent =
    mia === 0 ? (S.isBoard ? "Vittoria nel Tabellone!" : S.isTorneo ? "Re della Collina!" : "Hai vinto!") : mia === 1 ? "Secondo posto" : "Fine partita";
  $("final-trophy").textContent = mia === 0 ? "👑" : mia === classifica.length - 1 ? "💀" : "🎖️";

  $("final-table").innerHTML =
    "<tr><th></th><th>Giocatore</th><th>" + (S.isBoard ? "Casella" : S.isTorneo ? "Corone" : "Punti") + "</th></tr>" +
    classifica.map((g, i) =>
      "<tr class='" + (i === 0 ? "vinto " : "") + (g.id === S.io ? "mio" : "") + "'>" +
        "<td class='pos'>" + (medaglia(i) || (i + 1)) + "</td>" +
        "<td><i class='pastiglia' style='background:" + g.colore + "'>" + (g.avatar || "") + "</i>" +
          fuggiHtml(g.nome) + "</td>" +
        "<td class='punti'>" + (S.isBoard ? (S.posizioni[g.id] || 0) : S.isTorneo ? (S.corone[g.id] || 0) + " 👑" : g.punti) + "</td>" +
      "</tr>").join("");

  const vinti = S.storico.filter(t => t.length && t[0].id === S.io).length;
  $("final-stats").innerHTML = S.isTorneo 
    ? "Torneo Re della Collina terminato!"
    : (S.gioco.icona + " " + fuggiHtml(S.gioco.nome) + " · " + S.giocatori.length + " giocatori<br>" +
       "Round vinti: <b>" + vinti + " su " + S.storico.length + "</b>");

  if (mia === 0) {
    coriandoli(90);
    if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
    else if (window.Suoni) { Suoni.playDing(); setTimeout(() => Suoni.playDing(), 200); }
    if (window.Vibrazione) Vibrazione.successo();
    if (S.isTorneo && window.Trofei) Trofei.sblocca("campione_torneo");
  } else {
    if (window.Suoni && Suoni.playSconfitta) Suoni.playSconfitta();
    else if (window.Suoni) Suoni.playBuzzer();
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

function avviaPartita(torneo = false, board = false) {
  if (board) {
    if (Object.keys(S.posizioni || {}).length === 0) {
      azzera(true);
      S.posizioni = {};
      S.giocatori.forEach(g => S.posizioni[g.id] = 0);
    } else {
      azzera(false);
    }
    S.isBoard = true;
    
    if (S.ruolo === "host" || S.ruolo === "solo") {
      if (S.ruolo === "host") {
        Rete.invia("partita", {
          boardInit: true,
          posizioni: S.posizioni,
          giocatori: elencoDaSpedire()
        });
      }
      entraInBoard();
    }
    return;
  }

  if (torneo || S.isBoard) {
    if (!S.isBoard) {
      if (Object.keys(S.corone || {}).length === 0) azzera(true);
      else azzera(false); 
      S.isTorneo = true;
    }
    const giochiValidi = GIOCHI.filter(g => !motivoBlocco(g));
    if (giochiValidi.length === 0) { toast("Nessun gioco supporta questo numero di giocatori."); return; }
    
    if (!(S.isBoard && S.gioco)) {
      S.gioco = scegli(giochiValidi);
      S.giocoId = S.gioco.id;
    }
    // In torneo o board gioca 1 solo round
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
      isBoard: S.isBoard,
      corone: S.corone,
      posizioni: S.posizioni
    });
    Rete.invia("via", { round: 0 });
    setTimeout(preparaRound, S.latenza);
  } else {
    preparaRound();
  }
}

function lanciaSfidaBoard(sceltaId) {
  if (sceltaId) {
    S.giocoId = sceltaId;
    S.gioco = GIOCHI.find(g => g.id === sceltaId);
  }
  avviaPartita(false, false); 
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

    // Genera QR Code per accesso immediato da cellulare
    aggiornaQRCodeStanza(codice);
  });

function aggiornaQRCodeStanza(codice) {
  const qrContainer = $("host-qrcode");
  if (!qrContainer) return;

  if (location.protocol === "file:") {
    qrContainer.innerHTML = `
      <div style="background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4); color: #fde047; padding: 10px; border-radius: 12px; font-size: 0.82rem; text-align: center; max-width: 200px; line-height: 1.4;">
        ⚠️ <b>Sei su file:// locale</b><br>
        I telefoni non possono aprire file del PC.<br>
        Inserisci dal telefono il codice a mano:<br>
        <b style="font-size: 1.25rem; color: #fff; letter-spacing: 2px;">${codice}</b>
      </div>
    `;
    return;
  }

  const url = location.origin + location.pathname + "?s=" + codice;
  if (window.GeneratoreQR) {
    const svg = GeneratoreQR.creaSVG(url, { dimensione: 160, margine: 4 });
    if (svg) {
      qrContainer.innerHTML = svg;
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        const info = document.createElement("div");
        info.style.cssText = "font-size: 0.75rem; color: #94a3b8; margin-top: 6px; text-align: center; max-width: 200px; line-height: 1.3;";
        info.innerHTML = `💡 Se il cellulare è sulla stessa Wi-Fi, apri il sito con l'IP locale del PC o digita il codice <b>${codice}</b>!`;
        qrContainer.appendChild(info);
      }
    } else {
      qrContainer.innerHTML = `<b style="font-size: 1.2rem; color: #ffd23b;">Codice: ${codice}</b>`;
    }
  }
}

  // l'ospite, appena il canale si apre, si presenta
  Rete.on("connesso", () => {
    if (S.ruolo === "ospite") Rete.invia("ciao", { nome: S.nome, avatar: S.avatar });
    else misuraLatenza();
  });

  Rete.on("messaggio", (m) => {
    switch (m.tipo) {

      case "ciao": {                     // solo l'host lo riceve
        if (S.ruolo !== "host") break;
        aggiungiGiocatore(m.da, (m.nome || "Giocatore").slice(0, 14), m.avatar);
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
        if (m.boardInit) {
          azzera(true);
          S.isBoard = true;
          S.posizioni = m.posizioni || {};
          S.boardVincitore = m.boardVincitore;
          S.boardUltimo = m.boardUltimo;
          entraInBoard();
          break;
        }
        azzera(false);
        S.isTorneo = !!m.isTorneo;
        S.isBoard = !!m.isBoard;
        S.corone = m.corone || {};
        S.posizioni = m.posizioni || {};
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
        
      case "boardDado":
        if (S.ruolo === "host") lanciaDadoBoardHost(m.dado);
        break;

      case "boardDadoAnim":
        animaLancioBoard(m.tiratoreId, m.dado, m.boardUltimo);
        break;
        
      case "boardScegliGioco":
        if (S.ruolo === "host") lanciaSfidaBoard(m.giocoId);
        break;
        
      case "reazione":
        mostraReazione(m.emoji, m.da);
        break;

      case "votoInizia":
        Votazione.mostraModale(m.candidati, m.durata);
        break;

      case "votoTick":
        if ($("voto-timer")) $("voto-timer").textContent = m.secondi + "s";
        break;

      case "votoScelta":
        if (S.ruolo === "host") Votazione.registraVoto(m.da, m.sceltaId);
        break;

      case "votoAggiorna":
        Votazione.voti = m.voti;
        Votazione.aggiornaUI();
        break;

      case "votoFine":
        Votazione.mostraVincitore(m.vincitoreId);
        break;

      case "chatMsg":
        mostraBollaChat(m.testo, m.autore, m.avatar, m.colore);
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
      "<i class='pastiglia' style='background:" + g.colore + "'>" + (g.avatar || "") + "</i>" +
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
        (g.avatar || fuggiHtml((g.nome || "?").slice(0, 1).toUpperCase())) + "</div>" +
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

/* ------------------------------------------------------- reazioni rapide & chat */
function mostraReazione(emoji, daId) {
  const layer = $("reactions-layer");
  if (!layer) return;
  const g = gioc(daId);
  const div = document.createElement("div");
  div.className = "floating-reaction";
  div.textContent = emoji;
  const x = 10 + Math.random() * 80;
  div.style.left = x + "%";
  if (g) div.style.textShadow = "0 0 15px " + g.colore;
  layer.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 3000);
}

function inviaQuickChat(testo) {
  const mioG = gioc(S.io);
  const autore = mioG ? mioG.nome : S.nome || "Io";
  const avatar = mioG ? (mioG.avatar || "🦁") : S.avatar || "🦁";
  const colore = mioG ? mioG.colore : "#0ea5e9";

  mostraBollaChat(testo, autore, avatar, colore);
  if (S.ruolo !== "solo") {
    Rete.invia("chatMsg", { testo, autore, avatar, colore });
  }
  if (window.Trofei) Trofei.incrementaContatore("social", 5, "socialite");
}

function mostraBollaChat(testo, autore, avatar, colore) {
  const layer = $("reactions-layer");
  if (!layer) return;
  const div = document.createElement("div");
  div.className = "floating-bubble";
  div.style.borderColor = colore;
  div.innerHTML = `<small style="color:${colore}">${avatar} ${fuggiHtml(autore)}</small>${fuggiHtml(testo)}`;
  const x = 12 + Math.random() * 65;
  div.style.left = x + "%";
  layer.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
  // Reazioni Emoji
  document.querySelectorAll(".reaction-emoji-btn").forEach(b => {
    b.onclick = () => {
      const emoji = b.textContent;
      mostraReazione(emoji, S.io);
      if (S.ruolo !== "solo") Rete.invia("reazione", { emoji: emoji });
      if (window.Suoni) Suoni.playClick();
      if (window.Trofei) Trofei.incrementaContatore("social", 5, "socialite");
    };
  });

  // Toggle drawer frasi rapide
  const btnToggleChat = $("btn-toggle-chat");
  const drawerChat = $("quick-chat-drawer");
  if (btnToggleChat && drawerChat) {
    btnToggleChat.onclick = (e) => {
      e.stopPropagation();
      drawerChat.classList.toggle("is-open");
      if (window.Suoni) Suoni.playClick();
    };

    document.addEventListener("click", (e) => {
      if (!drawerChat.contains(e.target) && e.target !== btnToggleChat) {
        drawerChat.classList.remove("is-open");
      }
    });
  }

  // Click su pillole di frase rapida
  document.querySelectorAll(".chat-pill-btn").forEach(b => {
    b.onclick = () => {
      const testo = b.textContent;
      inviaQuickChat(testo);
      if (drawerChat) drawerChat.classList.remove("is-open");
      if (window.Suoni) Suoni.playClick();
    };
  });
});

