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
  assert.equal(scripts.length, 25);
  const retired = ['simon.js', 'sniper.js', 'fune.js', 'oca.js'];
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

test('testi e manifest dichiarano 25 giochi', () => {
  assert.match(read('manifest.json'), /Venticinque/);
  assert.match(html, /Venticinque party game/);
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