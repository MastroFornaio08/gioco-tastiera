# Zaltergames

Party game browser-based con 25 sfide competitive per 2–6 giocatori, allenamento contro un fantasma, tornei e modalità Tabellone.

## Giocare

Apri <https://mastrofornaio08.github.io/gioco-tastiera/>.

- **Crea stanza** genera un codice da condividere.
- **Entra con codice** collega un altro dispositivo via WebRTC.
- **Allenamento** permette di provare i giochi compatibili contro un avversario simulato.
- **Torneo** assegna corone per ogni sfida vinta.
- **Tabellone** trasforma i minigiochi in una corsa a 25 caselle.
- **Effetti visivi** offre qualità automatica, completa, ridotta o disattivata.
- Le interruzioni brevi di rete attivano una **riconnessione automatica** mantenendo lo slot del giocatore.

Non servono account. L’host funziona da arbitro e i browser comunicano tramite PeerJS/WebRTC.

## Catalogo

Il catalogo è stato ridotto a 25 giochi distinti. Sono state eliminate le varianti che duplicavano quasi completamente altre meccaniche:

- Simon Dice → resta **Sequenza**.
- Tiro al Bersaglio → resta **Bersaglio**.
- Tira alla Fune → resta **Tritadita**.
- Gioco dell’Oca come minigioco → resta la modalità **Tabellone**.

## Sviluppo

Il progetto è statico e non richiede una build.

```bash
node --test tests/*.test.cjs
node scratch/test_all_games.js
```

GitHub Actions controlla asset, sintassi, registrazione dei 25 giochi, configurazione PWA e simulazione con bot. Gli strumenti diagnostici restano nel repository ma non vengono caricati nella versione pubblica.

## Struttura

```text
index.html                schermate e caricamento moduli
css/design-system.css     design system e layout moderni
css/giochi.css            componenti delle arene
js/nucleo.js              stato, round, punteggi e lobby
js/rete.js                connessione PeerJS/WebRTC
js/giochi/                implementazioni dei minigiochi
js/tabellone.js           modalità Tabellone
tests/                    controlli automatici
sw.js                     cache PWA e fallback offline
```

## Limiti noti

- WebRTC può essere bloccato da reti molto restrittive.
- Il collegamento iniziale dipende dal broker pubblico PeerJS.
- Microfono, fotocamera e sensori richiedono HTTPS e consenso.

## Licenza

MIT.