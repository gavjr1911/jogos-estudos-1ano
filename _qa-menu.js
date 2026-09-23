/* QA do menu — confere que o hub e os módulos estão coerentes:
   - todo item do menu aponta para uma pasta que existe
   - toda pasta de módulo está listada no menu (nenhuma órfã)
   - todo item tem os campos obrigatórios, e a cor não se repete
   - todo módulo tem o botão 🏠 de voltar para o menu
   - toda chave do VOICE virou um .mp3 de verdade (narração do menu)
   - todo módulo do menu tem sua narração correspondente
   Uso: node _qa-menu.js
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const mm = html.match(/const MODULOS = \[([\s\S]*?)\];/);
if (!mm) { console.error('❌ array MODULOS não encontrado no index.html'); process.exit(1); }
const MODULOS = eval('[' + mm[1] + ']');

const vm_ = html.match(/const VOICE = \{([\s\S]*?)\n\};/);
if (!vm_) { console.error('❌ objeto VOICE não encontrado no index.html'); process.exit(1); }
const VOICE = {};
for (const [, k, v] of vm_[1].matchAll(/(\w+)\s*:\s*"([^"]*)"/g)) VOICE[k] = v;

const pastas = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.')
    && fs.existsSync(path.join(ROOT, d.name, 'index.html')))
  .map(d => d.name).sort();

const erros = [];
const audioKey = p => 'm_' + p.replace(/-/g, '_');

for (const mod of MODULOS) {
  if (!fs.existsSync(path.join(ROOT, mod.pasta, 'index.html')))
    erros.push(`menu aponta para "${mod.pasta}/", que não existe`);
  for (const campo of ['ico', 'nome', 'sub', 'tag', 'cor'])
    if (!mod[campo]) erros.push(`"${mod.pasta}" sem o campo ${campo}`);

  // a narração é o que torna o menu usável por quem ainda não lê
  const k = audioKey(mod.pasta);
  if (!VOICE[k]) erros.push(`"${mod.pasta}" sem texto de narração (VOICE.${k})`);
  else if (!fs.existsSync(path.join(ROOT, 'audio', k + '.mp3')))
    erros.push(`falta audio/${k}.mp3 — rode: .venv/bin/python gerar-audios.py`);
}

const noMenu = MODULOS.map(x => x.pasta);
for (const p of pastas)
  if (!noMenu.includes(p)) erros.push(`pasta "${p}/" existe mas não está no menu`);

const cores = MODULOS.map(x => x.cor);
const dup = [...new Set(cores.filter((c, i) => cores.indexOf(c) !== i))];
if (dup.length) erros.push(`cores repetidas entre cards: ${dup.join(', ')}`);

for (const k of Object.keys(VOICE))
  if (!fs.existsSync(path.join(ROOT, 'audio', k + '.mp3')))
    erros.push(`VOICE.${k} sem audio/${k}.mp3`);

// Sem esse botão a criança fica presa dentro do módulo
for (const p of pastas) {
  const src = fs.readFileSync(path.join(ROOT, p, 'index.html'), 'utf8');
  if (!src.includes('class="back-btn" href="../"'))
    erros.push(`"${p}/" sem o botão de voltar para o menu`);
}

if (erros.length) {
  console.error('❌ Problemas encontrados:\n' + erros.map(e => '   - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ Menu OK: ${MODULOS.length} módulos, ${Object.keys(VOICE).length} áudios de narração,`);
console.log('   todos com botão de voltar, sem órfãos e sem cor repetida.');
