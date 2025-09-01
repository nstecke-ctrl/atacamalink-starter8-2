'use client';
// Catálogo robusto con detección flexible de cámaras/radios y fallbacks.

export type Product = {
  id?: string;
  brand: string;
  model: string;
  category?: string;
  blurb?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  image?: string;
  datasheet?: string;
  slug?: string;
  highlight?: string;
};

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
const norm = (s: any) => String(s ?? '').trim().toLowerCase();
const normCompact = (s: any) => norm(s).replace(/[^a-z0-9]+/g, '');

const imageOverride: Record<string, string> = {
  // claves compactas (modelo sin espacios/guiones)
  'xnpc6403r':'https://hvsgmpprdstorage.blob.core.windows.net/pim/XNP-C8253RG/thumbnails/large_04/XNP-C6403R_KO_white_01_M-1.png',
  'mtp3550':'https://www.motorolasolutions.com/content/dam/msi/images/products/two-way-radios/dimetra-tetra/terminals/portable/mtp3000/mtp3550/product-mtp3550-front-w-screen.jpg#1',
  'mtm5400':'https://www.motorolasolutions.com/content/dam/msi/images/business/product_lines/dimetra_tetra/terminals/mobile_radios/mtm5400/_images/_staticfiles/mtm5400_lg.jpg',
  'mt680plus':'https://img-cdn.hytera.com/iwov-resources/hytera/02_products/2_main_image/DMR_TETRA/en_MT680_Plus_main.png_n.webp',
  'pt580hplus':'https://img-cdn.hytera.com/iwov-resources/hytera/02_products/2_main_image/DMR_TETRA/en_PT580H_Plus_main.png_n.webp',
};

const metaOverride: Record<string, { price?: number; currency?: string; highlight?: string }> = {
  'mt680plus':  { price: 1550000, currency: 'CLP', highlight: 'Homologada en Minera Candelaria' },
  'mtm5400':    { price: 1480000, currency: 'CLP', highlight: 'Homologada en Minera El Abra' },
  'mtp3550':    { price: 1250000, currency: 'CLP', highlight: 'Homologada en Minera El Abra' },
  'pt580hplus': { price: 1100000, currency: 'CLP', highlight: 'Homologada en Minera Candelaria' },
};

function normalizeCategory(c?: string) {
  if (!c) return '';
  const raw = norm(c).replace(/_/g, '-').replace(/\s+/g, ' ');
  const map: Record<string, string> = {
    'camera network': 'camera',
    'camera-network': 'camera',
    'network camera': 'camera',
    'camera - network': 'camera',
    'cctv': 'camera',
    'ip camera': 'camera',
    'radio mobile': 'radio',
    'radio-mobile': 'radio',
    'mobile radio': 'radio',
    'radio - mobile': 'radio',
    'radio portable': 'radio',
    'radio-portable': 'radio',
    'portable radio': 'radio',
    'radio - portable': 'radio',
  };
  return map[raw] || raw;
}

export function isCamera(p: Product) {
  const cat = normalizeCategory(p.category);
  const model = normCompact(p.model);
  return cat.includes('camera') || /(xnp|xno|pnp|pnm|qnp|qno|ipc|cam)/i.test(model);
}
export function isRadio(p: Product) {
  const cat = normalizeCategory(p.category);
  const model = String(p.model || '');
  return cat.includes('radio') || /(mtm|mtp|pt\d|dmr|tetra|hytera|motorola)/i.test(model);
}

export async function loadCatalog(): Promise<Product[]> {
  // Intentamos primero /products.json, si falla probamos /data/products.json
  async function fetchJson(url: string) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  let data: any[] = [];
  try {
    data = await fetchJson('/products.json');
  } catch {
    try { data = await fetchJson('/data/products.json'); } catch { data = []; }
  }
  const raw: Product[] = Array.isArray(data) ? data : [];

  // Filtra marcas excluidas
  const filtered = raw.filter(p => {
    const b = norm(p.brand);
    return b !== 'pelco' && b !== 'avigilon';
  });

  // Normaliza y aplica overrides
  return filtered.map((p) => {
    const slug = p.slug || slugify(`${p.brand}-${p.model}`);
    const id = p.id || slug;
    const key = normCompact(p.model);
    const img = imageOverride[key] || p.image;
    const meta = metaOverride[key];
    const category = normalizeCategory(p.category);
    return { ...p, slug, id, image: img, ...(meta ? meta : {}), category };
  });
}

export function filterBy(fn: (p: Product) => boolean) {
  return (list: Product[]) => list.filter(fn);
}

export function formatMoneyCLP(value?: number | null) {
  if (typeof value !== 'number') return null;
  try { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value); }
  catch { return `$${value}`; }
}
