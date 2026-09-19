/* Collegamento dei bottoni e avvio dell'applicazione.
   Caricato per ultimo, quando tutti i giochi si sono registrati in GIOCHI. */

function nomeScelto() {
  const v = $("input-name").value.trim();
  const nome = v ? v.slice(0, 14) : "Giocatore";
  try { localStorage.setItem("dd-nome", nome); } catch (e) { /* navigazione privata */ }
  return nome;
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
    S.ruolo = "ospite";
    stato("join-status", "Connessione in corso…");
    Rete.entraStanza(codice);
  };

  $("input-code").onkeydown = (e) => { if (e.key === "Enter") $("btn-join").click(); };

  $("btn-solo").onclick = () => {
    S.nome = nomeScelto();
    S.ruolo = "solo";
    S.nomeAvv = "Fantasma";
    S.giocoId = null;
    S.gioco = null;
    entraInLobby();
  };

  $("btn-copy-code").onclick = () => copia($("room-code").textContent, "Codice copiato!");

  $("btn-copy-link").onclick = () => {
    const url = location.origin + location.pathname + "?s=" + $("room-code").textContent;
    copia(url, "Link copiato!");
  };

  document.querySelectorAll("[data-back]").forEach(b => { b.onclick = tornaAlMenu; });

  $("btn-start").onclick = () => { $("btn-start").disabled = true; avviaPartita(); };

  $("btn-next").onclick = () => { $("btn-next").disabled = true; avanza(); };

  $("btn-rematch").onclick = () => { avviaPartita(); };

  $("btn-change").onclick = () => {
    azzera();
    if (S.ruolo === "host") Rete.invia("lobby", {});
    entraInLobby();
  };

  $("btn-quit").onclick = tornaAlMenu;
  $("btn-quit-game").onclick = tornaAlMenu;
}

(function avvio() {
  collegaInterfaccia();
  collegaRete();

  try {
    const salvato = localStorage.getItem("dd-nome");
    if (salvato) $("input-name").value = salvato;
  } catch (e) { /* navigazione privata */ }

  const codice = new URLSearchParams(location.search).get("s");
  if (codice) {
    $("input-code").value = codice.toUpperCase().slice(0, 5);
    mostra("screen-join");
  }
})();
