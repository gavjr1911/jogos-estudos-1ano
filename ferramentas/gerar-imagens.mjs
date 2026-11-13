#!/usr/bin/env node
/**
 * GERADOR DE IMAGENS DOS MÓDULOS
 *
 * Lê o dicionário IMAGENS de dentro do index.html do módulo e gera um
 * images/<chave>.webp para cada descrição, no mesmo espírito do
 * gerar-audios.py — a fonte da verdade é o próprio módulo.
 *
 *   node ferramentas/gerar-imagens.mjs ingles-art
 *   node ferramentas/gerar-imagens.mjs ingles-art --forcar   (refaz as existentes)
 *
 * Usa gpt-image-2 em qualidade low: ~US$ 0,006 e ~40 KB por imagem, que é o
 * suficiente para ilustração chapada de jogo infantil. O DALL-E 3 que os
 * scripts antigos usavam foi removido pela OpenAI e retorna 400.
 *
 * QUALIDADE=medium node ... troca o tier (custa ~9x mais, ~US$ 0,05).
 *
 * Três dicionários, cada um com seu jeito de gerar:
 *   IMAGENS   ilustração quadrada com fundo branco (gpt-image-2)
 *   ADESIVOS  objeto isolado com fundo TRANSPARENTE, para arrastar e
 *             compor cenas (gpt-image-1-mini: o gpt-image-2 recusa
 *             fundo transparente)
 *   CENARIOS  cenário de fundo em paisagem 3:2, sem objetos soltos
 *             na frente (gpt-image-2)
 */

import OpenAI from "openai";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { reduzir, LADO } from "./reduzir-imagens.mjs";

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const QUALIDADE = process.env.QUALIDADE || "low";
const CONCORRENCIA = 3;

/** Estilo comum: mantém os módulos visualmente coerentes entre si. */
const BASE = "flat vector illustration, simple bold shapes, bright friendly colors, " +
             "no text, no letters, children's educational app style";
const TIPOS = {
  IMAGENS:  { modelo: "gpt-image-2", tamanho: "1024x1024", preco: 30,
              estilo: `${BASE}, clean white background` },
  ADESIVOS: { modelo: "gpt-image-1-mini", tamanho: "1024x1024", preco: 8, fundo: "transparent",
              estilo: `${BASE}, single isolated object centered, thick soft outline, sticker style, nothing else in the image` },
  CENARIOS: { modelo: "gpt-image-2", tamanho: "1536x1024", preco: 30,
              estilo: `${BASE}, wide landscape background scene, calm composition, open empty space in the foreground for placing objects` },
};
const ESTIMATIVA = { IMAGENS: 0.006, ADESIVOS: 0.003, CENARIOS: 0.009 };

