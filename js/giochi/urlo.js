/* 🎤 Urlo — il microfono misura quanto riesci a farti sentire.

   Non vince chi fa il picco più alto (basterebbe soffiare sul microfono):
   vince chi tiene alto il volume nel tempo. Si somma il volume istante per
   istante, contando solo quello sopra una soglia, così il brusio di fondo
   non fa punti e non serve stare in silenzio assoluto per giocare.

   L'audio non lascia mai il telefono: si legge solo il livello, nessuna
   registrazione viene salvata né spedita agli altri giocatori. */

const URLO_SECONDI = 8;
const SOGLIA_VOCE = 0.06;      // sotto questa soglia è rumore di fondo

GIOCHI.push({
  id: "urlo",
  nome: "Urlo",
  icona: "🎤",
  desc: "Chi urla più forte e più a lungo. Serve il microfono.",
  regole: [
    "Otto secondi: <b>tieni alto il volume</b>, non basta un urlo secco.",
    "Il rumore di fondo non conta: serve superare una soglia.",
    "L'audio <b>non viene registrato né inviato</b>: si legge solo il livello.",
    "Senza microfono il round non si può giocare: si passa."
  ],
  gara: true,
  bonusPrimo: false,
  solo: true,
  maxGiocatori: 6,
  durata: URLO_SECONDI + 35,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, () => ({ secondi: URLO_SECONDI }));
  },

  fantasma() {
    const p = interoTra(200, 850);
    return { punti: p, dettaglio: p + " decibel-punti", tempo: URLO_SECONDI };
  },

  crea(api) {
    let ctx = null, stream = null, analizzatore = null, dati = null;
    let somma = 0, picco = 0;
    let concluso = false, avviato = false;
    let rAF = null;
    const timers = [];

    api.suggerimento("Fai un bel respiro…");

    api.arena.innerHTML =
      "<div class='ar-avvio' id='ur-avvio'>" +
        "<div class='ar-icona'>🎤</div>" +
        "<p>Serve il microfono. L'audio resta sul tuo telefono: si misura solo il volume.</p>" +
        "<button class='btn btn-primary' id='ur-via'>Attiva microfono</button>" +
        "<div class='ar-nota' id='ur-nota'></div>" +
      "</div>" +
      "<div class='ur-scena' id='ur-scena' hidden>" +
        "<div class='ur-bocca' id='ur-bocca'>😐</div>" +
        "<div class='ur-livello'><i id='ur-barra'></i></div>" +
        "<div class='sc-numero' id='ur-numero'>0</div>" +
        "<div class='sc-tempo' id='ur-tempo'></div>" +
      "</div>";

    const avvio = api.arena.querySelector("#ur-avvio");
    const scena = api.arena.querySelector("#ur-scena");
    const bocca = api.arena.querySelector("#ur-bocca");
    const barra = api.arena.querySelector("#ur-barra");
    const numero = api.arena.querySelector("#ur-numero");
    const elTempo = api.arena.querySelector("#ur-tempo");
    const nota = api.arena.querySelector("#ur-nota");

    async function parti() {
      nota.textContent = "Chiedo il permesso…";
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (e) {
        nota.textContent = "Microfono non disponibile: " + (e.name || "errore") + ".";
        timers.push(setTimeout(() => {
          if (!concluso) { concluso = true; api.finito({ punti: 0, dettaglio: "niente microfono" }); }
        }, 1200));
        return;
      }

      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const sorgente = ctx.createMediaStreamSource(stream);
      analizzatore = ctx.createAnalyser();
      analizzatore.fftSize = 512;
      sorgente.connect(analizzatore);
      dati = new Uint8Array(analizzatore.fftSize);

      avvio.hidden = true;
      scena.hidden = false;
      avviato = true;

      const fine = performance.now() + URLO_SECONDI * 1000;
      timers.push(setInterval(() => {
        const r = Math.max(0, (fine - performance.now()) / 1000);
        elTempo.textContent = r.toFixed(1) + "s";
        if (r <= 0) concludi();
      }, 100));

      misura();
    }

    /* Volume efficace del segnale: la media quadratica degli scostamenti
       dal silenzio. Reagisce al volume percepito meglio del singolo picco. */
    function misura() {
      if (concluso || !analizzatore) return;
      analizzatore.getByteTimeDomainData(dati);

      let quadrati = 0;
      for (let i = 0; i < dati.length; i++) {
        const v = (dati[i] - 128) / 128;
        quadrati += v * v;
      }
      const livello = Math.sqrt(quadrati / dati.length);

      if (livello > SOGLIA_VOCE) somma += (livello - SOGLIA_VOCE) * 26;
      picco = Math.max(picco, livello);

      barra.style.width = Math.min(100, livello * 140) + "%";
      bocca.textContent = livello > 0.3 ? "😱" : livello > 0.15 ? "😮" : livello > 0.07 ? "🙂" : "😐";
      numero.textContent = Math.round(somma);
      api.avanzo(Math.min(somma / 900, 1));

      rAF = requestAnimationFrame(misura);
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      fermaTutto();
      const p = Math.round(somma);
      api.avanzo(1);
      api.finito({ punti: p, dettaglio: p + " · picco " + Math.round(picco * 100) + "%" });
    }

    function fermaTutto() {
      cancelAnimationFrame(rAF);
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      if (stream) { stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} }); stream = null; }
      if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
      analizzatore = null;
    }

    api.arena.querySelector("#ur-via").onclick = parti;

    return {
      scaduto() {
        if (!avviato) { concluso = true; fermaTutto(); api.finito({ punti: 0, dettaglio: "non avviato" }); return; }
        concludi();
      },
      chiudi: fermaTutto
    };
  }
});
