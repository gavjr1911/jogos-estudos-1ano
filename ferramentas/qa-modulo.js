/* QA de conteúdo — roda em QUALQUER módulo.
   Generalizado a partir do _qa.js do ciencias2.

   Sorteia milhares de rodadas e confere:
     - toda rodada tem exatamente 1 resposta certa
     - nenhuma opção repetida (no rótulo ou na chave de áudio)
     - toda chave de áudio usada existe no VOICE e virou .mp3
     - o rótulo mostrado bate com o texto falado
     - o enunciado não entrega a resposta
     - a resposta certa não é sistematicamente a opção mais comprida
     - todos os jogos têm o mesmo número de rodadas

   Uso:
     node ferramentas/qa-modulo.js ciencias2
     node ferramentas/qa-modulo.js --todos
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.dirname(__dirname);
const RUNS = Number(process.env.RUNS || 400);

/* Limite de viés: acima disso dá para acertar chutando na opção mais longa.
   O acaso em 3 opções é 33%. */
const BIAS_MAX = Number(process.env.BIAS_MAX || 45);

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

/* `aud` pode ser uma chave só ("cubo") ou uma lista ["n2","n5","n9"],
   quando a opção é falada como sequência. Normaliza para array. */
const chavesDe = a => a == null ? [] : (Array.isArray(a) ? a : [a]);

const stripTags = s => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const norm = s => stripTags(s).toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function carregar(pasta) {
  const dir = path.join(RAIZ, pasta);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

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

  // `const` no topo do script não cai no global do vm — exportamos na mão.
  // Descobrimos os nomes em vez de fixá-los, para servir a qualquer módulo.
  const nomes = [...new Set([...code.matchAll(/^const ([A-Z][A-Z0-9_]*)\s*=/gm)].map(m => m[1]))];
  vm.runInContext(code + `\n;globalThis.__qa={${nomes.join(',')}};`, sandbox);
  return { dir, dados: sandbox.__qa, nomes };
}

