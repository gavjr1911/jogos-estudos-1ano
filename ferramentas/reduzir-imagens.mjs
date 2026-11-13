#!/usr/bin/env node
/**
 * REDUZIR IMAGENS
 *
 * A API devolve 1024 px (~130 KB por adesivo); no celular o adesivo aparece
 * com ~100 px. Isto redimensiona e recomprime em WebP usando o Chrome do
 * Puppeteer (canvas.toDataURL) — sem sharp, sem ImageMagick, mantendo a
 * transparência. PNG/JPG antigos viram .webp ao lado.
 *
 *   node ferramentas/reduzir-imagens.mjs <pasta-do-modulo>
 *
 * O gerar-imagens.mjs chama isto sozinho depois de gerar.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";
import { homedir } from "os";

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));

/** Lado máximo, em px, por dicionário do módulo. */
export const LADO = { ADESIVOS: 384, IMAGENS: 640, CENARIOS: 1200 };
const QUALIDADE = 0.82;

async function carregarPuppeteer() {
  for (const base of [RAIZ, join(homedir(), "Developer", "bot")]) {
    try {
      const req = createRequire(join(base, "package.json"));
      return (await import(pathToFileURL(req.resolve("puppeteer")).href)).default;
    } catch (e) { /* tenta o próximo */ }
  }
  return null;
}

/**
 * itens: [{origem, destino, lado}] — origem pode ser .png/.jpg/.webp.
 * Devolve quantos bytes economizou; null se não houver Puppeteer.
 */
export async function reduzir(itens) {
  if (!itens.length) return 0;
  const puppeteer = await carregarPuppeteer();
  if (!puppeteer) { console.log("⚠️  Puppeteer não encontrado — imagens ficam no tamanho original"); return null; }
  const browser = await puppeteer.launch({ headless: "new" });
  let antes = 0, depois = 0;
  try {
    const page = await browser.newPage();
    for (const it of itens) {
      const buf = readFileSync(it.origem);
      const tipo = it.origem.endsWith(".png") ? "png" : /\.jpe?g$/.test(it.origem) ? "jpeg" : "webp";
      const dataUrl = `data:image/${tipo};base64,${buf.toString("base64")}`;
      const saida = await page.evaluate(async (url, lado, q) => {
        const img = new Image(); img.src = url; await img.decode();
        const k = Math.min(1, lado / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const ctx = c.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL("image/webp", q);
      }, dataUrl, it.lado, QUALIDADE);
      const novo = Buffer.from(saida.split(",")[1], "base64");
      // Só troca se ficou menor (ou se é conversão de formato).
      if (it.origem !== it.destino || novo.length < buf.length) {
        writeFileSync(it.destino, novo);
        antes += buf.length; depois += novo.length;
      }
    }
  } finally {
    await browser.close();
  }
  return antes - depois;
}

/** Lê os dicionários do módulo para saber o tipo (e o lado) de cada chave. */
export function ladosDoModulo(html) {
  const lados = {};
  for (const [nome, lado] of Object.entries(LADO)) {
    const m = html.match(new RegExp(`const ${nome}\\s*=\\s*\\{(.*?)\\n\\};`, "s"));
    if (!m) continue;
    for (const x of m[1].matchAll(/["']?([\w-]+)["']?\s*:\s*"/g)) lados[x[1]] = lado;
  }
  return lados;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pasta = process.argv[2]?.replace(/\/$/, "");
  if (!pasta) { console.error("uso: node ferramentas/reduzir-imagens.mjs <pasta-do-modulo>"); process.exit(1); }
  const dir = join(RAIZ, pasta, "images");
  if (!existsSync(dir)) { console.error(`❌ ${pasta}/images não existe`); process.exit(1); }
  const lados = ladosDoModulo(readFileSync(join(RAIZ, pasta, "index.html"), "utf-8"));
  const arquivos = readdirSync(dir).filter(f => /\.(webp|png|jpe?g)$/i.test(f));
  const temWebp = new Set(arquivos.filter(f => f.endsWith(".webp")).map(f => f.slice(0, -5)));
  const itens = arquivos
    // PNG/JPG só é convertido se ainda não houver o .webp da mesma chave.
    .filter(f => f.endsWith(".webp") || !temWebp.has(f.replace(/\.\w+$/, "")))
    .map(f => {
      const chave = f.replace(/\.\w+$/, "");
      return { origem: join(dir, f), destino: join(dir, chave + ".webp"), lado: lados[chave] || LADO.IMAGENS };
    });
  const total = itens.reduce((s, it) => s + statSync(it.origem).size, 0);
  const eco = await reduzir(itens);
  if (eco !== null) console.log(`✅ ${pasta}: ${itens.length} imagens, ${(total / 1e6).toFixed(1)} MB → ${((total - eco) / 1e6).toFixed(1)} MB`);
}
