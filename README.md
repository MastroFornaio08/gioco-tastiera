# ⌨️ Dattilo Duello

Gara di scrittura veloce in italiano per due giocatori. Uno crea la stanza (host),
l'altro entra con un codice di 4 caratteri. Cinque round, regole a sorpresa, vince chi fa più punti.

Nessun account, nessuna installazione, nessun database: solo una pagina web.

## Come si gioca

1. Scrivi il tuo nome e premi **Crea una partita**.
2. Manda all'avversario il codice (o il link d'invito) che compare.
3. L'avversario apre lo stesso sito, preme **Entra con codice** e lo inserisce.
4. L'host preme **Inizia la sfida**.

C'è anche la modalità **Allenamento**, da soli contro un avversario simulato.

### Regole

- **5 round.** Stessa frase per entrambi, partenza simultanea dopo un conto alla rovescia.
- Le frasi si allungano round dopo round: due corte, due medie, una lunga.
- I punti nascono dalle **parole al minuto moltiplicate per la precisione al quadrato**:
  correre sbagliando non conviene quasi mai.
- Sotto il **75% di precisione** il round è **nullo**: zero punti.
- Chi consegna per primo prende un **bonus** (100 punti × moltiplicatore del round).
- <kbd>Invio</kbd> consegna in qualsiasi momento, anche a frase incompleta. Il tempo massimo è 90 secondi.

### Le regole speciali

Il primo round è sempre normale e l'ultimo è sempre Turbo; in mezzo se ne sorteggiano tre.

| Regola | Effetto | Punti |
|---|---|---|
| ⌨️ Round normale | nessuna regola speciale | ×1 |
| 🔒 Niente cancella | backspace disattivato: un errore resta per sempre | ×1,3 |
| 🔠 Tutto maiuscolo | la frase va scritta TUTTA IN MAIUSCOLO | ×1,3 |
| 🌫️ Nebbia | ciò che hai già scritto sfuma: bisogna andare a memoria | ×1,4 |
| 🙈 Alla cieca | non vedi quello che stai scrivendo, solo la barra di avanzamento | ×1,6 |
| ⚡ Turbo | punti raddoppiati, round decisivo | ×2 |

## Come funziona sotto il cofano

Il gioco è **peer-to-peer**: i due browser si parlano direttamente via WebRTC
(libreria [PeerJS](https://peerjs.com/)). Il server pubblico di PeerJS serve solo
per la "stretta di mano" iniziale — dopo, nessun dato passa da terzi.

Non esiste un server di gioco: **l'host fa da arbitro**. Sceglie frasi e regole,
riceve i risultati dell'avversario, calcola i punteggi e scandisce i round.
L'host misura anche il ritardo di rete e ritarda la propria partenza di metà round-trip,
così i due conti alla rovescia finiscono insieme.

```
index.html      struttura delle schermate
css/style.css   tutto lo stile
js/frasi.js     40 frasi italiane divise per lunghezza + le regole speciali
js/rete.js      connessione peer-to-peer (creazione stanza, ingresso, invio messaggi)
js/gioco.js     motore: round, digitazione, punteggi, schermate
```

## Pubblicarlo gratis

È un sito statico: qualunque hosting gratuito va bene. Il più semplice è **GitHub Pages**.

1. Crea un account su [github.com](https://github.com) e un repository pubblico, ad esempio `dattilo-duello`.
2. Carica i file (`index.html`, la cartella `css`, la cartella `js`, questo `README.md`).
   Da riga di comando:

   ```bash
   git init
   git add .
   git commit -m "Dattilo Duello"
   git branch -M main
   git remote add origin https://github.com/TUO-NOME/dattilo-duello.git
   git push -u origin main
   ```

3. Nel repository vai su **Settings → Pages**, alla voce *Source* scegli
   **Deploy from a branch**, ramo `main`, cartella `/ (root)`, e salva.
4. Dopo un minuto il gioco è online su `https://TUO-NOME.github.io/dattilo-duello/`.

Alternative altrettanto gratuite, se preferisci il trascinamento della cartella:
[Netlify Drop](https://app.netlify.com/drop), [Cloudflare Pages](https://pages.cloudflare.com/),
[Vercel](https://vercel.com/).

> **Serve HTTPS.** WebRTC non funziona su `http://`. Tutti i servizi qui sopra
> danno HTTPS automaticamente, quindi va bene così; aprire `index.html` con un doppio
> clic dal disco invece non basta per giocare in due.

### Una nota onesta sui limiti

Il collegamento iniziale passa dal **broker pubblico e gratuito di PeerJS**, che non
garantisce nulla in termini di continuità di servizio: se un giorno dovesse rallentare
o chiudere, la creazione delle stanze smetterebbe di funzionare. Per un uso tra amici
va benissimo. Se il gioco dovesse piacere davvero, la soluzione è ospitare il proprio
broker (`peerjs-server`, poche righe di Node) e indicarlo in `js/rete.js`.

Inoltre, in reti molto chiuse (alcune aziendali o universitarie) la connessione diretta
WebRTC può essere bloccata dal firewall: in quel caso il gioco mostra un errore di
connessione ed è necessario passare da un'altra rete.

## Licenza

MIT — fanne quello che vuoi.
