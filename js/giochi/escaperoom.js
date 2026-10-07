/* 🗝️ Escape Room: Fuga a Ruoli Asimmetrici (Guide 👁️ vs Operatori 🛠️)
   Esclusivamente MULTIPLAYER (da 2 a 6 giocatori, 3 contro 3 o a coppie).
   7 Stanze Tematiche:
     1. Laboratorio Cyberpunk (Codici e Frequenze Terminale)
     2. Tempio Ancestrale (Glifi e Simboli Sacri)
     3. Bunker Blindato (Disinnesco Cavi Portellone)
     4. Laboratorio Alchemico (Pozioni ed Elisir Segreti)
     5. Celle Sotterranee (Mazzo di Chiavi Antiche)
     6. Airlock Spaziale (Coordinate di Decompressione)
     7. Cripta del Tesoro (Gemme e Sigillo del Portale Finale)
*/

const STANZE_ESCAPE = [
  {
    id: 1,
    nome: "Stanza 1: Laboratorio Cyberpunk",
    icona: "🧪",
    tema: "cyber",
    coloreTema: "#00f0ff",
    descGuida: "Terminale di Sicurezza Neuro-Tech",
    indovinelli: [
      {
        titolo: "Protocollo Quantum Core",
        indizioGuida: "Sul monitor centrale lampeggia l'allarme: <b>OVERRIDE FREQUENZA</b>.<br>Tre codici luminosi visibili tra i server:<br><span style='color:#00f0ff; font-size:1.3rem; letter-spacing:3px;'>[AZZURRO: 7]</span> → <span style='color:#a855f7; font-size:1.3rem; letter-spacing:3px;'>[VIOLA: 3]</span> → <span style='color:#eab308; font-size:1.3rem; letter-spacing:3px;'>[ORO: 9]</span>.<br>Comunica all'Operatore la sequenza: <b>7 - 3 - 9</b>!",
        soluzione: "739",
        tipoInput: "codice",
        opzioni: ["7", "3", "9", "4", "1", "6"]
      },
      {
        titolo: "Bypass Matrix AI",
        indizioGuida: "L'ologramma della stanza mostra 3 celle di memoria attive:<br><i>'Il cubo Rosso vale 5, il Prisma Verde vale 2, la Sfera Blu vale 8.'</i><br>Comunica all'Operatore di inserire la sequenza: <b>5 - 2 - 8</b>!",
        soluzione: "528",
        tipoInput: "codice",
        opzioni: ["5", "2", "8", "9", "0", "3"]
      }
    ]
  },
  {
    id: 2,
    nome: "Stanza 2: Tempio Ancestrale",
    icona: "🗿",
    tema: "tempio",
    coloreTema: "#f59e0b",
    descGuida: "Stele degli Antichi Custodi",
    indovinelli: [
      {
        titolo: "Il Risveglio degli Elementi",
        indizioGuida: "La stele di pietra riporta un'antica iscrizione sacra:<br><i>'Prima si alza il <b>Sole ☀️</b> all'orizzonte, poi il <b>Falco 🦅</b> spicca il volo, infine le <b>Onde 🌊</b> bagnano la riva.'</i><br>Dì all'Operatore di toccare i 3 glifi nell'ordine esatto: <b>Sole ☀️ → Falco 🦅 → Onde 🌊</b>!",
        soluzione: ["☀️", "🦅", "🌊"],
        tipoInput: "glifi",
        glifiDisponibili: ["☀️", "🦅", "🌊", "🐍", "🌙", "🔥"]
      },
      {
        titolo: "Il Rito del Fuoco Notturno",
        indizioGuida: "I bassorilievi scolpiti nella roccia mostrano il ciclo della notte:<br><i>'La <b>Luna 🌙</b> illumina il cammino, il <b>Serpente 🐍</b> striscia tra le ombre e accende il <b>Fuoco Sacro 🔥</b>.'</i><br>Comunica all'Operatore: <b>Luna 🌙 → Serpente 🐍 → Fuoco 🔥</b>!",
        soluzione: ["🌙", "🐍", "🔥"],
        tipoInput: "glifi",
        glifiDisponibili: ["🌙", "🐍", "🔥", "☀️", "🦅", "⚡"]
      }
    ]
  },
  {
    id: 3,
    nome: "Stanza 3: Bunker Blindato",
    icona: "🚨",
    tema: "bunker",
    coloreTema: "#ef4444",
    descGuida: "Quadro Comandi Sblocco Portellone",
    indovinelli: [
      {
        titolo: "Procedura Defuse Cavi",
        indizioGuida: "Sul manuale di emergenza del bunker è scritto chiaramente:<br><i>'In allarme Reattore, disinnescare prima il cavo <b>BLU 🔵</b>, poi il cavo <b>GIALLO 🟡</b> e infine il cavo <b>ROSSO 🔴</b> (non toccare il Verde 🟢)!'</i><br>Istruisci l'Operatore sui cavi da tagliare nell'ordine esatto!",
        soluzione: ["blu", "giallo", "rosso"],
        tipoInput: "cavi",
        cavi: [
          { id: "rosso", nome: "Cavo Rosso 🔴", colore: "#ef4444" },
          { id: "blu", nome: "Cavo Blu 🔵", colore: "#3b82f6" },
          { id: "verde", nome: "Cavo Verde 🟢", colore: "#10b981" },
          { id: "giallo", nome: "Cavo Giallo 🟡", colore: "#eab308" }
        ]
      },
      {
        titolo: "Sequenza Valvole di Pressione",
        indizioGuida: "Il manometro del portellone principale indica:<br><i>'Per aprire il portellone pesante: taglia prima il cavo <b>VERDE 🟢</b>, poi il cavo <b>ROSSO 🔴</b> e per ultimo il cavo <b>BLU 🔵</b>!'</i><br>Comunica la sequenza precisa per proseguire!",
        soluzione: ["verde", "rosso", "blu"],
        tipoInput: "cavi",
        cavi: [
          { id: "rosso", nome: "Cavo Rosso 🔴", colore: "#ef4444" },
          { id: "blu", nome: "Cavo Blu 🔵", colore: "#3b82f6" },
          { id: "verde", nome: "Cavo Verde 🟢", colore: "#10b981" },
          { id: "giallo", nome: "Cavo Giallo 🟡", colore: "#eab308" }
        ]
      }
    ]
  },
  {
    id: 4,
    nome: "Stanza 4: Laboratorio Alchemico",
    icona: "⚗️",
    tema: "alchimia",
    coloreTema: "#a855f7",
    descGuida: "Grimorio delle Misture Segrete",
    indovinelli: [
      {
        titolo: "La Formula della Trasmutazione",
        indizioGuida: "Sul tomo degli alchimisti è annotata la formula della pozione:<br><i>'Versa nel calderone prima l'<b>Elisir Viola 🟣</b>, poi l'<b>Essenza Verde 🟢</b> e infine la <b>Polvere Rossa 🔴</b> (lascia intatta la Lacrima Blu 🔵)!'</i><br>Comunica all'Operatore le pozioni da selezionare!",
        soluzione: ["viola", "verde", "rossa"],
        tipoInput: "cavi",
        cavi: [
          { id: "viola", nome: "Elisir Viola 🟣", colore: "#a855f7" },
          { id: "verde", nome: "Essenza Verde 🟢", colore: "#10b981" },
          { id: "rossa", nome: "Polvere Rossa 🔴", colore: "#ef4444" },
          { id: "blu", nome: "Lacrima Blu 🔵", colore: "#3b82f6" }
        ]
      },
      {
        titolo: "Il Filtro della Fuga",
        indizioGuida: "La pergamena antica rivela la ricetta per sciogliere la serratura:<br><i>'Mescola con cura: <b>Lacrima Blu 🔵</b> → <b>Polvere Rossa 🔴</b> → <b>Elisir Viola 🟣</b>!'</i><br>Dì all'Operatore l'ordine corretto delle ampolle!",
        soluzione: ["blu", "rossa", "viola"],
        tipoInput: "cavi",
        cavi: [
          { id: "blu", nome: "Lacrima Blu 🔵", colore: "#3b82f6" },
          { id: "rossa", nome: "Polvere Rossa 🔴", colore: "#ef4444" },
          { id: "viola", nome: "Elisir Viola 🟣", colore: "#a855f7" },
          { id: "verde", nome: "Essenza Verde 🟢", colore: "#10b981" }
        ]
      }
    ]
  },
  {
    id: 5,
    nome: "Stanza 5: Celle Sotterranee",
    icona: "⛓️",
    tema: "prigione",
    coloreTema: "#94a3b8",
    descGuida: "Mazzo di Chiavi della Prigione",
    indovinelli: [
      {
        titolo: "Il Mazzo del Carceriere",
        indizioGuida: "Sulla parete umida della cella il prigioniero ha tracciato i simboli di fuga:<br><i>'Il lucchetto di ferro scatta con la <b>Chiave Teschio 💀</b>, poi la <b>Chiave Leone 🦁</b> e infine la <b>Chiave Serpente 🐍</b>!'</i><br>Comunica all'Operatore la combinazione delle 3 chiavi!",
        soluzione: ["💀", "🦁", "🐍"],
        tipoInput: "glifi",
        glifiDisponibili: ["💀", "🦁", "🐍", "👑", "🗡️", "🗝️"]
      },
      {
        titolo: "Il Grimaldello della Libertà",
        indizioGuida: "Sotto la branda di ferro si legge un messaggio segreto:<br><i>'Inserisci nelle serrature le chiavi: <b>Corona 👑</b> → <b>Spada 🗡️</b> → <b>Chiave d'Oro 🗝️</b>!'</i><br>Comunica all'Operatore le chiavi giuste!",
        soluzione: ["👑", "🗡️", "🗝️"],
        tipoInput: "glifi",
        glifiDisponibili: ["👑", "🗡️", "🗝️", "💀", "🦁", "🛡️"]
      }
    ]
  },
  {
    id: 6,
    nome: "Stanza 6: Airlock Spaziale",
    icona: "🛸",
    tema: "spazio",
    coloreTema: "#38bdf8",
    descGuida: "Computer di Rotta e Decompressione",
    indovinelli: [
      {
        titolo: "Allineamento Propulsori",
        indizioGuida: "Il computer di bordo richiede le coordinate di navigazione d'emergenza:<br>Tre frequenze di assetto stellare:<br><span style='color:#38bdf8; font-size:1.3rem; letter-spacing:3px;'>[ALPHA: 4]</span> → <span style='color:#f59e0b; font-size:1.3rem; letter-spacing:3px;'>[BETA: 8]</span> → <span style='color:#10b981; font-size:1.3rem; letter-spacing:3px;'>[GAMMA: 1]</span>.<br>Comunica all'Operatore il codice di rientro: <b>4 - 8 - 1</b>!",
        soluzione: "481",
        tipoInput: "codice",
        opzioni: ["4", "8", "1", "9", "6", "2"]
      },
      {
        titolo: "Decompressione Stagna",
        indizioGuida: "Il pannello di pressurizzazione della camera d'aria segnala:<br><i>'Codice di sicurezza portellone: inserire <b>9 - 2 - 6</b> prima che si esaurisca l'ossigeno!'</i><br>Detta all'Operatore il codice di apertura!",
        soluzione: "926",
        tipoInput: "codice",
        opzioni: ["9", "2", "6", "4", "7", "0"]
      }
    ]
  },
  {
    id: 7,
    nome: "Stanza 7: Cripta del Tesoro",
    icona: "💎",
    tema: "tesoro",
    coloreTema: "#10b981",
    descGuida: "Grande Portale d'Uscita Monumentale",
    indovinelli: [
      {
        titolo: "Il Prisma delle Tre Gemme",
        indizioGuida: "La monumentale porta finale è serrata da tre cavità mistiche:<br><i>'Posiziona sui piedistalli: il <b>Rubino 💎</b>, lo <b>Smeraldo 🟢</b> e lo <b>Zaffiro 🔷</b>!'</i><br>Comunica all'Operatore la combinazione per aprire l'uscita definitiva!",
        soluzione: ["💎", "🟢", "🔷"],
        tipoInput: "glifi",
        glifiDisponibili: ["💎", "🟢", "🔷", "🟡", "🟣", "⚪"]
      },
      {
        titolo: "Il Cuore della Cripta",
        indizioGuida: "L'epigrafe dorata sull'arco del portale indica il sigillo finale:<br><i>'Solo l'armonia di <b>Topazio Giallo 🟡</b>, <b>Ametista Viola 🟣</b> e <b>Diamante Puro ⚪</b> spalancherà la fuga!'</i><br>Comunica all'Operatore le ultime tre gemme!",
        soluzione: ["🟡", "🟣", "⚪"],
        tipoInput: "glifi",
        glifiDisponibili: ["🟡", "🟣", "⚪", "💎", "🟢", "🔷"]
      }
    ]
  }
];

