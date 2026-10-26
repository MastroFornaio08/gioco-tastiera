# Zaltergames Design System 2.0

## Direzione

Console premium minimal per giocatori 18–25. L’interfaccia deve sembrare un prodotto di gioco curato, non una collezione di effetti “gaming”.

Principi:

1. **Il gioco prima della decorazione.** La gerarchia guida subito a Crea stanza, Entra o Allenamento.
2. **Una sola voce forte.** L’accento pervinca identifica selezione e azione primaria; non tutti gli elementi competono.
3. **Profondità fisica, non neon.** Superfici grafite, bordi sottili e ombre ampie sostituiscono glow e vetro.
4. **Mobile tattile, desktop composto.** Target minimo 44 px, ma densità e allineamento restano da gioco PC.
5. **Motion funzionale.** 180–340 ms, easing morbido; nessuna animazione infinita nel menu.

## Token principali

| Ruolo | Token | Valore dark |
|---|---|---|
| Canvas | `--zg-canvas` | `#090b10` |
| Pannello | `--zg-panel` | `#121620` |
| Elevato | `--zg-panel-raised` | `#181d29` |
| Testo | `--zg-text` | `#f4f6f8` |
| Secondario | `--zg-text-2` | `#b2bac7` |
| Accento | `--zg-accent` | `#8b9cff` |
| Successo | `--zg-positive` | `#49d6ad` |
| Attenzione | `--zg-warning` | `#f4c95d` |
| Errore | `--zg-danger` | `#ff6f7d` |

Gli stati semantici non vanno usati come decorazione.

## Tipografia

- Titoli e numeri competitivi: **Space Grotesk**, 600–700.
- Testo, controlli e descrizioni: **Manrope**, 500–800.
- Titoli in sentence case; maiuscolo riservato a kicker, categorie brevi e codici stanza.
- Niente corsivo futuristico o ombre luminose sul testo.

## Geometria

- Controlli: 12 px.
- Card: 18 px.
- Pannelli principali: 26 px.
- Bordi: 1 px; 2 px solo per focus accessibile.
- Target interattivo minimo: 44 × 44 px.

## Componenti

### Azione primaria
Una per schermata, fondo accento pieno e testo scuro. Non usare gradienti.

### Azione secondaria
Superficie elevata con bordo sottile. Hover: sollevamento di 2 px.

### Ghost
Per navigazione indietro e funzioni di servizio. Non deve competere con l’azione primaria.

### Card gioco
Titolo, metadato breve e stato. Selezione con bordo accento e tinta al 12%, non con glow.

### Filtri
Segmenti compatti rettangolari. Lo stato attivo usa testo scuro su bianco.

### Feedback
Successo, avviso ed errore usano i colori semantici e sempre un testo esplicito; mai il solo colore.

## Layout

- Menu desktop: massimo 720 px.
- Schermate dense: fino a 1040 px tramite `#app.is-wide`.
- Mobile sotto 620 px: azioni in colonna e pannello quasi full-screen.
- Lista giochi: due colonne; una sotto 380 px.

## Motion

- Hover e press: 180 ms.
- Entrata schermata: 340 ms.
- Nessun rimbalzo elastico.
- `prefers-reduced-motion` è rispettato.

## Regole anti-“AI look”

- Niente gradienti arcobaleno.
- Niente tre colori neon nella stessa vista.
- Niente emoji come etichette principali.
- Niente glassmorphism su ogni componente.
- Niente testo promozionale finto o badge senza funzione.
- Niente controlli di debug nel menu dei giocatori.

I controlli tecnici restano nel DOM ma sono nascosti. Per mostrarli durante lo sviluppo, aggiungere la classe `dev-mode` al `body`.
