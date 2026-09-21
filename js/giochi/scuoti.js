/* 📳 Scuoti — dieci secondi di braccio, misurati dall'accelerometro.

   Non si contano gli "scossoni" ma quanto cambia l'accelerazione da una
   lettura all'altra: scuotere forte e cambiare direzione spesso vale molto,
   tenere il telefono fermo in un'auto in corsa non vale niente. Così non si
   bara appoggiandolo su qualcosa che vibra.

   Senza accelerometro (computer, o permesso negato) si gioca a tocchi: il
   punteggio viene riportato sulla stessa scala, così le due modalità restano
   confrontabili. */

const SCUOTI_SECONDI = 10;
const SOGLIA_SCOSSA = 12;      // m/s² di variazione sotto cui è solo rumore

GIOCHI.push({
  id: "scuoti",
  nome: "Scuoti",
  icona: "📳",
  desc: "Agita il telefono più forte che puoi per dieci secondi.",
  regole: [
    "Dieci secondi: <b>scuoti</b> il telefono con tutta l'energia che hai.",
    "Conta quanto <b>cambia</b> il movimento, non quanto lo tieni in moto.",
    "Al primo avvio il telefono chiede il permesso per i sensori.",
    "Da computer si gioca a <b>tocchi</b>, con lo stesso punteggio."
  ],
  gara: true,
  bonusPrimo: false,
  solo: true,
  maxGiocatori: 6,
  durata: SCUOTI_SECONDI + 35,

  generaPartita() {
    return Array.from({ length: MAX_ROUND }, () => ({ secondi: SCUOTI_SECONDI }));
  },

  fantasma() {
    const e = interoTra(250, 900);
    return { punti: e, dettaglio: e + " energia", tempo: SCUOTI_SECONDI };
  },

  crea(api) {
    let energia = 0;
    let ultima = null;
    let concluso = false, avviato = false;
    let modo = "tocchi";
    const timers = [];

    api.suggerimento("Più forte scuoti, più punti fai.");

    api.arena.innerHTML =
      "<div class='ar-avvio' id='sc-avvio'>" +
        "<div class='ar-icona'>📳</div>" +
        "<p>Tieni forte il telefono: dieci secondi di scossoni.</p>" +
        "<button class='btn btn-primary' id='sc-via'>Attiva sensori e parti</button>" +
        "<div class='ar-nota' id='sc-nota'></div>" +
      "</div>" +
      "<div class='sc-scena' id='sc-scena' hidden>" +
        "<div class='sc-energia'><i id='sc-barra'></i></div>" +
        "<div class='sc-numero' id='sc-numero'>0</div>" +
        "<div class='sc-modo' id='sc-modo'></div>" +
        "<div class='sc-tempo' id='sc-tempo'></div>" +
      "</div>";

    const avvio = api.arena.querySelector("#sc-avvio");
    const scena = api.arena.querySelector("#sc-scena");
    const barra = api.arena.querySelector("#sc-barra");
    const numero = api.arena.querySelector("#sc-numero");
    const elModo = api.arena.querySelector("#sc-modo");
    const elTempo = api.arena.querySelector("#sc-tempo");
    const nota = api.arena.querySelector("#sc-nota");

    function leggiMoto(e) {
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a || a.x === null) return;
      if (ultima) {
        // quanto è cambiata l'accelerazione fra due letture consecutive
        const d = Math.abs(a.x - ultima.x) + Math.abs(a.y - ultima.y) + Math.abs(a.z - ultima.z);
        if (d > SOGLIA_SCOSSA) aggiungi(d * 0.6);
      }
      ultima = { x: a.x, y: a.y, z: a.z };
    }

    function aggiungi(q) {
      if (concluso || !avviato) return;
      energia += q;
      numero.textContent = Math.round(energia);
      barra.style.width = Math.min(100, energia / 12) + "%";
      scena.classList.add("botta");
      clearTimeout(scena._t);
      scena._t = setTimeout(() => scena.classList.remove("botta"), 90);
      api.avanzo(Math.min(energia / 1200, 1));
    }

    async function parti() {
      let haSensori = false;
      try {
        if (typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function") {
          haSensori = (await DeviceMotionEvent.requestPermission()) === "granted";
        } else {
          haSensori = typeof window.DeviceMotionEvent !== "undefined";
        }
      } catch (e) { haSensori = false; }

      if (haSensori) {
        window.addEventListener("devicemotion", leggiMoto, true);
        modo = "sensori";
        // se in un secondo non arriva nulla, l'accelerometro non c'è davvero
        timers.push(setTimeout(() => {
          if (ultima === null && modo === "sensori") {
            modo = "tocchi";
            elModo.textContent = "Nessun accelerometro: tocca lo schermo!";
            toast("Sensori assenti: si gioca a tocchi.");
          }
        }, 1200));
      } else {
        nota.textContent = "Sensori non disponibili: si gioca a tocchi.";
      }

      elModo.textContent = haSensori ? "Scuoti!" : "Tocca lo schermo il più in fretta possibile!";
      avvio.hidden = true;
      scena.hidden = false;
      avviato = true;

      // i tocchi valgono sempre: su telefono sono un extra, su computer l'unico modo
      scena.addEventListener("pointerdown", () => aggiungi(18));

      const fine = performance.now() + SCUOTI_SECONDI * 1000;
      timers.push(setInterval(() => {
        const r = Math.max(0, (fine - performance.now()) / 1000);
        elTempo.textContent = r.toFixed(1) + "s";
        if (r <= 0) concludi();
      }, 100));
    }

    function concludi() {
      if (concluso) return;
      concluso = true;
      fermaTutto();
      const p = Math.round(energia);
      api.avanzo(1);
      api.finito({ punti: p, dettaglio: p + " energia" });
    }

    function fermaTutto() {
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      window.removeEventListener("devicemotion", leggiMoto, true);
    }

    api.arena.querySelector("#sc-via").onclick = parti;

    return {
      scaduto() {
        if (!avviato) { concluso = true; fermaTutto(); api.finito({ punti: 0, dettaglio: "non avviato" }); return; }
        concludi();
      },
      chiudi: fermaTutto
    };
  }
});
