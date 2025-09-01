// lib/catalog.ts
// ------------------------------------------------------------------
// Utilidades y helpers para trabajar con el catálogo.
// Si ya tienes tipos/funciones, puedes fusionar; si no, pega tal cual.
// ------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";

// TIPOS (ajusta si ya tienes tus propios tipos)
export type Product = {
  id?: string;
  name: string;
  brand?: string;          // "hanwha", "motorola", "hytera", etc.
  model?: string;
  description?: string;
  categories?: string[];   // ej: ["camera","lpr"] o ["vhf","uhf"]
  category?: string;       // si usas string en vez de array
  slug?: string;
  image?: string;
  price?: number;
  [key: string]: any;
};

// Carga robusta de products.json desde /public (build/server-safe)
function readProductsFromPublic(): Product[] {
  try {
    const filePath = path.join(process.cwd(), "public", "products.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    const arr = Array.isArray(json) ? json : json?.products;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Normaliza a slug
export const ensureSlug = (s: string | undefined | null): string => {
  if (!s) return "";
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quita tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Cache simple en build/runtime
let _CACHE: Product[] | null = null;

// Devuelve todos los productos ya normalizados
export const getAllProducts = (): Product[] => {
  if (!_CACHE) {
    const base = readProductsFromPublic();
    _CACHE = base.map((p) => ({
      ...p,
      slug: p.slug || ensureSlug(p.name || p.model || ""),
    }));
  }
  return _CACHE!;
};

// Para compatibilidad con tu código: alias que devuelve lo mismo.
// (Muchos archivos lo importan como { loadCatalog } y lo llaman directo.)
export const loadCatalog = (): Product[] => {
  return getAllProducts();
};

// Helpers de tipo/categoría según tu estructura
// Heurística: cámaras = marca Hanwha o categorías ["camera","camaras","cctv","lpr","ptz","bullet","dome"]
//             radios  = marca Motorola/Hytera o categorías ["radio","vhf","uhf","dmr","tetra"]
const CAMERA_KEYS = new Set([
  "camera", "camaras", "cctv", "lpr", "ptz", "bullet", "dome"
]);
const RADIO_KEYS = new Set([
  "radio", "vhf", "uhf", "dmr", "tetra"
]);
const RADIO_BRANDS = new Set(["motorola", "hytera"]);
const CAMERA_BRANDS = new Set(["hanwha", "hanwha vision", "hanwhavision"]);

function categoriesOf(p: Product): string[] {
  if (Array.isArray(p.categories)) return p.categories.map((x) => ensureSlug(String(x)));
  if (p.category) return [ensureSlug(String(p.category))];
  return [];
}

export const isCamera = (p: Product): boolean => {
  const brand = (p.brand || "").toLowerCase();
  if (CAMERA_BRANDS.has(brand)) return true;
  const cats = categoriesOf(p);
  return cats.some((c) => CAMERA_KEYS.has(c));
};

export const isRadio = (p: Product): boolean => {
  const brand = (p.brand || "").toLowerCase();
  if (RADIO_BRANDS.has(brand)) return true;
  const cats = categoriesOf(p);
  return cats.some((c) => RADIO_KEYS.has(c));
};

// Buscar por texto en nombre, modelo, marca y descripción
export function searchProducts(query: string, list?: Product[]): Product[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return (list || getAllProducts());

  const haystack = (list || getAllProducts());
  return haystack.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const model = (p.model || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return (
      name.includes(q) ||
      model.includes(q) ||
      brand.includes(q) ||
      desc.includes(q)
    );
  });
}

// Filtrar por marca exacta (case-insensitive)
export function byBrand(brand: string, list?: Product[]): Product[] {
  const b = (brand || "").toLowerCase();
  const haystack = (list || getAllProducts());
  return haystack.filter((p) => (p.brand || "").toLowerCase() === b);
}

// Filtrar por categoría (acepta category:string o categories:string[])
export function filterByCategory(category: string, list?: Product[], brand?: string): Product[] {
  const cSlug = ensureSlug(category);
  let haystack = (list || getAllProducts());

  if (brand) {
    haystack = byBrand(brand, haystack);
  }

  return haystack.filter((p) => {
    const cats = categoriesOf(p);
    return cats.includes(cSlug);
  });
}
