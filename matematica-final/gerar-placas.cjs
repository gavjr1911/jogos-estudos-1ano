#!/usr/bin/env node
/**
 * PLACAS DE NÚMERO do módulo matematica-final.
 *
 * O gerador de imagens por IA erra algarismos, então as placas com número
 * (usadas no ordenar e no mascote de Sequências) são desenhadas aqui, com a
 * fonte do sistema, no canvas do Chrome do Puppeteer. Lê a lista de
 * `const PLACAS = [...]` do index.html e grava images/num<N>.webp.
 *
 *   node matematica-final/gerar-placas.cjs
 *
 * Também desenha a barra de dez (exatamente 10 cubinhos — a IA desenhava 7)
 * e o cubinho, no mesmo estilo, para a criança ver que 10 cubinhos = 1 barra.
 *
 * Sem custo e determinístico: rodar de novo produz as mesmas placas.
 */
const fs = require('fs'), path = require('path'), os = require('os');

function carregarPuppeteer() {
  for (const base of [path.join(__dirname, '..'), path.join(os.homedir(), 'Developer', 'bot')]) {
    try { return require(require.resolve('puppeteer', { paths: [base] })); } catch (e) {}
  }
  throw new Error('puppeteer não encontrado');
}

(async () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const lista = JSON.parse(html.match(/const PLACAS\s*=\s*(\[[^\]]*\])/)[1]);
  const dir = path.join(__dirname, 'images');
  fs.mkdirSync(dir, { recursive: true });

  const browser = await carregarPuppeteer().launch({ headless: 'new' });
  const page = await browser.newPage();
  const imagens = await page.evaluate(lista => {
    const cores = ['#ff6b9d', '#4d96ff', '#ff924c', '#a06cd5', '#19c3b1', '#6bcb77'];
    return lista.map(n => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d');
      const cor = cores[n % cores.length];
      const ret = (p, r, fill) => { x.beginPath(); x.roundRect(p, p, 256 - 2 * p, 256 - 2 * p, r); x.fillStyle = fill; x.fill(); };
      ret(6, 54, '#ffffff');                 // borda branca de adesivo
      ret(18, 44, cor);
      x.globalAlpha = .18; ret(18, 44, '#000'); x.globalAlpha = 1;
      x.beginPath(); x.roundRect(18, 18, 220, 206, 44); x.fillStyle = cor; x.fill();
      const t = String(n);
      x.font = `bold ${t.length > 1 ? 132 : 160}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineJoin = 'round'; x.lineWidth = 14; x.strokeStyle = 'rgba(0,0,0,.28)';
      x.strokeText(t, 128, 128); x.fillStyle = '#fff'; x.fillText(t, 128, 124);
      return [n, c.toDataURL('image/webp', 0.9)];
    });
  }, lista);
  const blocos = await page.evaluate(() => {
    // cubo em perspectiva simples: frente, topo e lado
    const cubo = (x, px, py, a, d) => {
      const f = (pts, cor) => { x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u, v) : x.moveTo(u, v)); x.closePath(); x.fillStyle = cor; x.fill(); x.stroke(); };
      x.lineWidth = Math.max(3, a / 10); x.lineJoin = 'round'; x.strokeStyle = '#174a8c';
      f([[px, py], [px + a, py], [px + a, py + a], [px, py + a]], '#4fb3ff');
      f([[px, py], [px + d, py - d], [px + a + d, py - d], [px + a, py]], '#a9dcff');
      f([[px + a, py], [px + a + d, py - d], [px + a + d, py + a - d], [px + a, py + a]], '#2a86d6');
    };
    const tela = () => { const c = document.createElement('canvas'); c.width = c.height = 384; return c; };
    const b = tela(), xb = b.getContext('2d'), a = 34, d = 12;
    const x0 = (384 - a - d) / 2, y0 = (384 - 10 * a + d) / 2;
    for (let i = 9; i >= 0; i--) cubo(xb, x0, y0 + i * a, a, d);   // de baixo para cima
    const u = tela(), xu = u.getContext('2d'), A = 110, D = 36;
    cubo(xu, (384 - A - D) / 2, (384 - A + D) / 2, A, D);
    return { barra: b.toDataURL('image/webp', 0.9), cubinho: u.toDataURL('image/webp', 0.9) };
  });
  for (const [k, url] of Object.entries(blocos)) imagens.push([k, url]);
  for (const [n, url] of imagens)
    fs.writeFileSync(path.join(dir, (typeof n === 'number' ? 'num' + n : n) + '.webp'), Buffer.from(url.split(',')[1], 'base64'));
  await browser.close();
  console.log(`✅ ${imagens.length} placas em ${path.relative(process.cwd(), dir)}/`);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
