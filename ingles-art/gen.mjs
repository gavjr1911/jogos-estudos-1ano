import fs from 'fs';
import path from 'path';
import https from 'https';

// Read API key from bot .env
const envContent = fs.readFileSync('/Users/gilsonvilelajr/Developer/bot/.env', 'utf8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.*)/)?.[1]?.trim();
if (!apiKey) { console.error('No API key'); process.exit(1); }

const OUT = '/Users/gilsonvilelajr/Developer/jogos-estudos-1ano/ingles-art/images';
fs.mkdirSync(OUT, { recursive: true });

function callOpenAI(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try {
          const json = JSON.parse(text);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json);
        } catch(e) { reject(new Error('Parse error: ' + text.substring(0,200))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function gen(name, prompt) {
  const output = path.join(OUT, `${name}.png`);
  if (fs.existsSync(output)) {
    console.log(`⏭️  ${name} already exists, skipping`);
    return 'SKIP';
  }
  console.log(`🎨 [${name}] Generating...`);
  
  const json = await callOpenAI({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural',
    response_format: 'b64_json'
  });
  
  const b64 = json.data[0].b64_json;
  fs.writeFileSync(output, Buffer.from(b64, 'base64'));
  console.log(`✅ [${name}] Saved (${(fs.statSync(output).size / 1024).toFixed(0)}KB)`);
  return 'OK';
}

const S = 'Colorful children-friendly illustration, clean vector style with soft gradients, white background, educational art for 6-7 year old kids. High quality, detailed. ';

const IMAGES = [
  ['brush', S + 'A paintbrush with wooden handle and soft bristles loaded with blue paint, paint dripping slightly.'],
  ['paint', S + 'An open paint pot with bright red paint inside, a small splash of paint on the side.'],
  ['canvas', S + 'A blank white painting canvas on a small wooden easel, ready to be painted.'],
  ['palette', S + 'A wooden artist palette with colorful paint blobs (red, blue, yellow, green, white) and a thumb hole.'],
  ['pencil', S + 'A yellow No.2 pencil with pink eraser, sharpened tip with graphite visible.'],
  ['crayon', S + 'A set of 6 wax crayons in a small box: red, orange, yellow, green, blue, purple. Pointed tips.'],
  ['scissors', S + 'Childrens safety scissors with rounded tips, green plastic handles, slightly open blades.'],
  ['paper', S + 'A white sheet of paper, slightly curled at one corner, with a few colorful pencil marks.'],
  ['glue', S + 'A bottle of white school glue with orange cap.'],
  ['star', S + 'A glowing golden five-pointed star radiating soft yellow light against dark blue sky. Dreamy.'],
  ['moon', S + 'A crescent moon with a warm yellow glow in a dark blue starry night sky. Peaceful.'],
  ['sun', S + 'A bright warm sun with orange-yellow rays extending outward against light blue sky.'],
  ['tree', S + 'A green cypress tree, tall and narrow like Van Gogh painted, dark green swirling foliage on a grassy hill.'],
  ['flower', S + 'A bright yellow sunflower with brown center and green stem, inspired by Van Gogh sunflowers.'],
  ['cloud', S + 'A fluffy white cumulus cloud with soft gray shadows in a bright blue sky.'],
  ['mountain', S + 'Green rolling mountain with wildflowers, blue sky with white clouds. Landscape.'],
  ['wheat', S + 'Golden wheat field with tall stalks swaying in wind, warm golden tones. Landscape.'],
  ['starry-night', S + 'Child-friendly version of Van Gogh The Starry Night: swirling blue night sky, large glowing yellow stars, crescent moon, dark cypress tree left, small village below. Post-impressionist brushstrokes.'],
  ['wheat-field', S + 'Child-friendly Van Gogh Wheat Field with Cypresses: golden wheat foreground, dark cypress trees middle, blue sky swirling white clouds. Post-impressionist.'],
  ['sunflowers', S + 'Child-friendly Van Gogh Sunflowers: a yellow vase with bright sunflowers, warm yellow background. Post-impressionist.'],
  ['bedroom', S + 'Child-friendly Van Gogh The Bedroom: cozy room blue walls, wooden bed red blanket, two chairs, paintings on wall. Post-impressionist.'],
  ['self-portrait', S + 'Child-friendly Van Gogh self-portrait: man with red beard blue eyes, blue coat, swirling blue-green background. Friendly.'],
  ['scene-day', S + 'Cheerful daytime scene: bright blue sky, white clouds, green hills, yellow sun, colorful flowers, butterfly.'],
  ['scene-night', S + 'Peaceful nighttime scene: dark blue starry sky, crescent moon, cozy village with lit windows, fireflies, owl on tree.'],
  ['vangogh-artist', S + 'Child-friendly cartoon of Vincent Van Gogh: red beard, straw hat, blue clothes, holding palette and paintbrush, in front of easel outdoors sunny field.'],
];

async function main() {
  console.log(`Generating ${IMAGES.length} images...\n`);
  const log = [];
  let ok = 0, fail = 0, skip = 0;
  
  for (let i = 0; i < IMAGES.length; i++) {
    const [name, prompt] = IMAGES[i];
    try {
      const result = await gen(name, prompt);
      log.push(`${result} ${name}`);
      if (result === 'OK') ok++;
      else skip++;
    } catch(e) {
      log.push(`FAIL ${name}: ${e.message}`);
      console.error(`❌ ${name}: ${e.message}`);
      fail++;
    }
    fs.writeFileSync(path.join(OUT, 'progress.log'), log.join('\n'));
    if (i < IMAGES.length - 1) await new Promise(r => setTimeout(r, 3000));
  }
  
  log.push(`\nDONE: ${ok} generated, ${skip} skipped, ${fail} failed`);
  fs.writeFileSync(path.join(OUT, 'progress.log'), log.join('\n'));
  console.log(`\n🎉 Done! ${ok} generated, ${skip} skipped, ${fail} failed`);
}

main();
