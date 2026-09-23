/* 🐦 Flappy — salta tra i tubi! */

GIOCHI.push({
  id: "flappy",
  nome: "Flappy",
  icona: "🐦",
  desc: "Premi per saltare. Supera i tubi senza schiantarti.",
  regole: [
    "Premi sullo schermo o clicca per far saltare l'uccellino.",
    "Non toccare i tubi e non cadere a terra.",
    "Vince chi supera più tubi in 30 secondi (o fino allo schianto)!"
  ],
  gara: true,
  bonusPrimo: false,
  solo: true,
  durata: 30,

  generaPartita() {
    return { seed: Math.random() };
  },

  fantasma(dati) {
    return {
      punti: interoTra(3, 10),
      dettaglio: "Bot",
      tempo: 15
    };
  },

  crea(api) {
    api.suggerimento("Premi velocemente per restare in volo!");

    api.arena.innerHTML = `
      <div class="flappy-arena" id="flappy-arena">
        <div class="flappy-bird" id="flappy-bird">🐦</div>
      </div>
      <div class="flappy-punti" id="flappy-punti">0</div>
      <button class="btn btn-primary" id="flappy-jump-btn" style="margin-top: 10px; width: 100%;">SALTA!</button>
    `;

    const arena = api.arena.querySelector("#flappy-arena");
    const birdEl = api.arena.querySelector("#flappy-bird");
    const puntiEl = api.arena.querySelector("#flappy-punti");
    const jumpBtn = api.arena.querySelector("#flappy-jump-btn");

    let birdY = 50;
    let velocity = 0;
    const gravity = 0.5;
    const jumpForce = -7;
    
    let tubi = [];
    let punti = 0;
    let frames = 0;
    let concluso = false;
    let animFrame;

    function jump() {
      if (concluso) return;
      velocity = jumpForce;
    }

    // Supporto click su tutta l'arena e bottone
    arena.addEventListener("mousedown", jump);
    arena.addEventListener("touchstart", jump, {passive: true});
    jumpBtn.addEventListener("mousedown", jump);
    jumpBtn.addEventListener("touchstart", jump, {passive: true});

    function spawnTubo() {
      const gap = 35; // % di spazio verticale vuoto
      const minAltezza = 10;
      const maxAltezza = 100 - gap - minAltezza;
      
      const tuboSuH = Math.random() * (maxAltezza - minAltezza) + minAltezza;
      const tuboGiuH = 100 - tuboSuH - gap;

      const topTubo = document.createElement("div");
      topTubo.className = "flappy-tubo top";
      topTubo.style.height = tuboSuH + "%";
      topTubo.style.left = "100%";
      topTubo.dataset.passed = "false";

      const bottomTubo = document.createElement("div");
      bottomTubo.className = "flappy-tubo bottom";
      bottomTubo.style.height = tuboGiuH + "%";
      bottomTubo.style.left = "100%";

      arena.appendChild(topTubo);
      arena.appendChild(bottomTubo);

      tubi.push({ top: topTubo, bottom: bottomTubo, x: 100 });
    }

    function checkCollisions(tX) {
      // Selezioniamo il bounding box dell'uccellino (approssimato in percentuale per semplicità)
      // L'uccellino è al 20% della X, ed è largo circa il 10%
      const birdLeft = 20;
      const birdRight = 28;
      
      if (tX < birdRight && tX + 15 > birdLeft) { // 15 è la larghezza del tubo in %
        // collisione asse X, controlliamo asse Y
        // birdY è dal top (0 a 100)
        
        // Per ogni tubo nel set
        for (let t of tubi) {
          if (t.x === tX) {
            const hTop = parseFloat(t.top.style.height);
            const hBottom = parseFloat(t.bottom.style.height);
            // HTop è l'altezza dal top. HBottom è l'altezza dal bottom.
            if (birdY < hTop || birdY > (100 - hBottom)) {
              return true; // Schianto
            }
          }
        }
      }
      return false;
    }

    function loop() {
      if (concluso) return;

      frames++;
      velocity += gravity;
      birdY += velocity;

      // Limiti y
      if (birdY >= 95) { birdY = 95; schianto(); }
      if (birdY <= 0) { birdY = 0; velocity = 0; }

      birdEl.style.top = birdY + "%";

      // Ruota l'uccellino in base alla velocità
      birdEl.style.transform = \`rotate(\${Math.min(90, Math.max(-20, velocity * 4))}deg)\`;

      // Gestione tubi
      if (frames % 90 === 0) {
        spawnTubo();
      }

      for (let i = tubi.length - 1; i >= 0; i--) {
        let t = tubi[i];
        t.x -= 0.6; // Velocità scorrimento
        t.top.style.left = t.x + "%";
        t.bottom.style.left = t.x + "%";

        // Collisioni
        if (checkCollisions(t.x)) {
          schianto();
        }

        // Punteggio (quando supera il bird, che sta a ~20%)
        if (t.x < 15 && t.top.dataset.passed === "false") {
          t.top.dataset.passed = "true";
          punti++;
          puntiEl.textContent = punti;
          puntiEl.classList.add("pop");
          setTimeout(() => puntiEl.classList.remove("pop"), 200);
        }

        // Pulizia
        if (t.x < -20) {
          t.top.remove();
          t.bottom.remove();
          tubi.splice(i, 1);
        }
      }

      animFrame = requestAnimationFrame(loop);
    }

    function schianto() {
      if (concluso) return;
      concluso = true;
      cancelAnimationFrame(animFrame);
      birdEl.style.filter = "grayscale(100%)";
      jumpBtn.disabled = true;
      setTimeout(() => {
        api.finito({ punti, dettaglio: punti + " tubi" });
      }, 1500);
    }

    loop();

    return {
      scaduto: schianto,
      chiudi() { 
        concluso = true;
        cancelAnimationFrame(animFrame); 
      }
    };
  }
});
