/* Collegamento dei bottoni e avvio dell'applicazione.
   Caricato per ultimo, quando tutti i giochi si sono registrati in GIOCHI. */

function nomeScelto() {
  const v = $("input-name").value.trim();
  const nome = v ? v.slice(0, 14) : "Giocatore";
  try { localStorage.setItem("dd-nome", nome); } catch (e) { /* navigazione privata */ }
  return nome;
}

function avatarScelto() {
  const btn = document.querySelector(".avatar-btn.scelto");
  const avatar = btn ? btn.textContent : "🦁";
  try { localStorage.setItem("dd-avatar", avatar); } catch (e) {}
  return avatar;
}

function copia(testo, conferma) {
  const ok = () => toast(conferma);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(testo).then(ok, () => toast("Copia non riuscita."));
  } else {
    const t = document.createElement("textarea");
    t.value = testo;
    document.body.appendChild(t);
    t.select();
    try { document.execCommand("copy"); ok(); } catch (e) { toast("Copia non riuscita."); }
    document.body.removeChild(t);
  }
}

function collegaInterfaccia() {
  $("btn-create").onclick = () => {
    S.nome = nomeScelto();
    S.avatar = avatarScelto();
    S.ruolo = "host";
    $("room-code").textContent = "·····";
    stato("host-status", "Creazione della stanza…");
    mostra("screen-host");
    Rete.creaStanza();
  };

  $("btn-join-screen").onclick = () => {
    S.nome = nomeScelto();
    stato("join-status", "");
    mostra("screen-join");
    $("input-code").focus();
  };

  $("btn-join").onclick = () => {
    const codice = $("input-code").value.trim().toUpperCase();
    if (codice.length < 4) { stato("join-status", "Il codice della stanza ha 4 caratteri.", "err"); return; }
    if ($("input-name-join") && $("input-name-join").value.trim()) {
      $("input-name").value = $("input-name-join").value.trim();
    }
    S.nome = nomeScelto();
    S.avatar = avatarScelto();
    S.ruolo = "ospite";
    $("btn-join").disabled = true;
    stato("join-status", "🔄 Connessione alla stanza " + codice + "…");
    Rete.entraStanza(codice);
  };

  $("input-code").onkeydown = (e) => { if (e.key === "Enter") $("btn-join").click(); };

  $("btn-solo").onclick = () => {
    S.nome = nomeScelto();
    S.avatar = avatarScelto();
    S.ruolo = "solo";
    S.io = "p0";
    S.giocatori = [];
    aggiungiGiocatore("p0", S.nome, S.avatar);
    aggiungiGiocatore(ID_FANTASMA, "Fantasma", "👻");
    S.giocoId = null;
    S.gioco = null;
    entraInLobby();
  };

  $("btn-records").onclick = () => {
    mostra("screen-records");
    // Tab attiva di default: Record
    if ($("tab-btn-records")) $("tab-btn-records").click();

    let records = {};
    try { records = JSON.parse(localStorage.getItem("dd-records") || "{}"); } catch (e) {}
    const html = GIOCHI.filter(g => records[g.id]).sort((a,b) => records[b.id] - records[a.id]).map(g =>
      `<tr>
        <td style="font-size:1.5rem">${g.icona}</td>
        <td style="text-align:left"><b>${fuggiHtml(g.nome)}</b></td>
        <td class="punti">${records[g.id]} pt</td>
      </tr>`
    ).join("");
    $("records-table").innerHTML = html || "<tr><td colspan='3' class='muted'>Nessun record ancora registrato. Inizia a giocare!</td></tr>";
  };

  // Tabs della schermata Record & Trofei
  const tabBtnRecords = $("tab-btn-records");
  const tabBtnTrofei = $("tab-btn-trofei");
  const tabContentRecords = $("tab-content-records");
  const tabContentTrofei = $("tab-content-trofei");

  if (tabBtnRecords && tabBtnTrofei) {
    tabBtnRecords.onclick = () => {
      tabBtnRecords.style.background = "var(--primario)";
      tabBtnRecords.style.color = "#fff";
      tabBtnRecords.style.border = "none";

      tabBtnTrofei.style.background = "var(--bg-soft-2)";
      tabBtnTrofei.style.color = "var(--testo)";
      tabBtnTrofei.style.border = "2px solid var(--linea)";

      if (tabContentRecords) tabContentRecords.style.display = "block";
      if (tabContentTrofei) tabContentTrofei.style.display = "none";
      if (window.Suoni) Suoni.playClick();
    };

    tabBtnTrofei.onclick = () => {
      tabBtnTrofei.style.background = "var(--primario)";
      tabBtnTrofei.style.color = "#fff";
      tabBtnTrofei.style.border = "none";

      tabBtnRecords.style.background = "var(--bg-soft-2)";
      tabBtnRecords.style.color = "var(--testo)";
      tabBtnRecords.style.border = "2px solid var(--linea)";

      if (tabContentRecords) tabContentRecords.style.display = "none";
      if (tabContentTrofei) tabContentTrofei.style.display = "block";
      if (window.Trofei) Trofei.renderLista($("trofei-container"));
      if (window.Suoni) Suoni.playClick();
    };
  }

  // Filtri Categorie Lobby
  document.querySelectorAll(".lobby-filtri .filtro-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".lobby-filtri .filtro-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      categoriaAttiva = btn.dataset.cat || "tutti";
      disegnaGriglia();
      if (window.Suoni) Suoni.playClick();
    };
  });

  // Roulette casuale e Votazione party
  const btnRoulette = $("btn-roulette");
  if (btnRoulette) {
    btnRoulette.onclick = () => avviaRoulette();
  }
  const btnStartVote = $("btn-start-vote");
  if (btnStartVote) {
    btnStartVote.onclick = () => Votazione.avviaHost();
  }

  // Bottone Schermo Intero (Fullscreen)
  const btnFs = $("btn-fullscreen");
  if (btnFs) {
    btnFs.onclick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        btnFs.textContent = "🗗";
      } else {
        document.exitFullscreen().catch(() => {});
        btnFs.textContent = "⛶";
      }
      if (window.Suoni) Suoni.playClick();
    };
    document.addEventListener("fullscreenchange", () => {
      btnFs.textContent = document.fullscreenElement ? "🗗" : "⛶";
    });
  }

  // dalla sala d'attesa si passa alla scelta del gioco quando l'host decide
  $("btn-host-start").onclick = () => entraInLobby();

  $("btn-copy-code").onclick = () => copia($("room-code").textContent, "Codice copiato!");

  $("btn-copy-link").onclick = () => {
    const url = location.origin + location.pathname + "?s=" + $("room-code").textContent;
    if (navigator.share) {
      navigator.share({
        title: "SfidaParty",
        text: "Entra nella mia stanza su SfidaParty! Clicca sul link per giocare con me:",
        url: url
      }).catch(err => {
        // Fallback se l'utente annulla o c'è un errore
        if (err.name !== 'AbortError') copia(url, "Link copiato!");
      });
    } else {
      // Fallback per browser desktop vecchi che non supportano Web Share API
      copia(url, "Link copiato!");
    }
  };

  document.querySelectorAll("[data-back]").forEach(b => { b.onclick = tornaAlMenu; });

  $("btn-start").onclick = () => { $("btn-start").disabled = true; avviaPartita(false); };
  
  $("btn-start-tournament").onclick = () => { $("btn-start-tournament").disabled = true; avviaPartita(true); };

  if($("btn-start-board")) $("btn-start-board").onclick = () => { $("btn-start-board").disabled = true; avviaPartita(false, true); };
  if($("btn-board-next")) $("btn-board-next").onclick = () => { $("btn-board-next").disabled = true; lanciaSfidaBoard(); };
  if($("btn-board-quit")) $("btn-board-quit").onclick = () => { tornaAlMenu(); };

  $("btn-next").onclick = () => { $("btn-next").disabled = true; avanza(); };

  $("btn-rematch").onclick = () => { avviaPartita(); };

  $("btn-change").onclick = () => {
    azzera();
    if (S.ruolo === "host") Rete.invia("lobby", {});
    entraInLobby();
  };

  if ($("btn-share")) {
    $("btn-share").onclick = () => {
      const classifica = S.giocatori.slice().sort((a, b) => b.punti - a.punti);
      const mia = classifica.findIndex(g => g.id === S.io);
      const testo = `🎉 Ho giocato a SfidaParty!\n🥇 Sono arrivato ${mia + 1}° con ${S.giocatori.find(g => g.id === S.io).punti} punti!\nProva a battermi!`;
      copia(testo, "Risultato copiato negli appunti!");
    };
  }

  $("btn-quit").onclick = tornaAlMenu;
  $("btn-quit-game").onclick = tornaAlMenu;
  
  // Suono ai click sui bottoni
  document.querySelectorAll(".btn, .riga-gioco").forEach(b => {
    b.addEventListener("mousedown", () => {
       if (window.Suoni) Suoni.playClick();
       if (window.Vibrazione) Vibrazione.click();
    });
  });
}

