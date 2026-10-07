/* 🗝️ Escape Room: Fuga a Ruoli Asimmetrici (Guide 👁️ vs Operatori 🛠️)
   Supporta fino a 6 giocatori divisi a metà, e giocabile anche in Solo con il Fantasma radioamatore!
   3 Stanze:
     1. Laboratorio Cyberpunk (Codici e Frequenze Terminale)
     2. Tempio Ancestrale (Glifi e Indovinelli Sacri)
     3. Bunker Nucleare (Cavi e Sblocco Portellone Blindato)
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
        indizioGuida: "Sul monitor centrale lampeggia l'errore: <b>OVERRIDE FREQUENZA</b>.<br>Tre codici luminosi visibili tra i server:<br><span style='color:#00f0ff; font-size:1.3rem; letter-spacing:3px;'>[AZZURRO: 7]</span> → <span style='color:#a855f7; font-size:1.3rem; letter-spacing:3px;'>[VIOLA: 3]</span> → <span style='color:#eab308; font-size:1.3rem; letter-spacing:3px;'>[ORO: 9]</span>.<br>Comunica all'Operatore la sequenza numerica esatta!",
        soluzione: "739",
        tipoInput: "codice",
        opzioni: ["7", "3", "9", "4", "1", "6"]
      },
      {
        titolo: "Bypass Matrix AI",
        indizioGuida: "L'ologramma della stanza mostra 3 celle di memoria attive:<br><i>'Il cubo Rosso vale 5, il Prisma Verde vale 2, la Sfera Blu vale 8.'</i><br>Comunica all'Operatore di inserire la somma o la sequenza: <b>5 - 2 - 8</b>!",
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
        indizioGuida: "La stele di pietra riporta un'antica iscrizione sacra:<br><i>'Prima si alza il <b>Sole ☀️</b> all'orizzonte, poi il <b>Falco 🦅</b> spicca il volo, infine le <b>Onde 🌊</b> bagnano la riva.'</i><br>Dì all'Operatore di toccare i 3 glifi nell'ordine esatto!",
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
        indizioGuida: "Sul manuale di emergenza del bunker è scritto chiaramente:<br><i>'In allarme Reattore, disinnescare prima il cavo <b>BLU 🔵</b>, poi il cavo <b>GIALLO 🟡</b> e infine il cavo <b>ROSSO 🔴</b> (lasciare intatto il cavo Verde 🟢)!'</i><br>Istruisci l'Operatore su quali cavi tagliare nell'ordine!",
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
        indizioGuida: "Il manometro del portellone principale indica:<br><i>'Per aprire il portellone pesante: taglia prima il cavo <b>VERDE 🟢</b>, poi il cavo <b>ROSSO 🔴</b> e per ultimo il cavo <b>BLU 🔵</b>!'</i><br>Comunica la sequenza precisa per la fuga!",
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
  }
];

GIOCHI.push({
  id: "escaperoom",
  nome: "Escape Room",
  icona: "🗝️",
  desc: "Gioco asimmetrico a squadre: le Guide vedono gli indizi, gli Operatori inseriscono i codici per fuggire da 3 stanze!",
  regole: [
    "👥 <b>Ruoli Asimmetrici</b>: una metà dei giocatori è <b>GUIDA 👁️</b> (vede la stanza e gli indovinelli), l'altra metà è <b>OPERATORE 🛠️</b> (ha i comandi ma non vede gli indizi).",
    "🗣️ <b>Comunica con la voce o la radio</b>: la Guida deve descrivere cosa vede per far premere i tasti giusti all'Operatore!",
    "🚪 <b>3 Stanze Tematiche</b>: 1. Laboratorio Cyberpunk, 2. Tempio Antico, 3. Bunker Blindato.",
    "👻 <b>Modalità Solo</b>: giochi come Operatore e il Fantasma ti invia comunicazioni radio dalla stanza!",
    "Risolvete tutti e 3 gli enigmi prima che scada il tempo per vincere <b>500 punti</b>!"
  ],
  gara: false,
  solo: true,
  maxGiocatori: 6,
  durata: 90,

  generaPartita() {
    // Seleziona una variante per ciascuna delle 3 stanze
    const configStanze = STANZE_ESCAPE.map(s => {
      const idx = Math.floor(Math.random() * s.indovinelli.length);
      return {
        stanzaId: s.id,
        enigmaIdx: idx
      };
    });
    return [{ configStanze }];
  },

  fantasma() {
    return { punti: 450, dettaglio: "Evasi da 3 stanze!", tempo: 60 };
  },

  crea(api) {
    const isSolo = S.ruolo === "solo" || api.giocatori.length <= 1;
    let giocatori = api.giocatori.filter(g => g.online);
    if (giocatori.length <= 1) {
      giocatori = [
        api.giocatori[0] || { id: "p0", nome: "Tu", avatar: "😎" },
        { id: "gh", nome: "Fantasma 📻", avatar: "👻" }
      ];
    }

    const mioId = api.io;
    const mioIdx = isSolo ? 0 : Math.max(0, giocatori.findIndex(g => g.id === mioId));
    
    // Assegnazione ruoli: indici pari = Guida, indici dispari = Operatore (in Solo il giocatore è Operatore e il Fantasma è Guida)
    const sonoGuida = isSolo ? false : (mioIdx % 2 === 0);
    const mioRuoloNome = sonoGuida ? "GUIDA 👁️ (Osservatore)" : "OPERATORE 🛠️ (Decifratore)";
    
    const configStanze = (api.dati && api.dati.configStanze) || [
      { stanzaId: 1, enigmaIdx: 0 },
      { stanzaId: 2, enigmaIdx: 0 },
      { stanzaId: 3, enigmaIdx: 0 }
    ];

    let stanzaAttualeIdx = 0;
    let inputCorrente = [];
    let concluso = false;
    let timerRadioFantasma = null;

    // Costruzione UI Arena
    api.arena.innerHTML = `
      <div class="escape-arena" style="display: flex; flex-direction: column; height: 100%; width: 100%; max-width: 620px; margin: 0 auto; user-select: none;">
        <!-- Header Info e Ruolo -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(15, 23, 42, 0.75); border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="esc-stanza-badge" style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">Stanza 1/3</span>
            <span id="esc-titolo-stanza" style="font-weight: bold; font-size: 0.95rem; color: #f8fafc;">Laboratorio</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: bold; color: ${sonoGuida ? '#38bdf8' : '#eab308'}; border: 1px solid ${sonoGuida ? '#0284c7' : '#ca8a04'}; padding: 2px 8px; border-radius: 6px;">
            ${mioRuoloNome}
          </div>
        </div>

        <!-- Progress Stanze -->
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <div id="step-1" style="flex:1; height: 6px; border-radius: 4px; background: #00f0ff; transition: all 0.3s;"></div>
          <div id="step-2" style="flex:1; height: 6px; border-radius: 4px; background: rgba(255,255,255,0.15); transition: all 0.3s;"></div>
          <div id="step-3" style="flex:1; height: 6px; border-radius: 4px; background: rgba(255,255,255,0.15); transition: all 0.3s;"></div>
        </div>

        <!-- Schermo Principale Asimmetrico (Guida vs Operatore) -->
        <div id="esc-main-card" style="flex: 1; display: flex; flex-direction: column; background: rgba(10, 15, 29, 0.7); border: 2px solid #00f0ff; border-radius: 16px; padding: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow-y: auto; justify-content: space-between;">
          <!-- Contenuto dinamico della stanza -->
          <div id="esc-vista-area" style="width: 100%;"></div>

          <!-- Feed Feedback / Radio -->
          <div id="esc-radio-banner" style="margin-top: 10px; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 10px; font-size: 0.88rem; text-align: center; border-left: 4px solid #00f0ff;">
            In attesa di comunicazione...
          </div>
        </div>

        <!-- Barra Inferiore Controlli -->
        <div id="esc-bottom-bar" style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
          <div id="esc-partner-hint" style="font-size: 0.8rem; color: #94a3b8;">
            ${sonoGuida ? "👁️ Tu vedi gli indizi: detta la soluzione al compagno!" : "🛠️ Tu inserisci i comandi: ascolta la Guida!"}
          </div>
          ${isSolo ? `<button id="btn-radio-fantasma" class="btn btn-small btn-ghost" style="font-size: 0.8rem; padding: 4px 10px; border: 1px solid #38bdf8;">📻 Chiedi al Fantasma</button>` : ""}
        </div>
      </div>
    `;

    const elStanzaBadge = api.arena.querySelector("#esc-stanza-badge");
    const elTitoloStanza = api.arena.querySelector("#esc-titolo-stanza");
    const elMainCard = api.arena.querySelector("#esc-main-card");
    const elVistaArea = api.arena.querySelector("#esc-vista-area");
    const elRadioBanner = api.arena.querySelector("#esc-radio-banner");
    const btnRadioFantasma = api.arena.querySelector("#btn-radio-fantasma");

    // Renderizza la stanza corrente in base al ruolo del giocatore
    function disegnaStanza() {
      if (stanzaAttualeIdx >= 3) {
        trionfoFuga();
        return;
      }

      inputCorrente = [];
      const stanzaConf = configStanze[stanzaAttualeIdx];
      const stanzaData = STANZE_ESCAPE.find(s => s.id === stanzaConf.stanzaId);
      const enigma = stanzaData.indovinelli[stanzaConf.enigmaIdx];

      // Aggiorna header e colori a tema
      elStanzaBadge.textContent = `Stanza ${stanzaAttualeIdx + 1}/3`;
      elTitoloStanza.textContent = `${stanzaData.icona} ${stanzaData.nome}`;
      elMainCard.style.borderColor = stanzaData.coloreTema;
      elRadioBanner.style.borderLeftColor = stanzaData.coloreTema;

      // Aggiorna step bar
      for (let i = 1; i <= 3; i++) {
        const step = api.arena.querySelector(`#step-${i}`);
        if (step) {
          if (i - 1 === stanzaAttualeIdx) step.style.background = stanzaData.coloreTema;
          else if (i - 1 < stanzaAttualeIdx) step.style.background = "#10b981";
          else step.style.background = "rgba(255,255,255,0.15)";
        }
      }

      if (sonoGuida) {
        // VISTA GUIDA 👁️: Mostra la scena e l'indizio
        elVistaArea.innerHTML = `
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 2.2rem; filter: drop-shadow(0 0 10px ${stanzaData.coloreTema});">${stanzaData.icona}</div>
            <h3 style="margin: 4px 0; color: ${stanzaData.coloreTema}; font-size: 1.15rem;">${enigma.titolo}</h3>
            <span style="font-size: 0.8rem; opacity: 0.7;">${stanzaData.descGuida}</span>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); padding: 14px; border-radius: 12px; border: 1px dashed ${stanzaData.coloreTema}; line-height: 1.5; font-size: 0.95rem; color: #f1f5f9;">
            ${enigma.indizioGuida}
          </div>
          <div style="margin-top: 14px; text-align: center; font-size: 0.85rem; color: #94a3b8;">
            🗣️ <i>Parla con il tuo Operatore e digli esattamente cosa inserire!</i>
          </div>
        `;
        elRadioBanner.innerHTML = `🟢 <b>Collegamento audio attivo</b> con l'Operatore.`;
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
              <h4 style="margin: 2px 0; color: ${stanzaData.coloreTema};">Pietra dei Glifi Antichi</h4>
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
              <button id="btn-canc-glifi" class="btn btn-small btn-ghost" style="color: #ef4444; border-color: #ef4444;">⌫ Resetta Glifi</button>
            </div>
          `;
        } else if (enigma.tipoInput === "cavi") {
          controlliHtml = `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 1.8rem;">🚪</div>
              <h4 style="margin: 2px 0; color: ${stanzaData.coloreTema};">Pannello Circuiti Portellone</h4>
              <div id="esc-cavi-display" style="font-size: 0.95rem; font-weight: bold; color: #94a3b8; margin: 6px 0;">
                Taglia i cavi nell'ordine corretto comunicato dalla Guida:
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 0 auto;">
              ${enigma.cavi.map(c => `
                <button class="btn btn-ghost btn-cavo" data-id="${c.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-radius: 10px; border: 2px solid ${c.colore}; font-weight: bold; font-size: 1rem;">
                  <span>${c.nome}</span>
                  <span class="stato-cavo" style="color: #10b981;">INTEGRO ⚡</span>
                </button>
              `).join("")}
            </div>
          `;
        }

        elVistaArea.innerHTML = controlliHtml;

        // Attacca listener comandi Operatore
        agganciaComandiOperatore(enigma);

        if (isSolo) {
          elRadioBanner.innerHTML = `📻 <b>Fantasma Guida:</b> premi "Chiedi al Fantasma" o ascolta i suoi indizi!`;
          avviaIndizioFantasmaSolo(enigma);
        } else {
          elRadioBanner.innerHTML = `⏳ In ascolto della Guida... non premere a caso!`;
        }
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
            b.querySelector(".stato-cavo").textContent = "TAGLIATO ✂️";
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

    // Verifica soluzione e sincronizza
    function validaSoluzione(dataUtente, dataSoluzione) {
      if (concluso) return;

      if (dataUtente === dataSoluzione) {
        // Enigma corretto!
        if (window.Suoni) Suoni.playDing();
        if (window.Vibrazione) Vibrazione.successo();
        elRadioBanner.innerHTML = `✅ <b>STANZA SUPERATA!</b> Serratura sbloccata!`;
        elRadioBanner.style.background = "rgba(16, 185, 129, 0.25)";

        // Comunica agli altri giocatori
        if (!isSolo) {
          api.invia({ tipo: "stanzaSuperata", stanzaIdx: stanzaAttualeIdx });
        }

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

    // Indizi automatici del Fantasma in Solo
    function avviaIndizioFantasmaSolo(enigma) {
      clearTimeout(timerRadioFantasma);
      timerRadioFantasma = setTimeout(() => {
        if (concluso) return;
        inviaIndizioFantasma(enigma);
      }, 4000);
    }

    function inviaIndizioFantasma(enigma) {
      if (concluso) return;
      if (window.Suoni) Suoni.playTick();
      let msg = "";
      if (enigma.tipoInput === "codice") {
        msg = `👻 <b>Radio Fantasma:</b> "Vedo i terminali lampeggianti... il codice è <b>${enigma.soluzione}</b>!"`;
      } else if (enigma.tipoInput === "glifi") {
        msg = `👻 <b>Radio Fantasma:</b> "I geroglifici sacri indicano: <b>${enigma.soluzione.join(" → ")}</b>!"`;
      } else if (enigma.tipoInput === "cavi") {
        msg = `👻 <b>Radio Fantasma:</b> "Taglia nell'ordine: <b>${enigma.soluzione.join(" → ").toUpperCase()}</b>!"`;
      }
      elRadioBanner.innerHTML = msg;
    }

    if (btnRadioFantasma) {
      btnRadioFantasma.onclick = () => {
        const stanzaConf = configStanze[stanzaAttualeIdx];
        const stanzaData = STANZE_ESCAPE.find(s => s.id === stanzaConf.stanzaId);
        const enigma = stanzaData.indovinelli[stanzaConf.enigmaIdx];
        inviaIndizioFantasma(enigma);
      };
    }

    // Fuga riuscita: vittoria squadra
    function trionfoFuga() {
      if (concluso) return;
      concluso = true;
      clearTimeout(timerRadioFantasma);

      elRadioBanner.innerHTML = `🎉 <b>FUGA RIUSCITA! AVETE APERTO TUTTE LE PORTE!</b>`;
      elVistaArea.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 3.5rem; filter: drop-shadow(0 0 15px #10b981);">🏆</div>
          <h2 style="color: #10b981; margin: 10px 0;">EVASI DALL'ESCAPE ROOM!</h2>
          <p style="color: #94a3b8; font-size: 0.95rem;">Grande lavoro di squadra tra Guide e Operatori!</p>
        </div>
      `;

      if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
      if (window.Vibrazione) Vibrazione.successo();

      setTimeout(() => {
        api.finito({
          punti: 500,
          dettaglio: "3/3 Stanze superate! 🗝️"
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
        clearTimeout(timerRadioFantasma);
        api.finito({
          punti: stanzaAttualeIdx * 150,
          dettaglio: `Tempo scaduto (${stanzaAttualeIdx}/3 stanze)`
        });
      },
      chiudi() {
        concluso = true;
        clearTimeout(timerRadioFantasma);
      }
    };
  }
});
