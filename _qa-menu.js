/* QA do menu — confere que o hub e os módulos estão coerentes:
   - todo item do menu aponta para uma pasta que existe
   - toda pasta de módulo está listada no menu (nenhuma órfã)
   - nenhuma cor de card repetida
   - todo módulo tem o botão de voltar para o menu
   Uso: node _qa-menu.js
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname;

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = html.match(/const MODULOS = \[([\s\S]*?)\];/);
if (!m) { console.error('❌ array MODULOS não encontrado no index.html'); process.exit(1); }
const MODULOS = eval('[' + m[1] + ']');

const pastas = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.')
    && fs.existsSync(path.join(ROOT, d.name, 'index.html')))
  .map(d => d.name).sort();

const erros = [];

for (const mod of MODULOS) {
  if (!fs.existsSync(path.join(ROOT, mod.pasta, 'index.html')))
    erros.push(`menu aponta para "${mod.pasta}/", que não existe`);
  for (const campo of ['ico', 'nome', 'sub', 'tag', 'cls'])
    if (!mod[campo]) erros.push(`"${mod.pasta}" sem o campo ${campo}`);
}

const noMenu = MODULOS.map(x => x.pasta);
for (const p of pastas)
  if (!noMenu.includes(p)) erros.push(`pasta "${p}/" existe mas não está no menu`);

const cores = MODULOS.map(x => x.cls);
const dup = [...new Set(cores.filter((c, i) => cores.indexOf(c) !== i))];
if (dup.length) erros.push(`cores repetidas entre cards: ${dup.join(', ')}`);

// O botão de voltar é o que liga o módulo de volta ao hub — sem ele a criança fica presa
for (const p of pastas) {
  const src = fs.readFileSync(path.join(ROOT, p, 'index.html'), 'utf8');
  if (!src.includes('class="back-btn" href="../"'))
    erros.push(`"${p}/" sem o botão de voltar para o menu`);
}

if (erros.length) {
  console.error('❌ Problemas encontrados:\n' + erros.map(e => '   - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ Menu OK: ${MODULOS.length} módulos, todos com botão de voltar, sem órfãos e sem cor repetida.`);
