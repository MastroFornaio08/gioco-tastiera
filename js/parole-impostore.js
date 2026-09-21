/* Parole per l'Impostore, raggruppate per categoria.

   La categoria è pubblica: la vedono tutti, impostore compreso. È quello che
   gli permette di bluffare in modo plausibile invece di tacere. Le parole
   dentro una categoria sono vicine fra loro ma non identiche, così un indizio
   generico ("si mangia") non basta a smascherare nessuno, e uno troppo preciso
   tradisce subito chi conosce la parola. */

const CATEGORIE_IMPOSTORE = [
  { nome: "Cibo",        parole: ["pizza", "lasagne", "risotto", "tiramisù", "focaccia", "gelato", "carbonara", "cornetto", "panettone", "arancino"] },
  { nome: "Animali",     parole: ["elefante", "pinguino", "delfino", "scoiattolo", "coccodrillo", "farfalla", "riccio", "gufo", "canguro", "tartaruga"] },
  { nome: "Luoghi",      parole: ["spiaggia", "biblioteca", "aeroporto", "montagna", "supermercato", "ospedale", "stadio", "cimitero", "mercato", "faro"] },
  { nome: "Oggetti",     parole: ["ombrello", "spazzolino", "chitarra", "forbici", "candela", "valigia", "occhiali", "martello", "orologio", "tappeto"] },
  { nome: "Mestieri",    parole: ["idraulico", "astronauta", "giardiniere", "pompiere", "bagnino", "fornaio", "elettricista", "veterinario", "postino", "sarto"] },
  { nome: "Sport",       parole: ["nuoto", "scherma", "pallavolo", "sci", "ciclismo", "boxe", "surf", "maratona", "tuffi", "arrampicata"] },
  { nome: "Trasporti",   parole: ["traghetto", "monopattino", "elicottero", "funivia", "sottomarino", "tram", "mongolfiera", "slitta", "camion", "metropolitana"] },
  { nome: "In casa",     parole: ["lavatrice", "frigorifero", "materasso", "balcone", "caminetto", "cantina", "doccia", "scala", "tenda", "sgabello"] },
  { nome: "Natura",      parole: ["temporale", "vulcano", "deserto", "cascata", "nebbia", "arcobaleno", "ghiacciaio", "grotta", "palude", "valanga"] },
  { nome: "Feste",       parole: ["carnevale", "matrimonio", "capodanno", "compleanno", "laurea", "battesimo", "ferragosto", "halloween", "sagra", "pasqua"] }
];
