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
    if (codice.length < 4) { stato("join-status", "Il codice ha 4 caratteri.", "err"); return; }
    S.nome = nomeScelto();
    S.avatar = avatarScelto();
    S.ruolo = "ospite";
    stato("join-status", "Connessione in corso…");
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

(function avvio() {
  collegaInterfaccia();
  collegaRete();

  // Avatar selector
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach(btn => {
    btn.onclick = () => {
      avatarBtns.forEach(b => b.classList.remove("scelto"));
      btn.classList.add("scelto");
    };
  });

  // Theme toggle
  const btnTheme = $("btn-theme");
  if (btnTheme) {
    btnTheme.onclick = () => {
      document.body.classList.toggle("dark-theme");
      try { localStorage.setItem("dd-theme", document.body.classList.contains("dark-theme") ? "dark" : "light"); } catch(e){}
    };
  }

  try {
    const salvato = localStorage.getItem("dd-nome");
    if (salvato) $("input-name").value = salvato;
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
    if (theme === "dark") document.body.classList.add("dark-theme");
  } catch (e) { /* navigazione privata */ }

  const codice = new URLSearchParams(location.search).get("s");
  if (codice) {
    $("input-code").value = codice.toUpperCase().slice(0, 5);
    mostra("screen-join");
  }
})();
