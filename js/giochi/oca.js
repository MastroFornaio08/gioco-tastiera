/* 🪿 Gioco dell'Oca — Partita secca a 50 caselle con rimbalzo e bonus/malus bilanciati */

const CASELLE_MINI_OCA = [
  { n: 0, nome: "Partenza", icona: "🚩", tipo: "start" },
  { n: 1, nome: "Prato", icona: "🌱", tipo: "normale" },
  { n: 2, nome: "Sentiero", icona: "🌿", tipo: "normale" },
  { n: 3, nome: "Radura", icona: "🌼", tipo: "normale" },
  { n: 4, nome: "Boschetto", icona: "🌲", tipo: "normale" },
  { n: 5, nome: "Ruscello", icona: "💧", tipo: "normale" },
  { n: 6, nome: "Turbo Razzo", icona: "🚀", tipo: "turbo", delta: 3 },        // -> 9
  { n: 7, nome: "Ponte di Legno", icona: "🪵", tipo: "normale" },
  { n: 8, nome: "Collina", icona: "⛰️", tipo: "normale" },
  { n: 9, nome: "Mulino Antico", icona: "🌾", tipo: "normale" },
  { n: 10, nome: "Scivolo Fango", icona: "🍌", tipo: "malus", delta: 2 },     // -> 8
  { n: 11, nome: "Pianura", icona: "🌾", tipo: "normale" },
  { n: 12, nome: "Fiume Blu", icona: "🌊", tipo: "normale" },
  { n: 13, nome: "Oca Magica", icona: "🪿", tipo: "oca" },                    // -> 14..19
  { n: 14, nome: "Radura Verde", icona: "🌱", tipo: "normale" },
  { n: 15, nome: "Frutteto", icona: "🍎", tipo: "normale" },
  { n: 16, nome: "Stagno", icona: "🐸", tipo: "normale" },
  { n: 17, nome: "Cascata", icona: "💧", tipo: "normale" },
  { n: 18, nome: "Sorgente", icona: "✨", tipo: "normale" },
  { n: 19, nome: "Sentiero Pietre", icona: "🪨", tipo: "normale" },
  { n: 20, nome: "Pozzo Buio", icona: "🕳️", tipo: "trappola", delta: 3 },    // -> 17
  { n: 21, nome: "Valle Quieta", icona: "🍃", tipo: "normale" },
  { n: 22, nome: "Dado Extra", icona: "🎲", tipo: "extra" },
  { n: 23, nome: "Radura Soleggiata", icona: "☀️", tipo: "normale" },
  { n: 24, nome: "Super Turbo", icona: "🚀", tipo: "turbo", delta: 4 },       // -> 28
  { n: 25, nome: "Bosco di Pini", icona: "🌲", tipo: "normale" },
  { n: 26, nome: "Passo Roccioso", icona: "🧗", tipo: "normale" },
  { n: 27, nome: "Rifugio Alpino", icona: "🏡", tipo: "normale" },
  { n: 28, nome: "Valico del Vento", icona: "🌬️", tipo: "normale" },
  { n: 29, nome: "Buccia Banana", icona: "🍌", tipo: "malus", delta: 2 },     // -> 27
  { n: 30, nome: "Castello di Pietra", icona: "🏰", tipo: "normale" },
  { n: 31, nome: "Ponte Levatoio", icona: "🌉", tipo: "normale" },
  { n: 32, nome: "Oca Reale", icona: "🪿", tipo: "oca" },                     // -> 33..38
  { n: 33, nome: "Corte Reale", icona: "👑", tipo: "normale" },
  { n: 34, nome: "Giardino Reale", icona: "🌷", tipo: "normale" },
  { n: 35, nome: "Fontana Magica", icona: "⛲", tipo: "normale" },
  { n: 36, nome: "Labirinto", icona: "🧭", tipo: "normale" },
  { n: 37, nome: "Viale degli Olmi", icona: "🌳", tipo: "normale" },
  { n: 38, nome: "Arco Antico", icona: "🏛️", tipo: "normale" },
  { n: 39, nome: "Trappola Ragnatela", icona: "🕸️", tipo: "trappola", delta: 3 }, // -> 36
  { n: 40, nome: "Colle Ventoso", icona: "🪁", tipo: "normale" },
  { n: 41, nome: "Dado d'Oro", icona: "🎲", tipo: "extra" },
  { n: 42, nome: "Oca Dorata", icona: "🪿", tipo: "oca" },                    // -> 43..48
  { n: 43, nome: "Torre di Guardia", icona: "🗼", tipo: "normale" },
  { n: 44, nome: "Sentiero di Notte", icona: "🌙", tipo: "normale" },
  { n: 45, nome: "Turbo Finale", icona: "🚀", tipo: "turbo", delta: 3 },      // -> 48
  { n: 46, nome: "Piazza d'Onore", icona: "⭐", tipo: "normale" },
  { n: 47, nome: "Porta Trionfale", icona: "🚪", tipo: "normale" },
  { n: 48, nome: "Viale dei Campioni", icona: "🏆", tipo: "normale" },
  { n: 49, nome: "Ultimo Balzo", icona: "✨", tipo: "normale" },
  { n: 50, nome: "TRAGUARDO", icona: "🏆", tipo: "traguardo" }
];

