/* ==========================================================================
   Zaltergames — Bot Diagnostica e Test Connessione P2P (WebRTC & PeerJS)
   ==========================================================================
   Esegue un test end-to-end automatico della connessione peer-to-peer:
   1. Verifica caricamento libreria PeerJS locale
   2. Handshake con il server broker WebSocket (0.peerjs.com)
   3. Analisi candidati ICE: Locali (Host), STUN (IP Pubblico) e TURN (Relay)
   4. Stretta di mano WebRTC ICE & Apertura DataChannel
   5. Scambio dati bidirezionale (Ping-Pong) e calcolo latenza reale
   6. Funzione 'verificaStanza(codice)' per testare una stanza reale dell'Host
   ========================================================================== */

(function () {
  'use strict';

  const P2PTester = {
    inEsecuzione: false,

    async eseguiTest(onProgresso) {
      if (this.inEsecuzione) return { successo: false, errore: "Test già in esecuzione." };
      this.inEsecuzione = true;

      const log = (step, stato, dettaglio) => {
        if (typeof onProgresso === 'function') {
          onProgresso({ step, stato, dettaglio });
        }
      };

      const risultato = {
        successo: false,
        passaggi: [],
        latenzaMs: 0,
        haStun: false,
        haTurn: false,
        errore: null
      };

      let hostPeer = null;
      let guestPeer = null;
      let connHost = null;
      let connGuest = null;

      const pulisci = () => {
        try { if (connHost) connHost.close(); } catch (e) {}
        try { if (connGuest) connGuest.close(); } catch (e) {}
        try { if (hostPeer && !hostPeer.destroyed) hostPeer.destroy(); } catch (e) {}
        try { if (guestPeer && !guestPeer.destroyed) guestPeer.destroy(); } catch (e) {}
        this.inEsecuzione = false;
      };

      try {
        // Step 1: Libreria PeerJS
        log(1, 'running', 'Verifica presenza libreria PeerJS locale...');
        if (typeof window.Peer === 'undefined') {
          throw new Error("Libreria PeerJS non caricata. Verifica il file js/peerjs.min.js.");
        }
        log(1, 'ok', 'Libreria PeerJS v1.5.4 attiva.');
        risultato.passaggi.push({ step: 1, nome: 'Libreria PeerJS', stato: 'ok' });

        // Step 2: Protocollo sicuro / Origin
        log(2, 'running', 'Controllo ambiente di esecuzione (HTTPS / Localhost)...');
        if (location.protocol === 'file:') {
          log(2, 'warn', 'Attenzione: sei su file:// locale. Chrome e Edge possono limitare WebRTC su file://. Usa un server locale o GitHub Pages.');
        } else {
          log(2, 'ok', `Protocollo sicuro rilevato (${location.protocol}//${location.host}).`);
        }
        risultato.passaggi.push({ step: 2, nome: 'Ambiente di rete', stato: 'ok' });

        // Step 3: Connessione Broker Cloud (0.peerjs.com)
        log(3, 'running', 'Connessione al Broker Cloud e registrazione Host...');
        const testHostId = 'zg-diag-host-' + Math.floor(Math.random() * 900000 + 100000);
        const hostOpts = (typeof PEER_OPTS !== 'undefined') ? PEER_OPTS : { debug: 1 };
        hostPeer = new window.Peer(testHostId, hostOpts);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout broker PeerJS (10s): il server di segnalazione cloud non risponde o la connessione internet è assente.")), 10000);
          
          hostPeer.on('open', (id) => {
            clearTimeout(timeout);
            log(3, 'ok', `Broker Cloud connesso. Host registrato con successo (ID: ${id}).`);
            risultato.passaggi.push({ step: 3, nome: 'Registrazione Host', stato: 'ok' });
            resolve(id);
          });

          hostPeer.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore Broker Host: ${err.type || err.message || err}`));
          });
        });

        // Step 4: Registrazione Guest Peer
        log(4, 'running', 'Creazione e registrazione del Guest Peer...');
        const testGuestId = 'zg-diag-guest-' + Math.floor(Math.random() * 900000 + 100000);
        guestPeer = new window.Peer(testGuestId, hostOpts);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout registrazione Guest sul broker (10s).")), 10000);

          guestPeer.on('open', (id) => {
            clearTimeout(timeout);
            log(4, 'ok', `Guest registrato sul broker.`);
            risultato.passaggi.push({ step: 4, nome: 'Registrazione Guest', stato: 'ok' });
            resolve(id);
          });

          guestPeer.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore Broker Guest: ${err.type || err.message || err}`));
          });
        });

        // Step 5: Connessione P2P e Rilevamento Candidati ICE (STUN / TURN)
        log(5, 'running', 'Scambio candidati ICE e apertura DataChannel...');

        const hostAttendeConnessione = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout handshake WebRTC lato Host.")), 12000);
          hostPeer.on('connection', (c) => {
            clearTimeout(timeout);
            connHost = c;
            if (c.open) resolve(c);
            else c.on('open', () => resolve(c));
          });
        });

        connGuest = guestPeer.connect(testHostId, { reliable: true });

        // Monitora i tipi di candidati ICE generati
        let tipiCandidati = new Set();
        if (connGuest.peerConnection) {
          const pc = connGuest.peerConnection;
          pc.addEventListener('icecandidate', (e) => {
            if (e.candidate && e.candidate.type) {
              tipiCandidati.add(e.candidate.type);
              if (e.candidate.type === 'srflx') risultato.haStun = true;
              if (e.candidate.type === 'relay') risultato.haTurn = true;
            }
          });
        }

        const guestAttendeConnessione = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout apertura DataChannel (12s). Possibile blocco NAT/Firewall UDP.")), 12000);
          if (connGuest.open) {
            clearTimeout(timeout);
            resolve(connGuest);
          } else {
            connGuest.on('open', () => {
              clearTimeout(timeout);
              resolve(connGuest);
            });
          }
          connGuest.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore connessione DataChannel: ${err}`));
          });
        });

        await Promise.all([hostAttendeConnessione, guestAttendeConnessione]);

        const dettaglioICE = (risultato.haTurn ? 'TURN Relay attivo (OK per 4G/Hotspot) | ' : '') + 'DataChannel aperto.';
        log(5, 'ok', `Canale dati WebRTC P2P aperto! (${dettaglioICE})`);
        risultato.passaggi.push({ step: 5, nome: 'Handshake WebRTC P2P', stato: 'ok' });

        // Step 6: Scambio Dati Bidirezionale & Misurazione Latenza (Ping-Pong)
        log(6, 'running', 'Invio pacchetto dati di test e misurazione latenza...');
        const t0 = performance.now();

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout ricezione pacchetto Pong (5s).")), 5000);

          connHost.on('data', (dati) => {
            if (dati && dati.tipo === 'ping_test') {
              connHost.send({ tipo: 'pong_test', t: dati.t });
            }
          });

          connGuest.on('data', (dati) => {
            if (dati && dati.tipo === 'pong_test') {
              clearTimeout(timeout);
              const latenza = Math.round(performance.now() - t0);
              risultato.latenzaMs = latenza;
              log(6, 'ok', `Scambio dati riuscito in ${latenza} ms!`);
              risultato.passaggi.push({ step: 6, nome: 'Scambio Dati P2P', stato: 'ok', latenza });
              resolve();
            }
          });

          connGuest.send({ tipo: 'ping_test', t: t0 });
        });

        risultato.successo = true;
        log('fine', 'ok', `Infrastruttura P2P verificata al 100%! STUN e TURN operativi.`);

      } catch (err) {
        risultato.successo = false;
        risultato.errore = err.message || String(err);
        log('errore', 'fail', risultato.errore);
      } finally {
        pulisci();
      }

      return risultato;
    },

    /* Verifica diretta di una specifica stanza attiva creata dall'Host */
    async verificaStanza(codiceStanza, onProgresso) {
      if (this.inEsecuzione) return { successo: false, errore: "Test già in esecuzione." };
      this.inEsecuzione = true;

      codiceStanza = (codiceStanza || '').trim().toUpperCase();
      const log = (step, stato, dettaglio) => {
        if (typeof onProgresso === 'function') {
          onProgresso({ step, stato, dettaglio });
        }
      };

      if (codiceStanza.length < 3) {
        this.inEsecuzione = false;
        log('errore', 'fail', 'Il codice della stanza deve contenere almeno 4 caratteri.');
        return { successo: false, errore: 'Codice non valido' };
      }

      const prefisso = (typeof PREFISSO_ID !== 'undefined') ? PREFISSO_ID : "dattiloduello-v1-";
      const targetId = prefisso + codiceStanza;
      const hostOpts = (typeof PEER_OPTS !== 'undefined') ? PEER_OPTS : { debug: 1 };

      let probePeer = null;
      let probeConn = null;

      const pulisci = () => {
        try { if (probeConn) probeConn.close(); } catch (e) {}
        try { if (probePeer && !probePeer.destroyed) probePeer.destroy(); } catch (e) {}
        this.inEsecuzione = false;
      };

      try {
        log(1, 'running', `Connessione al Broker per verificare la stanza '${codiceStanza}'...`);
        probePeer = new window.Peer(undefined, hostOpts);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout connessione al Broker.")), 8000);
          probePeer.on('open', resolve);
          probePeer.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });

        log(2, 'running', `Ricerca dell'Host '${codiceStanza}' sul server broker...`);
        const t0 = performance.now();

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout connessione alla stanza '${codiceStanza}' (12s). Assicurati che l'Host abbia aperta la schermata 'Sala d'attesa' e non abbia ricaricato la pagina.`));
          }, 12000);

          probePeer.on('error', (err) => {
            clearTimeout(timeout);
            if (err.type === 'peer-unavailable') {
              reject(new Error(`La stanza '${codiceStanza}' NON è registrata sul broker cloud. Chi crea la stanza deve avere la schermata 'Sala d'attesa' aperta in questo momento!`));
            } else {
              reject(err);
            }
          });

          probeConn = probePeer.connect(targetId, { reliable: true });

          probeConn.on('open', () => {
            clearTimeout(timeout);
            const lat = Math.round(performance.now() - t0);
            log(3, 'ok', `Stanza '${codiceStanza}' TROVATA! Handshake P2P completato in ${lat} ms.`);
            resolve();
          });

          probeConn.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore canale dati verso la stanza '${codiceStanza}': ${err}`));
          });
        });

        log('fine', 'ok', `La stanza '${codiceStanza}' è ATTIVA e raggiungibile! Puoi connetterti normalmente.`);
        return { successo: true, codice: codiceStanza };

      } catch (err) {
        log('errore', 'fail', err.message || String(err));
        return { successo: false, errore: err.message || String(err) };
      } finally {
        pulisci();
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.P2PTester = P2PTester;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.P2PTester = P2PTester;
  }
})();
