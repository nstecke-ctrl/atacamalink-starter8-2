// lib/catalog.ts
// Helpers de catálogo SIN usar node:fs ni node:path y con exports usados por tus páginas.

export type Product = {
  id?: string;
  name: string;
  brand?: string;          // "hanwha", "motorola", "hytera", etc.
  model?: string;
  description?: string;
  categories?: string[];   // ej: ["camera","lpr"] o ["vhf","uhf"]
  category?: string;
  slug?: string;
  image?: string;
  price?: number;
  [key: string]: any;
};

// ---------- util ----------
export const ensureSlug = (s?: string | null): string =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ---------- carga catálogo (sin fs) ----------
let ALL_PRODUCTS: Product[] = [];
try {
  // Importamos desde código (no /public). Next puede resolver JSON en build.
  // Si tu TS tiene "resolveJsonModule": true, esto compila bien.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = require("@/lib/data/products.json");
  const arr = Array.isArray(data) ? data : (data?.products || []);
  ALL_PRODUCTS = Array.isArray(arr) ? arr : [];
} catch {
  ALL_PRODUCTS = [];
}

// Normalizamos slug siempre
export const getAllProducts = (): Product[] =>
  ALL_PRODUCTS.map((p) => ({ ...p, slug: p.slug || ensureSlug(p.name || p.model || "") }));

// Alias usado por tus páginas
export const loadCatalog = (): Product[] => getAllProducts();

// ---------- heurísticas por tipo ----------
const CAMERA_KEYS = new Set(["camera", "camaras", "cctv", "lpr", "ptz", "bullet", "dome"]);
const RADIO_KEYS  = new Set(["radio", "vhf", "uhf", "dmr", "tetra"]);
const RADIO_BRANDS  = new Set(["motorola", "hytera"]);
const CAMERA_BRANDS = new Set(["hanwha", "hanwha vision", "hanwhavision"]);

function categoriesOf(p: Product): string[] {
  if (Array.isArray(p.categories)) return p.categories.map((x) => ensureSlug(String(x)));
  if (p.category) return [ensureSlug(String(p.category))];
  return [];
}

export const isCamera = (p: Product): boolean => {
  const b = (p.brand || "").toLowerCase();
  if (CAMERA_BRANDS.has(b)) return true;
  return categoriesOf(p).some((c) => CAMERA_KEYS.has(c));
};

export const isRadio = (p: Product): boolean => {
  const b = (p.brand || "").toLowerCase();
  if (RADIO_BRANDS.has(b)) return true;
  return categoriesOf(p).some((c) => RADIO_KEYS.has(c));
};

// ---------- búsquedas / filtros ----------
export function searchProducts(query: string, list?: Product[]): Product[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return (list || getAllProducts());
  const haystack = (list || getAllProducts());
  return haystack.filter((p) => {
    const name  = (p.name || "").toLowerCase();
    const model = (p.model || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const desc  = (p.description || "").toLowerCase();
    return name.includes(q) || model.includes(q) || brand.includes(q) || desc.includes(q);
  });
}

export function byBrand(brand: string, list?: Product[]): Product[] {
  const b = (brand || "").toLowerCase();
  const haystack = (list || getAllProducts());
  return haystack.filter((p) => (p.brand || "").toLowerCase() === b);
}

export function filterByCategory(category: string, list?: Product[], brand?: string): Product[] {
  const cSlug = ensureSlug(category);
  let haystack = (list || getAllProducts());
  if (brand) haystack = byBrand(brand, haystack);
  return haystack.filter((p) => categoriesOf(p).includes(cSlug));
}
Esto elimina por completo node:fs/node:path y mantiene todos los exports que tus páginas piden:
loadCatalog, isCamera, isRadio, ensureSlug, searchProducts, byBrand, filterByCategory.