const FACCE_OCA = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const OCA_TRAGUARDO = 50;
const OCA_MS_PASSO = 150;          // prima 230: con 2 minuti la partita finiva quasi sempre a tempo
const OCA_MS_ATTESA_ASSENTE = 15000; // turno di un giocatore che non tira: lo tira il successivo

/** Testo sicuro da mettere in innerHTML (i nomi arrivano dagli altri giocatori). */
function escOca(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

GIOCHI.push({
  id: "oca",
  nome: "Gioco dell'Oca",
  icona: "🪿",
  desc: "Partita secca a 50 caselle: lancia i dadi, sfrutta bonus rari e centra il traguardo!",
  regole: [
    "🏆 <b>Partita Secca</b>: un solo round unico fino alla casella 50!",
    "🎯 <b>Numero esatto per vincere</b>: devi centrare esattamente il 50! Se superi il traguardo, <b>rimbalzi indietro</b> delle caselle in eccesso!",
    "🛡️ <b>Bonus Equi & Protetti</b>: i bonus sono rari e non ti faranno MAI finire direttamente su un malus!",
    "🔁 <b>Una sola volta</b>: se dopo un bonus o rimbalzo torni su una casella speciale, non si riattiva nello stesso turno!",
    "🪿 <b>Oca (13, 32, 42)</b>: Raddoppia i passi del dado e salta avanti!",
    "🚀 <b>Turbo (6, 24, 45)</b>: Scatto propulsivo verso caselle sicure.",
    "🍌 <b>Scivoli & Trappole (10, 20, 29, 39)</b>: Fango o pozzo, arretri di poche caselle.",
    "🎲 <b>Dado Extra (22, 41)</b>: Ottieni un tiro immediato aggiuntivo!",
    "Chi taglia per primo il <b>Traguardo (50)</b> vince <b>500 punti</b>!"
  ],
  gara: false,
  solo: true,
  maxGiocatori: 6,
  durata: 180,

  generaPartita() {
    return [{}];
  },

  fantasma() {
    return { punti: 350, dettaglio: "Casella 45/50", tempo: 55 };
  },

  crea(api) {
    const isSolo = (typeof S !== "undefined" && S.ruolo === "solo")
      || api.giocatori.length <= 1
      || api.giocatori.some(g => g.id === "gh" || g.id === "bot");

    // Ordine stabile e uguale su tutti i client: per id, NON filtrato per "online"
    // (chi si disconnette resta in lista e il suo turno viene tirato da un altro).
    let giocatori = api.giocatori.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
    if (giocatori.filter(g => g.online !== false).length <= 1) {
      giocatori = [
        api.giocatori[0] || { id: "p0", nome: "Tu", avatar: "😎" },
        { id: "gh", nome: "Fantasma", avatar: "👻" }
      ];
    }

    const n = giocatori.length;
    const mioIndice = isSolo ? 0 : Math.max(0, giocatori.findIndex(g => g.id === api.io));
    const posizioni = new Array(n).fill(0);
    const caselleUsateNelTurno = new Set();

    let turno = 0;
    let mossa = 0;            // contatore delle mosse: scarta i messaggi doppi o vecchi
    let concluso = false;
    let inAnimazione = false;
    const coda = [];          // tiri arrivati mentre un'animazione è in corso

    // --- timer: tutti tracciati, così chiudi() li ferma davvero ---------------
    const timers = new Set();
    const dopo = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!concluso) fn(); }, ms); timers.add(t); return t; };
    const ogni = (fn, ms) => { const t = setInterval(fn, ms); timers.add(t); return t; };
    const ferma = t => { clearTimeout(t); clearInterval(t); timers.delete(t); };
    const fermaTutto = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers.clear(); };
    let timerTurno = null;

    // --- interfaccia ------------------------------------------------------------
    api.arena.innerHTML = `
      <div class="oca-arena">
        <div class="oca-header">
          <div class="oca-turno">Tocca a: <span id="oca-turno-nome">...</span></div>
          <div class="oca-mia-pos">Tua casella: <b id="oca-mia-pos">0</b>/${OCA_TRAGUARDO}</div>
        </div>
        <div id="oca-event-banner" class="oca-banner">Partita Secca a 50 caselle! Centra il 50 esatto!</div>
        <div class="oca-track-wrapper"><div id="oca-track" class="oca-track"></div></div>
        <div class="oca-controls">
          <div id="oca-dice-cube" class="oca-dado">🎲</div>
          <button id="oca-roll-btn" class="btn btn-primary oca-btn-tira">🎲 TIRA IL DADO!</button>
        </div>
      </div>`;

    const $ = sel => api.arena.querySelector(sel);
    const elTrack = $("#oca-track");
    const elWrapper = $(".oca-track-wrapper");
    const elTurnoNome = $("#oca-turno-nome");
    const elMiaPos = $("#oca-mia-pos");
    const elBanner = $("#oca-event-banner");
    const elDado = $("#oca-dice-cube");
    const btnRoll = $("#oca-roll-btn");

    function disegnaPercorso() {
      // Una sola scrittura del DOM invece di 51 "innerHTML +="
      elTrack.innerHTML = CASELLE_MINI_OCA.map(c => `
        <div class="oca-tile tipo-${c.tipo}" id="oca-tile-${c.n}">
          <div class="oca-tile-testa"><span class="oca-badge">#${c.n}</span><span class="oca-icona">${c.icona}</span></div>
          <div class="oca-tile-slot" id="oca-slot-${c.n}"></div>
          <div class="oca-tile-nome">${escOca(c.nome)}</div>
        </div>`).join("");
    }

    const slots = [];
    function aggiornaPedine() {
      for (let i = 0; i <= OCA_TRAGUARDO; i++) {
        slots[i] = slots[i] || $("#oca-slot-" + i);
        slots[i].innerHTML = "";
      }
      giocatori.forEach((g, idx) => {
        const pos = Math.min(Math.max(posizioni[idx] || 0, 0), OCA_TRAGUARDO);
        slots[pos].insertAdjacentHTML("beforeend",
          `<div class="oca-pedina" title="${escOca(g.nome)}">${escOca(g.avatar)}</div>`);
      });
      elMiaPos.textContent = posizioni[mioIndice] || 0;
      api.avanzo((posizioni[mioIndice] || 0) / OCA_TRAGUARDO);

      // Scorre solo la plancia, non tutta la pagina
      const tile = $("#oca-tile-" + (posizioni[turno] || 0));
      if (tile) {
        const top = tile.offsetTop - elWrapper.clientHeight / 2 + tile.clientHeight / 2;
        elWrapper.scrollTo({ top, behavior: "smooth" });
      }
    }

    const eBot = idx => isSolo ? idx !== mioIndice : (giocatori[idx].id === "gh" || giocatori[idx].id === "bot");

    function aggiornaStato() {
      if (concluso) return;
      const g = giocatori[turno];
      const mio = turno === mioIndice;
      elTurnoNome.textContent = mio ? "TE! 🎯" : g.nome;

      const puoTirare = mio && !inAnimazione;
      btnRoll.disabled = !puoTirare;
      btnRoll.textContent = puoTirare ? "🎲 TIRA IL DADO!" : inAnimazione ? "Dado in volo..." : `In attesa di ${g.nome}...`;
      elDado.classList.toggle("attivo", puoTirare);

      ferma(timerTurno);
      if (inAnimazione) return;

      if (eBot(turno)) {
        timerTurno = dopo(() => { if (!inAnimazione) tira(turno); }, 900);
      } else if (!mio && !isSolo) {
        // Giocatore assente: dopo 15 s tira per lui il giocatore successivo
        const mossaAttesa = mossa;
        timerTurno = dopo(() => {
          if (!inAnimazione && mossa === mossaAttesa && (turno + 1) % n === mioIndice) {
            elBanner.textContent = `${g.nome} non risponde: tiro al suo posto.`;
            tira(turno);
          }
        }, OCA_MS_ATTESA_ASSENTE);
      }
    }

    /** Tiro generato su questo client (io, bot, o un assente). */
    function tira(idx) {
      if (concluso || inAnimazione || idx !== turno) return;
      let dado = Math.floor(Math.random() * 6) + 1;
      let maledetto = false;
      if (idx === mioIndice && window.Malus) {
        const malusId = window.Malus.estraiId(typeof S !== "undefined" ? S.malusNelRoundCorrente : null);
        if (malusId === "dado_lento" && dado > 3) { dado = 3; maledetto = true; }
      }
      const msg = { tipo: "tiroOca", mossa, chi: giocatori[idx].id, dado, maledetto };
      if (!isSolo) api.invia(msg);
      eseguiTiro(msg);
    }

    /** Applica un tiro (locale o ricevuto). Ignora doppioni e messaggi fuori sequenza. */
    function eseguiTiro(m) {
      if (concluso || m.mossa !== mossa) return;
      const idx = giocatori.findIndex(g => g.id === m.chi);
      if (idx !== turno) return;
      mossa++;
      animaDado(idx, m.dado, m.maledetto);
    }

    function processaCoda() {
      while (coda.length && !inAnimazione && !concluso) eseguiTiro(coda.shift());
    }

    function animaDado(idx, dado, maledetto) {
      inAnimazione = true;
      caselleUsateNelTurno.clear();
      aggiornaStato();
      const g = giocatori[idx];
      elBanner.textContent = `${g.nome} sta lanciando il dado...`;
      elDado.classList.add("rotola");

      let count = 0;
      const t = ogni(() => {
        count++;
        elDado.textContent = FACCE_OCA[Math.floor(Math.random() * 6)];
        if (window.Suoni && count % 2 === 0) Suoni.playTick();
        if (count >= 10) {
          ferma(t);
          elDado.classList.remove("rotola");
          elDado.textContent = FACCE_OCA[dado - 1];
          if (window.Suoni) Suoni.playDing();
          // Il dado maledetto ora si vede: prima il messaggio veniva sovrascritto subito
          elBanner.innerHTML = maledetto
            ? `🎲 <b>DADO MALEDETTO!</b> ${escOca(g.nome)} ottiene solo un <b>${dado}</b>!`
            : `🎲 <b>${escOca(g.nome)}</b> ha ottenuto un <b>${dado}</b>!`;
          dopo(() => muoviPassi(idx, dado, 1, () => applicaEffetto(idx, dado, 0)), 500);
        }
      }, 75);
    }

    function muoviPassi(idx, passi, verso, callback) {
      const g = giocatori[idx];
      const t = ogni(() => {
        if (concluso) { ferma(t); return; }
        if (passi <= 0) { ferma(t); callback(); return; }
        if (verso === 1 && posizioni[idx] >= OCA_TRAGUARDO) {
          verso = -1;
          elBanner.innerHTML = `↩️ <b>RIMBALZO!</b> Superato il 50! ${escOca(g.nome)} torna indietro!`;
          if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
          if (window.Vibrazione) Vibrazione.errore();
        }
        posizioni[idx] = Math.max(0, posizioni[idx] + verso);
        passi--;
        aggiornaPedine();
        if (window.Suoni) Suoni.playTick();
      }, OCA_MS_PASSO);
    }

    function applicaEffetto(idx, dado, catena) {
      const g = giocatori[idx];
      const nome = escOca(g.nome);
      const pos = posizioni[idx];
      const c = CASELLE_MINI_OCA[pos] || CASELLE_MINI_OCA[0];

      if (pos === OCA_TRAGUARDO) return terminaGioco(idx);
      if (caselleUsateNelTurno.has(pos) || catena >= 6) return chiudiTurno(false);

      const combo = catena > 0 ? "🔥 <b>COMBO A CATENA!</b> " : "";
      const salta = (passi, verso) =>
        dopo(() => muoviPassi(idx, passi, verso, () => applicaEffetto(idx, dado, catena + 1)), 700);

      switch (c.tipo) {
        case "oca":
          caselleUsateNelTurno.add(pos);
          elBanner.innerHTML = `${combo}🪿 <b>OCA!</b> ${nome} raddoppia il lancio: <b>+${dado}</b> passi!`;
          if (window.Suoni) Suoni.playDing();
          if (window.Vibrazione) Vibrazione.successo();
          return salta(dado, 1);
        case "turbo":
          caselleUsateNelTurno.add(pos);
          elBanner.innerHTML = `${combo}🚀 <b>TURBO!</b> ${nome} scatta avanti di <b>+${c.delta}</b> caselle!`;
          if (window.Suoni) Suoni.playDing();
          return salta(c.delta, 1);
        case "malus":
        case "trappola":
          caselleUsateNelTurno.add(pos);
          elBanner.innerHTML = c.tipo === "malus"
            ? `${combo}🍌 <b>SCIVOLO!</b> ${nome} scivola indietro di <b>-${c.delta}</b> caselle!`
            : `${combo}🕳️ <b>TRAPPOLA!</b> ${nome} cade e arretra di <b>-${c.delta}</b> caselle!`;
          if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
          if (window.Vibrazione) Vibrazione.errore();
          return salta(c.delta, -1);
        case "extra":
          caselleUsateNelTurno.add(pos);
          elBanner.innerHTML = `${combo}🎲 <b>DADO EXTRA!</b> ${nome} ottiene un tiro bonus immediato!`;
          if (window.Suoni) Suoni.playDing();
          return dopo(() => chiudiTurno(true), 1000);
        default:
          return chiudiTurno(false);
      }
    }

    function chiudiTurno(tiraAncora) {
      if (concluso) return;
      inAnimazione = false;
      caselleUsateNelTurno.clear();
      if (!tiraAncora) turno = (turno + 1) % n;
      aggiornaStato();
      processaCoda();
    }

    function registraFantasma(punti, dettaglio) {
      if (!isSolo || typeof S === "undefined") return;
      S.fantasmaDati = { punti, dettaglio, tempo: api.tempo ? api.tempo() : 30 };
      if (S.esiti) S.esiti[typeof ID_FANTASMA !== "undefined" ? ID_FANTASMA : "gh"] = S.fantasmaDati;
    }

    function terminaGioco(vincitoreIdx) {
      if (concluso) return;
      concluso = true;
      inAnimazione = false;
      fermaTutto();

      const v = giocatori[vincitoreIdx];
      const ioVinco = vincitoreIdx === mioIndice;
      elBanner.innerHTML = `🏆 <b>${escOca(v.nome)} TAGLIA IL TRAGUARDO SUL 50 E VINCE LA PARTITA!</b>`;
      if (ioVinco) {
        if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
        if (window.Vibrazione) Vibrazione.successo();
      }

      const ghIdx = giocatori.findIndex(g => g.id === "gh" || g.id === "bot");
      if (ghIdx >= 0) {
        const posGh = posizioni[ghIdx];
        registraFantasma(vincitoreIdx === ghIdx ? 500 : Math.round((posGh / OCA_TRAGUARDO) * 350),
          vincitoreIdx === ghIdx ? "1° al Traguardo! 🏆" : `Casella ${posGh}/50`);
      }

      // setTimeout "nudo": deve partire anche se concluso è già true
      setTimeout(() => api.finito({
        punti: ioVinco ? 500 : Math.round((posizioni[mioIndice] / OCA_TRAGUARDO) * 350),
        dettaglio: ioVinco ? "1° al Traguardo (50)! 🏆" : `Casella ${posizioni[mioIndice]}/50`
      }), 1800);
    }

    function tempoScaduto() {
      if (concluso) return;
      concluso = true;
      fermaTutto();

      const maxPos = Math.max(...posizioni);
      const sonoPrimo = posizioni[mioIndice] === maxPos && maxPos > 0;
      const ghIdx = giocatori.findIndex(g => g.id === "gh" || g.id === "bot");
      if (ghIdx >= 0) {
        const posGh = posizioni[ghIdx];
        registraFantasma(posGh === maxPos && maxPos > 0 ? 400 : Math.round((posGh / OCA_TRAGUARDO) * 300),
          `Casella ${posGh}/50`);
      }
      api.finito({
        punti: sonoPrimo ? 400 : Math.round((posizioni[mioIndice] / OCA_TRAGUARDO) * 300),
        dettaglio: `Tempo scaduto (Casella ${posizioni[mioIndice]}/50)`
      });
    }

    const mioTiro = () => { if (turno === mioIndice) tira(mioIndice); };
    btnRoll.onclick = mioTiro;
    elDado.onclick = mioTiro;

    disegnaPercorso();
    aggiornaPedine();
    aggiornaStato();

    return {
      messaggio(m) {
        if (!m || concluso || m.tipo !== "tiroOca") return;
        // Se c'è un'animazione in corso il tiro aspetta il suo turno, invece di sovrapporsi
        if (inAnimazione) coda.push(m); else eseguiTiro(m);
      },
      scaduto: tempoScaduto,
      chiudi() {
        concluso = true;
        fermaTutto();
      }
    };
  }
});