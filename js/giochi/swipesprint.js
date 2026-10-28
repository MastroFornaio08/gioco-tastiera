/* 👉 Swipe Sprint — gioco touch: scorri nella direzione indicata. */
GIOCHI.push({
  id: "swipesprint",
  nome: "Swipe Sprint",
  icona: "👉",
  desc: "Scorri nella direzione giusta prima che cambi la freccia.",
  regole: [
    "Segui la freccia con uno swipe deciso.",
    "Completa 10 mosse senza sbagliare.",
    "Su PC puoi usare anche le frecce della tastiera."
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
    let chiuso = false;
    let start = null;
    api.suggerimento("Scorri nella direzione della freccia!");

    api.arena.innerHTML = `
      <div class="swipe-sprint">
        <div class="swipe-progress" id="swipe-progress">1 / ${mosse.length}</div>
        <div class="swipe-arrow" id="swipe-arrow">${simboli[mosse[0]]}</div>
        <p>Scorri qui con il dito</p>
      </div>
    `;

    const area = api.arena.querySelector(".swipe-sprint");
    const arrow = api.arena.querySelector("#swipe-arrow");
    const progress = api.arena.querySelector("#swipe-progress");

    function direzione(dx, dy) {
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
      return dy > 0 ? "down" : "up";
    }

    function registra(d) {
      if (chiuso || !d) return;
      if (d !== mosse[indice]) {
        arrow.classList.add("is-wrong");
        setTimeout(() => arrow.classList.remove("is-wrong"), 180);
        return;
      }
      indice++;
      api.avanzo(indice / mosse.length);
      if (window.Suoni) Suoni.playClick();
      if (indice >= mosse.length) {
        chiuso = true;
        const tempo = api.tempo();
        arrow.textContent = "✓";
        const punti = Math.max(180, Math.round(1250 - tempo * 55));
        api.finito({ punti, dettaglio: "10 swipe", tempo });
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
        chiuso = true;
        api.finito({ punti: indice * 90, dettaglio: indice + " swipe" });
      },
      chiudi() {
        chiuso = true;
        document.removeEventListener("keydown", key);
      }
    };
  }
});
