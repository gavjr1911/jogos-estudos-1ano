#!/usr/bin/env node
/**
 * Gera todas as imagens do módulo Art Fun! usando DALL-E 3
 * Uso: node generate-images.js
 */
require('dotenv').config({ path: '/Users/gilsonvilelajr/Developer/bot/.env' });
const path = require('path');
const { generateImage } = require('/Users/gilsonvilelajr/Developer/bot/src/services/image-generator');

const OUT = path.join(__dirname, 'images');

const STYLE_PREFIX = 'Colorful children-friendly illustration, clean vector style with soft gradients, white background, educational art for 6-7 year old kids. High quality, detailed.';

const IMAGES = [
  // === ART SUPPLIES ===
  { name: 'brush', prompt: `${STYLE_PREFIX} A paintbrush with wooden handle and soft bristles loaded with blue paint, paint dripping slightly. Side view.` },
  { name: 'paint', prompt: `${STYLE_PREFIX} An open paint pot with bright red paint inside, a small splash of paint on the side. Front view.` },
  { name: 'canvas', prompt: `${STYLE_PREFIX} A blank white painting canvas on a small wooden easel, ready to be painted. Front view.` },
  { name: 'palette', prompt: `${STYLE_PREFIX} A wooden artist palette with colorful paint blobs (red, blue, yellow, green, white) and a thumb hole. Top view.` },
  { name: 'pencil', prompt: `${STYLE_PREFIX} A yellow No.2 pencil with pink eraser, sharpened tip with graphite visible. Slight angle view.` },
  { name: 'crayon', prompt: `${STYLE_PREFIX} A set of 6 wax crayons in a small box: red, orange, yellow, green, blue, purple. Each crayon has a pointed tip. Front view.` },
  { name: 'scissors', prompt: `${STYLE_PREFIX} Children's safety scissors with rounded tips, green plastic handles, slightly open blades. Front view.` },
  { name: 'paper', prompt: `${STYLE_PREFIX} A white sheet of paper, slightly curled at one corner, with a few colorful pencil marks on it. Front view.` },
  { name: 'glue', prompt: `${STYLE_PREFIX} A bottle of white school glue (like Elmer's), with orange cap, front label visible. Front view.` },

  // === NATURE ELEMENTS ===
  { name: 'star', prompt: `${STYLE_PREFIX} A glowing golden five-pointed star radiating soft yellow light against dark blue sky. Dreamy and magical.` },
  { name: 'moon', prompt: `${STYLE_PREFIX} A crescent moon with a warm yellow glow in a dark blue starry night sky. Peaceful and dreamy.` },
  { name: 'sun', prompt: `${STYLE_PREFIX} A bright warm sun with orange-yellow rays extending outward, friendly face optional. Against light blue sky.` },
  { name: 'tree', prompt: `${STYLE_PREFIX} A green cypress tree, tall and narrow like the ones Van Gogh painted, with dark green swirling foliage. On a grassy hill.` },
  { name: 'flower', prompt: `${STYLE_PREFIX} A bright yellow sunflower with brown center and green stem and leaves, inspired by Van Gogh's sunflowers. Front view.` },
  { name: 'cloud', prompt: `${STYLE_PREFIX} A fluffy white cumulus cloud with soft gray shadows, in a bright blue sky. Side view.` },
  { name: 'mountain', prompt: `${STYLE_PREFIX} A green rolling mountain with wildflowers, blue sky with white clouds above. Landscape view.` },
  { name: 'wheat', prompt: `${STYLE_PREFIX} A golden wheat field with tall wheat stalks swaying in the wind, warm golden tones. Landscape view.` },

  // === VAN GOGH PAINTINGS (simplified child-friendly versions) ===
  { name: 'starry-night', prompt: `${STYLE_PREFIX} A simplified child-friendly version of Van Gogh's "The Starry Night" painting: swirling blue night sky with large glowing yellow stars, a crescent moon, dark cypress tree on the left, small village with church steeple below. Post-impressionist style with visible brushstrokes.` },
  { name: 'wheat-field', prompt: `${STYLE_PREFIX} A simplified child-friendly version of Van Gogh's "Wheat Field with Cypresses": golden wheat field in foreground, dark green cypress trees in middle, blue sky with swirling white clouds above. Post-impressionist style with visible brushstrokes.` },
  { name: 'sunflowers', prompt: `${STYLE_PREFIX} A simplified child-friendly version of Van Gogh's "Sunflowers" painting: a yellow vase filled with bright sunflowers in various stages, some open fully, some wilting slightly, against a warm yellow background. Post-impressionist style.` },
  { name: 'bedroom', prompt: `${STYLE_PREFIX} A simplified child-friendly version of Van Gogh's "The Bedroom" at Arles: a cozy bedroom with blue walls, a wooden bed with red blanket, two chairs, paintings on wall, wooden floor, window on right. Post-impressionist style.` },
  { name: 'self-portrait', prompt: `${STYLE_PREFIX} A simplified child-friendly version of Van Gogh's self-portrait: a man with red beard and blue eyes wearing a blue coat, swirling blue-green background pattern. Post-impressionist style with visible brushstrokes. Friendly expression.` },

  // === DAY/NIGHT SCENES ===
  { name: 'scene-day', prompt: `${STYLE_PREFIX} A cheerful daytime scene: bright blue sky with white clouds, green hills, yellow sun shining, colorful flowers in a meadow, a butterfly flying. Warm and vibrant.` },
  { name: 'scene-night', prompt: `${STYLE_PREFIX} A peaceful nighttime scene: dark blue starry sky with crescent moon, a small cozy village with lit windows, fireflies glowing, an owl sitting on a tree branch. Calm and dreamy.` },
  
  // === VAN GOGH PORTRAIT (for quiz) ===
  { name: 'vangogh-artist', prompt: `${STYLE_PREFIX} A child-friendly cartoon illustration of Vincent Van Gogh as a friendly painter: red beard, straw hat, blue work clothes, holding a palette and paintbrush, standing in front of an easel outdoors in a sunny field. Warm, approachable.` },
];

async function main() {
  console.log(`\n🎨 Generating ${IMAGES.length} images for Art Fun module...\n`);
  
  let success = 0;
  let fail = 0;
  
  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const output = path.join(OUT, `${img.name}.png`);
    
    try {
      console.log(`[${i+1}/${IMAGES.length}] ${img.name}...`);
      await generateImage(img.prompt, { output, quality: 'standard', style: 'natural' });
      success++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
      fail++;
    }
    
    // Rate limit: wait between requests
    if (i < IMAGES.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\n✅ Done! ${success} generated, ${fail} failed.\n`);
  console.log(`Images saved in: ${OUT}/`);
}

main().catch(console.error);
