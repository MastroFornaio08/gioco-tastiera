/* 📸 Caccia AR — forme sparse nello spazio intorno a te, da inquadrare.

   Le forme non stanno sullo schermo: stanno a un certo angolo rispetto a te.
   Ognuna ha una direzione (azimut, come su una bussola) e un'altezza
   (elevazione, quanto in alto o in basso). Il telefono fa da finestra: si
   calcola dove cadrebbe ogni forma nell'inquadratura e la si disegna lì.

        alto
          |        ●  <- forma a +20° a destra, +15° in alto
          |
   ---- MIRINO ----  <- il centro dello schermo sei tu che guardi
          |
     ■    |            <- forma a -50°: per vederla devi girarti a sinistra
        basso

   Per centrare una forma bisogna portarla dentro il mirino e tenercela un
   istante. Tutti i giocatori ricevono la stessa disposizione, quindi la
   partita è uguale per tutti.

   Se fotocamera o bussola non ci sono (o non si dà il permesso), si gioca
   comunque: si "guarda in giro" trascinando il dito o il mouse. */

const CACCIA_SECONDI = 22;
const CAMPO_ORIZZONTALE = 70;   // gradi visibili in larghezza: quanto "zooma" la finestra
const CAMPO_VERTICALE = 52;
const RAGGIO_MIRINO = 9;        // gradi entro cui la forma è considerata centrata
const MS_AGGANCIO = 450;        // quanto va tenuta ferma per catturarla

