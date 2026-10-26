/* Escape Room — cooperativa simultanea a ruoli.
   Ogni giocatore risolve un modulo diverso. Una volta calibrato, il modulo
   viene liberato automaticamente dal compagno precedente nella catena. */

GIOCHI.push({
  id: "escaperoom",
  nome: "Escape Protocol",
  icona: "🗝️",
  desc: "Coordinate i moduli della struttura: ognuno risolve una prova diversa e sblocca il compagno successivo.",
  regole: [
    "Ogni giocatore riceve un <b>modulo differente</b> da completare sul proprio dispositivo.",
    "Tutti lavorano <b>contemporaneamente</b>: precisione, memoria, riflessi e controllo.",
    "Quando completi la prova, invii energia al giocatore successivo e liberi il suo terminale.",
    "La fase termina soltanto quando <b>tutti i moduli</b> sono calibrati e agganciati.",
    "Superate tre settori per aprire insieme la porta di evacuazione."
  ],
  gara: false,
  solo: false,
  minGiocatori: 2,
  maxGiocatori: 6,
  durata: 75,

  generaPartita() {
    const ruoli = [
      { id: "router", nome: "Instradamento", icona: "⌁", colore: "#8b9cff" },
      { id: "reattore", nome: "Reattore", icona: "◉", colore: "#5eead4" },
      { id: "memoria", nome: "Memoria", icona: "▦", colore: "#fbbf24" },
      { id: "frequenze", nome: "Frequenze", icona: "≋", colore: "#c084fc" },
      { id: "circuiti", nome: "Circuiti", icona: "⌘", colore: "#fb7185" },
      { id: "firewall", nome: "Firewall", icona: "◇", colore: "#60a5fa" }
    ];
    return Array.from({ length: typeof MAX_ROUND !== "undefined" ? MAX_ROUND : 3 }, (_, round) => ({
      settore: round + 1,
      ruoli,
      semi: Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000000))
    }));
  },

  crea(api) {
    const giocatori = api.giocatori.filter(g => g.online);
    const mioIndice = Math.max(0, giocatori.findIndex(g => g.id === api.io));
    const ruolo = api.dati.ruoli[mioIndice % api.dati.ruoli.length];
    const predecessore = giocatori[(mioIndice - 1 + giocatori.length) % giocatori.length];
    const successore = giocatori[(mioIndice + 1) % giocatori.length];
    const settore = api.dati.settore || (api.round + 1);
    const seed = (api.dati.semi[mioIndice % api.dati.semi.length] || 1) + settore * 97;
    const pronti = new Set();
    const completati = new Set();
    let localePronto = false;
    let localeCompletato = false;
    let concluso = false;
    let cleanupModulo = () => {};

    api.suggerimento("Completa il tuo modulo. Il compagno precedente libererà il terminale.");

    api.arena.innerHTML = `
      <div class="escape-protocol" style="--esc-accent:${ruolo.colore}">
        <header class="escp-header">
          <div>
            <span class="escp-kicker">SETTORE 0${settore} / PROTOCOLLO DI FUGA</span>
            <h3><span>${ruolo.icona}</span> ${ruolo.nome}</h3>
          </div>
          <span class="escp-role">MODULO ${mioIndice + 1}</span>
        </header>

        <div class="escp-chain" aria-label="Catena di sblocco">
          ${giocatori.map((g, i) => `
            <div class="escp-agent${g.id === api.io ? " is-me" : ""}" data-agent="${g.id}">
              <span>${g.avatar || "●"}</span>
              <small>${fuggiHtml(g.nome)}</small>
              <i></i>
            </div>
          `).join("")}
        </div>

        <section class="escp-console">
          <div class="escp-brief">
            <span>OBIETTIVO INDIVIDUALE</span>
            <p id="escp-instruction"></p>
          </div>
          <div id="escp-module" class="escp-module"></div>
          <div id="escp-feedback" class="escp-feedback">Modulo in attesa di input.</div>
        </section>

        <section class="escp-release">
          <div>
            <span class="escp-release-label">COLLEGAMENTO DI SICUREZZA</span>
            <strong id="escp-release-text">Prima calibra il tuo modulo.</strong>
            <small>Ricevi lo sblocco da ${fuggiHtml(predecessore.nome)} · alimenti ${fuggiHtml(successore.nome)}</small>
          </div>
          <button id="escp-release-btn" class="btn btn-primary" disabled>Aggancia modulo</button>
        </section>

        <div class="escp-team-progress">
          <div><span id="escp-team-count">0</span>/${giocatori.length} moduli agganciati</div>
          <div class="escp-track"><i id="escp-track-fill"></i></div>
        </div>
      </div>
    `;

    const modulo = api.arena.querySelector("#escp-module");
    const istruzione = api.arena.querySelector("#escp-instruction");
    const feedback = api.arena.querySelector("#escp-feedback");
    const releaseBtn = api.arena.querySelector("#escp-release-btn");
    const releaseText = api.arena.querySelector("#escp-release-text");
    const count = api.arena.querySelector("#escp-team-count");
    const fill = api.arena.querySelector("#escp-track-fill");

    function rngFactory(s) {
      let x = s >>> 0;
      return () => {
        x = (x * 1664525 + 1013904223) >>> 0;
        return x / 4294967296;
      };
    }
    const rng = rngFactory(seed);
    const shuffle = lista => lista.slice().sort(() => rng() - 0.5);

    function setFeedback(testo, tipo = "") {
      feedback.textContent = testo;
      feedback.className = "escp-feedback" + (tipo ? " is-" + tipo : "");
    }

    function segnaPronto() {
      if (localePronto || concluso) return;
      localePronto = true;
      pronti.add(api.io);
      aggiornaCatena();
      setFeedback("Calibrazione riuscita. Energia inviata a " + successore.nome + ".", "ok");
      api.invia({ tipo: "esc-pronto", id: api.io });
      aggiornaSblocco();
    }

    function aggiornaSblocco() {
      if (!localePronto || localeCompletato) return;
      if (pronti.has(predecessore.id)) {
        releaseBtn.disabled = false;
        releaseText.textContent = predecessore.nome + " ha liberato il terminale.";
        releaseBtn.classList.add("is-unlocked");
      } else {
        releaseText.textContent = "Calibrato. Attendo lo sblocco da " + predecessore.nome + "…";
      }
    }

    function completaLocale() {
      if (!localePronto || localeCompletato || !pronti.has(predecessore.id)) return;
      localeCompletato = true;
      completati.add(api.io);
      releaseBtn.disabled = true;
      releaseBtn.textContent = "Modulo agganciato";
      setFeedback("Collegamento stabile. Attendo la squadra.", "ok");
      api.invia({ tipo: "esc-completo", id: api.io });
      aggiornaProgresso();
    }
    releaseBtn.onclick = completaLocale;

    function aggiornaCatena() {
      api.arena.querySelectorAll(".escp-agent").forEach(el => {
        const id = el.dataset.agent;
        el.classList.toggle("is-ready", pronti.has(id));
        el.classList.toggle("is-complete", completati.has(id));
      });
    }

    function aggiornaProgresso() {
      count.textContent = completati.size;
      fill.style.width = (completati.size / giocatori.length * 100) + "%";
      api.avanzo(completati.size / giocatori.length);
      aggiornaCatena();
      if (completati.size >= giocatori.length) trionfo();
    }

    function trionfo() {
      if (concluso) return;
      concluso = true;
      cleanupModulo();
      api.arena.querySelector(".escp-console").innerHTML = `
        <div class="escp-victory">
          <span>✓</span>
          <p>SETTORE 0${settore} LIBERATO</p>
          <h3>Sincronizzazione completa</h3>
          <small>Tutti i moduli hanno risposto. Accesso al settore successivo autorizzato.</small>
        </div>`;
      const tempo = api.tempo();
      const punti = Math.max(350, Math.round(1100 - tempo * 8));
      if (window.Effetti) Effetti.coriandoli(26);
      setTimeout(() => api.finito({
        punti,
        dettaglio: giocatori.length + "/" + giocatori.length + " moduli · " + tempo.toFixed(1) + "s"
      }), 1200);
    }

    function creaRouter() {
      istruzione.textContent = "Attiva i nodi numerici in ordine crescente.";
      const totale = 5 + Math.min(2, settore);
      const valori = shuffle(Array.from({ length: totale }, (_, i) => i + 1));
      modulo.innerHTML = '<div class="escp-grid escp-router">' + valori.map(n =>
        '<button class="escp-node" data-n="' + n + '">' + n + '</button>').join("") + "</div>";
      let atteso = 1;
      modulo.querySelectorAll(".escp-node").forEach(btn => btn.onclick = () => {
        if (Number(btn.dataset.n) !== atteso) {
          btn.classList.add("is-error");
          setTimeout(() => btn.classList.remove("is-error"), 250);
          return;
        }
        btn.classList.add("is-on");
        btn.disabled = true;
        atteso++;
        if (atteso > totale) segnaPronto();
      });
    }

    function creaReattore() {
      istruzione.textContent = "Ferma il nucleo quando attraversa la zona stabile.";
      modulo.innerHTML = `
        <div class="escp-meter"><div class="escp-zone"></div><i id="escp-needle"></i></div>
        <button class="btn escp-action" id="escp-stop">Stabilizza nucleo</button>`;
      const needle = modulo.querySelector("#escp-needle");
      let pos = 0, dir = 1, raf;
      const loop = () => {
        pos += dir * (0.75 + settore * 0.12);
        if (pos >= 100 || pos <= 0) dir *= -1;
        needle.style.left = pos + "%";
        raf = requestAnimationFrame(loop);
      };
      modulo.querySelector("#escp-stop").onclick = () => {
        if (pos >= 43 && pos <= 57) {
          cancelAnimationFrame(raf);
          segnaPronto();
        } else setFeedback("Nucleo instabile. Riprova al centro.", "error");
      };
      raf = requestAnimationFrame(loop);
      cleanupModulo = () => cancelAnimationFrame(raf);
    }

    function creaMemoria() {
      istruzione.textContent = "Memorizza le celle illuminate e ripetile dopo il blackout.";
      const totale = 9;
      const pattern = new Set(shuffle(Array.from({ length: totale }, (_, i) => i)).slice(0, 3 + settore));
      modulo.innerHTML = '<div class="escp-memory">' + Array.from({ length: totale }, (_, i) =>
        '<button data-cell="' + i + '"' + (pattern.has(i) ? ' class="is-preview"' : "") + '></button>').join("") + "</div>";
      const scelti = new Set();
      const timer = setTimeout(() => {
        modulo.querySelectorAll("button").forEach(b => b.classList.remove("is-preview"));
        setFeedback("Blackout attivo. Ripeti il pattern.");
        modulo.querySelectorAll("button").forEach(b => b.onclick = () => {
          const n = Number(b.dataset.cell);
          if (!pattern.has(n)) {
            scelti.clear();
            modulo.querySelectorAll("button").forEach(x => x.classList.remove("is-on"));
            setFeedback("Pattern azzerato.", "error");
            return;
          }
          scelti.add(n);
          b.classList.add("is-on");
          if (scelti.size === pattern.size) segnaPronto();
        });
      }, 1900);
      cleanupModulo = () => clearTimeout(timer);
    }

    function creaFrequenze() {
      istruzione.textContent = "Allinea i tre canali alle frequenze indicate.";
      const target = Array.from({ length: 3 }, () => 1 + Math.floor(rng() * 5));
      const valori = [1, 1, 1];
      modulo.innerHTML = '<div class="escp-dials">' + target.map((t, i) => `
        <div><small>CH ${i + 1} · TARGET ${t}</small>
          <button data-i="${i}" data-d="-1">−</button><strong id="dial-${i}">1</strong><button data-i="${i}" data-d="1">+</button>
        </div>`).join("") + "</div>";
      modulo.querySelectorAll("button").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        valori[i] = Math.max(1, Math.min(5, valori[i] + Number(b.dataset.d)));
        modulo.querySelector("#dial-" + i).textContent = valori[i];
        if (valori.every((v, k) => v === target[k])) segnaPronto();
      });
    }

    function creaCircuiti() {
      istruzione.textContent = "Ruota ogni connettore fino alla direzione richiesta.";
      const simboli = ["↑", "→", "↓", "←"];
      const target = Array.from({ length: 4 }, () => Math.floor(rng() * 4));
      const valori = Array.from({ length: 4 }, () => 0);
      modulo.innerHTML = '<div class="escp-circuits">' + target.map((t, i) =>
        '<button data-i="' + i + '"><small>REQ ' + simboli[t] + '</small><strong>' + simboli[0] + '</strong></button>').join("") + "</div>";
      modulo.querySelectorAll("button").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        valori[i] = (valori[i] + 1) % 4;
        b.querySelector("strong").textContent = simboli[valori[i]];
        b.classList.toggle("is-on", valori[i] === target[i]);
        if (valori.every((v, k) => v === target[k])) segnaPronto();
      });
    }

    function creaFirewall() {
      istruzione.textContent = "Elimina le minacce nell’ordine mostrato dal protocollo.";
      const simboli = ["◆", "●", "▲", "■", "✦", "⬟"];
      const sequenza = shuffle(simboli).slice(0, 4 + Math.min(1, settore));
      const campo = shuffle(sequenza);
      modulo.innerHTML = '<div class="escp-sequence">' + sequenza.join(" ") + '</div><div class="escp-firewall">' +
        campo.map(s => '<button data-symbol="' + s + '">' + s + "</button>").join("") + "</div>";
      let indice = 0;
      modulo.querySelectorAll(".escp-firewall button").forEach(b => b.onclick = () => {
        if (b.dataset.symbol !== sequenza[indice]) {
          indice = 0;
          modulo.querySelectorAll(".escp-firewall button").forEach(x => { x.disabled = false; x.classList.remove("is-on"); });
          setFeedback("Sequenza respinta. Ricomincia.", "error");
          return;
        }
        b.disabled = true;
        b.classList.add("is-on");
        indice++;
        if (indice === sequenza.length) segnaPronto();
      });
    }

    const creatori = {
      router: creaRouter,
      reattore: creaReattore,
      memoria: creaMemoria,
      frequenze: creaFrequenze,
      circuiti: creaCircuiti,
      firewall: creaFirewall
    };
    creatori[ruolo.id]();
    aggiornaCatena();
    aggiornaProgresso();

    return {
      messaggio(m) {
        if (!m || concluso) return;
        if (m.tipo === "esc-pronto") {
          pronti.add(m.id);
          aggiornaCatena();
          aggiornaSblocco();
          if (m.id === predecessore.id && localePronto) setFeedback(predecessore.nome + " ha inviato lo sblocco.", "ok");
        } else if (m.tipo === "esc-completo") {
          completati.add(m.id);
          aggiornaProgresso();
        }
      },
      scaduto() {
        if (concluso) return;
        concluso = true;
        cleanupModulo();
        api.finito({
          punti: completati.size * 160,
          dettaglio: completati.size + "/" + giocatori.length + " moduli agganciati"
        });
      },
      chiudi() {
        concluso = true;
        cleanupModulo();
      }
    };
  }
});