function inizializzaBotTesterUI() {
  const modal = $("modal-bot-tester");
  const btnOpenMenu = $("btn-bot-tester");
  const btnOpenLobby = $("btn-lobby-bot-tester");
  const btnClose = $("btn-bot-tester-close");
  const selectGioco = $("bot-tester-select-gioco");
  const selectBot = $("bot-tester-select-bot");
  const selectModo = $("bot-tester-select-modo");
  const btnRun = $("btn-bot-tester-run");
  const btnStop = $("btn-bot-tester-stop");
  const btnCopy = $("btn-bot-tester-copy");
  const tbody = $("bot-tester-tbody");
  const cntTot = $("bot-tester-cnt-tot");
  const cntPass = $("bot-tester-cnt-pass");
  const cntFail = $("bot-tester-cnt-fail");
  const statusTxt = $("bot-tester-status-txt");
  const progressBar = $("bot-tester-progress-bar");
  const visualArena = $("bot-tester-visual-arena");

  if (!modal || !window.BotTester) return;

  function popolaSelectGiochi() {
    if (!selectGioco) return;
    const currVal = selectGioco.value || "tutti";
    selectGioco.innerHTML = `<option value="tutti">🌟 Tutti i ${GIOCHI.length} Minigiochi</option>`;
    GIOCHI.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = `${g.icona || "🎮"} ${g.nome} (${g.id})`;
      selectGioco.appendChild(opt);
    });
    selectGioco.value = currVal;
  }

  function apriModal() {
    popolaSelectGiochi();
    modal.style.display = "flex";
    if (window.Suoni) Suoni.playClick();
  }

  function chiudiModal() {
    if (BotTester.inEsecuzione) BotTester.ferma();
    modal.style.display = "none";
  }

  if (btnOpenMenu) btnOpenMenu.onclick = apriModal;
  if (btnOpenLobby) btnOpenLobby.onclick = apriModal;
  if (btnClose) btnClose.onclick = chiudiModal;

  modal.onclick = (e) => {
    if (e.target === modal) chiudiModal();
  };

  BotTester.impostaListener((evt) => {
    if (evt.tipo === "inizio") {
      cntTot.textContent = evt.totale;
      cntPass.textContent = "0";
      cntFail.textContent = "0";
      statusTxt.textContent = `Avvio test su ${evt.totale} giochi...`;
      progressBar.style.width = "0%";
      tbody.innerHTML = "";
    } else if (evt.tipo === "giocoInizio") {
      statusTxt.textContent = `Test in corso: ${evt.nome}...`;
      const row = document.createElement("tr");
      row.id = `row-test-${evt.gioco}`;
      row.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
      row.innerHTML = `
        <td style="padding: 6px 4px;"><span style="color:#00f0ff;">⏳ In test...</span></td>
        <td style="padding: 6px 4px;"><b>${fuggiHtml(evt.nome)}</b></td>
        <td style="padding: 6px 4px; color: #94a3b8;">—</td>
        <td style="padding: 6px 4px; color: #94a3b8;">Simulazione bot in corso...</td>
      `;
      tbody.appendChild(row);
      if (typeof row.scrollIntoView === "function") {
        row.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else if (evt.tipo === "giocoFine") {
      const r = evt.risultato;
      const row = $(`row-test-${r.id}`);
      const passTot = BotTester.risultati.filter(x => x.pass).length;
      const failTot = BotTester.risultati.filter(x => !x.pass).length;
      cntPass.textContent = passTot;
      cntFail.textContent = failTot;

      const pct = Math.round(((evt.indice + 1) / parseInt(cntTot.textContent || 1, 10)) * 100);
      progressBar.style.width = `${pct}%`;

      if (row) {
        const bgBadge = r.pass 
          ? "background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;" 
          : "background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;";
        const badgeTxt = r.pass ? "✅ PASS" : "❌ FAIL";

        let esitoHtml = "";
        if (r.pass) {
          esitoHtml = `<span style="color:#cbd5e1; font-size:0.8rem;">${r.dettagliBot.join(", ")}</span>`;
        } else {
          esitoHtml = `<b style="color:#ef4444;">${fuggiHtml(r.errori.join(" | "))}</b>`;
        }
        if (r.avvisi && r.avvisi.length) {
          esitoHtml += `<br><small style="color:#f59e0b;">⚠️ ${fuggiHtml(r.avvisi.join(" | "))}</small>`;
        }

        row.innerHTML = `
          <td style="padding: 6px 4px;"><span style="display:inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; ${bgBadge}">${badgeTxt}</span></td>
          <td style="padding: 6px 4px;"><span>${r.icona}</span> <b>${fuggiHtml(r.nome)}</b></td>
          <td style="padding: 6px 4px; font-family: monospace; font-size: 0.8rem;">${r.tempoMs}ms</td>
          <td style="padding: 6px 4px;">${esitoHtml}</td>
        `;
      }
    } else if (evt.tipo === "completato") {
      const passTot = evt.risultati.filter(x => x.pass).length;
      const failTot = evt.risultati.filter(x => !x.pass).length;
      statusTxt.textContent = failTot === 0 
        ? `🎉 Perfetto! Tutti i ${passTot} giochi superati senza errori!` 
        : `⚠️ Completato: ${passTot} superati, ${failTot} con problemi.`;
      progressBar.style.width = "100%";
      btnRun.disabled = false;
      btnStop.style.display = "none";
      if (visualArena) visualArena.style.display = "none";
      if (failTot === 0) {
        if (window.Suoni && Suoni.playVittoria) Suoni.playVittoria();
        else if (window.Suoni) Suoni.playDing();
      } else {
        if (window.Suoni && Suoni.playSconfitta) Suoni.playSconfitta();
        else if (window.Suoni) Suoni.playBuzzer();
      }
    }
  });

  if (btnRun) {
    btnRun.onclick = async () => {
      const gId = selectGioco ? selectGioco.value : "tutti";
      const numB = parseInt(selectBot ? selectBot.value : "3", 10);
      const isVisuale = (selectModo ? selectModo.value : "veloce") === "visuale";

      btnRun.disabled = true;
      btnStop.style.display = "inline-block";
      if (isVisuale && visualArena) {
        visualArena.style.display = "block";
      } else if (visualArena) {
        visualArena.style.display = "none";
      }

      await BotTester.avvia({
        giocoId: gId,
        numBot: numB,
        visuale: isVisuale,
        arenaEl: visualArena
      });

      btnRun.disabled = false;
      btnStop.style.display = "none";
    };
  }

  if (btnStop) {
    btnStop.onclick = () => {
      BotTester.ferma();
      btnStop.style.display = "none";
      btnRun.disabled = false;
      statusTxt.textContent = "Test interrotto dall'utente.";
    };
  }

  if (btnCopy) {
    btnCopy.onclick = () => {
      const report = BotTester.generaReportTesto();
      copia(report, "Report dei bot copiato negli appunti!");
    };
  }
}

(function avvio() {
  collegaInterfaccia();
  collegaRete();
  inizializzaBotTesterUI();

  // Avatar selector
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach(btn => {
    btn.onclick = () => {
      avatarBtns.forEach(b => b.classList.remove("scelto"));
      btn.classList.add("scelto");
    };
  });

  // Theme toggle (Chiaro / Scuro)
  const btnTheme = $("btn-theme");
  function impostaTema(isLight) {
    if (isLight) {
      document.body.classList.add("light-theme");
      if (btnTheme) btnTheme.textContent = "☀️";
    } else {
      document.body.classList.remove("light-theme");
      if (btnTheme) btnTheme.textContent = "🌙";
    }
  }

  if (btnTheme) {
    btnTheme.onclick = () => {
      const isLight = !document.body.classList.contains("light-theme");
      impostaTema(isLight);
      try { localStorage.setItem("dd-theme", isLight ? "light" : "dark"); } catch(e){}
      if (window.Suoni) Suoni.playClick();
    };
  }

  try {
    const salvato = localStorage.getItem("dd-nome");
    if (salvato) {
      $("input-name").value = salvato;
      if ($("input-name-join")) $("input-name-join").value = salvato;
    }
    const avatar = localStorage.getItem("dd-avatar");
    if (avatar) {
      avatarBtns.forEach(b => {
        if(b.textContent === avatar) {
          avatarBtns.forEach(x => x.classList.remove("scelto"));
          b.classList.add("scelto");
        }
      });
    }
    const theme = localStorage.getItem("dd-theme");
    if (theme === "light") {
      impostaTema(true);
    } else {
      impostaTema(false);
    }
  } catch (e) { /* navigazione privata */ }

  const codice = new URLSearchParams(location.search).get("s");
  if (codice) {
    $("input-code").value = codice.toUpperCase().slice(0, 5);
    mostra("screen-join");
    if ($("input-name-join") && $("input-name").value) {
      $("input-name-join").value = $("input-name").value;
    }
    stato("join-status", "Premi 'Connetti' per entrare nella stanza " + codice.toUpperCase() + "!");
  }
})();
