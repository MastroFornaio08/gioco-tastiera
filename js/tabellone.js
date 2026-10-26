/* Logica del Tabellone (Gioco dell'Oca) */

const OBIETTIVO_TABELLONE = 25;
const FACCE_DADO = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function disegnaTabellone() {
  const container = $("board-container");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i <= OBIETTIVO_TABELLONE; i++) {
    const isSpecialPlus = i === 5 || i === 15;
    const isSpecialMinus = i === 10 || i === 20;
    const isEnd = i === OBIETTIVO_TABELLONE;
    const isStart = i === 0;

    const tipo = isEnd ? "goal" : isStart ? "start" : isSpecialPlus ? "plus" : isSpecialMinus ? "minus" : "normal";
    const icona = isEnd ? "🏆" : isStart ? "🏁" : isSpecialPlus ? "↗" : isSpecialMinus ? "↙" : "";
    const label = isEnd ? "25" : isSpecialPlus ? "+2" : isSpecialMinus ? "−2" : String(i);

    container.insertAdjacentHTML("beforeend", `
      <div class="casella casella--${tipo}" id="casella-${i}" data-position="${i}">
        <span class="casella-step">${i === 0 ? "START" : i === OBIETTIVO_TABELLONE ? "FINISH" : String(i).padStart(2, "0")}</span>
        <span class="casella-icon" aria-hidden="true">${icona}</span>
        <span class="casella-value">${label}</span>
        <div class="pedine-slot" id="slot-${i}"></div>
      </div>
    `);
  }
}

function aggiornaPedine() {
  for (let i = 0; i <= OBIETTIVO_TABELLONE; i++) {
    const slot = $("slot-" + i);
    const cell = $("casella-" + i);
    if (slot) slot.innerHTML = "";
    if (cell) cell.classList.remove("is-leading");
  }

  S.giocatori.forEach(g => {
    if (!g.online && S.ruolo !== "solo") return;
    let pos = S.posizioni[g.id] || 0;
    if (pos > OBIETTIVO_TABELLONE) pos = OBIETTIVO_TABELLONE;
    if (pos < 0) pos = 0;
    const slot = $("slot-" + pos);
    if (slot) {
      slot.insertAdjacentHTML("beforeend", `<span class="pedina-board" title="${fuggiHtml(g.nome)}">${g.avatar}</span>`);
    }
  });

  const maxPos = Math.max(...S.giocatori.map(g => (g.online || S.ruolo === "solo") ? (S.posizioni[g.id] || 0) : 0));
  const casella = $("casella-" + Math.min(maxPos, OBIETTIVO_TABELLONE));
  if (casella) casella.classList.add("is-leading");
}

function popolaSceltaGiochi() {
  const container = $("board-game-list");
  if (!container) return;
  container.innerHTML = "";

  const giochiValidi = GIOCHI.filter(g => !motivoBlocco(g));
  giochiValidi.forEach(g => {
    const btn = document.createElement("button");
    btn.className = "board-game-option";
    btn.innerHTML = `<span class="board-game-icon">${g.icona}</span><span class="board-game-name">${fuggiHtml(g.nome)}</span><span class="board-game-arrow" aria-hidden="true">→</span>`;
    btn.onclick = () => {
      container.querySelectorAll("button").forEach(b => b.disabled = true);
      $("board-status").textContent = "Caricamento gioco in corso...";
      if (S.ruolo === "host" || S.ruolo === "solo") {
        lanciaSfidaBoard(g.id);
      } else {
        Rete.invia("boardScegliGioco", { giocoId: g.id });
      }
    };
    container.appendChild(btn);
  });
}

function botSceglieGiocoBoard() {
  const status = $("board-status");
  const chooseArea = $("board-choose-area");
  if (chooseArea) chooseArea.style.display = "none";
  if (status) status.textContent = "👻 Fantasma sta scegliendo il prossimo minigioco...";

  setTimeout(() => {
    const sc = $("screen-board");
    if (!sc || !sc.classList.contains("is-active")) return;
    const giochiValidi = GIOCHI.filter(g => !motivoBlocco(g));
    if (giochiValidi.length > 0) {
      const scelto = giochiValidi[Math.floor(Math.random() * giochiValidi.length)];
      if (status) status.textContent = `👻 Fantasma ha scelto: ${scelto.nome}! Preparati...`;
      setTimeout(() => {
        const sc2 = $("screen-board");
        if (!sc2 || !sc2.classList.contains("is-active")) return;
        lanciaSfidaBoard(scelto.id);
      }, 1200);
    }
  }, 1500);
}

