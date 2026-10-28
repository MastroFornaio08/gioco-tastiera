/* 👉 Swipe Sprint — swipe con vite e combo consecutive. */
GIOCHI.push({
  id: "swipesprint",
  nome: "Swipe Sprint",
  icona: "👉",
  desc: "Segui le frecce, conserva le vite e crea combo consecutive.",
  regole: [
    "Segui la freccia con uno swipe deciso.",
    "Hai tre vite: ogni direzione sbagliata ne consuma una.",
    "Ogni tre swipe giusti di fila ottieni punti bonus."
  ],
  gara: true,
  solo: true,
  durata: 20,

  generaPartita() {
    const direzioni = ["up", "right", "down", "left"];
    const round = () => Array.from({ length: 10 }, () => direzioni[Math.floor(Math.random() * direzioni.length)]);
    return Array.from({ length: typeof MAX_ROUND !== "undefined" ? MAX_ROUND : 3 }, round);
  },

  fantasma() {
    const secondi = 8 + Math.random() * 4;
    return { punti: Math.round(980 - secondi * 50), dettaglio: "10 swipe", tempo: secondi };
  },

  crea(api) {
    const simboli = { up: "↑", right: "→", down: "↓", left: "←" };
    const mosse = Array.isArray(api.dati) ? api.dati : ["up","right","down","left","up","down","right","left","up","right"];
    let indice = 0;
    let vite = 3;
    let combo = 0;
    let bonus = 0;
    let chiuso = false;
    let start = null;
    api.suggerimento("Tre vite a disposizione: fai combo da tre swipe!");

    api.arena.innerHTML = `
      <div class="swipe-sprint">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;font-weight:800">
          <span id="swipe-progress">1 / ${mosse.length}</span>
          <span id="swipe-lives" aria-label="Tre vite">❤️❤️❤️</span>
        </div>
        <div style="margin-top:8px;font-weight:800;color:#ffb800" id="swipe-combo">COMBO 0 · BONUS 0</div>
        <div class="swipe-arrow" id="swipe-arrow">${simboli[mosse[0]]}</div>
        <p>Scorri qui con il dito</p>
      </div>
    `;

    const area = api.arena.querySelector(".swipe-sprint");
    const arrow = api.arena.querySelector("#swipe-arrow");
    const progress = api.arena.querySelector("#swipe-progress");
    const lives = api.arena.querySelector("#swipe-lives");
    const comboLabel = api.arena.querySelector("#swipe-combo");

    function chiudiPartita(punti, dettaglio) {
      if (chiuso) return;
      chiuso = true;
      document.removeEventListener("keydown", key);
      api.finito({ punti, dettaglio });
    }

    function direzione(dx, dy) {
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
      return dy > 0 ? "down" : "up";
    }

    function registra(d) {
      if (chiuso || !d) return;
      if (d !== mosse[indice]) {
        vite--;
        combo = 0;
        lives.textContent = "❤️".repeat(vite) + "🖤".repeat(3 - vite);
        lives.setAttribute("aria-label", vite + " vite rimaste");
        comboLabel.textContent = "COMBO 0 · BONUS " + bonus;
        arrow.classList.add("is-wrong");
        setTimeout(() => arrow.classList.remove("is-wrong"), 180);
        if (vite <= 0) {
          chiudiPartita(indice * 90 + bonus, indice + " swipe · " + bonus + " bonus · 0 vite");
        }
        return;
      }
      indice++;
      combo++;
      if (combo % 3 === 0) bonus += 90;
      api.avanzo(indice / mosse.length);
      if (window.Suoni) Suoni.playClick();
      comboLabel.textContent = "COMBO " + combo + " · BONUS " + bonus;
      if (indice >= mosse.length) {
        const tempo = api.tempo();
        arrow.textContent = "✓";
        const punti = Math.max(180, Math.round(1250 - tempo * 55) + bonus);
        chiudiPartita(punti, "10 swipe · " + bonus + " bonus");
        return;
      }
      arrow.textContent = simboli[mosse[indice]];
      progress.textContent = (indice + 1) + " / " + mosse.length;
    }

    const touchStart = e => { start = e.changedTouches[0]; };
    const touchEnd = e => {
      if (!start) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.clientX, dy = end.clientY - start.clientY;
      if (Math.hypot(dx, dy) > 28) registra(direzione(dx, dy));
      start = null;
    };
    const key = e => {
      const map = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left" };
      if (map[e.key]) { e.preventDefault(); registra(map[e.key]); }
    };

    area.addEventListener("touchstart", touchStart, { passive: true });
    area.addEventListener("touchend", touchEnd, { passive: true });
    document.addEventListener("keydown", key);

    return {
      scaduto() {
        if (chiuso) return;
        chiudiPartita(indice * 90 + bonus, indice + " swipe · " + bonus + " bonus");
      },
      chiudi() {
        chiuso = true;
        document.removeEventListener("keydown", key);
      }
    };
  }
});
