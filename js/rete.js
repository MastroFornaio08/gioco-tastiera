/* Rete peer-to-peer basata su PeerJS, topologia a stella.

   L'host apre un peer con un id derivato dal codice stanza; tutti gli altri si
   collegano a lui. Nessuno parla direttamente con nessun altro: l'host sta al
   centro e rilancia i messaggi agli altri. Così bastano N-1 connessioni invece
   di N×(N-1)/2, e c'è un solo arbitro.

        ospite2   ospite3
             \     /
   ospite1 -- HOST -- ospite4
             /     \
        ospite5   (max 6 in tutto)

   Ogni giocatore ha un id breve e stabile: 'p0' è sempre l'host, gli ospiti
   ricevono 'p1'…'p5' nell'ordine in cui entrano. L'id resta valido per tutta
   la partita e non cambia se qualcuno se ne va.
*/

const PREFISSO_ID = "dattiloduello-v1-";
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente I/O/0/1, si confondono
const MAX_GIOCATORI = 6;

// Configurazione WebRTC con server STUN veloci e verificati
const PEER_OPTS = {
  debug: 1,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
      { urls: "stun:relay.metered.ca:80" }
    ],
    iceCandidatePoolSize: 10
  }
};

/* Messaggi che riguardano solo l'arbitro: non vanno rilanciati agli altri.
   "gp" è il canale privato dei giochi (parole segrete, voti): deve restare
   fra un giocatore e l'arbitro, altrimenti basterebbe guardare i messaggi
   in arrivo per sapere tutto. */
const SOLO_ARBITRO = ["ciao", "fine", "ping", "pong", "gp"];

function codiceCasuale(n = 4) {
  let s = "";
  for (let i = 0; i < n; i++) s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return s;
}

