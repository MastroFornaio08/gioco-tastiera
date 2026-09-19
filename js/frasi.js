/* Frasi in italiano per la gara. Lunghezza crescente per difficoltà. */
const FRASI = {
  // ~40-60 caratteri
  corte: [
    "Il gatto dorme sul davanzale della finestra.",
    "Domani mattina partiamo presto per il mare.",
    "Ho comprato il pane fresco dal fornaio.",
    "La pioggia batte forte sui tetti del paese.",
    "Chi va piano va sano e va lontano davvero.",
    "Un caffè macchiato e due cornetti caldi.",
    "Le stelle brillano sopra il vecchio faro.",
    "Mia nonna prepara la torta ogni domenica.",
    "Il treno delle sette è già in ritardo.",
    "Camminavamo lungo il fiume senza parlare.",
    "Accendi la luce che non vedo più niente.",
    "Quel libro mi è piaciuto tantissimo.",
    "La nebbia copre le colline di novembre.",
    "Suona la campana della chiesa di piazza.",
    "Ho perso le chiavi dentro la borsa nera."
  ],
  // ~70-100 caratteri
  medie: [
    "La bicicletta arrugginita era appoggiata al muro giallo del cortile interno.",
    "Ogni estate tornavamo in quel paesino tra le montagne per due settimane.",
    "Il professore spiegava la lezione mentre fuori continuava a nevicare piano.",
    "Nel cassetto della scrivania ho trovato una lettera scritta trent'anni fa.",
    "Il profumo del sugo si sentiva già dalle scale del vecchio palazzo.",
    "Avevamo deciso di partire all'alba, ma nessuno riuscì a svegliarsi in tempo.",
    "Le onde si infrangevano sugli scogli con un rumore sordo e costante.",
    "Quando il semaforo diventò verde, la città intera sembrò muoversi insieme.",
    "Scrivere velocemente richiede precisione, non soltanto dita rapide sui tasti.",
    "La libreria all'angolo vendeva romanzi usati a un euro ciascuno.",
    "Sul tavolo c'erano tre bicchieri, una caraffa d'acqua e un piatto vuoto.",
    "Mio fratello ripete sempre le stesse storie durante le cene di famiglia.",
    "Il vento del nord piegava i cipressi lungo la strada bianca e polverosa.",
    "Nessuno sapeva spiegare perché quell'orologio segnasse sempre le quattro.",
    "Guardava fuori dal finestrino contando i pali della luce uno dopo l'altro."
  ],
  // ~110-150 caratteri
  lunghe: [
    "Quella mattina di ottobre il mercato era pieno di gente, e il vociare dei venditori si mescolava all'odore del pesce appena pescato.",
    "Se qualcuno mi avesse detto che un giorno avrei vissuto in una città senza mare, probabilmente non gli avrei creduto nemmeno per un istante.",
    "La ricetta è semplice: farina, acqua, lievito e pazienza; il resto lo fa il tempo, che lavora molto meglio delle nostre mani frettolose.",
    "Ogni volta che il treno entrava in galleria, il riflesso del suo viso appariva sul vetro, sovrapposto al buio che correva all'indietro.",
    "Il vecchio custode conosceva ogni scricchiolio del pavimento e sapeva riconoscere, solo dal rumore dei passi, chi stesse salendo le scale.",
    "Imparare a scrivere alla tastiera senza guardare i tasti è come imparare a nuotare: all'inizio sembra impossibile, poi diventa naturale.",
    "Nel silenzio della biblioteca si sentiva soltanto il fruscio delle pagine e, ogni tanto, il ticchettio insistente di qualche tastiera lontana.",
    "Camminammo per ore tra i vicoli stretti del centro storico, fermandoci davanti a ogni portone dipinto e a ogni finestra piena di gerani.",
    "La verità è che nessuno di noi ricordava con esattezza come fosse iniziata quella discussione, eppure continuavamo a litigare con convinzione.",
    "Con la punta delle dita sfiorò la superficie dell'acqua e i cerchi si allargarono lentamente fino a toccare le radici degli alberi sommersi."
  ]
};

/* Ogni round pesca da una fascia diversa: la difficoltà cresce. */
const FASCE_ROUND = ["corte", "corte", "medie", "medie", "lunghe"];

/* Regole speciali. Il round 1 è sempre "normale". */
const MODIFICATORI = [
  {
    id: "normale",
    nome: "Round normale",
    icona: "⌨️",
    desc: "Nessuna regola speciale. Scrivi e basta.",
    mult: 1
  },
  {
    id: "precisione",
    nome: "Niente cancella",
    icona: "🔒",
    desc: "Il tasto backspace è disattivato: sbagli, resta.",
    mult: 1.3
  },
  {
    id: "nebbia",
    nome: "Nebbia",
    icona: "🌫️",
    desc: "La frase sfuma man mano. Memorizza in fretta.",
    mult: 1.4
  },
  {
    id: "turbo",
    nome: "Turbo",
    icona: "⚡",
    desc: "Punti raddoppiati. Round decisivo.",
    mult: 2
  },
  {
    id: "maiuscole",
    nome: "Tutto maiuscolo",
    icona: "🔠",
    desc: "La frase va scritta TUTTA IN MAIUSCOLO.",
    mult: 1.3
  },
  {
    id: "invisibile",
    nome: "Alla cieca",
    icona: "🙈",
    desc: "Non vedi quello che scrivi, solo quanto avanzi.",
    mult: 1.6
  }
];

function modificatore(id) {
  return MODIFICATORI.find(m => m.id === id) || MODIFICATORI[0];
}
