#!/usr/bin/env node
/**
 * Gera imagens HD via GPT-Image-1 para o módulo Art Fun!
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const envContent = fs.readFileSync('/Users/gilsonvilelajr/Developer/bot/.env', 'utf8');
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)/);
  if (m) process.env[m[1]] = m[2].trim();
}

import { generateImage } from '/Users/gilsonvilelajr/Developer/bot/src/services/image-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'images');
fs.mkdirSync(OUT, { recursive: true });

const S = 'Colorful children-friendly illustration, clean digital art with soft gradients, white background, educational art for 6-7 year old kids. High quality, highly detailed, no text or letters in the image. ';

const IMAGES = [
  // ART SUPPLIES
  ['brush', S + 'A paintbrush with wooden handle and soft bristles loaded with blue paint, paint dripping slightly. Side view.'],
  ['paint', S + 'An open paint pot with bright red paint inside, a small splash of paint on the side. Front view.'],
  ['canvas', S + 'A blank white painting canvas on a small wooden easel, ready to be painted. Front view.'],
  ['palette', S + 'A wooden artist palette with colorful paint blobs (red, blue, yellow, green, white) and a thumb hole. Top view.'],
  ['pencil', S + 'A yellow number 2 pencil with pink eraser, sharpened tip with graphite visible. Slight angle view.'],
  ['crayon', S + 'A set of 6 wax crayons in a small box: red, orange, yellow, green, blue, purple. Pointed tips. Front view.'],
  ['scissors', S + 'Childrens safety scissors with rounded tips, green plastic handles, slightly open blades. Front view.'],
  ['paper', S + 'A white sheet of paper, slightly curled at one corner, with a few colorful pencil marks. Front view.'],
  ['glue', S + 'A bottle of white school glue with orange cap. Front view.'],
  // NATURE
  ['star', S + 'A glowing golden five-pointed star radiating soft yellow light against dark blue sky. Dreamy and magical.'],
  ['moon', S + 'A crescent moon with warm yellow glow in a dark blue starry night sky. Peaceful and dreamy.'],
  ['sun', S + 'A bright warm sun with orange-yellow rays extending outward against light blue sky. Friendly.'],
  ['tree', S + 'A green cypress tree, tall and narrow like Van Gogh painted, with dark green swirling foliage on a grassy hill.'],
  ['flower', S + 'A bright yellow sunflower with brown center and green stem, inspired by Van Gogh sunflowers. Front view.'],
  ['cloud', S + 'A fluffy white cumulus cloud with soft gray shadows, in a bright blue sky. Side view.'],
  ['mountain', S + 'A green rolling mountain with wildflowers, blue sky with white clouds above. Landscape view.'],
  ['wheat', S + 'A golden wheat field with tall wheat stalks swaying in wind, warm golden tones. Landscape view.'],
  // VAN GOGH PAINTINGS (child-friendly recreations)
  ['starry-night', S + 'A child-friendly recreation of Van Gogh The Starry Night: swirling deep blue night sky with large glowing yellow stars and spirals, bright crescent moon, dark flame-shaped cypress tree on left, small charming village with church steeple below, rolling hills. Post-impressionist visible brushstroke style.'],
  ['wheat-field', S + 'A child-friendly recreation of Van Gogh Wheat Field with Cypresses: golden wheat field in foreground swaying in wind, dark green flame-shaped cypress trees in middle, brilliant blue sky with large swirling white clouds. Post-impressionist visible brushstroke style.'],
  ['sunflowers', S + 'A child-friendly recreation of Van Gogh Sunflowers painting: a round yellow ceramic vase filled with bright sunflowers in various stages of bloom against warm yellow background. Post-impressionist visible brushstroke style.'],
  ['bedroom', S + 'A child-friendly recreation of Van Gogh The Bedroom at Arles: cozy small bedroom with blue walls, wooden bed with red blanket, two chairs, small table, paintings on wall, wooden floor, window on right. Post-impressionist visible brushstroke style.'],
  ['self-portrait', S + 'A child-friendly recreation of Van Gogh self-portrait: a kind-looking man with red-orange beard and bright blue eyes wearing a blue coat, swirling blue-green background pattern. Post-impressionist visible brushstroke style. Friendly warm expression.'],
  // SCENES
  ['scene-day', S + 'A cheerful bright daytime countryside scene: vivid blue sky with puffy white clouds, lush green rolling hills, warm yellow sun shining, colorful wildflowers in a meadow, a butterfly and a bird flying. Warm, vibrant, joyful.'],
  ['scene-night', S + 'A peaceful magical nighttime scene: deep dark blue starry sky with crescent moon, a small cozy village with warmly lit windows, gentle fireflies glowing, a friendly owl sitting on a tree branch. Calm and dreamy.'],
  // VAN GOGH ARTIST
  ['vangogh-artist', S + 'A friendly warm cartoon illustration of Vincent Van Gogh as a painter: distinctive red-orange beard, wearing a straw hat, blue work clothes, holding a painters palette and paintbrush, standing in front of an easel outdoors in a sunny wheat field. Approachable and kind.'],
  // MASCOT
  ['mascot', S + 'A cute cartoon owl wearing a purple French beret and holding a thin paintbrush with paint on it. The owl is colorful with big round expressive friendly eyes, small wings, sitting on a branch. Artistic and cheerful.'],
];

const LOG = path.join(OUT, 'progress.log');

async function main() {
  let ok = 0, skip = 0, fail = 0;
  fs.writeFileSync(LOG, `Started: ${new Date().toISOString()}\n`);

  for (const [name, prompt] of IMAGES) {
    const output = path.join(OUT, `${name}.png`);
    if (fs.existsSync(output) && fs.statSync(output).size > 10000) {
      console.log(`⏭️  ${name} exists (${(fs.statSync(output).size/1024).toFixed(0)}KB), skipping`);
      fs.appendFileSync(LOG, `SKIP ${name}\n`);
      skip++;
      continue;
    }
    try {
      await generateImage(prompt, { output, quality: 'medium' });
      ok++;
      fs.appendFileSync(LOG, `OK ${name}\n`);
      // Rate limit delay
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
      fs.appendFileSync(LOG, `FAIL ${name}: ${e.message}\n`);
      fail++;
      // Longer delay on error
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  const summary = `\nDONE: ${ok} generated, ${skip} skipped, ${fail} failed — ${new Date().toISOString()}`;
  fs.appendFileSync(LOG, summary);
  console.log(`\n🎉 ${summary}`);
}

main();
