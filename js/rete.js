/* Rete peer-to-peer basata su PeerJS.
   L'host apre un peer con un id derivato dal codice stanza; l'ospite si connette a quell'id.
   Nessun server di gioco: il broker pubblico serve solo per la stretta di mano. */

const PREFISSO_ID = "dattiloduello-v1-";
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente I/O/0/1, si confondono

function codiceCasuale(n = 4) {
  let s = "";
  for (let i = 0; i < n; i++) s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return s;
}

const Rete = {
  peer: null,
  conn: null,
  ruolo: null,          // 'host' | 'ospite'
  codice: null,
  handlers: {},         // tipo -> callback

  on(tipo, fn) { this.handlers[tipo] = fn; return this; },

  _emit(tipo, dati) {
    const fn = this.handlers[tipo];
    if (fn) fn(dati);
  },

  invia(tipo, dati = {}) {
    if (this.conn && this.conn.open) {
      try { this.conn.send({ tipo, ...dati }); } catch (e) { /* connessione morente */ }
    }
  },

  _collegaConn(conn) {
    this.conn = conn;
    conn.on("data", (msg) => {
      if (msg && msg.tipo) this._emit("messaggio", msg);
    });
    conn.on("open", () => this._emit("connesso", { peer: conn.peer }));
    conn.on("close", () => this._emit("disconnesso", {}));
    conn.on("error", () => this._emit("disconnesso", {}));
  },

  /* Host: prova a registrare un id ricavato da un codice casuale.
     Se il codice è già occupato, ne genera un altro (max 5 tentativi). */
  creaStanza(tentativi = 5) {
    const codice = codiceCasuale();
    const id = PREFISSO_ID + codice;
    this.ruolo = "host";
    this.codice = codice;

    const peer = new Peer(id, { debug: 0 });
    this.peer = peer;

    peer.on("open", () => this._emit("stanzaPronta", { codice }));

    peer.on("connection", (conn) => {
      if (this.conn && this.conn.open) { conn.close(); return; } // stanza piena
      this._collegaConn(conn);
    });

    peer.on("error", (err) => {
      if (err.type === "unavailable-id" && tentativi > 0) {
        try { peer.destroy(); } catch (e) {}
        this.creaStanza(tentativi - 1);
      } else {
        this._emit("errore", { messaggio: descriviErrore(err) });
      }
    });
  },

  /* Ospite: si connette all'id dell'host. */
  entraStanza(codice) {
    codice = (codice || "").trim().toUpperCase();
    if (codice.length < 3) { this._emit("errore", { messaggio: "Codice troppo corto." }); return; }

    this.ruolo = "ospite";
    this.codice = codice;

    const peer = new Peer(undefined, { debug: 0 });
    this.peer = peer;

    peer.on("open", () => {
      const conn = peer.connect(PREFISSO_ID + codice, { reliable: true });
      this._collegaConn(conn);
      // Se entro 12 secondi non si apre, la stanza probabilmente non esiste.
      setTimeout(() => {
        if (!this.conn || !this.conn.open) {
          this._emit("errore", { messaggio: "Stanza non trovata. Controlla il codice." });
        }
      }, 12000);
    });

    peer.on("error", (err) => {
      if (err.type === "peer-unavailable") {
        this._emit("errore", { messaggio: "Nessuna stanza con questo codice." });
      } else {
        this._emit("errore", { messaggio: descriviErrore(err) });
      }
    });
  },

  chiudi() {
    try { if (this.conn) this.conn.close(); } catch (e) {}
    try { if (this.peer) this.peer.destroy(); } catch (e) {}
    this.conn = null; this.peer = null; this.ruolo = null; this.codice = null;
  }
};

function descriviErrore(err) {
  switch (err && err.type) {
    case "network":        return "Problema di rete verso il server di collegamento.";
    case "server-error":   return "Il server di collegamento non risponde. Riprova tra poco.";
    case "browser-incompatible": return "Questo browser non supporta WebRTC.";
    case "webrtc":         return "Connessione diretta fallita (firewall o rete restrittiva).";
    case "disconnected":   return "Connessione interrotta.";
    default:               return "Errore di connessione: " + ((err && err.type) || "sconosciuto");
  }
}
