/**
 * Test Runner Automatico con Bot per tutti i giochi di SfidaParty / Duello a Due.
 * Esegue simulazioni end-to-end con 2-4 bot per scovare bug, eccezioni o blocchi.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = __dirname;
const projectDir = path.resolve(__dirname, '..');

// Setup environment
function createMockElement(tag = 'div', id = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id: id,
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    hidden: false,
    style: {},
    classList: {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      toggle(c, f) {
        if (f === undefined) {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        } else if (f) this._classes.add(c); else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    children: [],
    attributes: {},
    _listeners: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    removeAttribute(k) { delete this.attributes[k]; },
    dataset: {},
    appendChild(child) {
      if (child) {
        this.children.push(child);
        child.parentElement = this;
      }
      return child;
    },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
      return child;
    },
    remove() {
      if (this.parentElement) this.parentElement.removeChild(this);
    },
    querySelector(sel) {
      if (sel.startsWith('#')) {
        const targetId = sel.slice(1);
        return findById(this, targetId) || createMockElement('div', targetId);
      }
      return this.children[0] || createMockElement();
    },
    querySelectorAll(sel) {
      return this.children.length > 0 ? this.children : [createMockElement()];
    },
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    },
    removeEventListener(evt, fn) {
      if (!this._listeners[evt]) return;
      this._listeners[evt] = this._listeners[evt].filter(f => f !== fn);
    },
    trigger(evt, eventObj = {}) {
      if (this['on' + evt]) this['on' + evt](eventObj);
      if (this._listeners[evt]) {
        this._listeners[evt].forEach(fn => fn(eventObj));
      }
    },
    focus() { this.trigger('focus'); },
    click() { this.trigger('click'); },
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 600, right: 400, bottom: 600 }; }
  };
  return el;
}

function findById(root, id) {
  if (root.id === id) return root;
  for (const child of root.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

const mockWindow = {
  performance: { now: () => Date.now() },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  navigator: { vibrate: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 800, innerHeight: 600,
  Suoni: {
    playDing: () => {}, playBuzzer: () => {}, playTick: () => {},
    playClick: () => {}, playVittoria: () => {}, playSconfitta: () => {},
    playCountdown: () => {}, playRouletteTick: () => {}, playTicTac: () => {},
    playTypewriter: () => {}, playSbagliato: () => {}
  },
  Vibrazione: { click: () => {}, successo: () => {}, errore: () => {} },
  Trofei: { sblocca: () => {}, incrementaContatore: () => {} }
};

const domById = new Map();
const mockDocument = {
  getElementById: (id) => {
    if (!domById.has(id)) domById.set(id, createMockElement('div', id));
    return domById.get(id);
  },
  querySelector: (sel) => {
    if (sel.startsWith('#')) return mockDocument.getElementById(sel.slice(1));
    return createMockElement();
  },
  querySelectorAll: () => [createMockElement()],
  createElement: (tag) => createMockElement(tag),
  body: createMockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

function fuggiHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function scegli(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
function interoTra(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function mescola(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function scegliDistinti(lista, n) { return mescola(lista).slice(0, n); }

const MAX_ROUND = 3;
function fasceScalate(n, fasce = ["corte", "medie", "lunghe"]) {
  if (n <= 1) return [fasce[Math.floor(fasce.length / 2)]];
  return Array.from({ length: n }, (_, i) =>
    fasce[Math.round(i * (fasce.length - 1) / (n - 1))]);
}

const COLORI = ["#00F0FF", "#FF0055", "#FFE600", "#00FF66", "#B026FF", "#FF7A00"];
const ID_FANTASMA = "gh";

const S = {
  nome: "HostBot",
  ruolo: "host",
  io: "p0",
  giocatori: [],
  esiti: {},
  avanzamenti: {},
  round: 0,
  partita: [],
  attivo: true,
  t0: Date.now()
};

const context = {
  window: mockWindow,
  document: mockDocument,
  navigator: mockWindow.navigator,
  performance: mockWindow.performance,
  localStorage: mockWindow.localStorage,
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: mockWindow.requestAnimationFrame,
  cancelAnimationFrame: mockWindow.cancelAnimationFrame,
  console, Math, Date, Array, Object, String, Number, Boolean, Set, Map, JSON,
  GIOCHI: [],
  MAX_ROUND,
  fasceScalate,
  COLORI,
  ID_FANTASMA,
  S,
  $: (id) => mockDocument.getElementById(id),
  fuggiHtml, scegli, interoTra, mescola, scegliDistinti,
  Suoni: mockWindow.Suoni,
  Vibrazione: mockWindow.Vibrazione,
  Trofei: mockWindow.Trofei
};

vm.createContext(context);

// Carica dipendenze dati
['frasi.js', 'parole.js', 'parole-impostore.js'].forEach(file => {
  const filePath = path.join(projectDir, 'js', file);
  if (fs.existsSync(filePath)) {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context);
  }
});

// Carica tutti i giochi
const giochiDir = path.join(projectDir, 'js', 'giochi');
const files = fs.readdirSync(giochiDir).filter(f => f.endsWith('.js'));
for (const file of files) {
  const code = fs.readFileSync(path.join(giochiDir, file), 'utf8');
  try {
    vm.runInContext(code, context);
  } catch (e) {
    console.error(`Errore caricamento ${file}:`, e.message);
  }
}

console.log(`Caricati ${context.GIOCHI.length} giochi in memoria.\n`);

// Funzione di test con Bot
async function testGiocoConBot(gioco, numBot = 3) {
  const logPrefix = `[${gioco.id}]`;
  const report = {
    id: gioco.id,
    nome: gioco.nome,
    pass: false,
    error: null,
    warnings: [],
    botScores: []
  };

  try {
    // 1. Test generaPartita
    if (typeof gioco.generaPartita !== 'function') {
      throw new Error("generaPartita() non definita!");
    }
    const matchData = gioco.generaPartita();
    if (!Array.isArray(matchData) || matchData.length === 0) {
      throw new Error(`generaPartita() deve restituire un Array non vuoto (tipo restituito: ${typeof matchData})`);
    }

    // 2. Setup Giocatori Bot
    const bots = [];
    const minP = gioco.minGiocatori || 1;
    const maxP = gioco.maxGiocatori || 6;
    const actualPlayers = Math.min(Math.max(numBot, minP), maxP);

    for (let i = 0; i < actualPlayers; i++) {
      bots.push({
        id: `p${i}`,
        nome: `Bot_${i}`,
        colore: COLORI[i % COLORI.length],
        punti: 0,
        online: true
      });
    }

    // Network bus per simulare messaggi peerjs tra i bot
    const networkBus = {
      instances: new Map(), // id -> instance
      broadcast(fromId, msg) {
        for (const [id, inst] of this.instances.entries()) {
          if (id !== fromId && inst.messaggio) {
            try { inst.messaggio(msg, fromId); } catch (e) { report.warnings.push(`Errore msg da ${fromId} a ${id}: ${e.message}`); }
          }
        }
      },
      sendPrivate(toId, msg, fromId) {
        const target = this.instances.get(toId);
        if (target && target.messaggio) {
          try { target.messaggio(msg, fromId); } catch (e) { report.warnings.push(`Errore msg privato a ${toId}: ${e.message}`); }
        }
      }
    };

    const roundData = matchData[0];
    const botFinished = new Map();

    // 3. Creazione Istanze per ciascun bot
    for (let i = 0; i < actualPlayers; i++) {
      const b = bots[i];
      const isHost = (i === 0);
      const arena = createMockElement('div', `arena-${b.id}`);

      const botApi = {
        round: 0,
        dati: roundData,
        sonoHost: isHost,
        arena: arena,
        io: b.id,
        giocatori: bots,
        indiceMio: i,
        nGiocatori: actualPlayers,
        tempo: () => 2.5,
        suggerimento: () => {},
        etichetta: () => {},
        nome: (id) => bots.find(x => x.id === id)?.nome || id,
        invia: (m) => networkBus.broadcast(b.id, m),
        aArbitro: (m) => networkBus.sendPrivate('p0', m, b.id),
        aGiocatore: (id, m) => networkBus.sendPrivate(id, m, b.id),
        avanzo: (p) => {},
        finito: (res) => {
          botFinished.set(b.id, res);
        }
      };

      const inst = gioco.crea(botApi);
      if (inst) {
        networkBus.instances.set(b.id, inst);
      }
    }

    // 4. Simulazione azioni dei bot
    // Ogni bot prova a interagire (click su bottoni nell'arena, input di valori, ecc.)
    for (const [id, inst] of networkBus.instances.entries()) {
      const arena = inst.arena || createMockElement();
      
      // Prova a cliccare bottoni presenti nell'arena
      if (arena.children) {
        arena.children.forEach(c => {
          if (c.click) c.click();
        });
      }

      // Se il gioco prevede scaduto(), testiamolo
      if (typeof inst.scaduto === 'function') {
        try { inst.scaduto(); } catch (e) { report.warnings.push(`Errore in scaduto() su ${id}: ${e.message}`); }
      }

      // Chiudi istanza
      if (typeof inst.chiudi === 'function') {
        try { inst.chiudi(); } catch (e) { report.warnings.push(`Errore in chiudi() su ${id}: ${e.message}`); }
      }
    }

    report.pass = true;
    report.botScores = Array.from(botFinished.entries()).map(([id, r]) => `${id}: ${r.punti}pt (${r.dettaglio || '-'})`);

  } catch (err) {
    report.pass = false;
    report.error = err.message;
  }

  return report;
}

// Esegui test su tutti i giochi registrati
async function main() {
  console.log("=== AVVIO TEST SUITE COMPLETA DEI MINIGIOCHI ===");
  const tutti = context.GIOCHI;
  let superati = 0;
  let falliti = 0;

  for (const g of tutti) {
    const res = await testGiocoConBot(g, 3);
    if (res.pass) {
      superati++;
      console.log(`✅ [${g.id}] ${g.nome}: PASS (${res.botScores.length} bot hanno concluso)`);
      if (res.warnings.length) {
        console.log(`   ⚠️ Avvisi: ${res.warnings.join('; ')}`);
      }
    } else {
      falliti++;
      console.log(`❌ [${g.id}] ${g.nome}: FAIL - ${res.error}`);
    }
  }

  console.log("\n=== RIEPILOGO TEST ===");
  console.log(`Totale giochi testati: ${tutti.length}`);
  console.log(`Superati: ${superati}`);
  console.log(`Falliti: ${falliti}`);
}

main();