function entraInBoard() {
  mostra("screen-board");
  disegnaTabellone();
  aggiornaPedine();
  
  const diceArea = $("board-dice-area");
  const chooseArea = $("board-choose-area");
  const btnRoll = $("btn-roll-dice");
  const diceCube = $("board-dice-cube");
  const diceRes = $("board-dice-result");
  const status = $("board-status");
  
  if (diceArea) diceArea.style.display = "none";
  if (chooseArea) chooseArea.style.display = "none";
  
  // Fase 1: Lancio dei dadi da parte del vincitore della sfida
  if (S.boardVincitore) {
    if (diceArea) diceArea.style.display = "block";
    
    if (S.io === S.boardVincitore) {
      if (status) status.textContent = "🏆 Hai vinto la sfida! Lancia il dado per avanzare sul tabellone!";
      if (diceRes) diceRes.textContent = "Premi il pulsante o tocca il dado!";
      if (diceCube) {
        diceCube.textContent = "🎲";
        diceCube.style.cursor = "pointer";
        diceCube.onclick = avviaTiroDado;
      }
      if (btnRoll) {
        btnRoll.style.display = "inline-block";
        btnRoll.disabled = false;
        btnRoll.textContent = "🎲 Lancia il tuo Dado!";
        btnRoll.onclick = avviaTiroDado;
      }
    } else {
      if (status) status.textContent = `🎲 In attesa che ${nomeDi(S.boardVincitore)} lanci il dado...`;
      if (diceRes) diceRes.textContent = `Tocca a ${nomeDi(S.boardVincitore)} tirare`;
      if (diceCube) {
        diceCube.textContent = "🎲";
        diceCube.style.cursor = "default";
        diceCube.onclick = null;
      }
      if (btnRoll) btnRoll.style.display = "none";

      // Se siamo in solo e il vincitore è il fantasma: lancia automaticamente
      if (S.ruolo === "solo" && (S.boardVincitore === "gh" || S.boardVincitore === ID_FANTASMA)) {
        setTimeout(() => {
          const sc = $("screen-board");
          if (!sc || !sc.classList.contains("is-active") || S.boardVincitore !== "gh") return;
          const dado = Math.floor(Math.random() * 6) + 1;
          animaLancioBoard("gh", dado, S.boardUltimo);
        }, 1200);
      }
    }
  } 
  // Fase 2: Scelta del gioco (chi è arrivato ultimo nel minigioco sceglie la prossima sfida)
  else if (S.boardUltimo) {
    if (S.io === S.boardUltimo) {
      if (S.ruolo === "solo") {
        if (status) status.textContent = "🎯 Hai perso la sfida: scegli tu il prossimo minigioco per rimontare!";
      } else {
        if (status) status.textContent = "🎮 Hai perso la sfida precedente: tocca a te scegliere il prossimo gioco per rimontare!";
      }
      if (chooseArea) chooseArea.style.display = "block";
      popolaSceltaGiochi();
    } else {
      if (status) status.textContent = `⏳ In attesa che ${nomeDi(S.boardUltimo)} scelga il prossimo gioco...`;
      if (chooseArea) chooseArea.style.display = "none";

      // In modalità solo, se tocca al fantasma scegliere
      if (S.ruolo === "solo" && (S.boardUltimo === "gh" || S.boardUltimo === ID_FANTASMA)) {
        botSceglieGiocoBoard();
      }
    }
  } 
  // Avvio iniziale (prima del round 1)
  else {
    if (S.ruolo === "host" || S.ruolo === "solo") {
      if (status) status.textContent = "Tocca a te lanciare la prima sfida del tabellone!";
      if (chooseArea) chooseArea.style.display = "block";
      popolaSceltaGiochi();
    } else {
      if (status) status.textContent = "In attesa che l'host scelga la prima sfida...";
      if (chooseArea) chooseArea.style.display = "none";
    }
  }
}

// Avvio tiro dado (premuto da chi ha vinto)
function avviaTiroDado() {
  const btn = $("btn-roll-dice");
  if (btn && btn.disabled) return;
  if (btn) btn.disabled = true;
  
  const dado = Math.floor(Math.random() * 6) + 1;
  
  if (S.ruolo === "solo") {
    animaLancioBoard(S.io, dado, S.boardUltimo);
  } else if (S.ruolo === "host") {
    lanciaDadoBoardHost(dado);
  } else {
    // Ospite che ha vinto: invia all'host
    Rete.invia("boardDado", { dado: dado });
  }
}