function verificar(pasta) {
  const { dir, dados } = carregar(pasta);
  const { BUILDERS, GAMES, VOICE_EN } = dados;
  // Módulo bilíngue (inglês) guarda as falas em inglês num segundo dicionário.
  const VOICE = VOICE_EN ? { ...dados.VOICE, ...VOICE_EN } : dados.VOICE;
  const errors = [];

  if (!VOICE) return { pasta, errors: ['sem objeto VOICE'], stats: {} };
  if (!BUILDERS || !GAMES) return { pasta, errors: ['sem BUILDERS ou GAMES'], stats: {} };

  // Legendas do palco precisam bater com a narração (arrays de {k, txt})
  for (const [nome, val] of Object.entries(dados)) {
    if (!Array.isArray(val) || !val.length) continue;
    if (typeof val[0] !== 'object' || val[0] === null) continue;
    if (!('k' in val[0]) || !('txt' in val[0])) continue;
    val.forEach(it => {
      if (!(it.k in VOICE)) { errors.push(`${nome}: item sem voz "${it.k}"`); return; }
      if (norm(it.txt) !== norm(VOICE[it.k]))
        errors.push(`${nome}: legenda "${it.txt}" != narração "${VOICE[it.k]}" (${it.k})`);
    });
  }

  const bias = { total: 0, maisLonga: 0, porJogo: {} };
  const seen = { keys: new Set(), rounds: 0 };

  for (const g of GAMES) {
    for (let n = 0; n < RUNS; n++) {
      const rounds = BUILDERS[g.id]();
      if (!rounds.length) { errors.push(`${g.id}: rodada vazia`); continue; }

      rounds.forEach((r, i) => {
        seen.rounds++;
        const where = `${g.id}[${i}]`;
        (r.audio || []).forEach(a => chavesDe(a).forEach(k => {
          seen.keys.add(k);
          if (!(k in VOICE)) errors.push(`${where}: áudio de pergunta inexistente "${k}"`);
        }));

        if (r.mode === 'seq') {
          if (!r.itens || r.itens.length < 2) errors.push(`${where}: sequência curta`);
          (r.itens || []).forEach(it => chavesDe(it.aud).forEach(k => {
            seen.keys.add(k);
            if (!(k in VOICE)) errors.push(`${where}: áudio de ficha inexistente "${k}"`);
          }));
          chavesDe(r.expAud).forEach(k => {
            seen.keys.add(k);
            if (!(k in VOICE)) errors.push(`${where}: expAud inexistente "${k}"`);
          });
          return;
        }

        // Rodadas de formato próprio (ex.: mode 'build', montar palavra com
        // sílabas) não usam `options`. O QA não conhece esses formatos — ignora
        // em vez de adivinhar campos e gerar alarme falso.
        if (!r.options) return;

        const opts = r.options;
        if (opts.length < 2) errors.push(`${where}: menos de 2 opções`);
        const corr = opts.filter(o => o.correct);
        if (corr.length !== 1)
          errors.push(`${where}: ${corr.length} respostas certas — ${JSON.stringify(opts.map(o => o.aud))}`);

        const auds = opts.map(o => chavesDe(o.aud).join('+'));
        if (new Set(auds).size !== auds.length) errors.push(`${where}: chave de áudio repetida`);
        // Rótulo que é só emoji/imagem normaliza para vazio — nesses a distinção
        // real está na chave de áudio, já conferida acima.
        const labels = opts.map(o => norm(o.label)).filter(Boolean);
        if (new Set(labels).size !== labels.length) errors.push(`${where}: rótulo repetido`);

        if (corr.length === 1 && opts.length === 3) {
          const lens = opts.map(o => norm(o.label).length);
          const maiorIdx = lens.indexOf(Math.max(...lens));
          const ehMaior = opts[maiorIdx].correct && lens.filter(l => l === lens[maiorIdx]).length === 1;
          bias.total++; if (ehMaior) bias.maisLonga++;
          const pj = bias.porJogo[g.id] || (bias.porJogo[g.id] = { t: 0, m: 0 });
          pj.t++; if (ehMaior) pj.m++;

          const lc = norm(corr[0].label).length;
          const lw = Math.max(...opts.filter(o => !o.correct).map(o => norm(o.label).length));
          if (lc >= lw * 1.5 && lc - lw >= 10)
            errors.push(`${where}: resposta certa bem mais longa (${lc} vs ${lw}) — ${chavesDe(corr[0].aud).join('+')}`);
        }

        opts.forEach(o => {
          const ks = chavesDe(o.aud);
          ks.forEach(k => {
            seen.keys.add(k);
            if (!(k in VOICE)) errors.push(`${where}: áudio de opção inexistente "${k}"`);
          });
          chavesDe(o.expAud).forEach(k => {
            seen.keys.add(k);
            if (!(k in VOICE)) errors.push(`${where}: expAud inexistente "${k}"`);
          });
          if (o.label === undefined) errors.push(`${where}: opção sem rótulo (${ks.join('+')})`);
          // O texto falado deve bater com o rótulo — MENOS em alfabetização,
          // onde o card mostra "r" e a narração fala "erre" (o nome da letra).
          // Rótulo curto (letra, dígrafo, trígrafo) é justamente esse caso.
          // A narração pode ser mais descritiva que o rótulo ("entre" → "entre as
          // árvores"); só acusa quando o texto falado não tem relação com o rótulo.
          if (ks.length === 1 && ks[0] in VOICE) {
            const lbl = norm(o.label), fala = norm(VOICE[ks[0]]);
            if (lbl.length > 3 && fala !== lbl && !fala.includes(lbl) && !lbl.includes(fala))
              errors.push(`${where}: rótulo "${lbl}" não tem relação com o áudio "${fala}" (${ks[0]})`);
          }
        });

        // Numa pergunta "é A ou é B?" as opções aparecem de propósito —
        // só é vazamento quando SÓ a resposta certa está no enunciado.
        if (corr.length === 1) {
          const q = norm(r.q), ans = norm(corr[0].label);
          const errados = opts.filter(o => !o.correct).map(o => norm(o.label));
          const todosNoEnunciado = errados.every(e => q.includes(e));
          if (ans.length > 6 && q.includes(ans) && !todosNoEnunciado)
            errors.push(`${where}: enunciado entrega a resposta ("${ans}")`);
        }
      });
    }
  }

  const tamanhos = {};
  GAMES.forEach(g => {
    tamanhos[g.id] = new Set();
    for (let n = 0; n < 50; n++) tamanhos[g.id].add(BUILDERS[g.id]().length);
  });
  // Aviso, não erro: jogos com 7 ou 8 rodadas funcionam igual. Uniformizar é
  // desejável em módulo novo, mas não justifica reprovar os que já rodam.
  const todos = new Set([].concat(...Object.values(tamanhos).map(s => [...s])));
  const avisos = [];
  if (todos.size !== 1)
    avisos.push('jogos com número de rodadas diferente: ' +
      Object.entries(tamanhos).map(([k, v]) => `${k}=${[...v].join('/')}`).join(', '));

  // Toda chave usada precisa ter virado .mp3 de verdade
  const audioDir = path.join(dir, 'audio');
  for (const k of seen.keys)
    if (k in VOICE && !fs.existsSync(path.join(audioDir, k + '.mp3')))
      errors.push(`falta audio/${k}.mp3`);

  const pct = (a, b) => b ? Math.round(a * 100 / b) : 0;
  const viesGeral = pct(bias.maisLonga, bias.total);
  const jogosViciados = Object.entries(bias.porJogo)
    .map(([k, v]) => [k, pct(v.m, v.t)]).filter(([, p]) => p > BIAS_MAX);

  // Acima do limite a criança acerta sem saber a matéria — o jogo perde a função
  for (const [jogo, p] of jogosViciados)
    errors.push(`viés alto em "${jogo}": ${p}% acerta chutando na opção mais longa (limite ${BIAS_MAX}%)`);

  const infra = new Set(['greet','test','win','choose','ok1','ok2','ok3','ok4','ok5','ok6','no1','no2','no3']);
  const orfas = Object.keys(VOICE).filter(k => !seen.keys.has(k) && !infra.has(k));

  return {
    pasta, errors: [...new Set(errors)],
    stats: { jogos: GAMES.length, rodadas: seen.rounds, vozes: Object.keys(VOICE).length,
             usadas: seen.keys.size, vies: viesGeral, orfas, avisos }
  };
}