GIOCHI.push({
  id: "caccia",
  nome: "Caccia AR",
  icona: "📸",
  desc: "Girati con il telefono e inquadra le forme sparse intorno a te.",
  regole: [
    "Le forme stanno <b>tutt'intorno</b>: per trovarle devi girarti davvero.",
    "Porta la forma nel mirino e <b>tienila ferma un attimo</b> per catturarla.",
    "Cerchio <b>120 punti</b>, quadrato <b>90</b>, quella d'oro <b>250</b>.",
    "Servono fotocamera e bussola: al primo avvio il telefono chiede il permesso.",
    "Senza fotocamera si gioca lo stesso, guardandosi intorno col dito."
  ],
  gara: true,
  bonusPrimo: false,      // dura un tempo fisso: non ha senso premiare "il primo"
  solo: true,
  maxGiocatori: 6,
  durata: CACCIA_SECONDI + 40,   // il tempo di dare i permessi è compreso

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, (_, r) => {
      const quante = 7 + r * 2;
      const forme = [];
      for (let i = 0; i < quante; i++) {
        // sparpagliate su tutto il giro, evitando di ammassarle
        let az, tentativi = 0;
        do {
          az = interoTra(0, 359);
          tentativi++;
        } while (tentativi < 30 && forme.some(f => Math.abs(differenzaAngolo(f.az, az)) < 22));

        const tipo = Math.random() < 0.12 ? "oro" : (Math.random() < 0.55 ? "cerchio" : "quadrato");
        forme.push({ az, el: interoTra(-22, 24), tipo });
      }
      return { forme };
    });
  },

  fantasma(dati) {
    const prese = interoTra(Math.round(dati.forme.length * 0.3), dati.forme.length);
    return { punti: prese * 110, dettaglio: prese + " forme", tempo: CACCIA_SECONDI };
  },

  crea(api) {
    const forme = api.dati.forme.map(f => ({ ...f, presa: false }));
    let yaw = 0, pitch = 0;        // dove stiamo guardando
    let baseAlpha = null;          // prima lettura della bussola, usata come zero
    let modo = null;               // 'sensori' | 'dito'
    let stream = null;
    let punti = 0, prese = 0;
    let concluso = false, avviato = false;
    let rAF = null;
    const timers = [];

    api.suggerimento("Inquadra le forme e tienile nel mirino.");

    api.arena.innerHTML =
      "<div class='ar-avvio' id='ar-avvio'>" +
        "<div class='ar-icona'>📸</div>" +
        "<p>Le forme sono sparse intorno a te. Serve la fotocamera per vederle.</p>" +
        "<button class='btn btn-primary' id='ar-permessi'>Attiva fotocamera</button>" +
        "<button class='btn btn-ghost btn-small' id='ar-senza'>Gioca senza fotocamera</button>" +
        "<div class='ar-nota' id='ar-nota'></div>" +
      "</div>" +
      "<div class='ar-scena' id='ar-scena' hidden>" +
        "<video id='ar-video' playsinline muted autoplay></video>" +
        "<div class='ar-forme' id='ar-forme'></div>" +
        "<div class='ar-mirino' id='ar-mirino'></div>" +
        "<div class='ar-hud'><span id='ar-conta'></span><span id='ar-tempo'></span></div>" +
        "<div class='ar-bussola' id='ar-bussola'></div>" +
      "</div>";

    const avvio = api.arena.querySelector("#ar-avvio");
    const scena = api.arena.querySelector("#ar-scena");
    const video = api.arena.querySelector("#ar-video");
    const contForme = api.arena.querySelector("#ar-forme");
    const elConta = api.arena.querySelector("#ar-conta");
    const elTempo = api.arena.querySelector("#ar-tempo");
    const elBussola = api.arena.querySelector("#ar-bussola");
    const nota = api.arena.querySelector("#ar-nota");

    /* ------------------------------------------------------ i permessi */

    async function chiediPermessi() {
      nota.textContent = "Sto chiedendo i permessi…";
      let haVideo = false, haSensori = false;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, audio: false
        });
        video.srcObject = stream;
        haVideo = true;
      } catch (e) {
        nota.textContent = "Fotocamera non disponibile: " + (e.name || "errore") + ".";
      }

      // su iOS il permesso al giroscopio va chiesto da un gesto dell'utente
      try {
        if (typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function") {
          haSensori = (await DeviceOrientationEvent.requestPermission()) === "granted";
        } else {
          haSensori = typeof window.DeviceOrientationEvent !== "undefined";
        }
      } catch (e) { haSensori = false; }

      if (haSensori) {
        window.addEventListener("deviceorientation", leggiOrientamento, true);
        // se entro un secondo non arriva nessuna lettura, i sensori non ci sono davvero
        timers.push(setTimeout(() => {
          if (baseAlpha === null && modo === "sensori") {
            modo = "dito";
            attivaDito();
            toast("Bussola assente: guardati intorno col dito.");
          }
        }, 1200));
      }

      modo = haSensori ? "sensori" : "dito";
      if (!haSensori) attivaDito();
      comincia(haVideo);
    }

    function senzaFotocamera() {
      modo = "dito";
      attivaDito();
      comincia(false);
    }

    /* --------------------------------------------------- guardarsi intorno */

    function leggiOrientamento(e) {
      if (e.alpha === null || e.alpha === undefined) return;
      if (baseAlpha === null) baseAlpha = e.alpha;
      // alpha cresce in senso antiorario: invertiamo per far combaciare
      // il movimento della scena con quello della mano
      yaw = normalizzaAngolo(baseAlpha - e.alpha);
      pitch = Math.max(-60, Math.min(60, (e.beta || 0) - 60));
    }

    let trascina = null;
    function attivaDito() {
      const giu = (x, y) => { trascina = { x, y, yaw, pitch }; };
      const muovi = (x, y) => {
        if (!trascina) return;
        yaw = normalizzaAngolo(trascina.yaw - (x - trascina.x) * 0.25);
        pitch = Math.max(-40, Math.min(40, trascina.pitch + (y - trascina.y) * 0.18));
      };
      const su = () => { trascina = null; };

      scena.addEventListener("pointerdown", e => giu(e.clientX, e.clientY));
      scena.addEventListener("pointermove", e => muovi(e.clientX, e.clientY));
      scena.addEventListener("pointerup", su);
      scena.addEventListener("pointercancel", su);
      scena.classList.add("col-dito");
    }

    /* ------------------------------------------------------- la partita */

    function comincia(haVideo) {
      if (avviato) return;
      avviato = true;
      avvio.hidden = true;
      scena.hidden = false;
      scena.classList.toggle("senza-video", !haVideo);

      const fine = performance.now() + CACCIA_SECONDI * 1000;
      timers.push(setInterval(() => {
        const restano = Math.max(0, (fine - performance.now()) / 1000);
        elTempo.textContent = restano.toFixed(1) + "s";
        if (restano <= 0) concludi();
      }, 100));

      disegna();
    }

    /* Ridisegna la scena a ogni fotogramma: poche decine di nodi, nessun costo. */
    function disegna() {
      if (concluso) return;
      const ora = performance.now();
      let html = "";
      let centrata = null;

      forme.forEach((f, i) => {
        if (f.presa) return;
        const p = proietta(f, yaw, pitch);
        if (!p.visibile) { f.dentroDa = null; return; }

        const { x, y, centrata: vicina } = p;

        if (vicina) {
          if (!f.dentroDa) f.dentroDa = ora;
          centrata = i;
        } else {
          f.dentroDa = null;
        }

        const carica = vicina ? Math.min((ora - f.dentroDa) / MS_AGGANCIO, 1) : 0;
        if (vicina && carica >= 1) { cattura(i); return; }

        html += "<div class='ar-forma ar-" + f.tipo + (vicina ? " agganciata" : "") + "' " +
          "style='left:" + x.toFixed(1) + "%;top:" + y.toFixed(1) + "%;" +
          "--carica:" + (carica * 100).toFixed(0) + "%'></div>";
      });

      contForme.innerHTML = html;
      api.arena.querySelector("#ar-mirino").classList.toggle("attivo", centrata !== null);

      // bussola: mostra dove sono le forme rimaste rispetto a dove guardi
      elBussola.innerHTML = forme.filter(f => !f.presa).map(f => {
        const d = differenzaAngolo(f.az, yaw);
        const p = 50 + (d / 180) * 50;
        return "<i style='left:" + p.toFixed(1) + "%'></i>";
      }).join("");

      elConta.textContent = prese + "/" + forme.length;
      api.avanzo(prese / forme.length);

      rAF = requestAnimationFrame(disegna);
    }

    function cattura(i) {
      const f = forme[i];
      if (f.presa) return;
      f.presa = true;
      prese++;
      punti += f.tipo === "oro" ? 250 : f.tipo === "cerchio" ? 120 : 90;
      if (navigator.vibrate) { try { navigator.vibrate(40); } catch (e) {} }
      if (prese >= forme.length) concludi();
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      fermaTutto();
      api.avanzo(1);
      api.finito({ punti, dettaglio: prese + "/" + forme.length + " forme" });
    }

    function fermaTutto() {
      cancelAnimationFrame(rAF);
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      window.removeEventListener("deviceorientation", leggiOrientamento, true);
      if (stream) { stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} }); stream = null; }
    }

    api.arena.querySelector("#ar-permessi").onclick = chiediPermessi;
    api.arena.querySelector("#ar-senza").onclick = senzaFotocamera;

    return {
      scaduto() {
        if (!avviato) { concluso = true; fermaTutto(); api.finito({ punti: 0, dettaglio: "non avviato" }); return; }
        concludi();
      },
      chiudi: fermaTutto
    };
  }
});

