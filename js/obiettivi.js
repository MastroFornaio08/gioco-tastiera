/* 🏆 Sistema Trofei & Obiettivi (Achievements) */

const OBIETTIVI = [
  {
    id: "dita_fuoco",
    nome: "Dita di Fuoco",
    icona: "🏎️",
    desc: "Supera 65 WPM nel gioco di Dattilografia"
  },
  {
    id: "riflessi_lampo",
    nome: "Riflessi Lampo",
    icona: "⚡",
    desc: "Reagisci in meno di 250 millisecondi a Riflessi o Cronometro"
  },
  {
    id: "cervellone",
    nome: "Cervellone",
    icona: "🧠",
    desc: "Fai più di 500 punti a Calcolo Mentale"
  },
  {
    id: "cecchino",
    nome: "Occhio di Falco",
    icona: "🎯",
    desc: "Fai più di 400 punti a Bersagli o Sniper"
  },
  {
    id: "cyborg_simon",
    nome: "Memoria Cyborg",
    icona: "🤖",
    desc: "Supera almeno il livello 6 a Simon Dice"
  },
  {
    id: "disinnescatore",
    nome: "Artificiere EOD",
    icona: "💣",
    desc: "Sopravvivi al round della Bomba senza farla esplodere"
  },
  {
    id: "re_oca",
    nome: "Re del Tabellone",
    icona: "👑",
    desc: "Trionfa sul Tabellone del Gioco dell'Oca"
  },
  {
    id: "campione_torneo",
    nome: "Campione del Torneo",
    icona: "🏆",
    desc: "Conquista la vittoria finale in un Torneo"
  },
  {
    id: "vita_party",
    nome: "Vita da Party",
    icona: "🥳",
    desc: "Completa almeno 10 partite o sfide"
  },
  {
    id: "socialite",
    nome: "Spirito di Gruppo",
    icona: "💬",
    desc: "Invia almeno 5 reazioni o frasi rapide in partita"
  },
  {
    id: "maestro_tris",
    nome: "Mente Strategica",
    icona: "❌",
    desc: "Vinci un duello a Tris"
  },
  {
    id: "stroop_master",
    nome: "Illusione Ottica",
    icona: "🎨",
    desc: "Totalizza oltre 450 punti nella sfida Stroop"
  }
];

const Trofei = {
  _chiave: "dd-badges",

  ottieniSbloccati() {
    try {
      return JSON.parse(localStorage.getItem(this._chiave) || "{}");
    } catch (e) {
      return {};
    }
  },

  sblocca(id) {
    const ob = OBIETTIVI.find(o => o.id === id);
    if (!ob) return;

    const sbloccati = this.ottieniSbloccati();
    if (sbloccati[id]) return; // già sbloccato

    sbloccati[id] = { data: new Date().toLocaleDateString("it-IT") };
    try {
      localStorage.setItem(this._chiave, JSON.stringify(sbloccati));
    } catch (e) {}

    // Suono ed effetto
    if (window.Suoni && Suoni.playAchievement) Suoni.playAchievement();
    if (window.Vibrazione) Vibrazione.successo();

    this.mostraNotifica(ob);
  },

  mostraNotifica(ob) {
    let container = document.getElementById("achievement-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "achievement-toast-container";
      container.className = "achievement-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div class="ach-icon">${ob.icona}</div>
      <div class="ach-body">
        <div class="ach-badge-tag">🏆 OBIETTIVO SBLOCCATO!</div>
        <div class="ach-title">${ob.nome}</div>
        <div class="ach-desc">${ob.desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("is-visible"), 50);

    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, 4500);
  },

  incrementaContatore(chiave, target, badgeId) {
    try {
      const stats = JSON.parse(localStorage.getItem("dd-stats") || "{}");
      stats[chiave] = (stats[chiave] || 0) + 1;
      localStorage.setItem("dd-stats", JSON.stringify(stats));
      if (stats[chiave] >= target) {
        this.sblocca(badgeId);
      }
    } catch (e) {}
  },

  renderLista(containerEl) {
    if (!containerEl) return;
    const sbloccati = this.ottieniSbloccati();
    const totale = OBIETTIVI.length;
    const ottenuti = Object.keys(sbloccati).length;

    let html = `
      <div class="trofei-header">
        <div class="trofei-progress-text">Progresso Trofei: <b>${ottenuti} / ${totale}</b></div>
        <div class="trofei-bar-wrap">
          <div class="trofei-bar-fill" style="width: ${Math.round((ottenuti / totale) * 100)}%"></div>
        </div>
      </div>
      <div class="trofei-grid">
    `;

    html += OBIETTIVI.map(ob => {
      const isSbloccato = !!sbloccati[ob.id];
      const dataSblocco = isSbloccato ? sbloccati[ob.id].data : "";
      return `
        <div class="trofeo-card ${isSbloccato ? 'sbloccato' : 'bloccato'}">
          <div class="trofeo-icona">${ob.icona}</div>
          <div class="trofeo-info">
            <div class="trofeo-nome">${ob.nome}</div>
            <div class="trofeo-desc">${ob.desc}</div>
            ${isSbloccato ? `<div class="trofeo-data">Sbloccato il ${dataSblocco}</div>` : `<div class="trofeo-data bloccato-testo">🔒 Da sbloccare</div>`}
          </div>
        </div>
      `;
    }).join("");

    html += `</div>`;
    containerEl.innerHTML = html;
  }
};

if (typeof window !== "undefined") {
  window.Trofei = Trofei;
  window.OBIETTIVI = OBIETTIVI;
} else if (typeof global !== "undefined") {
  global.Trofei = Trofei;
  global.OBIETTIVI = OBIETTIVI;
}