const Rete = {
  peer: null,
  ruolo: null,          // 'host' | 'ospite'
  codice: null,
  io: null,             // il proprio id di giocatore
  conns: new Map(),     // idGiocatore -> connessione   (l'ospite ha solo 'p0')
  handlers: {},
  _heartbeatInterval: null,

  on(tipo, fn) { this.handlers[tipo] = fn; return this; },

  _emit(tipo, dati) {
    const fn = this.handlers[tipo];
    if (fn) fn(dati);
  },

  _spedisci(conn, pacco) {
    if (conn && conn.open) {
      try { conn.send(pacco); } catch (e) { /* connessione morente */ }
    }
  },

  /* Host: manda a tutti gli ospiti. Ospite: manda all'host. */
  invia(tipo, dati = {}) {
    const mioId = this.io || (window.S && window.S.io) || (this.ruolo === "host" ? "p0" : null);
    const pacco = { tipo, da: mioId, ...dati };
    this.conns.forEach(conn => this._spedisci(conn, pacco));
  },

  /* Host: manda a un solo ospite. */
  inviaA(id, tipo, dati = {}) {
    const mioId = this.io || (window.S && window.S.io) || (this.ruolo === "host" ? "p0" : null);
    this._spedisci(this.conns.get(id), { tipo, da: mioId, ...dati });
  },

  /* Host: rilancia agli altri un messaggio arrivato da un ospite. */
  _inoltra(msg) {
    this.conns.forEach((conn, id) => {
      if (id !== msg.da) this._spedisci(conn, msg);
    });
  },

  get quanti() { return this.ruolo === "host" ? this.conns.size + 1 : 0; },

  /* Cerca se esiste già uno slot assegnato allo stesso peerId */
  _trovaSlotPeer(peerId) {
    if (!peerId) return null;
    for (const [id, c] of this.conns.entries()) {
      if (c && c.peer === peerId) return id;
    }
    return null;
  },

  /* Primo slot libero fra p1 e p5, così un posto liberato viene riusato. */
  _slotLibero() {
    for (let i = 1; i < MAX_GIOCATORI; i++) {
      if (!this.conns.has("p" + i)) return "p" + i;
    }
    return null;
  },

  _collegaConn(id, conn) {
    this.conns.set(id, conn);
    let eraAperto = false;

    conn.on("data", (msg) => {
      if (!msg || !msg.tipo) return;
      if (this.ruolo === "host") {
        msg.da = id;                                    // non fidarsi del mittente dichiarato
        if (!SOLO_ARBITRO.includes(msg.tipo)) this._inoltra(msg);
      }
      this._emit("messaggio", msg);
    });

    const notificaAperto = () => {
      if (eraAperto) return;
      eraAperto = true;
      console.log("[Rete] Canale dati aperto con:", id);
      this._emit("connesso", { id });
    };

    if (conn.open) {
      notificaAperto();
    } else {
      conn.on("open", notificaAperto);
    }

    const addio = () => {
      if (this.conns.get(id) === conn) {
        this.conns.delete(id);
        if (eraAperto) {
          console.log("[Rete] Canale dati chiuso con:", id);
          this._emit("disconnesso", { id });
        }
      }
    };
    conn.on("close", addio);
    conn.on("error", (err) => {
      console.warn("[Rete] Warning/Errore connessione " + id + ":", err);
      // Disconnetti solo se il canale non è aperto o chiuso definitivamente
      if (!conn.open) {
        addio();
      }
    });
  },

  /* Host: registra un id ricavato da un codice casuale.
     Se il codice è già occupato, ne genera un altro (max 5 tentativi). */
  creaStanza(tentativi = 5) {
    this.chiudi();
    this._chiusuraVoluta = false;
    const codice = codiceCasuale();
    this.ruolo = "host";
    this.io = "p0";
    this.codice = codice;
    this.conns = new Map();

    const peer = new Peer(PREFISSO_ID + codice, PEER_OPTS);
    this.peer = peer;

    peer.on("open", (id) => {
      console.log("[Rete] Host registrato con id:", id);
      this._emit("stanzaPronta", { codice });
    });

    peer.on("connection", (conn) => {
      console.log("[Rete] Host ha ricevuto richiesta da:", conn.peer);
      
      // Se questo peerId era già connesso (es. riconnessione o refresh), riutilizza lo slot esistente
      let id = this._trovaSlotPeer(conn.peer);
      if (id) {
        console.log(`[Rete] Peer ${conn.peer} già registrato nello slot ${id}, aggiorno canale...`);
        const vecchia = this.conns.get(id);
        if (vecchia && vecchia !== conn) {
          try { vecchia.close(); } catch (e) {}
        }
      } else {
        id = this._slotLibero();
      }

      if (!id) {
        const rifiuta = () => {
          try { conn.send({ tipo: "pieno" }); } catch (e) {}
          setTimeout(() => { try { conn.close(); } catch (e) {} }, 300);
        };
        if (conn.open) rifiuta(); else conn.on("open", rifiuta);
        return;
      }
      this._collegaConn(id, conn);
    });

    peer.on("disconnected", () => {
      if (this._chiusuraVoluta || !peer || peer.destroyed) return;
      console.warn("[Rete] Host disconnesso temporaneamente dal broker. Riconnetto...");
      try { peer.reconnect(); } catch (e) {}
    });

    peer.on("error", (err) => {
      console.warn("[Rete] Errore peer host:", err);
      if (err.type === "unavailable-id" && tentativi > 0) {
        console.log("[Rete] Codice stanza già occupato, riprovo con un nuovo codice...");
        try { peer.destroy(); } catch (e) {}
        this.creaStanza(tentativi - 1);
      } else {
        this._emit("errore", { messaggio: descriviErrore(err) });
      }
    });
  },

  /* Ospite: si collega all'host. L'id definitivo glielo comunica l'host. */
  entraStanza(codice) {
    this.chiudi();
    this._chiusuraVoluta = false;
    codice = (codice || "").trim().toUpperCase();
    if (codice.length < 3) { this._emit("errore", { messaggio: "Codice troppo corto." }); return; }

    this.ruolo = "ospite";
    this.io = null;               // lo assegna l'host col messaggio di benvenuto
    this.codice = codice;
    this.conns = new Map();

    const guestId = "zg-g-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    const peer = new Peer(guestId, PEER_OPTS);
    this.peer = peer;

    let connesso = false;
    let timerTimeout = null;
    let conn = null;

    const targetId = PREFISSO_ID + codice;

    const avviaConnessione = () => {
      if (connesso || !this.peer || this.peer.destroyed) return;
      console.log("[Rete] Ospite connette a:", targetId);
      conn = this.peer.connect(targetId, { reliable: true });
      this._collegaConn("p0", conn);

      const onAperto = () => {
        if (connesso) return;
        connesso = true;
        if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
        console.log("[Rete] Connessione P2P riuscita con l'host!");
        this._emit("stato", { messaggio: "Canale aperto! Presentazione all'host..." });
      };

      if (conn.open) onAperto();
      else conn.on("open", onAperto);

      conn.on("error", (err) => {
        console.warn("[Rete] Errore canale dati ospite:", err);
      });
    };

    peer.on("open", (mioPeerId) => {
      console.log("[Rete] Ospite registrato (" + mioPeerId + ") -> connessione a:", targetId);
      this._emit("stato", { messaggio: "Stanza trovata! Apertura canale con l'host..." });
      avviaConnessione();

      timerTimeout = setTimeout(() => {
        if (!connesso && (!conn || !conn.open)) {
          console.warn("[Rete] Timeout connessione stanza:", codice);
          this._emit("errore", {
            messaggio: "Impossibile collegarsi alla stanza " + codice + ". Assicurati che l'host sia nella schermata 'Sala d'attesa' e riprova!"
          });
          try { if (conn) conn.close(); } catch (e) {}
          try { peer.destroy(); } catch (e) {}
        }
      }, 16000);
    });

    peer.on("disconnected", () => {
      if (this._chiusuraVoluta || !peer || peer.destroyed) return;
      console.warn("[Rete] Ospite disconnesso temporaneamente dal broker. Riconnetto...");
      try { peer.reconnect(); } catch (e) {}
    });

    peer.on("error", (err) => {
      console.warn("[Rete] Errore peer ospite:", err);
      if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
      if (err.type === "peer-unavailable") {
        this._emit("errore", {
          messaggio: "Nessuna stanza attiva trovata con il codice '" + codice + "'. Assicurati che l'host abbia già creato la stanza e sia nella Sala d'attesa!"
        });
      } else if (err.type === "unavailable-id") {
        try { peer.destroy(); } catch (e) {}
        this.entraStanza(codice);
      } else {
        this._emit("errore", { messaggio: descriviErrore(err) });
      }
    });
  },

  /* Host: chiude il posto di un giocatore (espulsione o uscita). */
  scollega(id) {
    const conn = this.conns.get(id);
    if (conn) { try { conn.close(); } catch (e) {} }
    this.conns.delete(id);
  },

  chiudi() {
    this._chiusuraVoluta = true;
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
    this.conns.forEach(conn => { try { conn.close(); } catch (e) {} });
    this.conns.clear();
    try {
      if (this.peer && !this.peer.destroyed) {
        this.peer.destroy();
      }
    } catch (e) {}
    this.peer = null;
    this.ruolo = null;
    this.codice = null;
    this.io = null;
  }
};

window.addEventListener("beforeunload", () => {
  try { Rete.chiudi(); } catch (e) {}
});

function descriviErrore(err) {
  console.error("[Rete Errore]", err);
  const tipo = (err && err.type) || "";
  const msg = (err && err.message) || "";
  switch (tipo) {
    case "network": return "Problema di rete verso il server PeerJS. Controlla la connessione internet.";
    case "server-error": return "Il server di collegamento non risponde. Riprova tra pochi secondi.";
    case "browser-incompatible": return "Questo browser non supporta WebRTC.";
    case "webrtc": return "Connessione diretta WebRTC non riuscita. Riprova con un altro codice o premi Svuota Cache.";
    case "disconnected": return "Connessione al server interrotta.";
    case "peer-unavailable": return "Stanza non trovata. L'host potrebbe aver chiuso o il codice è errato.";
    case "socket-error":
    case "socket-closed": return "Connessione al broker interrotta. Riprova.";
    default: return "Errore di connessione" + (tipo ? " (" + tipo + ")" : "") + (msg ? ": " + msg : "");
  }
}
