// scripts/hanwha-oneoff-populate-images.cjs
// Carga ÚNICA: completa imágenes/datasheets de Hanwha en public/products.json
// Estrategia: 1) Azure PIM (por prefijo de SKU)  2) overrides.json  3) logo Hanwha local
//
// Uso:
//   node scripts/hanwha-oneoff-populate-images.cjs --limit=300 --verbose
//   # continuar
//   node scripts/hanwha-oneoff-populate-images.cjs --offset=300 --limit=300 --verbose
//
// Resultado: public/products_with_images.json  → luego reemplaza public/products.json

const fs = require('fs/promises');
const path = require('path');

// ---- CLI ----
const flags = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
}));
const VERBOSE = !!flags.verbose;
const LIMIT = flags.limit ? parseInt(flags.limit, 10) : null;
const OFFSET = flags.offset ? parseInt(flags.offset, 10) : 0;
const TIMEOUT_MS = flags.timeout ? Math.max(5000, parseInt(flags.timeout, 10)) : 20000;

const UA = "Mozilla/5.0 (compatible; AtacamaLinkBot/1.0)";
const PIM_BASE = 'https://hvsgmpprdstorage.blob.core.windows.net/pim';
const HANWHA_LOGO_LOCAL = '/brand/hanwha-placeholder.png';

function log(...xs){ if (VERBOSE) console.log(...xs); }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
function norm(s){ return String(s||'').trim(); }
function normLower(s){ return norm(s).toLowerCase(); }

function withTimeout(promise, ms){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return Promise.race([
    promise(ctrl.signal).finally(() => clearTimeout(t)),
    new Promise((_,rej)=> setTimeout(()=> rej(new Error('timeout')), ms+100))
  ]);
}

async function fetchText(url, ms = TIMEOUT_MS){
  return withTimeout(async (signal) => {
    const r = await fetch(url, { signal, headers: { 'user-agent': UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return await r.text();
  }, ms);
}

function pickBest(names, sku){
  // Prefer thumbnails grandes y archivos "main"
  const scored = names.map(n => {
    const L = n.toLowerCase();
    let s = 0;
    if (L.includes('/thumbnails/large_08/')) s += 1000;
    if (L.includes('/thumbnails/large_04/')) s += 800;
    if (L.includes('/thumbnails/')) s += 500;
    if (L.endsWith('.png')) s += 50;
    if (L.endsWith('.jpg') || L.endsWith('.jpeg')) s += 40;
    if (/-01|_01|main/.test(L)) s += 10;
    if (L.includes(sku.toLowerCase())) s += 5;
    return { n, s };
  }).sort((a,b) => b.s - a.s);
  return scored.length ? scored[0].n : null;
}

async function findImageBySKU(sku){
  // Lista objetos con prefijo <SKU>/ y elige la mejor miniatura
  const url = `${PIM_BASE}?restype=container&comp=list&prefix=${encodeURIComponent(sku)}/`;
  try {
    const xml = await fetchText(url);
    const names = Array.from(xml.matchAll(/<Name>([^<]+)<\/Name>/g)).map(m => m[1]);
    const filtered = names.filter(n => n && n.toLowerCase().includes(sku.toLowerCase()));
    if (!filtered.length) return null;
    const best = pickBest(filtered, sku);
    return best ? `${PIM_BASE}/${best}` : null;
  } catch {
    return null;
  }
}

async function loadOverrides(root){
  const candidates = [
    path.join(root, 'public', 'overrides.json'),
    path.join(root, 'scripts', 'overrides.json'),
  ];
  for (const p of candidates){
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const j = JSON.parse(raw);
      log('[overrides] loaded', p);
      return j;
    } catch {}
  }
  return {};
}

async function main(){
  const ROOT = process.cwd();
  const IN = path.join(ROOT, 'public', 'products.json');
  const OUT = path.join(ROOT, 'public', 'products_with_images.json');

  const overrides = await loadOverrides(ROOT);

  const raw = await fs.readFile(IN, 'utf-8');
  const list = JSON.parse(raw);
  const total = list.length;
  console.log(`[INFO] Productos: ${total} (LIMIT=${LIMIT ?? 'none'}, OFFSET=${OFFSET})`);

  const end = LIMIT === null ? total : Math.min(total, OFFSET + LIMIT);
  let updated = 0;

  for (let i = OFFSET; i < end; i++){
    const p = list[i];
    const brand = normLower(p?.brand);
    const sku = norm(p?.model);
    if (!sku) continue;

    // Solo Hanwha Vision (otros brands quedan igual)
    if (!brand.includes('hanwha')) continue;

    // Si ya tiene imagen, no tocar
    if (p.image && norm(p.image) !== '') { log(`[${i+1}/${total}] skip: ${sku}`); continue; }

    console.log(`[${i+1}/${total}] ${sku} ...`);

    // 1) overrides
    const ov = overrides[sku] || overrides[sku.toUpperCase?.()] || overrides[sku.toLowerCase?.()];
    if (ov?.image) {
      p.image = ov.image;
      if (ov.page && !p.datasheet) p.datasheet = ov.page;
      updated++; continue;
    }

    // 2) Azure PIM
    const img = await findImageBySKU(sku);
    if (img){
      p.image = img;
      if (ov?.page && !p.datasheet) p.datasheet = ov.page;
      updated++; continue;
    }

    // 3) Fallback logo local
    p.image = HANWHA_LOGO_LOCAL;
    if (ov?.page && !p.datasheet) p.datasheet = ov.page;
    updated++;
    await sleep(60);
  }

  await fs.writeFile(OUT, JSON.stringify(list, null, 2));
  console.log(`[OK] Productos actualizados: ${updated}. Archivo: public/products_with_images.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
