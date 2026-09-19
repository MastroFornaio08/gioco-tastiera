/* Parole italiane comuni, divise per lunghezza. Usate dagli anagrammi.
   Niente accenti e niente lettere doppie ravvicinate difficili da leggere
   quando le lettere vengono mescolate. */

const PAROLE = {
  corte: [
    "casa", "mare", "sole", "luna", "pane", "gatto", "cane", "libro", "porta", "sedia",
    "tempo", "mano", "piede", "occhio", "fiore", "albero", "acqua", "fuoco", "vento", "neve",
    "strada", "citta", "campo", "monte", "fiume", "lago", "isola", "ponte", "treno", "nave"
  ],
  medie: [
    "finestra", "bicchiere", "telefono", "giornale", "montagna", "bambino", "cucina", "giardino",
    "orologio", "quaderno", "castello", "coperta", "formaggio", "chitarra", "bottiglia", "pantaloni",
    "cappello", "scrivania", "armadio", "lampada", "cuscino", "specchio", "tastiera", "schermo",
    "pentola", "forchetta", "coltello", "tovaglia", "sciarpa", "ombrello"
  ],
  lunghe: [
    "biblioteca", "televisione", "frigorifero", "aspirapolvere", "ristorante", "supermercato",
    "passeggiata", "avventura", "dizionario", "calendario", "temperatura", "primavera",
    "pomeriggio", "settimana", "compleanno", "fotografia", "bicicletta", "automobile",
    "aeroporto", "ospedale", "farmacia", "pasticceria", "cioccolato", "spaghetti",
    "parmigiano", "melanzana", "prezzemolo", "rosmarino", "girasole", "temporale"
  ]
};

/* Mescola le lettere di una parola assicurandosi che il risultato sia diverso
   dall'originale (altrimenti l'anagramma sarebbe già risolto). */
function mescolaLettere(parola) {
  const lettere = parola.split("");
  let tentativi = 0;
  let mescolata;
  do {
    for (let i = lettere.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lettere[i], lettere[j]] = [lettere[j], lettere[i]];
    }
    mescolata = lettere.join("");
  } while (mescolata === parola && ++tentativi < 20);
  return mescolata;
}
