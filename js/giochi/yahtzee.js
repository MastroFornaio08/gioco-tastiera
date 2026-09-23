/* 🎲 Yahtzee lampo — cinque dadi, tre tiri, una combinazione sola.

   Lo Yahtzee vero dura tredici mani: troppo per un round da party. Qui se ne
   gioca una per turno: tiri, blocchi i dadi che ti servono, ritiri fino a due
   volte, e alla fine incassi la combinazione migliore che hai in mano.

   Si gioca a turno perché i dadi vanno visti da tutti: la tensione di guardare
   l'avversario che ritira è metà del gioco. Il lancio lo decide l'arbitro e lo
   comunica a tutti, così nessuno può rilanciare finché non gli piace. */

const COMBINAZIONI = [
  { id: "poker5",  nome: "Yahtzee",        punti: 500, prova: c => max(c) >= 5 },
  { id: "poker4",  nome: "Poker",          punti: 300, prova: c => max(c) >= 4 },
  { id: "scala5",  nome: "Scala reale",    punti: 280, prova: (c, d) => scala(d, 5) },
  { id: "full",    nome: "Full",           punti: 220, prova: c => vals(c).includes(3) && vals(c).includes(2) },
  { id: "scala4",  nome: "Scala",          punti: 160, prova: (c, d) => scala(d, 4) },
  { id: "tris",    nome: "Tris",           punti: 120, prova: c => max(c) >= 3 },
  { id: "coppie2", nome: "Doppia coppia",  punti: 80,  prova: c => vals(c).filter(v => v >= 2).length >= 2 },
  { id: "coppia",  nome: "Coppia",         punti: 40,  prova: c => max(c) >= 2 }
];

function conta(dadi) {
  const c = {};
  dadi.forEach(d => { c[d] = (c[d] || 0) + 1; });
  return c;
}
function vals(c) { return Object.values(c); }
function max(c) { return Math.max(0, ...vals(c)); }

/* Scala di lunghezza n fra i valori presenti, senza contare i doppioni. */
function scala(dadi, n) {
  const unici = [...new Set(dadi)].sort((a, b) => a - b);
  let filo = 1, massimo = 1;
  for (let i = 1; i < unici.length; i++) {
    filo = unici[i] === unici[i - 1] + 1 ? filo + 1 : 1;
    massimo = Math.max(massimo, filo);
  }
  return massimo >= n;
}

/* La combinazione migliore fra quelle realizzate: l'elenco è già in ordine
   di valore decrescente, quindi vince la prima che passa la prova. */
function migliore(dadi) {
  const c = conta(dadi);
  const trovata = COMBINAZIONI.find(k => k.prova(c, dadi));
  return trovata || { nome: "Niente", punti: 10 };
}

