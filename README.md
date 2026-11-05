# Il Delitto · Zaltergames

Un gioco narrativo browser-based per **10 sospettati e un narratore**. Il narratore crea una stanza, sceglie uno dei tre casi e vede ruoli, segreti, messaggi scritti e soluzione. I sospettati entrano dai propri telefoni oppure giocano dal vivo passando un telefono.

## Come si gioca

- Il narratore crea una stanza e condivide il codice con dieci giocatori. Non riceve un personaggio e non vota.
- Il narratore avvia il caso e distribuisce i ruoli in privato. L’assassino e il complice si conoscono.
- La partita procede in quattro fasi: introduzione, interrogatorio, svolta e voto finale. Solo il narratore può avanzare; il voto resta chiuso fino all’ultima fase.
- Non c’è una bacheca di indizi pubblici. Ogni personaggio ha informazioni e obiettivi riservati, che può rivelare, trattenere o usare negli accordi.
- Il narratore può scrivere situazioni e inviarle a tutti o a un solo sospettato. Può anche usare spunti rapidi.
- I sospettati inviano accordi pubblici o privati dai telefoni. Il narratore vede tutti i messaggi; quelli privati restano nascosti agli altri giocatori.
- Al voto finale, tutti scelgono assassino, complice, metodo e movente. Serve la maggioranza per ogni scelta: gli investigatori vincono se identificano assassino, metodo e movente; assassino e complice possono salvarsi separatamente se non vengono scoperti.

## Partita dal vivo

Inserisci i dieci nomi e un PIN narratore di 4–6 cifre. Il narratore vede la schermata con soluzione, ruoli e messaggi; il PIN serve a proteggere l’accesso quando il telefono passa di mano. Le schede si leggono una alla volta. Il gioco assegna a ogni persona un PIN casuale e univoco da salvare; per riaprire la propria scheda servono nome e PIN. Accordi e conversazioni possono avvenire a voce.

## Bot per le prove

Nella sala del narratore, **Aggiungi 10 bot di prova** completa i posti dei sospettati con bot PeerJS. Ricevono una scheda, inviano un accordo e votano a caso quando si apre il voto finale. **Rimuovi bot** li disconnette.

## Casi inclusi

- **Il ritratto scomparso** · Palazzo Velluto, 1934.
- **L’ultimo applauso** · Teatro Belladonna, 1951.
- **Il sigillo nero** · Villa Malaspina, 1898.

## Rete e privacy

La stanza usa PeerJS/WebRTC con il narratore come arbitro. Ruoli e messaggi privati passano dal narratore e vengono inviati solo ai destinatari; il narratore mantiene il registro completo. I giocatori vedono solo i propri messaggi privati e le situazioni destinate a loro. Il narratore deve restare collegato per tutta la partita.

## Sviluppo

Progetto statico, senza build. Apri index.html tramite un server HTTPS/localhost per usare WebRTC.