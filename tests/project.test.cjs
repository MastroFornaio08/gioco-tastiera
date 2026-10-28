const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html').replace(/<!--[\s\S]*?-->/g, '');

test('tutti gli asset locali caricati dall HTML esistono', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match => match[1].split('?')[0])
    .filter(ref => !/^(?:https?:|data:|#)/.test(ref));
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), `asset mancante: ${ref}`);
});

test('la build pubblica carica 25 giochi distinti', () => {
  const scripts = [...html.matchAll(/<script\s+src="(js\/giochi\/[^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.equal(scripts.length, 26);
  const retired = ['simon.js', 'sniper.js', 'fune.js', 'oca.js', 'dodge.js'];
  for (const name of retired) assert.ok(!scripts.some(file => file.endsWith(name)), `${name} non deve essere caricato`);
});

test('tutti i JavaScript del progetto hanno sintassi valida', () => {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== '.git') walk(full);
      else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) files.push(full);
    }
  }
  walk(root);
  for (const file of files) assert.doesNotThrow(() => new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file }));
});

test('la PWA registra un service worker che non si autodistrugge', () => {
  const sw = read('sw.js');
  assert.match(html, /serviceWorker\.register\(['"]\.\/sw\.js['"]\)/);
  assert.doesNotMatch(html, /getRegistrations\(\).*unregister/s);
  assert.doesNotMatch(sw, /registration\.unregister/);
  assert.match(sw, /caches\.open\(CACHE_VERSION\)/);
});

test('gli strumenti diagnostici non sono caricati in produzione', () => {
  assert.doesNotMatch(html, /src="js\/(?:bot-tester|p2p-tester)\.js/);
  assert.doesNotMatch(html, /id="btn-(?:bot-tester|test-p2p|purge-cache)/);
});

test('testi e manifest dichiarano 26 giochi', () => {
  assert.match(read('manifest.json'), /Ventisei/);
  assert.match(html, /Ventisei party game/);
  assert.doesNotMatch(html, /Trentuno|31 Minigiochi|31 giochi/);
});

test('la preferenza effetti è persistente e offre quattro livelli', () => {
  const effetti = read('js/effetti.js');
  for (const valore of ['auto', 'completi', 'ridotti', 'disattivati']) {
    assert.match(html, new RegExp(`value="${valore}"`));
  }
  assert.match(effetti, /localStorage\.getItem\('zg-effetti'\)/);
  assert.match(effetti, /impostaModalita/);
});

test('la rete conserva identità e slot durante la riconnessione', () => {
  const rete = read('js/rete.js');
  assert.match(rete, /localStorage\.getItem\("zg-peer-id"\)/);
  assert.match(rete, /_programmaRiconnessione/);
  assert.match(rete, /_slotPerPeer/);
  assert.match(rete, /riconnessioneFallita/);
});

test('la Playlist Party crea una sequenza di sfide senza duplicati', () => {
  const nucleo = read('js/nucleo.js');
  const avvio = read('js/avvio.js');
  assert.match(html, /id="btn-start-playlist"/);
  assert.match(avvio, /avviaPlaylist\(\)/);
  assert.match(nucleo, /function avviaPlaylist\(\)/);
  assert.match(nucleo, /mescola\(validi\)\.slice\(0, lunghezza\)/);
  assert.match(nucleo, /isPlaylist: S\.isPlaylist/);
});


test('la lobby non espone più il tasto Torneo e versiona gli script della playlist', () => {
  assert.doesNotMatch(html, /id="btn-start-tournament"/);
  assert.match(html, /js\/nucleo\.js\?v=34/);
  assert.match(html, /js\/avvio\.js\?v=23/);
  assert.match(read('sw.js'), /zaltergames-v7/);
});


test('la rimozione del Torneo non interrompe l’inizializzazione dei comandi', () => {
  const avvio = read('js/avvio.js');
  assert.doesNotMatch(avvio, /btn-start-tournament/);
  assert.match(avvio, /\$\("btn-next"\)\.onclick/);
  assert.match(html, /js\/avvio\.js\?v=23/);
  assert.match(read('sw.js'), /zaltergames-v7/);
});


test('il tema game portal è caricato e disponibile offline', () => {
  assert.match(html, /css\/portal-theme\.css\?v=2/);
  assert.match(read('sw.js'), /\.\/css\/portal-theme\.css/);
});


test('Meteoriti è sostituito da due sfide pensate per touch', () => {
  assert.match(html, /js\/giochi\/tapdash\.js/);
  assert.match(html, /js\/giochi\/swipesprint\.js/);
  assert.doesNotMatch(html, /js\/giochi\/dodge\.js/);
  assert.match(read('js/giochi/tapdash.js'), /touchstart/);
  assert.match(read('js/giochi/swipesprint.js'), /touchend/);
});


test('Escape Room non applica o propone malus', () => {
  const nucleo = read('js/nucleo.js');
  assert.match(nucleo, /g\.id === "escaperoom"/);
  assert.match(nucleo, /S\.giocoId === "escaperoom"/);
  assert.match(nucleo, /S\.malusInCoda = null/);
});