/* Dove cade una forma nell'inquadratura, dato dove stiamo guardando.

   Tenuta fuori dal ciclo di disegno apposta: è tutta la geometria del gioco
   in una funzione senza effetti collaterali, quindi si può verificare da sola
   senza fotocamera, senza sensori e senza aspettare un fotogramma.

   Restituisce la posizione in percentuale sullo schermo (50,50 = centro),
   se la forma è nell'inquadratura e se è dentro il mirino. */
function proietta(forma, yaw, pitch) {
  const dAz = differenzaAngolo(forma.az, yaw);
  const dEl = forma.el - pitch;

  if (Math.abs(dAz) > CAMPO_ORIZZONTALE / 2 || Math.abs(dEl) > CAMPO_VERTICALE / 2) {
    return { visibile: false, centrata: false, x: 0, y: 0, dAz, dEl };
  }
  return {
    visibile: true,
    centrata: Math.abs(dAz) < RAGGIO_MIRINO && Math.abs(dEl) < RAGGIO_MIRINO,
    x: 50 + (dAz / (CAMPO_ORIZZONTALE / 2)) * 50,
    y: 50 - (dEl / (CAMPO_VERTICALE / 2)) * 50,
    dAz, dEl
  };
}

/* Differenza fra due angoli, riportata sempre fra -180 e +180: senza questo,
   passando da 359° a 1° sembrerebbe un salto di 358 gradi invece di 2. */
function differenzaAngolo(a, b) {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function normalizzaAngolo(a) {
  let v = a % 360;
  if (v < 0) v += 360;
  return v;
}