GIOCHI.push({
  id: "escaperoom",
  nome: "Escape Room",
  icona: "🗝️",
  desc: "Gioco asimmetrico a squadre (2-6 giocatori): le Guide vedono gli indizi, gli Operatori inseriscono i comandi per fuggire da 7 stanze!",
  regole: [
    "👥 <b>Solo con Giocatori (2-6)</b>: una metà dei giocatori è <b>GUIDA 👁️</b> (vede la stanza), l'altra metà è <b>OPERATORE 🛠️</b> (ha i comandi).",
    "🗣️ <b>Comunicate a voce</b>: la Guida deve descrivere gli indovinelli per far premere i tasti giusti all'Operatore!",
    "🚪 <b>7 Stanze Tematiche</b>: Laboratorio, Tempio, Bunker, Alchimia, Prigione, Spazio e Cripta del Tesoro.",
    "🏆 Risolvete tutti e 7 gli enigmi prima dello scadere del tempo per vincere <b>500 punti</b>!"
  ],
  gara: false,
  solo: false, // Disabilitato in Solo col Fantasma: richiede veri giocatori cooperativi
  minGiocatori: 2,
  maxGiocatori: 6,
  durata: 150, // 2 minuti e mezzo per completare tutte le 7 stanze

  generaPartita() {
    // Seleziona una variante casuale per ciascuna delle 7 stanze
    const configStanze = STANZE_ESCAPE.map(s => {
      const idx = Math.floor(Math.random() * s.indovinelli.length);
      return {
        stanzaId: s.id,
        enigmaIdx: idx
      };
    });
    return [{ configStanze }];
  },

  crea(api) {
    const giocatori = api.giocatori.filter(g => g.online);
    const mioId = api.io;
    const mioIdx = Math.max(0, giocatori.findIndex(g => g.id === mioId));
    
    // Assegnazione ruoli asimmetrici: indici pari = Guida 👁️, indici dispari = Operatore 🛠️
    const sonoGuida = (mioIdx % 2 === 0);
    const mioRuoloNome = sonoGuida ? "GUIDA 👁️ (Osservatore)" : "OPERATORE 🛠️ (Decifratore)";
    
    const configStanze = (api.dati && api.dati.configStanze) || STANZE_ESCAPE.map(s => ({
      stanzaId: s.id,
      enigmaIdx: 0
    }));

    const totaleStanze = configStanze.length;
    let stanzaAttualeIdx = 0;
    let inputCorrente = [];
    let concluso = false;

    // Genera gli indicatori della barra dei progressi per le 7 stanze
    const stepBarsHtml = configStanze.map((_, i) => `
      <div id="step-${i + 1}" style="flex:1; height: 6px; border-radius: 4px; background: ${i === 0 ? '#00f0ff' : 'rgba(255,255,255,0.15)'}; transition: all 0.3s;"></div>
    `).join("");

    // Costruzione UI Arena
    api.arena.innerHTML = `
      <div class="escape-arena" style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 620px; margin: 0 auto; user-select: none;">
        <!-- Header Info e Ruolo -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(15, 23, 42, 0.75); border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="esc-stanza-badge" style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">Stanza 1/${totaleStanze}</span>
            <span id="esc-titolo-stanza" style="font-weight: bold; font-size: 0.95rem; color: #f8fafc;">Laboratorio</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: bold; color: ${sonoGuida ? '#38bdf8' : '#eab308'}; border: 1px solid ${sonoGuida ? '#0284c7' : '#ca8a04'}; padding: 2px 8px; border-radius: 6px;">
            ${mioRuoloNome}
          </div>
        </div>

        <!-- Progress Stanze (7 step) -->
        <div style="display: flex; gap: 5px; margin-bottom: 8px;">
          ${stepBarsHtml}
        </div>

        <!-- Schermo Principale Asimmetrico (Guida vs Operatore) -->
        <div id="esc-main-card" style="flex: 1; display: flex; flex-direction: column; background: rgba(10, 15, 29, 0.75); border: 2px solid #00f0ff; border-radius: 16px; padding: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow-y: auto; justify-content: space-between;">
          <!-- Contenuto dinamico della stanza -->
          <div id="esc-vista-area" style="width: 100%;"></div>

          <!-- Feed Feedback / Radio -->
          <div id="esc-radio-banner" style="margin-top: 10px; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 10px; font-size: 0.88rem; text-align: center; border-left: 4px solid #00f0ff;">
            In attesa di comunicazione...
          </div>
        </div>

        <!-- Barra Inferiore Controlli -->
        <div id="esc-bottom-bar" style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
          <div id="esc-partner-hint" style="font-size: 0.82rem; color: #94a3b8;">
            ${sonoGuida ? "👁️ Tu vedi gli indovinelli: detta i codici al compagno Operatore!" : "🛠️ Tu inserisci i comandi: ascolta attentamente la tua Guida!"}
          </div>
          <div style="font-size: 0.78rem; opacity: 0.75; color: #94a3b8;">
            Team Co-op 🤝
          </div>
        </div>
      </div>
    `;

    const elStanzaBadge = api.arena.querySelector("#esc-stanza-badge");
    const elTitoloStanza = api.arena.querySelector("#esc-titolo-stanza");
    const elMainCard = api.arena.querySelector("#esc-main-card");
    const elVistaArea = api.arena.querySelector("#esc-vista-area");
    const elRadioBanner = api.arena.querySelector("#esc-radio-banner");

    // Renderizza la stanza corrente in base al ruolo del giocatore
    function disegnaStanza() {
      if (stanzaAttualeIdx >= totaleStanze) {
        trionfoFuga();
        return;
      }

      inputCorrente = [];
      const stanzaConf = configStanze[stanzaAttualeIdx];
      const stanzaData = STANZE_ESCAPE.find(s => s.id === stanzaConf.stanzaId) || STANZE_ESCAPE[0];
      const enigma = stanzaData.indovinelli[stanzaConf.enigmaIdx] || stanzaData.indovinelli[0];

      // Aggiorna header e colori a tema
      elStanzaBadge.textContent = `Stanza ${stanzaAttualeIdx + 1}/${totaleStanze}`;
      elTitoloStanza.textContent = `${stanzaData.icona} ${stanzaData.nome}`;
      elMainCard.style.borderColor = stanzaData.coloreTema;
      elRadioBanner.style.borderLeftColor = stanzaData.coloreTema;

      // Aggiorna step bar
      for (let i = 1; i <= totaleStanze; i++) {
        const step = api.arena.querySelector(`#step-${i}`);
        if (step) {
          if (i - 1 === stanzaAttualeIdx) step.style.background = stanzaData.coloreTema;
          else if (i - 1 < stanzaAttualeIdx) step.style.background = "#10b981";
          else step.style.background = "rgba(255,255,255,0.15)";
        }
      }

      if (sonoGuida) {
        // VISTA GUIDA 👁️: Mostra la scena e l'indovinello
        elVistaArea.innerHTML = `
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 2.2rem; filter: drop-shadow(0 0 10px ${stanzaData.coloreTema});">${stanzaData.icona}</div>
            <h3 style="margin: 4px 0; color: ${stanzaData.coloreTema}; font-size: 1.15rem;">${enigma.titolo}</h3>
            <span style="font-size: 0.8rem; opacity: 0.75;">${stanzaData.descGuida}</span>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); padding: 14px; border-radius: 12px; border: 1px dashed ${stanzaData.coloreTema}; line-height: 1.55; font-size: 0.95rem; color: #f1f5f9;">
            ${enigma.indizioGuida}
          </div>
          <div style="margin-top: 14px; text-align: center; font-size: 0.85rem; color: #94a3b8;">
            🗣️ <i>Descrivi l'indovinello al tuo Operatore e digli cosa inserire!</i>
          </div>
        `;
        elRadioBanner.innerHTML = `🟢 <b>Collegamento vocale attivo</b> con gli Operatori.`;
      } else {
        // VISTA OPERATORE 🛠️: Mostra la console di controllo per inserire la soluzione
        let controlliHtml = "";

        if (enigma.tipoInput === "codice") {
          controlliHtml = `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 1.8rem;">💻</div>
              <h4 style="margin: 2px 0; color: ${stanzaData.coloreTema};">Terminale di Sblocco</h4>
              <div id="esc-codice-display" style="font-size: 1.8rem; letter-spacing: 6px; font-weight: bold; background: #000; padding: 8px 16px; border-radius: 8px; border: 1px solid ${stanzaData.coloreTema}; margin: 10px auto; width: fit-content; min-width: 140px; color: ${stanzaData.coloreTema};">
                _ _ _
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 280px; margin: 0 auto;">
              ${enigma.opzioni.map(opt => `
                <button class="btn btn-ghost btn-tasto-codice" data-val="${opt}" style="font-size: 1.3rem; padding: 12px; font-weight: bold; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);">
                  ${opt}
                </button>
              `).join("")}
            </div>
            <div style="text-align: center; margin-top: 12px;">
              <button id="btn-canc-codice" class="btn btn-small btn-ghost" style="color: #ef4444; border-color: #ef4444;">⌫ Cancella</button>
            </div>
          `;
        } else if (enigma.tipoInput === "glifi") {
          controlliHtml = `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 1.8rem;">🗿</div>
              <h4 style="margin: 2px 0; color: ${stanzaData.coloreTema};">Selettore Glifi & Simboli</h4>
              <div id="esc-glifi-display" style="font-size: 1.6rem; letter-spacing: 8px; min-height: 42px; background: rgba(0,0,0,0.5); padding: 4px 12px; border-radius: 8px; border: 1px solid ${stanzaData.coloreTema}; margin: 8px auto; width: fit-content;">
                [ ? ? ? ]
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 300px; margin: 0 auto;">
              ${enigma.glifiDisponibili.map(g => `
                <button class="btn btn-ghost btn-glifo" data-val="${g}" style="font-size: 1.9rem; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.25);">
                  ${g}
                </button>
              `).join("")}
            </div>
            <div style="text-align: center; margin-top: 12px;">
              <button id="btn-canc-glifi" class="btn btn-small btn-ghost" style="color: #ef4444; border-color: #ef4444;">⌫ Resetta Simboli</button>
            </div>
          `;
        } else if (enigma.tipoInput === "cavi") {
          controlliHtml = `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 1.8rem;">⚡</div>
              <h4 style="margin: 2px 0; color: ${stanzaData.coloreTema};">Pannello Meccanismi & Circuiti</h4>
              <div id="esc-cavi-display" style="font-size: 0.95rem; font-weight: bold; color: #94a3b8; margin: 6px 0;">
                Tocca gli elementi nell'ordine esatto descritto dalla Guida:
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 0 auto;">
              ${enigma.cavi.map(c => `
                <button class="btn btn-ghost btn-cavo" data-id="${c.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-radius: 10px; border: 2px solid ${c.colore}; font-weight: bold; font-size: 1rem;">
                  <span>${c.nome}</span>
                  <span class="stato-cavo" style="color: #10b981;">ATTIVO ⚡</span>
                </button>
              `).join("")}
            </div>
          `;
        }

        elVistaArea.innerHTML = controlliHtml;

        // Attacca listener comandi Operatore
        agganciaComandiOperatore(enigma);
        elRadioBanner.innerHTML = `⏳ In ascolto della Guida... non inserire a caso!`;
      }
    }

    // Gestione input Operatore
    function agganciaComandiOperatore(enigma) {
      if (enigma.tipoInput === "codice") {
        const display = api.arena.querySelector("#esc-codice-display");
        const btnCanc = api.arena.querySelector("#btn-canc-codice");
        
        api.arena.querySelectorAll(".btn-tasto-codice").forEach(b => {
          b.onclick = () => {
            if (concluso || inputCorrente.length >= 3) return;
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(b.dataset.val);
            display.textContent = inputCorrente.join(" ") + " _".repeat(Math.max(0, 3 - inputCorrente.length));
            
            if (inputCorrente.length === 3) {
              validaSoluzione(inputCorrente.join(""), enigma.soluzione);
            }
          };
        });

        if (btnCanc) {
          btnCanc.onclick = () => {
            inputCorrente = [];
            display.textContent = "_ _ _";
            if (window.Suoni) Suoni.playTick();
          };
        }
      } else if (enigma.tipoInput === "glifi") {
        const display = api.arena.querySelector("#esc-glifi-display");
        const btnCanc = api.arena.querySelector("#btn-canc-glifi");

        api.arena.querySelectorAll(".btn-glifo").forEach(b => {
          b.onclick = () => {
            if (concluso || inputCorrente.length >= 3) return;
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(b.dataset.val);
            display.textContent = inputCorrente.join(" ");

            if (inputCorrente.length === 3) {
              const solGiusta = Array.isArray(enigma.soluzione) ? enigma.soluzione.join("") : enigma.soluzione;
              validaSoluzione(inputCorrente.join(""), solGiusta);
            }
          };
        });

        if (btnCanc) {
          btnCanc.onclick = () => {
            inputCorrente = [];
            display.textContent = "[ ? ? ? ]";
            if (window.Suoni) Suoni.playTick();
          };
        }
      } else if (enigma.tipoInput === "cavi") {
        api.arena.querySelectorAll(".btn-cavo").forEach(b => {
          b.onclick = () => {
            if (concluso || b.disabled) return;
            const cavoId = b.dataset.id;
            b.disabled = true;
            b.style.opacity = "0.4";
            b.querySelector(".stato-cavo").textContent = "DISATTIVATO ✂️";
            b.querySelector(".stato-cavo").style.color = "#ef4444";
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(cavoId);

            if (inputCorrente.length === enigma.soluzione.length) {
              validaSoluzione(inputCorrente.join(","), enigma.soluzione.join(","));
            }
          };
        });
      }
    }

    // Verifica soluzione e sincronizza su rete
    function validaSoluzione(dataUtente, dataSoluzione) {
      if (concluso) return;

      if (dataUtente === dataSoluzione) {
        // Enigma corretto!
        if (window.Suoni) Suoni.playDing();
        if (window.Vibrazione) Vibrazione.successo();
        elRadioBanner.innerHTML = `✅ <b>STANZA SUPERATA!</b> Meccanismo sbloccato!`;
        elRadioBanner.style.background = "rgba(16, 185, 129, 0.25)";

        // Comunica a tutti i giocatori del team
        api.invia({ tipo: "stanzaSuperata", stanzaIdx: stanzaAttualeIdx });

        setTimeout(() => {
          stanzaAttualeIdx++;
          elRadioBanner.style.background = "rgba(255,255,255,0.05)";
          disegnaStanza();
        }, 1200);
      } else {
        // Errore
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
        if (window.Vibrazione) Vibrazione.errore();
        elRadioBanner.innerHTML = `❌ <b>ERRORE COMBINAZIONE!</b> Riprova con la Guida!`;
        elRadioBanner.style.background = "rgba(239, 68, 68, 0.25)";

        setTimeout(() => {
          inputCorrente = [];
          elRadioBanner.style.background = "rgba(255,255,255,0.05)";
          disegnaStanza();
        }, 1000);
      }
    }

    // Fuga riuscita: vittoria squadra per tutte le 7 stanze
    function trionfoFuga() {
      if (concluso) return;
      concluso = true;

      elRadioBanner.innerHTML = `🎉 <b>FUGA TOTALE RIUSCITA! TUTTE LE 7 STANZE SUPERATE!</b>`;
      elVistaArea.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 3.8rem; filter: drop-shadow(0 0 16px #10b981);">🏆</div>
          <h2 style="color: #10b981; margin: 10px 0;">EVASI DALL'ESCAPE ROOM!</h2>
          <p style="color: #94a3b8; font-size: 0.95rem;">Tutte e 7 le stanze completate in perfetto gioco di squadra!</p>
        </div>
      `;

      if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
      if (window.Vibrazione) Vibrazione.successo();

      setTimeout(() => {
        api.finito({
          punti: 500,
          dettaglio: "7/7 Stanze superate! 🗝️"
        });
      }, 2000);
    }

    // Inizializza prima stanza
    disegnaStanza();

    return {
      messaggio(m, da) {
        if (!m || concluso) return;
        if (m.tipo === "stanzaSuperata") {
          // Un altro compagno operatore ha sbloccato la stanza
          stanzaAttualeIdx = m.stanzaIdx + 1;
          if (window.Suoni) Suoni.playDing();
          elRadioBanner.innerHTML = `✅ Stanza superata dal team! Avanzamento...`;
          setTimeout(() => {
            disegnaStanza();
          }, 1000);
        }
      },
      scaduto() {
        if (concluso) return;
        concluso = true;
        api.finito({
          punti: Math.round((stanzaAttualeIdx / totaleStanze) * 400),
          dettaglio: `Tempo scaduto (${stanzaAttualeIdx}/${totaleStanze} stanze)`
        });
      },
      chiudi() {
        concluso = true;
      }
    };
  }
});
