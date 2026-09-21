/* QA do módulo Ciências 2 — roda milhares de rodadas sorteadas e confere:
   - toda rodada tem exatamente 1 resposta certa
   - nenhuma opção repetida (nem no texto, nem na chave de áudio)
   - toda chave de áudio usada existe no VOICE (e portanto vira .mp3)
   - o enunciado não entrega a resposta
   Uso: node _qa.js
*/
const fs = require('fs'), path = require('path'), vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const noop = () => {};
const fakeEl = {
  innerHTML: '', textContent: '', style: {}, className: '',
  classList: { add: noop, remove: noop, toggle: noop },
  appendChild: noop, querySelector: () => fakeEl, querySelectorAll: () => [],
  addEventListener: noop, getContext: () => ({
    clearRect: noop, save: noop, restore: noop, translate: noop,
    rotate: noop, fillRect: noop, set fillStyle(v) {}
  })
};
const sandbox = {
  document: { getElementById: () => fakeEl, querySelector: () => fakeEl, querySelectorAll: () => [] },
  localStorage: { getItem: () => '0', setItem: noop },
  Audio: function () { return { play: () => ({ catch: noop, then: () => ({ catch: noop }) }), pause: noop }; },
  addEventListener: noop, requestAnimationFrame: noop,
  innerWidth: 800, innerHeight: 600, setTimeout: noop,
  AudioContext: function () { return { state: 'running', resume: noop }; },
  console, Math, Date
};
sandbox.window = sandbox;
vm.createContext(sandbox);
// `const` no topo do script não vai para o objeto global do vm: exportamos na mão.
vm.runInContext(code + '\n;globalThis.__qa={VOICE,BUILDERS,GAMES,ACOES,SERES,MATERIAIS,COMIDAS,BEMESTAR};', sandbox);

const { VOICE, BUILDERS, GAMES, ACOES, SERES, MATERIAIS, COMIDAS, BEMESTAR } = sandbox.__qa;
const stripTags = s => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const norm = s => stripTags(s).toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

const errors = [];

// as legendas mostradas no palco (cena()) têm de bater com a narração do item
for (const [nome, arr] of [['ACOES', ACOES], ['SERES', SERES], ['MATERIAIS', MATERIAIS], ['COMIDAS', COMIDAS], ['BEMESTAR', BEMESTAR]]) {
  arr.forEach(it => {
    if (!(it.k in VOICE)) { errors.push(`${nome}: item sem voz "${it.k}"`); return; }
    if (norm(it.txt) !== norm(VOICE[it.k])) {
      errors.push(`${nome}: legenda "${it.txt}" != narração "${VOICE[it.k]}" (${it.k})`);
    }
  });
}

// viés de comprimento: acertar só tocando no botão de texto mais longo
const bias = { total: 0, maisLonga: 0, porJogo: {} };
const seen = { keys: new Set(), rounds: 0 };
const RUNS = 400;

