/* 🐍 Snake — Il classico serpente arcade */

GIOCHI.push({
  id: "snake",
  nome: "Snake",
  icona: "🐍",
  desc: "Mangia le mele senza sbattere contro i muri o te stesso.",
  regole: [
    "Usa le frecce della tastiera oppure clicca/tocca i bordi dell'area per girare.",
    "Ogni mela ti fa crescere e ti dà punti.",
    "Se tocchi il bordo o te stesso, il gioco finisce.",
    "Hai 30 secondi (o fino alla morte)!"
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
      punti: interoTra(5, 15),
      dettaglio: "Bot",
      tempo: 15
    };
  },

  crea(api) {
    api.suggerimento("Tocca la parte superiore/inferiore/destra/sinistra dell'area per girare.");

    api.arena.innerHTML = `
      <div class="snake-board" id="snake-board"></div>
      <div class="snake-punteggio">Punti: <span id="snake-punti">0</span></div>
      
      <!-- Controlli a schermo touch trasparenti -->
      <div id="sn-up" class="sn-ctrl up"></div>
      <div id="sn-down" class="sn-ctrl down"></div>
      <div id="sn-left" class="sn-ctrl left"></div>
      <div id="sn-right" class="sn-ctrl right"></div>
    `;

    const board = api.arena.querySelector("#snake-board");
    const puntiEl = api.arena.querySelector("#snake-punti");
    
    // Dimensioni griglia
    const COLS = 15;
    const ROWS = 15;
    
    let snake = [{x: 7, y: 7}]; // Corpo del serpente
    let dir = {x: 0, y: -1}; // Direzione iniziale (su)
    let nextDir = {x: 0, y: -1}; // Direzione per il prossimo frame
    let food = spawnFood();
    let punti = 0;
    let concluso = false;
    let loopTimeout;

    // Crea celle DOM
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const div = document.createElement("div");
        div.className = "sn-cell";
        board.appendChild(div);
        cells.push(div);
      }
    }

    function getCell(x, y) {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
      return cells[y * COLS + x];
    }

    function spawnFood() {
      let x, y;
      while (true) {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        // Controlla che non sia sul serpente
        if (!snake.some(s => s.x === x && s.y === y)) break;
      }
      return {x, y};
    }

    function draw() {
      cells.forEach(c => c.className = "sn-cell");
      
      // Mela
      const fCell = getCell(food.x, food.y);
      if (fCell) fCell.classList.add("sn-food");

      // Serpente
      snake.forEach((s, i) => {
        const sCell = getCell(s.x, s.y);
        if (sCell) {
          sCell.classList.add("sn-body");
          if (i === 0) sCell.classList.add("sn-head");
        }
      });
    }

    function step() {
      if (concluso) return;

      dir = nextDir;
      const head = snake[0];
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Collisione muri
      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        return schianto();
      }
      // Collisione corpo
      if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        return schianto();
      }

      snake.unshift(newHead); // Aggiungi nuova testa

      // Mela mangiata
      if (newHead.x === food.x && newHead.y === food.y) {
        punti++;
        puntiEl.textContent = punti;
        food = spawnFood();
        // Aumenta la velocità!
      } else {
        snake.pop(); // Rimuovi coda se non ha mangiato
      }

      draw();
      
      // Velocità in base ai punti
      const speed = Math.max(80, 200 - (punti * 5));
      loopTimeout = setTimeout(step, speed);
    }

    function schianto() {
      concluso = true;
      board.classList.add("sn-dead");
      setTimeout(() => api.finito({ punti, dettaglio: punti + " mele" }), 1500);
    }

    // Input da tastiera
    const keyListener = (e) => {
      if (concluso) return;
      if (e.key === "ArrowUp" && dir.y === 0) nextDir = {x: 0, y: -1};
      if (e.key === "ArrowDown" && dir.y === 0) nextDir = {x: 0, y: 1};
      if (e.key === "ArrowLeft" && dir.x === 0) nextDir = {x: -1, y: 0};
      if (e.key === "ArrowRight" && dir.x === 0) nextDir = {x: 1, y: 0};
    };
    document.addEventListener("keydown", keyListener);

    // Input touch / mouse sui bordi
    const setDir = (dx, dy) => {
      if (concluso) return;
      if (dx !== 0 && dir.x === 0) nextDir = {x: dx, y: 0};
      if (dy !== 0 && dir.y === 0) nextDir = {x: 0, y: dy};
    };
    api.arena.querySelector("#sn-up").onmousedown = () => setDir(0, -1);
    api.arena.querySelector("#sn-down").onmousedown = () => setDir(0, 1);
    api.arena.querySelector("#sn-left").onmousedown = () => setDir(-1, 0);
    api.arena.querySelector("#sn-right").onmousedown = () => setDir(1, 0);
    
    // Supporto touch
    api.arena.querySelector("#sn-up").ontouchstart = () => setDir(0, -1);
    api.arena.querySelector("#sn-down").ontouchstart = () => setDir(0, 1);
    api.arena.querySelector("#sn-left").ontouchstart = () => setDir(-1, 0);
    api.arena.querySelector("#sn-right").ontouchstart = () => setDir(1, 0);

    draw();
    setTimeout(step, 500);

    return {
      scaduto: schianto,
      chiudi() { 
        concluso = true;
        clearTimeout(loopTimeout);
        document.removeEventListener("keydown", keyListener);
      }
    };
  }
});
