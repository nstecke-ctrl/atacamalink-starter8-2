import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type OverrideMap = Record<string, { page?: string; image?: string }>;

function abs(u: string, base: string) {
  try { return new URL(u, base).toString(); } catch { return u; }
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeout = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0', ...(init.headers||{}) }, cache: 'no-store' });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url: string, init: RequestInit = {}, timeout = 60000, retries = 2) {
  let lastErr: any = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url, init, timeout);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      lastErr = e;
    }
    await delay(400 * (i + 1));
  }
  throw lastErr || new Error('fetch failed');
}

async function findOgImage(url: string) {
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return abs(og[1], url);
  const cand = html.match(/src=["']([^"']+(hvsgmpprdstorage[^"']+|wp-content\/uploads[^"']+))["']/i);
  if (cand) return abs(cand[1], url);
  return null;
}

let overridesCache: OverrideMap | null = null;
async function readOverrides(): Promise<OverrideMap> {
  if (overridesCache) return overridesCache;
  try {
    const res = await fetchWithRetry(`/overrides.json`);
    const data = await res.json();
    overridesCache = data || {};
  } catch {
    overridesCache = {};
  }
  return overridesCache;
}

// ---- sitemaps index ----
let productUrls: string[] = [];
let indexed = false;
let indexing: Promise<void> | null = null;

async function parseLocs(xml: string): Promise<string[]> {
  const locs: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    locs.push(m[1]);
  }
  return locs;
}

async function fetchText(url: string) {
  const res = await fetchWithRetry(url);
  return await res.text();
}

async function ensureIndex() {
  if (indexed) return;
  if (indexing) return indexing;
  indexing = (async () => {
    const roots = [
      'https://www.hanwhavision.com/sitemap_index.xml',
      'https://www.hanwhavision.com/sitemap.xml',
      'https://www.hanwhavision.com/en/sitemap.xml'
    ];
    const seen = new Set<string>();
    const queue: string[] = [];

    for (const r of roots) queue.push(r);

    const MAX_MAPS = 50; // guard para no bajar todo
    let mapsFetched = 0;

    while (queue.length && mapsFetched < MAX_MAPS) {
      const u = queue.shift()!;
      if (seen.has(u)) continue;
      seen.add(u);
      let xml: string | null = null;
      try { xml = await fetchText(u); } catch { xml = null; }
      if (!xml) continue;
      mapsFetched++;

      const locs = await parseLocs(xml);
      for (const loc of locs) {
        if (loc.includes('/sitemap') && !seen.has(loc) && queue.length < 200) {
          queue.push(loc);
        }
        if (loc.includes('/en/products/')) {
          productUrls.push(loc);
        }
      }
      if (productUrls.length > 20000) break;
    }
    indexed = true;
  })();
  await indexing;
}

function pickFromIndex(sku: string): string | null {
  const s = sku.toLowerCase();
  const candidates = productUrls.filter(u => u.toLowerCase().includes(s));
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.length - b.length);
  return candidates[0];
}

async function findFromSiteSearch(sku: string) {
  const searchUrl = `https://www.hanwhavision.com/en/search/?q=${encodeURIComponent(sku)}`;
  try {
    const res = await fetchWithRetry(searchUrl, {}, 60000);
    const html = await res.text();
    const m = html.match(/href=["']([^"']*\/en\/products\/[^"']+)["']/i);
    if (!m) return null;
    let href = m[1];
    if (href.startsWith('/')) href = 'https://www.hanwhavision.com' + href;
    return href;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sku = (searchParams.get('sku') || '').trim();
  const debug = searchParams.get('debug') === '1';
  if (!sku) return NextResponse.json({ error: 'missing sku' }, { status: 400 });

  const trace: any = { sku, steps: [] };

  try {
    // 1) overrides
    const overrides = await readOverrides();
    const ov = overrides[sku] || overrides[sku.toUpperCase()] || overrides[sku.toLowerCase()];
    if (ov?.page || ov?.image) {
      const image = ov.image || (ov.page ? await findOgImage(ov.page) : null);
      const payload: any = { sku, image, datasheet: ov.page || null, source: 'override' };
      if (debug) payload.trace = trace;
      return NextResponse.json(payload);
    }
    trace.steps.push('no override');

    // 2) sitemap-first
    await ensureIndex();
    trace.steps.push({ sitemaps: productUrls.length });
    let page = pickFromIndex(sku);
    if (page) {
      const image = await findOgImage(page);
      const payload: any = { sku, image, datasheet: page, source: 'sitemap' };
      if (debug) payload.trace = trace;
      return NextResponse.json(payload);
    }
    trace.steps.push('not in sitemap');

    // 3) site search fallback
    page = await findFromSiteSearch(sku);
    if (page) {
      const image = await findOgImage(page);
      const payload: any = { sku, image, datasheet: page, source: 'site-search' };
      if (debug) payload.trace = trace;
      return NextResponse.json(payload);
    }
    trace.steps.push('not in site-search');

    return NextResponse.json({ sku, image: null, datasheet: null, source: null, note: 'not found', trace: debug ? trace : undefined });
  } catch (e: any) {
    return NextResponse.json({ sku, error: String(e?.message || e) }, { status: 500 });
  }
}