for (const g of GAMES) {
  for (let n = 0; n < RUNS; n++) {
    const rounds = BUILDERS[g.id]();
    if (!rounds.length) errors.push(`${g.id}: rodada vazia`);
    rounds.forEach((r, i) => {
      seen.rounds++;
      const where = `${g.id}[${i}]`;
      (r.audio || []).forEach(k => {
        seen.keys.add(k);
        if (!(k in VOICE)) errors.push(`${where}: áudio de pergunta inexistente "${k}"`);
      });

      if (r.mode === 'seq') {
        if (!r.itens || r.itens.length < 2) errors.push(`${where}: sequência curta`);
        r.itens.forEach(it => {
          seen.keys.add(it.aud);
          if (!(it.aud in VOICE)) errors.push(`${where}: áudio de ficha inexistente "${it.aud}"`);
        });
        if (r.expAud) { seen.keys.add(r.expAud); if (!(r.expAud in VOICE)) errors.push(`${where}: expAud inexistente "${r.expAud}"`); }
        return;
      }

      const opts = r.options || [];
      if (opts.length < 2) errors.push(`${where}: menos de 2 opções`);
      const corr = opts.filter(o => o.correct);
      if (corr.length !== 1) errors.push(`${where}: ${corr.length} respostas certas — ${JSON.stringify(opts.map(o => o.aud))}`);

      const auds = opts.map(o => o.aud);
      if (new Set(auds).size !== auds.length) errors.push(`${where}: chave de áudio repetida ${JSON.stringify(auds)}`);
      const labels = opts.map(o => norm(o.label));
      if (new Set(labels).size !== labels.length) errors.push(`${where}: rótulo repetido ${JSON.stringify(labels)}`);

      // a resposta certa não pode ser sistematicamente a opção mais comprida
      if (corr.length === 1 && opts.length === 3) {
        const lens = opts.map(o => norm(o.label).length);
        const maiorIdx = lens.indexOf(Math.max(...lens));
        const ehMaior = opts[maiorIdx].correct && lens.filter(l => l === lens[maiorIdx]).length === 1;
        bias.total++; if (ehMaior) bias.maisLonga++;
        const pj = bias.porJogo[g.id] || (bias.porJogo[g.id] = { t: 0, m: 0 });
        pj.t++; if (ehMaior) pj.m++;
        // diferença gritante: dá para acertar de olho, sem ler nem ouvir
        const lc = norm(corr[0].label).length;
        const lw = Math.max(...opts.filter(o => !o.correct).map(o => norm(o.label).length));
        if (lc >= lw * 1.5 && lc - lw >= 10) {
          errors.push(`${where}: resposta certa bem mais longa que as outras (${lc} vs ${lw}) — ${corr[0].aud}`);
        }
      }

      opts.forEach(o => {
        seen.keys.add(o.aud);
        if (o.expAud) { seen.keys.add(o.expAud); if (!(o.expAud in VOICE)) errors.push(`${where}: expAud inexistente "${o.expAud}"`); }
        if (!(o.aud in VOICE)) errors.push(`${where}: áudio de opção inexistente "${o.aud}"`);
        if (o.label === undefined) errors.push(`${where}: opção sem rótulo (${o.aud})`);
        // o texto falado da opção deve bater com o rótulo mostrado
        if (o.aud in VOICE) {
          const a = norm(VOICE[o.aud]), b = norm(o.label);
          if (a !== b) errors.push(`${where}: rótulo "${b}" != áudio "${a}" (${o.aud})`);
        }
      });

      // vazamento: o enunciado não pode conter a resposta certa.
      // Numa pergunta do tipo "é A ou é B?" as duas opções aparecem de
      // propósito — só é vazamento quando SÓ a resposta certa aparece.
      if (corr.length === 1) {
        const q = norm(r.q), ans = norm(corr[0].label);
        const errados = opts.filter(o => !o.correct).map(o => norm(o.label));
        const todosNoEnunciado = errados.every(e => q.includes(e));
        if (ans.length > 6 && q.includes(ans) && !todosNoEnunciado) {
          errors.push(`${where}: enunciado entrega a resposta ("${ans}")`);
        }
      }
    });
  }
}

// todo jogo deve ter o mesmo número de rodadas
const tamanhos = {};
GAMES.forEach(g => { tamanhos[g.id] = new Set(); });
GAMES.forEach(g => { for (let n = 0; n < 50; n++) tamanhos[g.id].add(BUILDERS[g.id]().length); });
const todos = new Set([].concat(...Object.values(tamanhos).map(s => [...s])));
if (todos.size !== 1) errors.push(`jogos com número de rodadas diferente: ` +
  Object.entries(tamanhos).map(([k, v]) => `${k}=${[...v].join('/')}`).join(', '));

// chaves do VOICE que nunca são usadas (ou seja, mp3 gerado à toa)
const usadas = seen.keys;
const infra = new Set(['greet', 'test', 'win', 'choose', 'ok1', 'ok2', 'ok3', 'ok4', 'ok5', 'ok6', 'no1', 'no2', 'no3']);
const orfas = Object.keys(VOICE).filter(k => !usadas.has(k) && !infra.has(k));

const pct = (a, b) => b ? Math.round(a * 100 / b) : 0;
console.log(`Chutar na opção mais comprida acerta ${pct(bias.maisLonga, bias.total)}% (acaso = 33%) — ` +
  Object.entries(bias.porJogo).map(([k, v]) => `${k} ${pct(v.m, v.t)}%`).join(', '));
console.log(`Jogos: ${GAMES.length} | rodadas conferidas: ${seen.rounds} | chaves de voz: ${Object.keys(VOICE).length} | usadas: ${usadas.size}`);
if (orfas.length) console.log(`⚠️  chaves no VOICE sem uso: ${orfas.join(', ')}`);
if (errors.length) {
  const uniq = [...new Set(errors)];
  console.log(`\n❌ ${uniq.length} problema(s) distinto(s):`);
  uniq.slice(0, 60).forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log('\n✅ Tudo certo: 1 resposta certa por rodada, sem opção repetida, todos os áudios existem e nenhum enunciado entrega a resposta.');
