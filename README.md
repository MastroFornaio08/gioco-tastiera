# Il Delitto · Zaltergames

Un gioco narrativo browser-based per **10 giocatori**. L'host crea una stanza con codice, gli altri entrano dai propri telefoni. Ogni giocatore riceve in privato un personaggio, un segreto e un obiettivo.

## Come si gioca

- L'host crea una stanza e condivide il codice o il link.
- Quando sono collegati tutti e dieci, l'host sceglie uno dei tre casi e distribuisce i ruoli.
- Ogni caso ha tre indizi pubblici, dieci storie personali, un assassino e un complice che si conoscono.
- I giocatori possono stringere accordi pubblici o inviare proposte private. Gli accordi non sono vincolanti.
- Dopo il confronto, l'host inserisce l'accusa: assassino, complice, metodo e movente.

## Bot per le prove

Nella sala host, **Riempi con bot fino a 10** aggiunge i bot necessari per completare la stanza, host incluso nel totale. I bot si collegano con canali PeerJS separati, ricevono una scheda privata e inviano una proposta di accordo per provare il flusso di rete. **Rimuovi bot** li disconnette. Servono per verificare lobby, assegnazione privata dei ruoli e accordi; per provare l'interfaccia individuale occorrono ancora telefoni o browser distinti.

## Casi inclusi

- **Il ritratto scomparso** · Palazzo Velluto, 1934.
- **L'ultimo applauso** · Teatro Belladonna, 1951.
- **Il sigillo nero** · Villa Malaspina, 1898.

## Rete e privacy

La stanza usa PeerJS/WebRTC con l'host come arbitro. I messaggi dei ruoli e degli accordi privati passano sul canale riservato all'host e vengono inviati solo ai destinatari; gli indizi e gli accordi pubblici vengono condivisi con tutti. L'host deve restare collegato per tutta la partita.

## Sviluppo

Progetto statico, senza build. Apri index.html tramite un server HTTPS/localhost per usare WebRTC.

I moduli dei vecchi minigiochi non vengono più caricati dall'app. Sono rimasti nel repository come sorgente storica.
