// Automated Test Script for all games
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=== INIZIO ANALISI E TEST DEI GIOCHI ===");

// 1. Setup Sandbox Environment
const baseDir = __dirname; // will run from root or scratch
const projectDir = path.resolve(__dirname, '..');

function createMockElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    style: {},
    classList: {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) this._classes.add(c);
        else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    children: [],
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    removeAttribute(k) { delete this.attributes[k]; },
    dataset: {},
    appendChild(el) { this.children.push(el); return el; },
    removeChild(el) {
      const idx = this.children.indexOf(el);
      if (idx !== -1) this.children.splice(idx, 1);
      return el;
    },
    querySelector(sel) { return createMockElement(); },
    querySelectorAll(sel) { return [createMockElement(), createMockElement()]; },
    addEventListener(evt, fn) {},
    removeEventListener(evt, fn) {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 600, right: 400, bottom: 600 }; },
    focus() {},
    click() { if (this.onclick) this.onclick(); }
  };
}

const mockWindow = {
  performance: { now: () => Date.now() },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  navigator: { vibrate: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 800,
  innerHeight: 600,
  Suoni: {
    playDing: () => {},
    playBuzzer: () => {},
    playTick: () => {},
    playClick: () => {},
    playVittoria: () => {},
    playSconfitta: () => {},
    playCountdown: () => {},
    playRouletteTick: () => {}
  },
  Vibrazione: {
    click: () => {},
    successo: () => {},
    errore: () => {}
  },
  Trofei: {
    sblocca: () => {},
    incrementaContatore: () => {}
  }
};

const mockDocument = {
  getElementById: (id) => createMockElement(),
  querySelector: (sel) => createMockElement(),
  querySelectorAll: (sel) => [createMockElement()],
  createElement: (tag) => createMockElement(tag),
  body: createMockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Utilities defined in nucleo.js
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

const context = {
  window: mockWindow,
  document: mockDocument,
  navigator: mockWindow.navigator,
  performance: mockWindow.performance,
  localStorage: mockWindow.localStorage,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: mockWindow.requestAnimationFrame,
  cancelAnimationFrame: mockWindow.cancelAnimationFrame,
  console,
  Math,
  Date,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Set,
  Map,
  JSON,
  GIOCHI: [],
  MAX_ROUND,
  fasceScalate,
  $: (id) => mockDocument.getElementById(id),
  fuggiHtml,
  scegli,
  interoTra,
  mescola,
  scegliDistinti,
  Suoni: mockWindow.Suoni,
  Vibrazione: mockWindow.Vibrazione,
  Trofei: mockWindow.Trofei
};

vm.createContext(context);

// Load data files first
['frasi.js', 'parole.js', 'parole-impostore.js'].forEach(file => {
  const filePath = path.join(projectDir, 'js', file);
  if (fs.existsSync(filePath)) {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context);
  }
});

// Load all games in js/giochi
const giochiDir = path.join(projectDir, 'js', 'giochi');
const files = fs.readdirSync(giochiDir).filter(f => f.endsWith('.js'));

console.log(`Trovati ${files.length} file di giochi.`);

const results = [];

for (const file of files) {
  const filePath = path.join(giochiDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const countBefore = context.GIOCHI.length;

  try {
    vm.runInContext(code, context);
  } catch (err) {
    results.push({
      file,
      status: 'SYNTAX/LOAD_ERROR',
      error: err.message,
      stack: err.stack
    });
    continue;
  }

  const countAfter = context.GIOCHI.length;
  if (countAfter === countBefore) {
    results.push({
      file,
      status: 'NO_REGISTRATION',
      error: 'Il gioco non ha fatto GIOCHI.push()'
    });
    continue;
  }

  const g = context.GIOCHI[context.GIOCHI.length - 1];
  results.push({
    file,
    id: g.id,
    nome: g.nome,
    gameObj: g,
    status: 'LOADED'
  });
}

console.log('\n--- VERIFICA CONFIGURAZIONE GIOCHI ---');
for (const res of results) {
  if (res.status !== 'LOADED') {
    console.log(`❌ [${res.file}]: ${res.status} - ${res.error}`);
    continue;
  }
  const g = res.gameObj;
  const issues = [];

  // Check generaPartita
  if (typeof g.generaPartita !== 'function') {
    issues.push('manca generaPartita()');
  } else {
    try {
      const data = g.generaPartita();
      if (!Array.isArray(data)) {
        issues.push(`generaPartita() NON restituisce un Array (tipo: ${typeof data}) - QUESTO ROMPE IL GIOCO!`);
      } else if (data.length === 0) {
        issues.push('generaPartita() restituisce un Array vuoto');
      }
    } catch (e) {
      issues.push(`generaPartita() lancia eccezione: ${e.message}`);
    }
  }

  // Check crea
  if (typeof g.crea !== 'function') {
    issues.push('manca crea()');
  }

  if (issues.length > 0) {
    console.log(`⚠️ [${g.id} (${res.file})]: ${issues.join('; ')}`);
  } else {
    console.log(`✅ [${g.id} (${res.file})]: Configurazione OK`);
  }

  // Simulation: Test crea(api) for Host and Guest with 2 players
  if (typeof g.generaPartita === 'function' && typeof g.crea === 'function') {
    try {
      const matchData = g.generaPartita();
      const roundData = Array.isArray(matchData) ? matchData[0] : matchData;

      // Test 1: Host instance
      const players = [
        { id: 'p0', nome: 'Host', colore: '#00F0FF', punti: 0, online: true },
        { id: 'p1', nome: 'Ospite 1', colore: '#FF0055', punti: 0, online: true },
        { id: 'p2', nome: 'Ospite 2', colore: '#FFE600', punti: 0, online: true }
      ];

      function makeMockApi(playerId, isHost) {
        return {
          round: 0,
          dati: roundData,
          sonoHost: isHost,
          arena: createMockElement('arena'),
          io: playerId,
          giocatori: players,
          indiceMio: players.findIndex(p => p.id === playerId),
          nGiocatori: players.length,
          tempo: () => 1.5,
          suggerimento: () => {},
          etichetta: () => {},
          nome: (id) => players.find(p => p.id === id)?.nome || id,
          invia: (m) => {},
          aArbitro: (m) => {},
          aGiocatore: (id, m) => {},
          avanzo: (p) => {},
          finito: (res) => {}
        };
      }

      // Run host
      try {
        const hostApi = makeMockApi('p0', true);
        const hostInstance = g.crea(hostApi);
        if (hostInstance && typeof hostInstance.chiudi === 'function') {
          hostInstance.chiudi();
        }
      } catch (errHost) {
        console.log(`   ❌ ERRORE RUNTIME HOST in crea() [${g.id}]: ${errHost.message}`);
        console.log(`      ${errHost.stack.split('\n').slice(0, 3).join('\n      ')}`);
      }

      // Run guest
      try {
        const guestApi = makeMockApi('p1', false);
        const guestInstance = g.crea(guestApi);
        if (guestInstance && typeof guestInstance.chiudi === 'function') {
          guestInstance.chiudi();
        }
      } catch (errGuest) {
        console.log(`   ❌ ERRORE RUNTIME GUEST in crea() [${g.id}]: ${errGuest.message}`);
        console.log(`      ${errGuest.stack.split('\n').slice(0, 3).join('\n      ')}`);
      }

    } catch (eMatch) {
      console.log(`   ❌ ERRORE in simulazione [${g.id}]: ${eMatch.message}`);
    }
  }
}

