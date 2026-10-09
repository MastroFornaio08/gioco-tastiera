/* 🗝️ Escape Room Cooperativa Avanzata (Guide 👁️ vs Operatori 🛠️)
   - Senza Limite di Tempo (ragionamento cooperativo senza fretta)
   - Menu a Tendina per la Guida (protocolli deduttivi condizionali in base a ciò che l'Operatore vede a voce)
   - 3 Indizi Progressivi per Stanza con sincronizzazione in tempo reale
   - Tasto "Arrenditi" con conferma, rivelazione della soluzione e punteggio parziale
   - 7 Stanze Tematiche con enigmi logici avanzati e deterministici
*/

function generaStanzaCyber(id) {
  const cifre = [
    Math.floor(Math.random() * 8) + 1,
    Math.floor(Math.random() * 8) + 1,
    Math.floor(Math.random() * 8) + 1,
    Math.floor(Math.random() * 8) + 1
  ];
  const somma = cifre.reduce((a, b) => a + b, 0);
  const isPari = (somma % 2 === 0);
  let sol = "";
  if (isPari) {
    const max = Math.max(...cifre);
    const min = Math.min(...cifre);
    const pariCount = cifre.filter(x => x % 2 === 0).length;
    sol = `${max}${min}${pariCount}`;
  } else {
    const prima = cifre[0];
    const ultima = cifre[3];
    const diff = Math.abs(prima - ultima);
    sol = `${prima}${ultima}${diff}`;
  }

  // Opzioni tastierino
  const setOpts = new Set(sol.split(""));
  while (setOpts.size < 6) {
    setOpts.add(String(Math.floor(Math.random() * 9) + 1));
  }
  const opzioniKeypad = Array.from(setOpts).sort();

  return {
    id,
    nome: "Stanza 1: Laboratorio Cyberpunk",
    icona: "🧪",
    coloreTema: "#00f0ff",
    tipoInput: "codice",
    soluzione: sol,
    opzioniKeypad,
    datiOperatore: {
      titoloModulo: "Terminale Neuro-Core v4.9",
      descrizioneVisiva: `Sul display centrale lampeggiano 4 cifre di diagnostica:`,
      cifre
    },
    menuGuida: [
      {
        valore: "numeri",
        titolo: "🔢 Display con 4 Cifre di Diagnostica (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Protocollo di Sicurezza Reattore:</b> Fatti comunicare all'Operatore le <b>4 cifre</b> mostrate sul suo monitor e calcolatene insieme la <b>SOMMA</b>.</p>
            <div style="background:rgba(0,240,255,0.08); border-left:4px solid #00f0ff; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE LA SOMMA È PARI:</b><br>
              Il codice a 3 cifre da inserire è formato da:<br>
              • <b>1ª cifra:</b> La cifra più <span style="color:#00f0ff;">ALTA</span> visibile sul monitor<br>
              • <b>2ª cifra:</b> La cifra più <span style="color:#00f0ff;">BASSA</span> visibile sul monitor<br>
              • <b>3ª cifra:</b> Il <span style="color:#00f0ff;">NUMERO TOTALE DI CIFRE PARI</span> presenti sul monitor
            </div>
            <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE LA SOMMA È DISPARI:</b><br>
              Il codice a 3 cifre da inserire è formato da:<br>
              • <b>1ª cifra:</b> La <span style="color:#ef4444;">PRIMA cifra</span> a sinistra<br>
              • <b>2ª cifra:</b> L'<span style="color:#ef4444;">ULTIMA cifra</span> a destra<br>
              • <b>3ª cifra:</b> La <span style="color:#ef4444;">DIFFERENZA</span> (valore positivo) tra la prima e l'ultima
            </div>
          </div>
        `
      },
      {
        valore: "frequenza",
        titolo: "📡 Modulo Onde Radio e Oscilloscopio MHz",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Questo protocollo si applica solo se l'Operatore vede un grafico a onde sinusoidali continue. Se l'Operatore vede numeri discreti, torna al menu e seleziona 'Display con 4 Cifre'!</i>
          </div>
        `
      },
      {
        valore: "matrice",
        titolo: "💾 Dump Esadecimale della Memoria Cache",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Questo protocollo riguarda matrici esadecimali con lettere [A-F]. Se l'Operatore ha solo numeri standard, seleziona 'Display con 4 Cifre' nel menu!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida selezioni nel menu a tendina: 'Display con 4 Cifre di Diagnostica'. L'Operatore deve leggere i 4 numeri.",
      `La somma dei 4 numeri (${cifre.join(" + ")}) è ${somma} (${isPari ? "PARI" : "DISPARI"}). Applicate la regola corrispondente nel manuale!`,
      `Il codice da digitare sul terminale è: ${soluzionePerDisplay(sol)}`
    ]
  };
}

function generaStanzaTempio(id) {
  const tuttiGlifi = ["🌙", "☀️", "🦅", "🌊", "🐍", "🔥"];
  const shuffle = [...tuttiGlifi].sort(() => Math.random() - 0.5);
  const scenaGlifi = shuffle.slice(0, 4);
  const primo = scenaGlifi[0];

  let sol = [];
  if (primo === "🌙") sol = ["☀️", "🦅", "🌊"];
  else if (primo === "☀️") sol = ["🌊", "🌙", "🔥"];
  else if (primo === "🦅" || primo === "🐍") sol = ["🔥", "🐍", "🌙"];
  else sol = ["🦅", "☀️", "🐍"];

  return {
    id,
    nome: "Stanza 2: Tempio Ancestrale",
    icona: "🗿",
    coloreTema: "#f59e0b",
    tipoInput: "glifi",
    soluzione: sol,
    glifiDisponibili: tuttiGlifi,
    datiOperatore: {
      titoloModulo: "Stele degli Antichi Custodi",
      descrizioneVisiva: `Sulla pietra sacra sono incisi 4 glifi cerimoniali da sinistra a destra:`,
      scenaGlifi
    },
    menuGuida: [
      {
        valore: "glifi",
        titolo: "🔮 Stele di Pietra con 4 Glifi Sacri (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Iscrizione dei Custodi:</b> Chiedi all'Operatore quale glifo si trova nella <b>PRIMA POSIZIONE</b> (il più a sinistra sulla stele).</p>
            <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>• Se il primo glifo è la LUNA 🌙:</b><br>
              L'ordine di sblocco è: <span style="color:#f59e0b; font-weight:bold;">Sole ☀️ → Falco 🦅 → Onde 🌊</span>
            </div>
            <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>• Se il primo glifo è il SOLE ☀️:</b><br>
              L'ordine di sblocco è: <span style="color:#f59e0b; font-weight:bold;">Onde 🌊 → Luna 🌙 → Fuoco 🔥</span>
            </div>
            <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>• Se il primo glifo è un ANIMALE (Falco 🦅 o Serpente 🐍):</b><br>
              L'ordine di sblocco è: <span style="color:#f59e0b; font-weight:bold;">Fuoco 🔥 → Serpente 🐍 → Luna 🌙</span>
            </div>
            <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>• Se il primo glifo è un ELEMENTO (Onde 🌊 o Fuoco 🔥):</b><br>
              L'ordine di sblocco è: <span style="color:#f59e0b; font-weight:bold;">Falco 🦅 → Sole ☀️ → Serpente 🐍</span>
            </div>
          </div>
        `
      },
      {
        valore: "bracieri",
        titolo: "🕯️ Bracieri e Ceneri dei Guardiani",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Questo rito richiede bracieri accesi con differenti colori di fiamma. Se l'Operatore vede simboli su pietra, usa 'Stele di Pietra con 4 Glifi'!</i>
          </div>
        `
      },
      {
        valore: "colonne",
        titolo: "🏛️ Allineamento delle Colonne Monolitiche",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Applicabile solo con colonne rotanti numerate. Seleziona 'Stele di Pietra con 4 Glifi' nel menu!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida apra 'Stele di Pietra con 4 Glifi'. L'Operatore deve comunicare il primo simbolo a sinistra.",
      `Il primo glifo a sinistra è ${primo}. Cercate nel manuale della Guida la riga corrispondente a questo simbolo!`,
      `Toccate nell'ordine esatto questi 3 glifi: ${sol.join(" → ")}`
    ]
  };
}

function generaStanzaBunker(id) {
  const colorPool = ["rosso", "blu", "giallo", "verde"];
  const caviScelti = [
    colorPool[Math.floor(Math.random() * colorPool.length)],
    colorPool[Math.floor(Math.random() * colorPool.length)],
    colorPool[Math.floor(Math.random() * colorPool.length)],
    colorPool[Math.floor(Math.random() * colorPool.length)]
  ];
  // Assicura che ci siano almeno 2 colori distinti
  if (new Set(caviScelti).size === 1) {
    caviScelti[1] = (caviScelti[0] === "rosso") ? "blu" : "rosso";
  }

  const nRosso = caviScelti.filter(c => c === "rosso").length;
  const nBlu = caviScelti.filter(c => c === "blu").length;

  let solIdx = [];
  let sintesiRegola = "";
  if (nRosso === 0) {
    solIdx = [1, 0, 2];
    sintesiRegola = "Nessun cavo rosso: taglia il 2° cavo, poi il 1°, poi il 3° cavo.";
  } else if (nRosso > 1 && caviScelti[3] === "giallo") {
    // Primo blu o primo verde, poi giallo, poi primo rosso
    const primoBlu = caviScelti.indexOf("blu") !== -1 ? caviScelti.indexOf("blu") : caviScelti.indexOf("verde");
    const primoGiallo = caviScelti.indexOf("giallo");
    const primoRosso = caviScelti.indexOf("rosso");
    solIdx = [primoBlu !== -1 ? primoBlu : 0, primoGiallo, primoRosso];
    sintesiRegola = "Più di un rosso e ultimo cavo giallo: taglia prima il cavo BLU, poi il cavo GIALLO, infine il primo ROSSO.";
  } else if (nBlu >= 2) {
    const indiciBlu = caviScelti.map((c, i) => c === "blu" ? i : -1).filter(i => i !== -1);
    const terzo = caviScelti.findIndex(c => c !== "blu");
    solIdx = [indiciBlu[0], indiciBlu[1], terzo !== -1 ? terzo : 0];
    sintesiRegola = "Almeno 2 cavi blu: taglia prima i due cavi BLU dall'alto in basso, poi il primo cavo diverso da blu.";
  } else {
    // Ordine standard: primo verde (o primo giallo), primo rosso, poi primo blu (o altro)
    const pVerde = caviScelti.indexOf("verde") !== -1 ? caviScelti.indexOf("verde") : caviScelti.indexOf("giallo");
    const pRosso = caviScelti.indexOf("rosso");
    const pResto = [0, 1, 2, 3].find(i => i !== pVerde && i !== pRosso);
    solIdx = [pVerde !== -1 ? pVerde : 0, pRosso !== -1 ? pRosso : 1, pResto !== undefined ? pResto : 2];
    sintesiRegola = "Caso standard: taglia prima il cavo VERDE (o Giallo), poi il cavo ROSSO, infine il cavo restante.";
  }

  // Cavi per render
  const caviDati = caviScelti.map((col, idx) => ({
    id: `cavo_${idx}`,
    colore: col,
    nome: `Cavo ${idx + 1}: ${col.toUpperCase()}`,
    hex: col === "rosso" ? "#ef4444" : col === "blu" ? "#3b82f6" : col === "giallo" ? "#eab308" : "#10b981"
  }));

  const solCaviIds = solIdx.map(i => `cavo_${i}`);
  const solNomi = solIdx.map(i => caviDati[i].nome).join(" → ");

  return {
    id,
    nome: "Stanza 3: Bunker Blindato",
    icona: "🚨",
    coloreTema: "#ef4444",
    tipoInput: "cavi",
    soluzione: solCaviIds,
    solNomi,
    datiOperatore: {
      titoloModulo: "Circuito Portellone Antiatomico",
      descrizioneVisiva: `Pannello di alimentazione con 4 cavi disposti dall'alto verso il basso:`,
      caviDati
    },
    menuGuida: [
      {
        valore: "cavi",
        titolo: "⚡ Quadro Elettrico e Disinnesco Cavi (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Manuale di Sicurezza Bunker:</b> Fatti elencare dall'Operatore i <b>colori dei 4 cavi</b> dall'alto verso il basso (1°, 2°, 3°, 4°).</p>
            <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>1. SE NON C'È ALCUN CAVO ROSSO:</b><br>
              Taglia nell'ordine esatto: il <span style="color:#ef4444; font-weight:bold;">2° cavo</span> → il <span style="color:#ef4444; font-weight:bold;">1° cavo</span> → il <span style="color:#ef4444; font-weight:bold;">3° cavo</span>.
            </div>
            <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>2. SE C'È PIÙ DI UN ROSSO E L'ULTIMO CAVO È GIALLO:</b><br>
              Taglia prima il cavo <span style="color:#3b82f6; font-weight:bold;">BLU</span> → poi il cavo <span style="color:#eab308; font-weight:bold;">GIALLO</span> → poi il primo cavo <span style="color:#ef4444; font-weight:bold;">ROSSO</span>.
            </div>
            <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>3. SE CI SONO 2 O PIÙ CAVI BLU:</b><br>
              Taglia tutti i cavi <span style="color:#3b82f6; font-weight:bold;">BLU</span> dall'alto in basso → poi il primo cavo differente da blu.
            </div>
            <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>4. IN TUTTI GLI ALTRI CASI:</b><br>
              Taglia prima il cavo <span style="color:#10b981; font-weight:bold;">VERDE (o Giallo)</span> → poi il cavo <span style="color:#ef4444; font-weight:bold;">ROSSO</span> → infine il cavo rimanente.
            </div>
          </div>
        `
      },
      {
        valore: "manometro",
        titolo: "🚨 Valvole di Rilascio Pressione Idraulica",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Questa sezione serve solo per valvole circolari a pressione PSI. Per cavi elettrici, consulta 'Quadro Elettrico e Disinnesco Cavi'!</i>
          </div>
        `
      },
      {
        valore: "radio",
        titolo: "📻 Frequenza di Emergenza del Bunker",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Riguarda la sintonizzazione della radio a onde corte. Torna al menu e seleziona 'Quadro Elettrico e Disinnesco Cavi'!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida apra 'Quadro Elettrico e Disinnesco Cavi'. L'Operatore deve comunicare i colori dei 4 cavi dall'alto al basso.",
      `Verificate la regola: ${sintesiRegola}`,
      `Tagliate i 3 cavi in questo ordine: ${solNomi}`
    ]
  };
}

function generaStanzaAlchimia(id) {
  // Genera 4 volumi distinti in ml
  const pool = [20, 30, 40, 50, 60, 70].sort(() => Math.random() - 0.5);
  const vViola = pool[0];
  const vVerde = pool[1];
  const vRossa = pool[2];
  const vBlu = pool[3];

  const ampolle = [
    { id: "viola", nome: "Elisir Viola 🟣", ml: vViola, hex: "#a855f7" },
    { id: "verde", nome: "Essenza Verde 🟢", ml: vVerde, hex: "#10b981" },
    { id: "rossa", nome: "Polvere Rossa 🔴", ml: vRossa, hex: "#ef4444" },
    { id: "blu", nome: "Lacrima Blu 🔵", ml: vBlu, hex: "#3b82f6" }
  ];

  const sommaVV = vViola + vVerde;
  let sol = [];

  if (sommaVV >= 90) {
    const maxAmp = [...ampolle].sort((a, b) => b.ml - a.ml)[0];
    const minAmp = [...ampolle].sort((a, b) => a.ml - b.ml)[0];
    sol = [maxAmp.id, "rossa", minAmp.id];
  } else {
    const ordinati = [...ampolle].sort((a, b) => b.ml - a.ml);
    const secondo = ordinati[1];
    sol = ["blu", secondo.id, "verde"];
  }

  const solNomi = sol.map(s => ampolle.find(a => a.id === s).nome).join(" → ");

  return {
    id,
    nome: "Stanza 4: Laboratorio Alchemico",
    icona: "⚗️",
    coloreTema: "#a855f7",
    tipoInput: "ampolle",
    soluzione: sol,
    solNomi,
    datiOperatore: {
      titoloModulo: "Banco delle Misture ed Elisir",
      descrizioneVisiva: `Sul banco degli alchimisti ci sono 4 ampolle graduate:`,
      ampolle
    },
    menuGuida: [
      {
        valore: "ampolle",
        titolo: "⚗️ Ricettario Ampolle ed Elisir in ml (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Grimorio di Ermete:</b> Fatti comunicare all'Operatore i volumi in <b>ml</b> dell'<b>Elisir Viola</b> e dell'<b>Essenza Verde</b> e sommateli.</p>
            <div style="background:rgba(168,85,247,0.08); border-left:4px solid #a855f7; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE LA SOMMA (Viola + Verde) È 90ml O PIÙ:</b><br>
              Versa nel calderone nell'ordine esatto:<br>
              1. L'ampolla con il <span style="color:#a855f7; font-weight:bold;">VOLUME PIÙ ALTO</span> in assoluto<br>
              2. L'ampolla <span style="color:#ef4444; font-weight:bold;">ROSSA 🔴</span><br>
              3. L'ampolla con il <span style="color:#a855f7; font-weight:bold;">VOLUME PIÙ BASSO</span> in assoluto
            </div>
            <div style="background:rgba(168,85,247,0.08); border-left:4px solid #a855f7; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE LA SOMMA È INFERIORE A 90ml:</b><br>
              Versa nel calderone nell'ordine esatto:<br>
              1. L'ampolla <span style="color:#3b82f6; font-weight:bold;">BLU 🔵</span><br>
              2. L'ampolla con il <span style="color:#a855f7; font-weight:bold;">SECONDO VOLUME PIÙ ALTO</span> in assoluto<br>
              3. L'ampolla <span style="color:#10b981; font-weight:bold;">VERDE 🟢</span>
            </div>
          </div>
        `
      },
      {
        valore: "temperatura",
        titolo: "🔥 Termoregolazione del Crogiolo di Mercurio",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Riguarda la fiamma a carbone e i gradi Celsius. Se l'Operatore vede ampolle graduate con liquidi colorati, seleziona 'Ricettario Ampolle ed Elisir in ml'!</i>
          </div>
        `
      },
      {
        valore: "erbario",
        titolo: "🌿 Erbario delle Radici di Mandragora",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Utilizzato per l'infusione di foglie secche. Torna al menu e seleziona 'Ricettario Ampolle ed Elisir in ml'!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida selezioni nel menu: 'Ricettario Ampolle ed Elisir in ml'. L'Operatore deve leggere i ml delle ampolle Viola e Verde.",
      `La somma Viola (${vViola}ml) + Verde (${vVerde}ml) fa ${sommaVV}ml (${sommaVV >= 90 ? ">= 90ml" : "< 90ml"}). Seguite la formula corrispondente!`,
      `Versate le 3 ampolle in questo ordine: ${solNomi}`
    ]
  };
}

function generaStanzaCelle(id) {
  const numeriCella = [3, 4, 5, 6, 7, 8];
  const romani = { 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII" };
  const cellaNum = numeriCella[Math.floor(Math.random() * numeriCella.length)];
  const cellaRomano = romani[cellaNum];
  const isPari = (cellaNum % 2 === 0);

  const sol = isPari ? ["👑", "🦁", "💀"] : ["🗡️", "🛡️", "👑"];
  const chiaviDisponibili = ["👑", "🦁", "💀", "🗡️", "🛡️", "🗝️"];

  return {
    id,
    nome: "Stanza 5: Celle Sotterranee",
    icona: "⛓️",
    coloreTema: "#94a3b8",
    tipoInput: "glifi",
    soluzione: sol,
    glifiDisponibili: chiaviDisponibili,
    datiOperatore: {
      titoloModulo: "Portone di Ferro della Prigione",
      descrizioneVisiva: `Sulla targa di ferro della cella è inciso:`,
      targa: `BLOCCO CELLA: ${cellaRomano} (${cellaNum})`,
      istruzioneInput: "Scegli e inserisci le 3 chiavi giuste nelle serrature:"
    },
    menuGuida: [
      {
        valore: "chiavi",
        titolo: "🗝️ Registri del Carceriere e Blocchi Cella (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Registro delle Chiavi:</b> Fatti comunicare all'Operatore il <b>numero della cella</b> visibile sulla targa di ferro.</p>
            <div style="background:rgba(148,163,184,0.08); border-left:4px solid #94a3b8; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE IL NUMERO DELLA CELLA È PARI (es. IV, VI, VIII):</b><br>
              Inserisci nelle serrature nell'ordine esatto:<br>
              1. La Chiave della Regalità: <span style="font-weight:bold; color:#f8fafc;">Corona 👑</span><br>
              2. La Chiave della Forza: <span style="font-weight:bold; color:#f8fafc;">Leone 🦁</span><br>
              3. La Chiave del Pericolo: <span style="font-weight:bold; color:#f8fafc;">Teschio 💀</span>
            </div>
            <div style="background:rgba(148,163,184,0.08); border-left:4px solid #94a3b8; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE IL NUMERO DELLA CELLA È DISPARI (es. III, V, VII):</b><br>
              Inserisci nelle serrature nell'ordine esatto:<br>
              1. La Chiave dell'Onore: <span style="font-weight:bold; color:#f8fafc;">Spada 🗡️</span><br>
              2. La Chiave della Difesa: <span style="font-weight:bold; color:#f8fafc;">Scudo 🛡️</span><br>
              3. La Chiave della Regalità: <span style="font-weight:bold; color:#f8fafc;">Corona 👑</span>
            </div>
          </div>
        `
      },
      {
        valore: "catene",
        titolo: "⛓️ Diametro e Peso delle Catene di Ferro",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Questa sezione serve a calcolare i contrappesi delle catene sospese. Se l'Operatore vede una targa con mazzo di chiavi, seleziona 'Registri del Carceriere'!</i>
          </div>
        `
      },
      {
        valore: "mappa",
        titolo: "🗺️ Cunicoli e Condotti Fognari di Fuga",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Mappa topografica di orientamento. Torna al menu e seleziona 'Registri del Carceriere e Blocchi Cella'!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida apra 'Registri del Carceriere'. L'Operatore deve riferire il numero del blocco cella.",
      `Il numero della cella è ${cellaNum} (${isPari ? "PARI" : "DISPARI"}). Verificate nel manuale l'ordine delle 3 chiavi!`,
      `Inserite le chiavi in questo ordine esatto: ${sol.join(" → ")}`
    ]
  };
}

function generaStanzaSpazio(id) {
  const P = Math.floor(Math.random() * 5) + 5; // 5..9
  const O = Math.floor(Math.random() * 6) + 2; // 2..7
  const T = Math.floor(Math.random() * 4) + 1; // 1..4

  let sol = "";
  if (P > O) {
    const c1 = P - O;
    const c2 = (P + O) % 10;
    const c3 = T;
    sol = `${c1}${c2}${c3}`;
  } else {
    const c1 = Math.abs(O - P);
    const c2 = T;
    const c3 = (O * T) % 10;
    sol = `${c1}${c2}${c3}`;
  }

  const setOpts = new Set(sol.split(""));
  while (setOpts.size < 6) {
    setOpts.add(String(Math.floor(Math.random() * 9) + 1));
  }
  const opzioniKeypad = Array.from(setOpts).sort();

  return {
    id,
    nome: "Stanza 6: Airlock Spaziale",
    icona: "🛸",
    coloreTema: "#38bdf8",
    tipoInput: "codice",
    soluzione: sol,
    opzioniKeypad,
    datiOperatore: {
      titoloModulo: "Monitor Telemetrico Decompressione",
      descrizioneVisiva: `I sensori ambientali della camera stagna riportano i seguenti dati:`,
      sensori: [
        { nome: "Pressione (P)", val: `${P} bar`, icon: "📟" },
        { nome: "Ossigeno (O)", val: `${O} %`, icon: "💨" },
        { nome: "Temperatura (T)", val: `${T} °C`, icon: "❄️" }
      ]
    },
    menuGuida: [
      {
        valore: "telemetria",
        titolo: "🛸 Sensori Pressurizzazione e Calcolo Override (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Computer di Bordo:</b> Fatti comunicare all'Operatore i 3 valori: <b>Pressione (P)</b>, <b>Ossigeno (O)</b> e <b>Temperatura (T)</b>.</p>
            <div style="background:rgba(56,189,248,0.08); border-left:4px solid #38bdf8; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE LA PRESSIONE È MAGGIORE DELL'OSSIGENO (P > O):</b><br>
              • <b>1ª cifra:</b> Pressione meno Ossigeno <span style="color:#38bdf8;">(P - O)</span><br>
              • <b>2ª cifra:</b> L'ultima cifra della loro somma <span style="color:#38bdf8;">(P + O)</span><br>
              • <b>3ª cifra:</b> Il valore della Temperatura <span style="color:#38bdf8;">(T)</span>
            </div>
            <div style="background:rgba(56,189,248,0.08); border-left:4px solid #38bdf8; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>👉 SE L'OSSIGENO È MAGGIORE O UGUALE ALLA PRESSIONE (O ≥ P):</b><br>
              • <b>1ª cifra:</b> Ossigeno meno Pressione <span style="color:#38bdf8;">(O - P)</span><br>
              • <b>2ª cifra:</b> Il valore della Temperatura <span style="color:#38bdf8;">(T)</span><br>
              • <b>3ª cifra:</b> L'ultima cifra del prodotto <span style="color:#38bdf8;">(O × T)</span>
            </div>
          </div>
        `
      },
      {
        valore: "vettori",
        titolo: "🛰️ Vettori di Rientro Orbitale e Propulsione",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Calcolo coordinate astronomiche di rotta. Se l'Operatore legge sensori barometrici e termici, usa 'Sensori Pressurizzazione e Calcolo Override'!</i>
          </div>
        `
      },
      {
        valore: "scudi",
        titolo: "🛡️ Generatore Deflettore Termico Antimateria",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Calibrazione dei campi magnetici. Seleziona 'Sensori Pressurizzazione' nel menu della Guida!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida apra 'Sensori Pressurizzazione'. L'Operatore deve riferire i 3 valori: Pressione, Ossigeno e Temperatura.",
      `Pressione (${P}) ${P > O ? ">" : "≤"} Ossigeno (${O}). Calcolate le 3 cifre seguendo la formula esatta nel manuale!`,
      `Digitate sul tastierino il codice di sblocco: ${soluzionePerDisplay(sol)}`
    ]
  };
}

function generaStanzaTesoro(id) {
  const runePossibili = [
    { id: "fuoco", nome: "Runa del Fuoco 🔥", sol: ["🔴", "🟡", "💎"] },
    { id: "tempesta", nome: "Runa della Tempesta 🌪️", sol: ["🔷", "🟣", "💎"] },
    { id: "terra", nome: "Runa della Terra 🌍", sol: ["🟢", "🔴", "🟡"] }
  ];
  const runa = runePossibili[Math.floor(Math.random() * runePossibili.length)];
  const gemmeTutte = ["💎", "🟢", "🟣", "🟡", "🔷", "🔴"];

  return {
    id,
    nome: "Stanza 7: Cripta del Tesoro (Portale Finale)",
    icona: "💎",
    coloreTema: "#10b981",
    tipoInput: "glifi",
    soluzione: runa.sol,
    glifiDisponibili: gemmeTutte,
    datiOperatore: {
      titoloModulo: "Grande Portale Monumentale della Salvezza",
      descrizioneVisiva: `Al centro del portale brilla intensamente una runa elementale:`,
      runaAttiva: runa.nome,
      istruzioneInput: "Incastona nei 3 piedistalli le gemme mistiche corrette:"
    },
    menuGuida: [
      {
        valore: "gemme",
        titolo: "💎 Sigillo delle Rune Elementali e Gemme (Consigliato)",
        contenuto: `
          <div style="font-size:0.92rem; line-height:1.6;">
            <p><b>Epigrafe Dorata:</b> Fatti descrivere dall'Operatore quale <b>Runa Elementale</b> risplende al centro del portale.</p>
            <div style="background:rgba(16,185,129,0.08); border-left:4px solid #10b981; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>🔥 SE È LA RUNA DEL FUOCO:</b><br>
              Incastonate nell'ordine esatto:<br>
              <span style="font-weight:bold; color:#10b981;">Rubino 🔴</span> (fiamma viva) → <span style="font-weight:bold; color:#10b981;">Topazio 🟡</span> (scintilla) → <span style="font-weight:bold; color:#10b981;">Diamante 💎</span> (luce pura)
            </div>
            <div style="background:rgba(16,185,129,0.08); border-left:4px solid #10b981; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>🌪️ SE È LA RUNA DELLA TEMPESTA:</b><br>
              Incastonate nell'ordine esatto:<br>
              <span style="font-weight:bold; color:#10b981;">Zaffiro 🔷</span> (vento glaciale) → <span style="font-weight:bold; color:#10b981;">Ametista 🟣</span> (fulmine) → <span style="font-weight:bold; color:#10b981;">Diamante 💎</span> (luce)
            </div>
            <div style="background:rgba(16,185,129,0.08); border-left:4px solid #10b981; padding:10px 14px; margin:8px 0; border-radius:6px;">
              <b>🌍 SE È LA RUNA DELLA TERRA:</b><br>
              Incastonate nell'ordine esatto:<br>
              <span style="font-weight:bold; color:#10b981;">Smeraldo 🟢</span> (foresta antica) → <span style="font-weight:bold; color:#10b981;">Rubino 🔴</span> (magma) → <span style="font-weight:bold; color:#10b981;">Topazio 🟡</span> (oro nativo)
            </div>
          </div>
        `
      },
      {
        valore: "oracolo",
        titolo: "⚖️ Pesi e Bilance dell'Oracolo d'Oro",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Serve per calcolare il peso di lingotti e calici. Se l'Operatore vede gemme e una runa elementale, usa 'Sigillo delle Rune Elementali e Gemme'!</i>
          </div>
        `
      },
      {
        valore: "architettura",
        titolo: "🚪 Struttura Architettonica dei Bassorilievi",
        contenuto: `
          <div style="font-size:0.9rem; opacity:0.85; line-height:1.5;">
            <i>Descrizione storica delle colonne. Seleziona 'Sigillo delle Rune Elementali e Gemme' nel menu della Guida!</i>
          </div>
        `
      }
    ],
    indizi: [
      "La Guida apra 'Sigillo delle Rune Elementali e Gemme'. L'Operatore deve riferire quale runa elementale brilla al centro del portale.",
      `La runa attiva è la ${runa.nome}. Consultate la sequenza esatta di gemme associata a questo elemento!`,
      `Incastonate le gemme nell'ordine finale: ${runa.sol.join(" → ")}`
    ]
  };
}

function soluzionePerDisplay(sol) {
  if (Array.isArray(sol)) return sol.join(" → ");
  return sol.split("").join(" - ");
}

GIOCHI.push({
  id: "escaperoom",
  nome: "Escape Room",
  icona: "🗝️",
  desc: "Gioco cooperativo asimmetrico (2-6 giocatori) SENZA LIMITI DI TEMPO: la Guida consulta i protocolli con menu a tendina, l'Operatore inserisce i comandi!",
  regole: [
    "👥 <b>Solo con Giocatori (2-6)</b>: una metà è <b>GUIDA 👁️</b> (ha il manuale di decifrazione), l'altra è <b>OPERATORE 🛠️</b> (ha i comandi).",
    "⏳ <b>Senza Limite di Tempo</b>: nessun countdown forzato! Ragionate con calma, deducete e comunicate a voce.",
    "🗣️ <b>Comunicazione a voce</b>: l'Operatore descrive cosa vede sullo schermo, la Guida trova la sezione corretta nel <b>menu a tendina</b> e ne ricava la soluzione!",
    "💡 <b>3 Indizi per Stanza</b>: se siete bloccati potete consultare fino a 3 indizi progressivi.",
    "🏳️ <b>Tasto Arrenditi</b>: potete gettare la spugna in qualsiasi momento per svelare la soluzione e concludere la partita."
  ],
  gara: false,
  solo: false,
  senzaTempo: true,
  minGiocatori: 2,
  maxGiocatori: 6,
  durata: 0,

  generaPartita() {
    // Genera tutte e 7 le stanze in modo deterministico e sincronizzato
    const configStanze = [
      generaStanzaCyber(1),
      generaStanzaTempio(2),
      generaStanzaBunker(3),
      generaStanzaAlchimia(4),
      generaStanzaCelle(5),
      generaStanzaSpazio(6),
      generaStanzaTesoro(7)
    ];
    return [{ configStanze }];
  },

  crea(api) {
    const giocatori = api.giocatori.filter(g => g.online);
    const mioId = api.io;
    const mioIdx = Math.max(0, giocatori.findIndex(g => g.id === mioId));

    // Assegnazione ruoli asimmetrici
    const sonoGuida = (mioIdx % 2 === 0);
    const mioRuoloNome = sonoGuida ? "GUIDA 👁️ (Manuale Decifrazione)" : "OPERATORE 🛠️ (Console Comandi)";

    const configStanze = (api.dati && api.dati.configStanze) || [
      generaStanzaCyber(1),
      generaStanzaTempio(2),
      generaStanzaBunker(3),
      generaStanzaAlchimia(4),
      generaStanzaCelle(5),
      generaStanzaSpazio(6),
      generaStanzaTesoro(7)
    ];

    const totaleStanze = configStanze.length;
    let stanzaAttualeIdx = 0;
    let inputCorrente = [];
    let concluso = false;
    let indiziUsati = 0; // da 0 a 3 per la stanza corrente
    let menuSelezionato = ""; // scelta del menu a tendina della Guida

    // Indicatori step bar (7 stanze)
    const stepBarsHtml = configStanze.map((_, i) => `
      <div id="step-${i + 1}" style="flex:1; height:6px; border-radius:4px; background:${i === 0 ? '#00f0ff' : 'rgba(255,255,255,0.15)'}; transition:all 0.3s;"></div>
    `).join("");

    // Arena UI
    api.arena.innerHTML = `
      <div class="escape-arena" style="display:flex; flex-direction:column; height:100%; width:100%; max-width:680px; margin:0 auto; user-select:none; font-family:inherit;">
        
        <!-- Header Info e Ruolo -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(15,23,42,0.85); border-radius:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.12); backdrop-filter:blur(6px);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span id="esc-stanza-badge" style="background:#0284c7; color:#fff; padding:3px 9px; border-radius:8px; font-weight:bold; font-size:0.82rem;">Stanza 1/${totaleStanze}</span>
            <span id="esc-titolo-stanza" style="font-weight:bold; font-size:0.92rem; color:#f8fafc;">Laboratorio</span>
          </div>
          <div style="font-size:0.82rem; font-weight:bold; color:${sonoGuida ? '#38bdf8' : '#eab308'}; border:1px solid ${sonoGuida ? '#0284c7' : '#ca8a04'}; padding:3px 8px; border-radius:6px; background:rgba(0,0,0,0.3);">
            ${mioRuoloNome}
          </div>
        </div>

        <!-- Barra Strumenti: Step bar + Tasti Indizio & Arrenditi -->
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
          <div style="display:flex; gap:5px;">
            ${stepBarsHtml}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:2px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <button id="btn-indizio" class="btn btn-small" style="background:rgba(234,179,8,0.15); color:#facc15; border:1px solid #eab308; padding:5px 10px; font-size:0.82rem; border-radius:8px; cursor:pointer; font-weight:600; transition:all 0.2s;">
                💡 Indizio (3 rimasti)
              </button>
              <span id="badge-indizi-count" style="font-size:0.75rem; color:#94a3b8;">0/3 usati</span>
            </div>

            <button id="btn-arrenditi" class="btn btn-small" style="background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.4); padding:5px 10px; font-size:0.82rem; border-radius:8px; cursor:pointer; font-weight:600; transition:all 0.2s;">
              🏳️ Arrenditi
            </button>
          </div>
        </div>

        <!-- Box Indizi Sbloccati (se attivi) -->
        <div id="esc-box-indizi-attivi" style="display:none; background:rgba(234,179,8,0.08); border:1px dashed #eab308; border-radius:10px; padding:10px 14px; margin-bottom:8px; font-size:0.86rem; color:#fef08a; line-height:1.45;"></div>

        <!-- Schermo Principale Asimmetrico (Guida vs Operatore) -->
        <div id="esc-main-card" style="flex:1; display:flex; flex-direction:column; background:rgba(10,15,29,0.85); border:2px solid #00f0ff; border-radius:16px; padding:14px; box-shadow:0 8px 24px rgba(0,0,0,0.5); overflow-y:auto; justify-content:space-between; min-height:300px;">
          <!-- Contenuto dinamico della stanza -->
          <div id="esc-vista-area" style="width:100%;"></div>

          <!-- Radio Feedback Banner -->
          <div id="esc-radio-banner" style="margin-top:10px; padding:8px 12px; background:rgba(255,255,255,0.05); border-radius:10px; font-size:0.86rem; text-align:center; border-left:4px solid #00f0ff;">
            In attesa di comunicazione verbale...
          </div>
        </div>

        <!-- Modal / Dialogo Conferma Resa -->
        <div id="esc-dialogo-resa" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center; padding:16px;">
          <div style="background:#0f172a; border:2px solid #ef4444; border-radius:16px; padding:20px; max-width:380px; width:100%; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <div style="font-size:2.4rem; margin-bottom:8px;">🏳️</div>
            <h3 style="color:#ef4444; margin:0 0 8px 0;">Vuoi davvero arrenderti?</h3>
            <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.45; margin-bottom:16px;">
              Dichiarando la resa, la combinazione corretta di questa stanza verrà svelata e la partita terminerà con i punti accumulati finora.
            </p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button id="btn-conferma-resa-no" class="btn btn-ghost" style="flex:1; padding:8px; border-radius:8px; font-size:0.88rem;">
                ❌ Continua
              </button>
              <button id="btn-conferma-resa-si" class="btn" style="flex:1; background:#ef4444; color:#fff; border:none; padding:8px; border-radius:8px; font-size:0.88rem; font-weight:bold;">
                🏳️ Sì, Resa
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Guida/Operatore -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; font-size:0.8rem; color:#94a3b8;">
          <div>${sonoGuida ? "👁️ Guida: ascolta l'Operatore e usa il menu a tendina!" : "🛠️ Operatore: descrivi a voce cosa vedi!"}</div>
          <div>Co-op Senza Limiti ⏳</div>
        </div>
      </div>
    `;

    const elStanzaBadge = api.arena.querySelector("#esc-stanza-badge");
    const elTitoloStanza = api.arena.querySelector("#esc-titolo-stanza");
    const elMainCard = api.arena.querySelector("#esc-main-card");
    const elVistaArea = api.arena.querySelector("#esc-vista-area");
    const elRadioBanner = api.arena.querySelector("#esc-radio-banner");
    const btnIndizio = api.arena.querySelector("#btn-indizio");
    const badgeIndiziCount = api.arena.querySelector("#badge-indizi-count");
    const elBoxIndiziAttivi = api.arena.querySelector("#esc-box-indizi-attivi");
    const btnArrenditi = api.arena.querySelector("#btn-arrenditi");
    const dlgResa = api.arena.querySelector("#esc-dialogo-resa");
    const btnResaNo = api.arena.querySelector("#btn-conferma-resa-no");
    const btnResaSi = api.arena.querySelector("#btn-conferma-resa-si");

    // Gestione Dialogo Resa
    btnArrenditi.onclick = () => {
      if (concluso) return;
      dlgResa.style.display = "flex";
    };
    btnResaNo.onclick = () => {
      dlgResa.style.display = "none";
    };
    btnResaSi.onclick = () => {
      dlgResa.style.display = "none";
      eseguiResa();
    };

    function eseguiResa() {
      if (concluso) return;
      concluso = true;
      const stanzaData = configStanze[stanzaAttualeIdx] || configStanze[0];
      const solTesto = Array.isArray(stanzaData.soluzione) ? stanzaData.soluzione.join(" → ") : stanzaData.soluzione;

      // Invia resa a tutti i compagni
      api.invia({
        tipo: "resa",
        stanzaIdx: stanzaAttualeIdx,
        soluzione: solTesto
      });

      mostraSchermataResa(stanzaAttualeIdx, solTesto);
    }

    function mostraSchermataResa(idxStanza, solTesto) {
      concluso = true;
      if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
      if (window.Vibrazione) Vibrazione.errore();

      elRadioBanner.innerHTML = `🏳️ <b>RESA DICHIARATA!</b> La missione è stata interrotta.`;
      elRadioBanner.style.background = "rgba(239, 68, 68, 0.25)";

      elVistaArea.innerHTML = `
        <div style="text-align:center; padding:15px 0;">
          <div style="font-size:3rem; margin-bottom:8px;">🏳️</div>
          <h3 style="color:#ef4444; margin:4px 0;">VI SIETE ARRESI</h3>
          <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:12px;">
            La combinazione corretta per superare la Stanza ${idxStanza + 1} era:
          </p>
          <div style="display:inline-block; font-size:1.4rem; font-weight:bold; color:#00f0ff; background:rgba(0,0,0,0.6); padding:8px 18px; border-radius:10px; border:1px solid #00f0ff; letter-spacing:2px; margin-bottom:14px;">
            ${solTesto}
          </div>
          <p style="color:#cbd5e1; font-size:0.85rem;">Stanze completate con successo: <b>${idxStanza}/7</b></p>
        </div>
      `;

      setTimeout(() => {
        const puntiOttenuti = Math.max(0, idxStanza * 60);
        api.finito({
          punti: puntiOttenuti,
          dettaglio: `Resa alla Stanza ${idxStanza + 1} (${idxStanza}/7 superate)`
        });
      }, 3000);
    }

    // Gestione Indizi
    btnIndizio.onclick = () => {
      if (concluso) return;
      const stanzaData = configStanze[stanzaAttualeIdx];
      if (!stanzaData || indiziUsati >= 3) return;

      indiziUsati++;
      aggiornaBadgeIndizi();
      renderizzaBoxIndizi(stanzaData);

      if (window.Suoni && Suoni.playDing) Suoni.playDing();
      if (window.Vibrazione) Vibrazione.successo();

      // Sincronizza indizio con tutti
      api.invia({
        tipo: "usaIndizio",
        stanzaIdx: stanzaAttualeIdx,
        livello: indiziUsati
      });
    };

    function aggiornaBadgeIndizi() {
      const rimasti = 3 - indiziUsati;
      if (rimasti > 0) {
        btnIndizio.textContent = `💡 Indizio (${rimasti} rimast${rimasti === 1 ? 'o' : 'i'})`;
        btnIndizio.disabled = false;
        btnIndizio.style.opacity = "1";
      } else {
        btnIndizio.textContent = `💡 Tutti gli indizi usati`;
        btnIndizio.disabled = true;
        btnIndizio.style.opacity = "0.5";
      }
      badgeIndiziCount.textContent = `${indiziUsati}/3 usati`;
    }

    function renderizzaBoxIndizi(stanzaData) {
      if (indiziUsati <= 0) {
        elBoxIndiziAttivi.style.display = "none";
        elBoxIndiziAttivi.innerHTML = "";
        return;
      }

      elBoxIndiziAttivi.style.display = "block";
      const indiziMostrati = stanzaData.indizi.slice(0, indiziUsati);
      elBoxIndiziAttivi.innerHTML = `
        <div style="font-weight:bold; margin-bottom:6px; color:#facc15; display:flex; justify-content:space-between; align-items:center;">
          <span>💡 Indizi Sbloccati (${indiziUsati}/3):</span>
        </div>
        ${indiziMostrati.map((txt, i) => `
          <div style="margin-bottom:4px; padding-left:14px; position:relative;">
            <span style="position:absolute; left:0; font-weight:bold; color:#eab308;">${i + 1}.</span>
            ${txt}
          </div>
        `).join("")}
      `;
    }

    // Disegna la Stanza
    function disegnaStanza() {
      if (stanzaAttualeIdx >= totaleStanze) {
        trionfoFuga();
        return;
      }

      inputCorrente = [];
      menuSelezionato = ""; // reset selezione dropdown per la Guida
      const stanzaData = configStanze[stanzaAttualeIdx];

      // Aggiorna header e colori
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

      // Aggiorna indizi per la nuova stanza
      aggiornaBadgeIndizi();
      renderizzaBoxIndizi(stanzaData);

      if (sonoGuida) {
        disegnaVistaGuida(stanzaData);
      } else {
        disegnaVistaOperatore(stanzaData);
      }
    }

    // VISTA GUIDA 👁️ (Terminale con Menu a Tendina)
    function disegnaVistaGuida(stanzaData) {
      const opzioniMenu = stanzaData.menuGuida || [];

      elVistaArea.innerHTML = `
        <div style="text-align:center; margin-bottom:10px;">
          <div style="font-size:2rem; filter:drop-shadow(0 0 10px ${stanzaData.coloreTema});">${stanzaData.icona}</div>
          <h3 style="margin:2px 0; color:${stanzaData.coloreTema}; font-size:1.1rem;">📖 Manuale Tecnico di Decifrazione</h3>
          <span style="font-size:0.8rem; color:#94a3b8;">Ascolta con attenzione cosa ti descrive a voce il tuo Operatore!</span>
        </div>

        <!-- Menu a Tendina Protocolli -->
        <div style="background:rgba(15,23,42,0.85); padding:12px; border-radius:12px; border:1px solid ${stanzaData.coloreTema}; margin-bottom:12px;">
          <label for="esc-select-manuale" style="display:block; font-size:0.84rem; font-weight:bold; color:${stanzaData.coloreTema}; margin-bottom:6px;">
            🔍 Seleziona ciò che l'Operatore ti descrive a voce:
          </label>
          <select id="esc-select-manuale" style="width:100%; padding:10px 12px; background:#0b1329; color:#f8fafc; border:1px solid rgba(255,255,255,0.25); border-radius:8px; font-size:0.9rem; font-weight:600; outline:none; cursor:pointer;">
            <option value="" disabled selected>👉 Scegli dal menu in base a cosa vede l'altro...</option>
            ${opzioniMenu.map(opt => `
              <option value="${opt.valore}">${opt.titolo}</option>
            `).join("")}
          </select>
        </div>

        <!-- Contenuto dinamico del protocollo selezionato -->
        <div id="esc-scheda-protocollo" style="min-height:110px; background:rgba(0,0,0,0.35); border-radius:12px; padding:12px; border:1px dashed rgba(255,255,255,0.15);">
          <div style="text-align:center; color:#94a3b8; font-size:0.86rem; padding:20px 0;">
            🗣️ Chiedi al tuo compagno Operatore: <i>"Cosa vedi sul tuo schermo?"</i><br>
            Poi seleziona la sezione corrispondente nel menu a tendina sopra!
          </div>
        </div>
      `;

      const selectManuale = api.arena.querySelector("#esc-select-manuale");
      const schedaProtocollo = api.arena.querySelector("#esc-scheda-protocollo");

      selectManuale.onchange = () => {
        const val = selectManuale.value;
        menuSelezionato = val;
        const optTrovata = opzioniMenu.find(o => o.valore === val);
        if (optTrovata) {
          if (window.Suoni) Suoni.playTick();
          schedaProtocollo.innerHTML = `
            <div style="margin-bottom:8px; font-weight:bold; color:${stanzaData.coloreTema}; font-size:0.95rem;">
              ${optTrovata.titolo}
            </div>
            ${optTrovata.contenuto}
          `;
          schedaProtocollo.style.border = `1px solid ${stanzaData.coloreTema}`;
        }
      };

      elRadioBanner.innerHTML = `🟢 <b>Collegamento vocale attivo</b>: guida il tuo Operatore!`;
    }

    // VISTA OPERATORE 🛠️ (Modulo Visivo + Comandi)
    function disegnaVistaOperatore(stanzaData) {
      let visualHtml = "";
      const d = stanzaData.datiOperatore;

      // Rendering elementi grafici per l'Operatore
      if (d.cifre) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:flex; justify-content:center; gap:8px;">
              ${d.cifre.map(n => `
                <div style="width:48px; height:54px; background:#02101e; border:2px solid ${stanzaData.coloreTema}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:bold; color:${stanzaData.coloreTema}; box-shadow:0 0 12px rgba(0,240,255,0.25);">
                  ${n}
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else if (d.scenaGlifi) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:flex; justify-content:center; gap:10px;">
              ${d.scenaGlifi.map((g, idx) => `
                <div style="width:52px; height:56px; background:#1e1503; border:2px solid ${stanzaData.coloreTema}; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(245,158,11,0.2);">
                  <span style="font-size:1.6rem;">${g}</span>
                  <span style="font-size:0.65rem; color:#94a3b8;">#${idx + 1}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else if (d.caviDati) {
        visualHtml = `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; text-align:center; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:flex; flex-direction:column; gap:6px; max-width:320px; margin:0 auto;">
              ${d.caviDati.map(c => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; background:rgba(0,0,0,0.4); border-left:5px solid ${c.hex}; border-radius:6px; font-size:0.88rem; font-weight:bold;">
                  <span>${c.nome}</span>
                  <span style="color:${c.hex}; font-size:0.8rem;">ATTIVO ⚡</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else if (d.ampolle) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; max-width:340px; margin:0 auto;">
              ${d.ampolle.map(a => `
                <div style="padding:8px; background:rgba(0,0,0,0.45); border:1px solid ${a.hex}; border-radius:8px; text-align:center;">
                  <div style="font-size:0.92rem; font-weight:bold; color:${a.hex};">${a.nome}</div>
                  <div style="font-size:1.1rem; font-weight:bold; color:#f8fafc; margin-top:2px;">${a.ml} ml</div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else if (d.targa) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:inline-block; padding:10px 20px; background:#1e293b; border:2px dashed ${stanzaData.coloreTema}; border-radius:10px; font-size:1.25rem; font-weight:bold; color:#f1f5f9; letter-spacing:1px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
              ${d.targa}
            </div>
          </div>
        `;
      } else if (d.sensori) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:6px;">${d.descrizioneVisiva}</div>
            <div style="display:flex; justify-content:center; gap:8px;">
              ${d.sensori.map(s => `
                <div style="flex:1; max-width:110px; padding:8px 4px; background:rgba(2,16,30,0.85); border:1px solid ${stanzaData.coloreTema}; border-radius:8px;">
                  <div style="font-size:1.1rem;">${s.icon}</div>
                  <div style="font-size:0.72rem; color:#94a3b8;">${s.nome}</div>
                  <div style="font-size:1.05rem; font-weight:bold; color:#38bdf8;">${s.val}</div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else if (d.runaAttiva) {
        visualHtml = `
          <div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:4px;">${d.descrizioneVisiva}</div>
            <div style="display:inline-block; padding:10px 22px; background:rgba(16,185,129,0.12); border:2px solid #10b981; border-radius:12px; font-size:1.35rem; font-weight:bold; color:#10b981; box-shadow:0 0 16px rgba(16,185,129,0.3);">
              ${d.runaAttiva}
            </div>
          </div>
        `;
      }

      // Input Controls per l'Operatore
      let controlliHtml = "";

      if (stanzaData.tipoInput === "codice") {
        controlliHtml = `
          <div style="text-align:center; margin-bottom:8px;">
            <div style="font-size:0.85rem; color:#94a3b8;">Digita il codice di sblocco concordato con la Guida:</div>
            <div id="esc-codice-display" style="font-size:1.8rem; letter-spacing:8px; font-weight:bold; background:#000; padding:6px 16px; border-radius:8px; border:1px solid ${stanzaData.coloreTema}; margin:8px auto; width:fit-content; min-width:140px; color:${stanzaData.coloreTema};">
              _ _ _
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:270px; margin:0 auto;">
            ${stanzaData.opzioniKeypad.map(opt => `
              <button class="btn btn-ghost btn-tasto-codice" data-val="${opt}" style="font-size:1.3rem; padding:10px; font-weight:bold; border-radius:10px; border:1px solid rgba(255,255,255,0.2);">
                ${opt}
              </button>
            `).join("")}
          </div>
          <div style="text-align:center; margin-top:10px;">
            <button id="btn-canc-codice" class="btn btn-small btn-ghost" style="color:#ef4444; border-color:#ef4444; font-size:0.8rem;">⌫ Cancella Cifre</button>
          </div>
        `;
      } else if (stanzaData.tipoInput === "glifi") {
        controlliHtml = `
          <div style="text-align:center; margin-bottom:8px;">
            <div style="font-size:0.85rem; color:#94a3b8;">Tocca i 3 elementi nell'ordine dettato dalla Guida:</div>
            <div id="esc-glifi-display" style="font-size:1.5rem; letter-spacing:8px; min-height:40px; background:rgba(0,0,0,0.5); padding:4px 12px; border-radius:8px; border:1px solid ${stanzaData.coloreTema}; margin:6px auto; width:fit-content;">
              [ ? ? ? ]
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:280px; margin:0 auto;">
            ${stanzaData.glifiDisponibili.map(g => `
              <button class="btn btn-ghost btn-glifo" data-val="${g}" style="font-size:1.8rem; padding:8px; border-radius:10px; border:1px solid rgba(255,255,255,0.25);">
                ${g}
              </button>
            `).join("")}
          </div>
          <div style="text-align:center; margin-top:10px;">
            <button id="btn-canc-glifi" class="btn btn-small btn-ghost" style="color:#ef4444; border-color:#ef4444; font-size:0.8rem;">⌫ Resetta Sequenza</button>
          </div>
        `;
      } else if (stanzaData.tipoInput === "cavi") {
        controlliHtml = `
          <div style="text-align:center; margin-bottom:8px;">
            <div style="font-size:0.85rem; color:#94a3b8;">Taglia i 3 cavi corretti nell'ordine indicato dalla Guida:</div>
            <div id="esc-cavi-display" style="font-size:0.85rem; font-weight:bold; color:${stanzaData.coloreTema}; margin:4px 0;">
              Cavi tagliati: 0/3
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; max-width:320px; margin:0 auto;">
            ${stanzaData.datiOperatore.caviDati.map(c => `
              <button class="btn btn-ghost btn-cavo" data-id="${c.id}" style="display:flex; justify-content:space-between; align-items:center; padding:8px 14px; border-radius:8px; border:2px solid ${c.hex}; font-weight:bold; font-size:0.92rem;">
                <span>${c.nome}</span>
                <span class="stato-cavo" style="color:#10b981;">ATTIVO ⚡</span>
              </button>
            `).join("")}
          </div>
        `;
      } else if (stanzaData.tipoInput === "ampolle") {
        controlliHtml = `
          <div style="text-align:center; margin-bottom:8px;">
            <div style="font-size:0.85rem; color:#94a3b8;">Versa 3 ampolle nel calderone secondo le indicazioni della Guida:</div>
            <div id="esc-ampolle-display" style="font-size:0.95rem; font-weight:bold; color:${stanzaData.coloreTema}; margin:4px 0;">
              Versate: [ ]
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; max-width:320px; margin:0 auto;">
            ${stanzaData.datiOperatore.ampolle.map(a => `
              <button class="btn btn-ghost btn-ampolla" data-id="${a.id}" style="padding:10px 8px; border:2px solid ${a.hex}; border-radius:8px; font-weight:bold; font-size:0.88rem; color:${a.hex};">
                ${a.nome}
              </button>
            `).join("")}
          </div>
          <div style="text-align:center; margin-top:10px;">
            <button id="btn-canc-ampolle" class="btn btn-small btn-ghost" style="color:#ef4444; border-color:#ef4444; font-size:0.8rem;">⌫ Svuota Calderone</button>
          </div>
        `;
      }

      elVistaArea.innerHTML = `
        <div style="text-align:center; margin-bottom:10px;">
          <h3 style="margin:2px 0; color:${stanzaData.coloreTema}; font-size:1.1rem;">💻 ${stanzaData.datiOperatore.titoloModulo}</h3>
          <span style="font-size:0.8rem; color:#facc15; font-weight:600;">🗣️ Descrivi alla tua Guida cosa vedi a schermo!</span>
        </div>
        ${visualHtml}
        ${controlliHtml}
      `;

      agganciaComandiOperatore(stanzaData);
      elRadioBanner.innerHTML = `⏳ Spiega a voce alla Guida gli elementi visivi!`;
    }

    // Listener interazioni Operatore
    function agganciaComandiOperatore(stanzaData) {
      if (stanzaData.tipoInput === "codice") {
        const display = api.arena.querySelector("#esc-codice-display");
        const btnCanc = api.arena.querySelector("#btn-canc-codice");

        api.arena.querySelectorAll(".btn-tasto-codice").forEach(b => {
          b.onclick = () => {
            if (concluso || inputCorrente.length >= 3) return;
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(b.dataset.val);
            display.textContent = inputCorrente.join(" ") + " _".repeat(Math.max(0, 3 - inputCorrente.length));

            if (inputCorrente.length === 3) {
              validaSoluzione(inputCorrente.join(""), stanzaData.soluzione, stanzaData);
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
      } else if (stanzaData.tipoInput === "glifi") {
        const display = api.arena.querySelector("#esc-glifi-display");
        const btnCanc = api.arena.querySelector("#btn-canc-glifi");

        api.arena.querySelectorAll(".btn-glifo").forEach(b => {
          b.onclick = () => {
            if (concluso || inputCorrente.length >= 3) return;
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(b.dataset.val);
            display.textContent = inputCorrente.join(" ");

            if (inputCorrente.length === 3) {
              const solGiusta = Array.isArray(stanzaData.soluzione) ? stanzaData.soluzione.join("") : stanzaData.soluzione;
              validaSoluzione(inputCorrente.join(""), solGiusta, stanzaData);
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
      } else if (stanzaData.tipoInput === "cavi") {
        const display = api.arena.querySelector("#esc-cavi-display");
        api.arena.querySelectorAll(".btn-cavo").forEach(b => {
          b.onclick = () => {
            if (concluso || b.disabled) return;
            const cavoId = b.dataset.id;
            b.disabled = true;
            b.style.opacity = "0.35";
            b.querySelector(".stato-cavo").textContent = "TAGLIATO ✂️";
            b.querySelector(".stato-cavo").style.color = "#ef4444";
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(cavoId);
            if (display) display.textContent = `Cavi tagliati: ${inputCorrente.length}/3`;

            if (inputCorrente.length === 3) {
              validaSoluzione(inputCorrente.join(","), stanzaData.soluzione.join(","), stanzaData);
            }
          };
        });
      } else if (stanzaData.tipoInput === "ampolle") {
        const display = api.arena.querySelector("#esc-ampolle-display");
        const btnCanc = api.arena.querySelector("#btn-canc-ampolle");

        api.arena.querySelectorAll(".btn-ampolla").forEach(b => {
          b.onclick = () => {
            if (concluso || inputCorrente.length >= 3) return;
            if (window.Suoni) Suoni.playTick();
            inputCorrente.push(b.dataset.id);
            b.disabled = true;
            b.style.opacity = "0.4";

            const ampolleDati = stanzaData.datiOperatore.ampolle;
            const nomiScelti = inputCorrente.map(id => ampolleDati.find(a => a.id === id).nome);
            display.textContent = `Versate: [ ${nomiScelti.join(", ")} ]`;

            if (inputCorrente.length === 3) {
              validaSoluzione(inputCorrente.join(","), stanzaData.soluzione.join(","), stanzaData);
            }
          };
        });

        if (btnCanc) {
          btnCanc.onclick = () => {
            inputCorrente = [];
            display.textContent = "Versate: [ ]";
            api.arena.querySelectorAll(".btn-ampolla").forEach(b => {
              b.disabled = false;
              b.style.opacity = "1";
            });
            if (window.Suoni) Suoni.playTick();
          };
        }
      }
    }

    // Verifica la soluzione inserita
    function validaSoluzione(dataUtente, dataSoluzione, stanzaData) {
      if (concluso) return;

      if (dataUtente === dataSoluzione) {
        // Enigma superato!
        if (window.Suoni && Suoni.playDing) Suoni.playDing();
        if (window.Vibrazione) Vibrazione.successo();
        elRadioBanner.innerHTML = `✅ <b>STANZA SUPERATA!</b> Sblocco effettuato con successo!`;
        elRadioBanner.style.background = "rgba(16, 185, 129, 0.25)";

        // Sincronizza avanzamento con la squadra
        api.invia({ tipo: "stanzaSuperata", stanzaIdx: stanzaAttualeIdx });

        setTimeout(() => {
          stanzaAttualeIdx++;
          indiziUsati = 0; // resetta indizi per la nuova stanza
          elRadioBanner.style.background = "rgba(255,255,255,0.05)";
          disegnaStanza();
        }, 1200);
      } else {
        // Errore
        if (window.Suoni && Suoni.playSbagliato) Suoni.playSbagliato();
        if (window.Vibrazione) Vibrazione.errore();
        elRadioBanner.innerHTML = `❌ <b>ERRORE COMBINAZIONE!</b> Riconfrontati con la Guida!`;
        elRadioBanner.style.background = "rgba(239, 68, 68, 0.25)";

        setTimeout(() => {
          inputCorrente = [];
          elRadioBanner.style.background = "rgba(255,255,255,0.05)";
          disegnaStanza();
        }, 1100);
      }
    }

    // Fuga riuscita: tutte e 7 le stanze completate
    function trionfoFuga(notificaSquadra = true) {
      if (concluso) return;
      concluso = true;

      if (notificaSquadra) {
        api.invia({ tipo: "fugaRiuscita" });
      }

      elRadioBanner.innerHTML = `🎉 <b>FUGA TOTALE RIUSCITA! TUTTE LE 7 STANZE SUPERATE!</b>`;
      elVistaArea.innerHTML = `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:3.8rem; filter:drop-shadow(0 0 16px #10b981);">🏆</div>
          <h2 style="color:#10b981; margin:10px 0;">EVASI DALL'ESCAPE ROOM!</h2>
          <p style="color:#94a3b8; font-size:0.95rem;">Tutte e 7 le stanze completate con brillante coordinazione e logica!</p>
        </div>
      `;

      if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
      if (window.Vibrazione) Vibrazione.successo();

      setTimeout(() => {
        api.finito({
          punti: 500,
          dettaglio: "7/7 Stanze superate! 🗝️"
        });
      }, 2200);
    }

    // Avvio iniziale prima stanza
    disegnaStanza();

    return {
      messaggio(m, da) {
        if (!m || concluso) return;
        if (m.tipo === "fugaRiuscita") {
          trionfoFuga(false);
          return;
        }
        if (m.tipo === "stanzaSuperata") {
          stanzaAttualeIdx = m.stanzaIdx + 1;
          indiziUsati = 0;
          if (window.Suoni && Suoni.playDing) Suoni.playDing();
          elRadioBanner.innerHTML = `✅ Stanza superata dal team! Avanzamento...`;
          setTimeout(() => {
            disegnaStanza();
          }, 1000);
        } else if (m.tipo === "usaIndizio") {
          stanzaAttualeIdx = m.stanzaIdx;
          indiziUsati = m.livello;
          const stanzaData = configStanze[stanzaAttualeIdx];
          if (stanzaData) {
            aggiornaBadgeIndizi();
            renderizzaBoxIndizi(stanzaData);
            if (window.Suoni && Suoni.playDing) Suoni.playDing();
          }
        } else if (m.tipo === "resa") {
          concluso = true;
          mostraSchermataResa(m.stanzaIdx, m.soluzione);
        }
      },
      scaduto() {
        // Con senzaTempo: true non scade, ma preserviamo il fallback per sicurezza
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