function lerImagens(html, nome = "IMAGENS") {
  const m = html.match(new RegExp(`const ${nome}\\s*=\\s*\\{(.*?)\\n\\};`, "s"));
  if (!m) return {};
  // Aceita chave nua (brush) e entre aspas ("starry-night"): o nome da chave
  // é exatamente o nome do arquivo gerado.
  return Object.fromEntries(
    [...m[1].matchAll(/["']?([\w-]+)["']?\s*:\s*"([^"]*)"/g)].map(x => [x[1], x[2]])
  );
}

async function gerar(openai, dir, chave, descricao, tipo = "IMAGENS") {
  const destino = join(dir, chave + ".webp");
  const t = TIPOS[tipo];
  try {
    const r = await openai.images.generate({
      model: t.modelo,
      prompt: `${descricao}. ${t.estilo}`,
      n: 1,
      size: t.tamanho,
      quality: QUALIDADE,
      output_format: "webp",
      output_compression: 75,
      ...(t.fundo ? { background: t.fundo } : {}),
    });
    const buf = Buffer.from(r.data[0].b64_json, "base64");
    writeFileSync(destino, buf);
    const tok = r.usage?.output_tokens || 0;
    const usd = tok * t.preco / 1e6;
    console.log(`  ✅ ${chave.padEnd(20)} ${String(Math.round(buf.length / 1024) + " KB").padEnd(8)} US$ ${usd.toFixed(4)}`);
    return usd;
  } catch (e) {
    console.log(`  ❌ ${chave.padEnd(20)} ${String(e.message).slice(0, 70)}`);
    return 0;
  }
}

const pasta = process.argv[2]?.replace(/\/$/, "");
const forcar = process.argv.includes("--forcar");

if (!pasta) {
  console.error("uso: node ferramentas/gerar-imagens.mjs <pasta-do-modulo> [--forcar]");
  process.exit(1);
}

const dirModulo = join(RAIZ, pasta);
const htmlPath = join(dirModulo, "index.html");
if (!existsSync(htmlPath)) {
  console.error(`❌ ${htmlPath} não existe`);
  process.exit(1);
}

const html = readFileSync(htmlPath, "utf-8");
const imagens = {}, tipoDe = {};
for (const tipo of Object.keys(TIPOS)) {
  for (const [k, d] of Object.entries(lerImagens(html, tipo))) {
    if (k in imagens) { console.error(`❌ chave "${k}" aparece em ${tipoDe[k]} e em ${tipo} — o arquivo seria o mesmo`); process.exit(1); }
    imagens[k] = d; tipoDe[k] = tipo;
  }
}
const chaves = Object.keys(imagens);
if (!chaves.length) {
  console.error(`❌ nenhum dicionário IMAGENS, ADESIVOS ou CENARIOS encontrado em ${pasta}/index.html`);
  console.error(`   Declare assim, no <script>:\n   const IMAGENS = {\n     chave: "descrição da imagem em inglês",\n   };`);
  process.exit(1);
}

const dirImg = join(dirModulo, "images");
mkdirSync(dirImg, { recursive: true });
// Qualquer extensão conta como "já existe": módulos antigos têm .jpg/.png e
// não devem ser regerados só por mudança de formato — isso mudaria o visual
// de um módulo já publicado.
const existentes = new Set(
  readdirSync(dirImg)
    .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .map(f => f.replace(/\.(webp|jpg|jpeg|png)$/i, ""))
);
const aFazer = forcar ? chaves : chaves.filter(k => !existentes.has(k));

if (!aFazer.length) {
  console.log(`✅ ${pasta}: as ${chaves.length} imagens já existem. Use --forcar para refazer.`);
  process.exit(0);
}

const fator = QUALIDADE === "low" ? 1 : QUALIDADE === "medium" ? 9 : 36;
const estimado = aFazer.reduce((s, k) => s + ESTIMATIVA[tipoDe[k]] * fator, 0).toFixed(2);
console.log(`\n🎨 ${pasta}: ${aFazer.length} imagem(ns) em qualidade ${QUALIDADE} — estimativa US$ ${estimado}\n`);

/** A chave vive no .env do bot; aqui ela é lida, nunca copiada para o repo. */
function acharChave() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const candidatos = [
    join(RAIZ, ".env"),
    join(homedir(), "Developer", "bot", ".env"),
  ];
  for (const c of candidatos) {
    if (!existsSync(c)) continue;
    const m = readFileSync(c, "utf-8").match(/^OPENAI_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  return null;
}

const chave = acharChave();
if (!chave) {
  console.error("❌ OPENAI_API_KEY não encontrada (env, .env daqui ou ~/Developer/bot/.env)");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: chave });
let total = 0;

for (let i = 0; i < aFazer.length; i += CONCORRENCIA) {
  const lote = aFazer.slice(i, i + CONCORRENCIA);
  const custos = await Promise.all(lote.map(k => gerar(openai, dirImg, k, imagens[k], tipoDe[k])));
  total += custos.reduce((a, b) => a + b, 0);
}

console.log(`\n✅ ${aFazer.length} imagem(ns) em ${pasta}/images/ — custo US$ ${total.toFixed(4)}`);

// A API entrega 1024 px; o celular mostra ~100 px. Reduz só as recém-geradas.
const feitas = aFazer.filter(k => existsSync(join(dirImg, k + ".webp")))
  .map(k => ({ origem: join(dirImg, k + ".webp"), destino: join(dirImg, k + ".webp"), lado: LADO[tipoDe[k]] }));
const eco = await reduzir(feitas);
if (eco) console.log(`🗜️  reduzidas: ${(eco / 1e6).toFixed(1)} MB a menos`);