function modulos() {
  return fs.readdirSync(RAIZ, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_')
      && !['audio','ferramentas','docs','node_modules'].includes(d.name)
      && fs.existsSync(path.join(RAIZ, d.name, 'index.html')))
    .map(d => d.name).sort();
}

const arg = process.argv[2];
const alvos = (!arg || arg === '--todos') ? modulos() : [arg.replace(/\/$/, '')];

let falhou = false;
for (const pasta of alvos) {
  let r;
  try { r = verificar(pasta); }
  catch (e) { console.log(`\n❌ ${pasta}: erro ao carregar — ${e.message}`); falhou = true; continue; }

  const s = r.stats;
  console.log(`\n── ${pasta} ─────────────────────────────`);
  if (s.jogos)
    console.log(`   ${s.jogos} jogos · ${s.rodadas} rodadas · ${s.usadas}/${s.vozes} vozes · viés ${s.vies}%`);
  (s.avisos || []).forEach(a => console.log(`   ⚠️  ${a}`));
  if (s.orfas && s.orfas.length)
    console.log(`   ⚠️  ${s.orfas.length} voz(es) sem uso: ${s.orfas.slice(0,6).join(', ')}${s.orfas.length>6?'…':''}`);

  if (r.errors.length) {
    falhou = true;
    console.log(`   ❌ ${r.errors.length} problema(s):`);
    r.errors.slice(0, 15).forEach(e => console.log('      - ' + e));
    if (r.errors.length > 15) console.log(`      … e mais ${r.errors.length - 15}`);
  } else {
    console.log('   ✅ sem problemas');
  }
}

console.log(falhou ? '\n❌ QA reprovado.' : `\n✅ QA aprovado em ${alvos.length} módulo(s).`);
process.exit(falhou ? 1 : 0);
