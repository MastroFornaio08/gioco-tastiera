const fs = require('fs');
const vm = require('vm');

// Mock browser global environment
const context = {
  console: console,
  addEventListener: () => {},
  removeEventListener: () => {},
  window: {},
  document: {
    getElementById: (id) => {
      // return a mock element
      return {
        id,
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        innerHTML: '',
        textContent: '',
        value: '',
        children: [],
        querySelectorAll: () => [],
        querySelector: () => null,
      };
    },
    querySelector: (sel) => ({
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {},
      textContent: '🦁'
    }),
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    documentElement: { requestFullscreen: () => Promise.resolve() },
    body: {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      appendChild: () => {},
      removeChild: () => {},
    }
  },
  navigator: {
    clipboard: { writeText: () => Promise.resolve() },
    serviceWorker: { getRegistrations: () => Promise.resolve([]) }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  location: {
    hostname: 'localhost',
    protocol: 'http:',
    pathname: '/',
    origin: 'http://localhost',
    search: ''
  },
  URLSearchParams: class {
    get() { return null; }
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  AudioContext: class {
    createGain() { return { connect: () => {}, gain: { value: 0, setValueAtTime: () => {} } }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
  },
  Audio: class {
    constructor() { this.loop = false; this.volume = 1; }
    play() { return Promise.resolve(); }
    pause() {}
    addEventListener() {}
  },
  Peer: class {}
};
context.window = context;
vm.createContext(context);

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script\s+src="([^"]+)"/g)];

for (const m of scriptMatches) {
  const src = m[1].split('?')[0];
  if (src.startsWith('http')) continue;
  console.log('Loading:', src);
  const code = fs.readFileSync(src, 'utf8');
  try {
    vm.runInContext(code, context, { filename: src });
  } catch (err) {
    console.error('ERROR IN FILE:', src, err);
    process.exit(1);
  }
}
console.log('All scripts loaded successfully without runtime errors!');
