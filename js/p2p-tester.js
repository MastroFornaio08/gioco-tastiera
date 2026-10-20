/* ==========================================================================
   Zaltergames — Bot Diagnostica e Test Connessione P2P (WebRTC & PeerJS)
   ==========================================================================
   Esegue un test end-to-end automatico della connessione peer-to-peer:
   1. Verifica caricamento libreria PeerJS
   2. Handshake con il server broker WebSocket
   3. Creazione Host Peer temporaneo
   4. Creazione Guest Peer temporaneo
   5. Stretta di mano WebRTC ICE & Apertura DataChannel
   6. Scambio dati bidirezionale (Ping-Pong) e calcolo latenza reale
   7. Diagnosi degli errori con spiegazione della causa
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
        log(1, 'running', 'Verifica presenza libreria PeerJS...');
        if (typeof window.Peer === 'undefined') {
          throw new Error("Libreria PeerJS non caricata. Verifica la connessione o il file js/peerjs.min.js.");
        }
        log(1, 'ok', 'Libreria PeerJS v' + (window.Peer.prototype?.version || '1.5.x') + ' attiva.');
        risultato.passaggi.push({ step: 1, nome: 'Libreria PeerJS', stato: 'ok' });

        // Step 2: Protocollo sicuro / Origin
        log(2, 'running', 'Controllo ambiente di esecuzione (HTTPS / Localhost)...');
        if (location.protocol === 'file:') {
          log(2, 'warn', 'Attenzione: sei su file://. Chrome e altri browser bloccano WebRTC su file locali.');
        } else {
          log(2, 'ok', `Protocollo ${location.protocol}// rilevato.`);
        }
        risultato.passaggi.push({ step: 2, nome: 'Ambiente di rete', stato: 'ok' });

        // Step 3: Connessione Broker & Registrazione Host
        log(3, 'running', 'Connessione al Broker Cloud e registrazione Host...');
        const testHostId = 'zg-diag-host-' + Math.floor(Math.random() * 900000 + 100000);
        
        const hostOpts = (typeof PEER_OPTS !== 'undefined') ? PEER_OPTS : { debug: 1 };
        hostPeer = new window.Peer(testHostId, hostOpts);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout connessione al server broker PeerJS (10s). Il server di segnalazione potrebbe essere irraggiungibile.")), 10000);
          
          hostPeer.on('open', (id) => {
            clearTimeout(timeout);
            log(3, 'ok', `Host registrato sul broker con successo (ID: ${id}).`);
            risultato.passaggi.push({ step: 3, nome: 'Registrazione Host sul Broker', stato: 'ok' });
            resolve(id);
          });

          hostPeer.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore Broker Host: ${err.type || err.message || err}`));
          });
        });

        // Step 4: Registrazione Guest Peer
        log(4, 'running', 'Creazione del Guest Peer...');
        const testGuestId = 'zg-diag-guest-' + Math.floor(Math.random() * 900000 + 100000);
        guestPeer = new window.Peer(testGuestId, hostOpts);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout registrazione Guest sul broker (10s).")), 10000);

          guestPeer.on('open', (id) => {
            clearTimeout(timeout);
            log(4, 'ok', `Guest registrato sul broker con successo.`);
            risultato.passaggi.push({ step: 4, nome: 'Registrazione Guest sul Broker', stato: 'ok' });
            resolve(id);
          });

          guestPeer.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Errore Broker Guest: ${err.type || err.message || err}`));
          });
        });

        // Step 5: Connessione P2P e Apertura DataChannel
        log(5, 'running', 'Avvio stretta di mano WebRTC (ICE candidates & DataChannel)...');

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

        const guestAttendeConnessione = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout apertura DataChannel lato Guest (12s). Possibile blocco NAT/Firewall UDP.")), 12000);
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
        log(5, 'ok', 'Canale dati WebRTC P2P aperto con successo!');
        risultato.passaggi.push({ step: 5, nome: 'Handshake WebRTC P2P', stato: 'ok' });

        // Step 6: Scambio Dati Bidirezionale & Misurazione Latenza (Ping-Pong)
        log(6, 'running', 'Invio pacchetto dati di test e misurazione latenza...');
        const t0 = performance.now();

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout ricezione pacchetto Pong (5s).")), 5000);

          // L'Host risponde al Ping inviando un Pong
          connHost.on('data', (dati) => {
            if (dati && dati.tipo === 'ping_test') {
              connHost.send({ tipo: 'pong_test', t: dati.t });
            }
          });

          // Il Guest riceve il Pong e misura il tempo
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

          // Invia il Ping iniziale
          connGuest.send({ tipo: 'ping_test', t: t0 });
        });

        risultato.successo = true;
        log('fine', 'ok', 'Tutti i controlli superati! La connessione P2P funziona perfettamente.');

      } catch (err) {
        risultato.successo = false;
        risultato.errore = err.message || String(err);
        log('errore', 'fail', risultato.errore);
      } finally {
        pulisci();
      }

      return risultato;
    }
  };

  if (typeof window !== 'undefined') {
    window.P2PTester = P2PTester;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.P2PTester = P2PTester;
  }
})();