// Host gestisce il tiro e sincronizza
function lanciaDadoBoardHost(dadoRicevuto) {
  let dado = dadoRicevuto || (Math.floor(Math.random() * 6) + 1);
  const malusId = window.Malus && window.Malus.estraiId(typeof S !== "undefined" ? S.malusNelRoundCorrente : null);
  if (malusId === "dado_lento") {
    dado = Math.min(dado, 3);
  }
  const tiratore = S.boardVincitore;
  const ultimo = S.boardUltimo;
  
  if (S.ruolo === "host") {
    Rete.invia("boardDadoAnim", {
      tiratoreId: tiratore,
      dado: dado,
      boardUltimo: ultimo
    });
  }
  animaLancioBoard(tiratore, dado, ultimo);
}

// Animazione del dado + movimento pedina sincronizzato
function animaLancioBoard(tiratoreId, dado, ultimoId) {
  const diceArea = $("board-dice-area");
  const btnRoll = $("btn-roll-dice");
  const chooseArea = $("board-choose-area");
  const cube = $("board-dice-cube");
  const res = $("board-dice-result");
  const status = $("board-status");
  
  if (diceArea) diceArea.style.display = "block";
  if (btnRoll) btnRoll.style.display = "none";
  if (chooseArea) chooseArea.style.display = "none";
  
  if (status) status.textContent = `🎲 ${nomeDi(tiratoreId)} sta lanciando il dado...`;
  if (res) res.textContent = "Il dado sta rotolando...";
  
  let rotolii = 0;
  const timerRotola = setInterval(() => {
    rotolii++;
    const facciaRandom = Math.floor(Math.random() * 6);
    if (cube) {
      cube.textContent = FACCE_DADO[facciaRandom];
      cube.style.transform = `rotate(${(rotolii % 4) * 20 - 20}deg) scale(1.25)`;
    }
    if (window.Suoni && rotolii % 2 === 0) Suoni.playTick();
    
    if (rotolii >= 12) {
      clearInterval(timerRotola);
      if (cube) {
        cube.textContent = FACCE_DADO[dado - 1];
        cube.style.transform = "rotate(0deg) scale(1)";
      }
      if (window.Suoni) Suoni.playDing();
      if (window.Vibrazione) Vibrazione.successo();
      
      const testoRis = tiratoreId === S.io 
        ? `🎲 Hai fatto ${dado}!` 
        : `🎲 ${nomeDi(tiratoreId)} ha fatto ${dado}!`;
      if (res) res.textContent = testoRis;
      if (status) status.textContent = testoRis;
      
      // Inizia a muovere la pedina dopo una breve pausa
      setTimeout(() => {
        muoviPedinaPassoPasso(tiratoreId, dado, ultimoId);
      }, 700);
    }
  }, 75);
}

// Movimento passo per passo lungo il tabellone
function muoviPedinaPassoPasso(tiratoreId, dado, ultimoId) {
  let posAttuale = S.posizioni[tiratoreId] || 0;
  let passiRimasti = dado;
  
  const timerPasso = setInterval(() => {
    if (passiRimasti > 0 && posAttuale < OBIETTIVO_TABELLONE) {
      posAttuale++;
      passiRimasti--;
      S.posizioni[tiratoreId] = posAttuale;
      aggiornaPedine();
      if (window.Suoni) Suoni.playTick();
    } else {
      clearInterval(timerPasso);
      verificaCasellaSpeciale(tiratoreId, posAttuale, dado, ultimoId);
    }
  }, 260);
}