GIOCHI.push({
  id: "yahtzee",
  nome: "Yahtzee",
  icona: "🎲",
  desc: "Cinque dadi, tre tiri. Blocca quelli buoni e cerca la combinazione.",
  regole: [
    "A turno: <b>un tiro e due ritiri</b>. Tocca i dadi per bloccarli.",
    "Vale solo la <b>combinazione migliore</b> che resta in mano.",
    "Yahtzee <b>500</b>, poker 300, scala reale 280, full 220, tris 120.",
    "I dadi li lancia l'arbitro: nessuno può ritirare di nascosto."
  ],
  gara: false,
  solo: false,
  maxGiocatori: 6,
  durata: 300,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, () => ({ tiri: 3 }));
  },

  crea(api) {
    const giocatori = api.giocatori.filter(g => g.online);
    const n = giocatori.length;
    const io = api.indiceMio;
    const maxTiri = api.dati.tiri;

    let turno = api.round % n;
    let dadi = [0, 0, 0, 0, 0];
    let bloccati = [false, false, false, false, false];
    let tiriFatti = 0;
    let concluso = false;
    const risultati = new Array(n).fill(null);
    let attesa = null;

    api.arena.innerHTML =
      "<div class='mem-testa' id='ya-testa'></div>" +
      "<div class='ya-dadi' id='ya-dadi'></div>" +
      "<div class='ya-mano' id='ya-mano'></div>" +
      "<button class='btn btn-primary btn-small' id='ya-tira'>Tira</button>" +
      "<div class='mem-punti' id='ya-punti'></div>";

    const elTesta = api.arena.querySelector("#ya-testa");
    const elDadi = api.arena.querySelector("#ya-dadi");
    const elMano = api.arena.querySelector("#ya-mano");
    const btnTira = api.arena.querySelector("#ya-tira");
    const elPunti = api.arena.querySelector("#ya-punti");

    function disegna() {
      const mio = turno === io;
      elTesta.innerHTML = "<span class='mem-turno " + (mio ? "attivo" : "") + "'>" +
        (mio ? "Tocca a te" : "Tira " + fuggiHtml(giocatori[turno].nome)) + "</span>" +
        "<span class='mem-conta'>Tiro " + Math.min(tiriFatti + 1, maxTiri) + " di " + maxTiri + "</span>";

      elDadi.innerHTML = dadi.map((d, i) =>
        "<button class='ya-dado" + (bloccati[i] ? " bloccato" : "") + (d ? "" : " vuoto") + "' " +
        "data-i='" + i + "'>" + (d ? "⚀⚁⚂⚃⚄⚅"[d - 1] : "·") + "</button>").join("");

      const mTotale = dadi[0] ? migliore(dadi) : null;
      const dadiBloccati = dadi.filter((_, i) => bloccati[i]);
      const mSicuro = dadiBloccati.length > 0 ? migliore(dadiBloccati) : null;

      if (mTotale) {
        let htmlMano = "<span class='ya-combo'>" + fuggiHtml(mTotale.nome) + " · <b>" + mTotale.punti + "</b></span>";
        if (tiriFatti < maxTiri && mSicuro && mSicuro.punti > 10) {
          htmlMano += "<br><span class='ya-combo-sicuro' style='font-size:0.85em; opacity:0.8; margin-top:4px; display:inline-block;'>Garantito: " + fuggiHtml(mSicuro.nome) + " · <b>" + mSicuro.punti + "</b></span>";
        }
        elMano.innerHTML = htmlMano;
      } else {
        elMano.innerHTML = "<span class='ya-combo vuota'>nessun tiro ancora</span>";
      }

      btnTira.disabled = !mio || tiriFatti >= maxTiri;
      btnTira.textContent = tiriFatti === 0 ? "Tira"
        : tiriFatti >= maxTiri ? "Tiri finiti" : "Ritira (" + (maxTiri - tiriFatti) + ")";

      elPunti.innerHTML = giocatori.map((g, k) =>
        "<span class='mem-p" + (k === turno ? " ora" : "") + "'>" +
          "<i class='pastiglia' style='background:" + g.colore + "'></i>" +
          fuggiHtml(g.nome) + " <b>" + (risultati[k] === null ? "—" : risultati[k].punti) + "</b></span>").join("");

      elDadi.querySelectorAll(".ya-dado").forEach(b => {
        b.onclick = () => {
          if (turno !== io || !dadi[0] || tiriFatti >= maxTiri) return;
          const i = Number(b.dataset.i);
          api.invia({ t: "blocca", i });
          blocca(i);
        };
      });
    }

    function blocca(i) {
      if (!dadi[0]) return;
      bloccati[i] = !bloccati[i];
      disegna();
    }

    /* Solo l'arbitro genera i numeri, poi li comunica: così i dadi sono
       gli stessi su tutti gli schermi e nessuno può ritirare per conto suo. */
    function chiediTiro() {
      if (turno !== io || tiriFatti >= maxTiri) return;
      if (api.sonoHost) eseguiTiro(nuoviValori());
      else api.aArbitro({ t: "chiedoTiro" });
    }

    function nuoviValori() {
      return dadi.map((d, i) => (bloccati[i] && d ? d : interoTra(1, 6)));
    }

    function eseguiTiro(valori) {
      dadi = valori;
      tiriFatti++;
      if (api.sonoHost) api.invia({ t: "tiro", valori, tiriFatti, turno });
      elDadi.classList.add("rotola");
      setTimeout(() => elDadi.classList.remove("rotola"), 400);
      disegna();
      if (tiriFatti >= maxTiri) attesa = setTimeout(passaTurno, 1400);
    }

    function passaTurno() {
      if (concluso) return;
      const m = migliore(dadi);
      risultati[turno] = { nome: m.nome, punti: m.punti };
      if (api.sonoHost) api.invia({ t: "incassa", turno, ris: risultati[turno] });
      avanzaTurno();
    }

    function avanzaTurno() {
      turno++;
      dadi = [0, 0, 0, 0, 0];
      bloccati = [false, false, false, false, false];
      tiriFatti = 0;
      if (turno >= n) { concludi(); return; }
      disegna();
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      clearTimeout(attesa);
      const mio = risultati[io] || { nome: "Niente", punti: 0 };
      const massimo = Math.max(...risultati.map(r => (r ? r.punti : 0)));
      const premio = mio.punti === massimo && mio.punti > 0 ? 150 : 0;
      api.finito({ punti: mio.punti + premio, dettaglio: mio.nome });
    }

    btnTira.onclick = chiediTiro;
    disegna();

    return {
      messaggio(m, da) {
        if (!m || concluso) return;
        switch (m.t) {
          case "chiedoTiro":                     // arriva solo all'arbitro
            if (!api.sonoHost) return;
            if (giocatori[turno] && giocatori[turno].id === da) eseguiTiro(nuoviValori());
            break;
          case "tiro":
            if (api.sonoHost) return;            // l'arbitro li ha già applicati
            turno = m.turno;
            dadi = m.valori;
            tiriFatti = m.tiriFatti;
            elDadi.classList.add("rotola");
            setTimeout(() => elDadi.classList.remove("rotola"), 400);
            disegna();
            break;
          case "blocca": blocca(m.i); break;
          case "incassa":
            if (api.sonoHost) return;
            risultati[m.turno] = m.ris;
            avanzaTurno();
            break;
        }
      },
      scaduto: concludi,
      chiudi() { clearTimeout(attesa); }
    };
  }
});
