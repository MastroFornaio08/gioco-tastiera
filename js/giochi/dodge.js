/* ☄️ Dodge — schiva gli asteroidi */

GIOCHI.push({
  id: "dodge",
  nome: "Schivata",
  icona: "☄️",
  desc: "Schiva gli asteroidi cadenti. Sopravvivi 30 secondi!",
  regole: [
    "Usa il mouse, il dito o le frecce per muovere la navicella in basso.",
    "Non farti colpire dagli asteroidi rossi.",
    "Più sopravvivi, più punti ottieni."
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
      punti: interoTra(150, 250),
      dettaglio: "Bot",
      tempo: 30
    };
  },

  crea(api) {
    api.suggerimento("Trascina la navicella a destra o sinistra per salvarti!");

    api.arena.innerHTML = `
      <div class="dodge-area" id="dodge-area">
        <div class="dodge-ship" id="dodge-ship">🚀</div>
      </div>
      <div class="dodge-score" id="dodge-score">0</div>
    `;

    const area = api.arena.querySelector("#dodge-area");
    const ship = api.arena.querySelector("#dodge-ship");
    const scoreEl = api.arena.querySelector("#dodge-score");

    let shipX = 50; // percentuale
    let punti = 0;
    let meteors = [];
    let concluso = false;
    let animFrame;
    let frames = 0;

    // Muovi nave col mouse o dito
    function moveShip(clientX) {
      if (concluso) return;
      const rect = area.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      x = Math.max(5, Math.min(95, x));
      shipX = x;
      ship.style.left = shipX + "%";
    }

    area.addEventListener("mousemove", (e) => moveShip(e.clientX));
    area.addEventListener("touchmove", (e) => {
      // e.preventDefault(); // potrebbe bloccare lo scroll globale
      moveShip(e.touches[0].clientX);
    }, {passive: true});

    // Supporto tastiera
    const keyListener = (e) => {
      if (concluso) return;
      if (e.key === "ArrowLeft") { shipX = Math.max(5, shipX - 10); ship.style.left = shipX + "%"; }
      if (e.key === "ArrowRight") { shipX = Math.min(95, shipX + 10); ship.style.left = shipX + "%"; }
    };
    document.addEventListener("keydown", keyListener);

    function spawnMeteor() {
      const el = document.createElement("div");
      el.className = "dodge-meteor";
      el.textContent = "☄️";
      
      const x = Math.random() * 90 + 5;
      el.style.left = x + "%";
      el.style.top = "-10%";
      
      area.appendChild(el);
      meteors.push({ el, x, y: -10, speed: Math.random() * 0.8 + 0.7 });
    }

    function checkCollision(mX, mY) {
      // ship è al 90% di top, larga e alta circa 10%
      const shipTop = 85;
      const shipBottom = 95;
      const shipLeft = shipX - 5;
      const shipRight = shipX + 5;

      const mTop = mY - 5;
      const mBottom = mY + 5;
      const mLeft = mX - 5;
      const mRight = mX + 5;

      // Semplice AABB
      if (mLeft < shipRight && mRight > shipLeft && mTop < shipBottom && mBottom > shipTop) {
        return true;
      }
      return false;
    }

    function loop() {
      if (concluso) return;
      frames++;

      // Più va avanti, più ne genera
      const spawnRate = Math.max(10, 40 - Math.floor(frames / 100));
      if (frames % spawnRate === 0) {
        spawnMeteor();
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        m.y += m.speed;
        m.el.style.top = m.y + "%";

        if (checkCollision(m.x, m.y)) {
          return schianto();
        }

        if (m.y > 110) {
          m.el.remove();
          meteors.splice(i, 1);
        }
      }

      // Punti salgono sopravvivendo
      if (frames % 6 === 0) {
        punti++;
        scoreEl.textContent = punti;
      }

      animFrame = requestAnimationFrame(loop);
    }

    function schianto() {
      if (concluso) return;
      concluso = true;
      cancelAnimationFrame(animFrame);
      ship.style.filter = "grayscale(100%) blur(2px)";
      ship.textContent = "💥";
      setTimeout(() => api.finito({ punti, dettaglio: punti + " punti" }), 1500);
    }

    // Parte dopo mezzo secondo per non fregare il giocatore
    setTimeout(() => {
      animFrame = requestAnimationFrame(loop);
    }, 500);

    return {
      scaduto: schianto,
      chiudi() { 
        concluso = true;
        cancelAnimationFrame(animFrame); 
        document.removeEventListener("keydown", keyListener);
      }
    };
  }
});