// Controllo caselle speciali (Oca +2 o Scivolo -2)
function verificaCasellaSpeciale(tiratoreId, pos, dado, ultimoId) {
  const status = $("board-status");
  const res = $("board-dice-result");
  
  if (pos === 5 || pos === 15) {
    if (res) res.innerHTML = "🪿 <b>Casella Oca!</b> Salto bonus di +2 caselle!";
    if (status) status.innerHTML = `✨ <b>${nomeDi(tiratoreId)}</b> è sull'Oca: +2 caselle bonus!`;
    if (window.Suoni) Suoni.playDing();
    
    setTimeout(() => {
      let passiBonus = 2;
      const timerBonus = setInterval(() => {
        if (passiBonus > 0 && pos < OBIETTIVO_TABELLONE) {
          pos++;
          passiBonus--;
          S.posizioni[tiratoreId] = pos;
          aggiornaPedine();
          if (window.Suoni) Suoni.playTick();
        } else {
          clearInterval(timerBonus);
          concludiTurnoBoard(tiratoreId, pos, dado, ultimoId);
        }
      }, 260);
    }, 700);
    return;
  }
  
  if (pos === 10 || pos === 20) {
    if (res) res.innerHTML = "🍌 <b>Scivolo!</b> Scivoli indietro di 2 caselle!";
    if (status) status.innerHTML = `💥 <b>${nomeDi(tiratoreId)}</b> scivola indietro di 2 caselle!`;
    if (window.Suoni) Suoni.playSbagliato && Suoni.playSbagliato();
    
    setTimeout(() => {
      let passiMalus = 2;
      const timerMalus = setInterval(() => {
        if (passiMalus > 0 && pos > 0) {
          pos--;
          passiMalus--;
          S.posizioni[tiratoreId] = pos;
          aggiornaPedine();
          if (window.Suoni) Suoni.playTick();
        } else {
          clearInterval(timerMalus);
          concludiTurnoBoard(tiratoreId, pos, dado, ultimoId);
        }
      }, 260);
    }, 700);
    return;
  }
  
  concludiTurnoBoard(tiratoreId, pos, dado, ultimoId);
}

// Conclusione del lancio del dado e transizione chiara alla scelta del gioco
function concludiTurnoBoard(tiratoreId, posFinale, dado, ultimoId) {
  const status = $("board-status");
  const res = $("board-dice-result");
  
  // Vittoria sul tabellone?
  if (posFinale >= OBIETTIVO_TABELLONE) {
    S.posizioni[tiratoreId] = OBIETTIVO_TABELLONE;
    aggiornaPedine();
    if (tiratoreId === S.io && window.Trofei) Trofei.sblocca("re_oca");
    if (status) status.textContent = `🏆 ${nomeDi(tiratoreId)} ha raggiunto il TRAGUARDO e VINCE LA PARTITA!`;
    if (res) res.textContent = "VITTORIA!";
    if (S.ruolo === "host") Rete.invia("finale", {});
    setTimeout(() => mostraFinale(), 2000);
    return;
  }
  
  if (status) status.textContent = `🎲 Risultato: ${nomeDi(tiratoreId)} ha tirato un ${dado} ed è alla casella ${posFinale}.`;
  
  if (S.ruolo === "host") {
    Rete.invia("partita", {
      boardInit: true,
      posizioni: S.posizioni,
      boardVincitore: null,
      boardUltimo: ultimoId,
      giocatori: elencoDaSpedire()
    });
  }
  
  // Pausa chiara di 2.2 secondi per vedere la mossa prima di passare alla scelta
  setTimeout(() => {
    S.boardVincitore = null;
    S.boardUltimo = ultimoId;
    
    const diceArea = $("board-dice-area");
    const chooseArea = $("board-choose-area");
    if (diceArea) diceArea.style.display = "none";
    
    if (S.ruolo === "solo") {
      if (ultimoId === "gh" || ultimoId === ID_FANTASMA) {
        botSceglieGiocoBoard();
      } else {
        if (status) status.textContent = `🎯 Sei alla casella ${posFinale}! Scegli il prossimo gioco per continuare:`;
        if (chooseArea) chooseArea.style.display = "block";
        popolaSceltaGiochi();
      }
    } else {
      if (S.io === S.boardUltimo) {
        if (status) status.textContent = `🎮 Hai perso la sfida precedente: scegli il prossimo gioco per recuperare!`;
        if (chooseArea) chooseArea.style.display = "block";
        popolaSceltaGiochi();
      } else {
        if (status) status.textContent = `⏳ In attesa che ${nomeDi(S.boardUltimo)} scelga il prossimo gioco...`;
        if (chooseArea) chooseArea.style.display = "none";
      }
    }
  }, 2200);
}

// Eseguito dall'host al termine di un minigioco
function preparaTurnoBoard() {
  const classifica = attivi().slice().sort((a, b) => {
    const pa = (S.esiti[a.id] || {}).punti || 0;
    const pb = (S.esiti[b.id] || {}).punti || 0;
    return pb - pa;
  });
  
  if (classifica.length > 0 && ((S.esiti[classifica[0].id] || {}).punti > 0 || S.ruolo === "solo")) {
    S.boardVincitore = classifica[0].id;
  } else {
    S.boardVincitore = null;
  }
  
  // Chi perde il minigioco sceglie il prossimo gioco
  if (classifica.length > 1) {
    S.boardUltimo = classifica[classifica.length - 1].id;
  } else if (classifica.length === 1) {
    S.boardUltimo = classifica[0].id;
  } else {
    S.boardUltimo = null;
  }
}
