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

// Configurazione WebRTC con server STUN veloci
const PEER_OPTS = {
  debug: 0,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" }
    ]
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
    const pacco = { tipo, da: this.io, ...dati };
    this.conns.forEach(conn => this._spedisci(conn, pacco));
  },

  /* Host: manda a un solo ospite. */
  inviaA(id, tipo, dati = {}) {
    this._spedisci(this.conns.get(id), { tipo, da: this.io, ...dati });
  },

  /* Host: rilancia agli altri un messaggio arrivato da un ospite. */
  _inoltra(msg) {
    this.conns.forEach((conn, id) => {
      if (id !== msg.da) this._spedisci(conn, msg);
    });
  },

  get quanti() { return this.ruolo === "host" ? this.conns.size + 1 : 0; },

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
          this._emit("disconnesso", { id });
        }
      }
    };
    conn.on("close", addio);
    conn.on("error", addio);
  },

  /* Host: registra un id ricavato da un codice casuale.
     Se il codice è già occupato, ne genera un altro (max 5 tentativi). */
  creaStanza(tentativi = 5) {
    this.chiudi();
    const codice = codiceCasuale();
    this.ruolo = "host";
    this.io = "p0";
    this.codice = codice;
    this.conns = new Map();

    const peer = new Peer(PREFISSO_ID + codice, PEER_OPTS);
    this.peer = peer;

    // Heartbeat ogni 12 secondi per evitare che il broker chiuda il WebSocket
    this._heartbeatInterval = setInterval(() => {
      if (this.peer && !this.peer.destroyed && this.peer.socket && this.peer.socket._ws && this.peer.socket._ws.readyState === 1) {
        try { this.peer.socket.send({ type: "HEARTBEAT" }); } catch (e) {}
      }
    }, 12000);

    peer.on("open", (id) => {
      console.log("[Rete] Host registrato con id:", id);
      this._emit("stanzaPronta", { codice });
    });

    peer.on("connection", (conn) => {
      console.log("[Rete] Host ha ricevuto richiesta da:", conn.peer);
      const id = this._slotLibero();
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
      console.warn("[Rete] Host disconnesso temporaneamente dal broker. Riconnetto...");
      try { if (!peer.destroyed) peer.reconnect(); } catch (e) {}
    });

    peer.on("error", (err) => {
      console.warn("[Rete] Errore peer host:", err);
      if (err.type === "unavailable-id" && tentativi > 0) {
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
    codice = (codice || "").trim().toUpperCase();
    if (codice.length < 3) { this._emit("errore", { messaggio: "Codice troppo corto." }); return; }

    this.ruolo = "ospite";
    this.io = null;               // lo assegna l'host col messaggio di benvenuto
    this.codice = codice;
    this.conns = new Map();

    const peer = new Peer(undefined, PEER_OPTS);
    this.peer = peer;

    let connesso = false;
    let timerTimeout = null;
    let timerRetry = null;
    let conn = null;

    const targetId = PREFISSO_ID + codice;

    // Heartbeat per mantenere attiva la connessione con il broker
    this._heartbeatInterval = setInterval(() => {
      if (this.peer && !this.peer.destroyed && this.peer.socket && this.peer.socket._ws && this.peer.socket._ws.readyState === 1) {
        try { this.peer.socket.send({ type: "HEARTBEAT" }); } catch (e) {}
      }
    }, 12000);

    const avviaConnessione = () => {
      if (connesso || peer.destroyed) return;
      console.log("[Rete] Ospite connette a:", targetId);
      conn = peer.connect(targetId);
      this._collegaConn("p0", conn);

      const onAperto = () => {
        if (connesso) return;
        connesso = true;
        if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
        if (timerRetry) { clearTimeout(timerRetry); timerRetry = null; }
        console.log("[Rete] Connessione P2P riuscita con l'host!");
      };

      if (conn.open) onAperto();
      else conn.on("open", onAperto);

      conn.on("error", (err) => console.warn("[Rete] Errore conn:", err));
    };

    peer.on("open", (mioPeerId) => {
      console.log("[Rete] Ospite registrato (" + mioPeerId + ") -> connessione a:", targetId);
      avviaConnessione();

      // Retry dopo 4.5s se la prima offerta ICE non è andata a segno
      timerRetry = setTimeout(() => {
        if (!connesso && (!conn || !conn.open)) {
          console.log("[Rete] Rinnovo handshake con l'host...");
          avviaConnessione();
        }
      }, 4500);

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
      console.warn("[Rete] Ospite disconnesso temporaneamente dal broker. Riconnetto...");
      try { if (!peer.destroyed) peer.reconnect(); } catch (e) {}
    });

    peer.on("error", (err) => {
      console.warn("[Rete] Errore peer ospite:", err);
      if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
      if (timerRetry) { clearTimeout(timerRetry); timerRetry = null; }
      if (err.type === "peer-unavailable") {
        this._emit("errore", {
          messaggio: "Nessuna stanza attiva trovata con il codice '" + codice + "'. Assicurati che l'host abbia già creato la stanza e sia nella Sala d'attesa!"
        });
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
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
    this.conns.forEach(conn => { try { conn.close(); } catch (e) {} });
    this.conns.clear();
    try { if (this.peer) this.peer.destroy(); } catch (e) {}
    this.peer = null; this.ruolo = null; this.codice = null; this.io = null;
  }
};

window.addEventListener("beforeunload", () => {
  try { Rete.chiudi(); } catch (e) {}
});

function descriviErrore(err) {
  switch (err && err.type) {
    case "network":        return "Problema di rete verso il server PeerJS. Controlla la connessione internet.";
    case "server-error":   return "Il server di collegamento non risponde. Riprova tra pochi secondi.";
    case "browser-incompatible": return "Questo browser non supporta WebRTC.";
    case "webrtc":         return "Connessione diretta fallita (blocco NAT/firewall o rete restrittiva).";
    case "disconnected":   return "Connessione al server interrotta.";
    case "peer-unavailable": return "Stanza non trovata. L'host potrebbe aver chiuso o il codice è errato.";
    default:               return "Errore di connessione: " + ((err && err.type) || "impossibile connettersi");
  }
}
