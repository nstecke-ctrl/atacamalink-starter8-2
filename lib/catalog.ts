// lib/catalog.ts
// ------------------------------------------------------------------
// Utilidades y helpers para trabajar con el catálogo.
// Si ya tienes tipos o funciones existentes aquí, conserva lo tuyo
// y añade/ajusta las exportaciones de abajo.
// ------------------------------------------------------------------

// TIPOS (ajusta si ya tienes tus propios tipos)
export type Product = {
  id?: string;
  name: string;
  brand?: string;          // "hanwha", "motorola", "hytera", etc.
  model?: string;
  description?: string;
  categories?: string[];   // ej: ["bullet","ptz","lpr"] o ["vhf","uhf"]
  category?: string;       // si usas string en vez de array
  slug?: string;
  image?: string;
  price?: number;
  [key: string]: any;
};

// Si ya tienes una forma de cargar productos, úsala.
// Aquí intentamos importar desde /public/products.json como fallback:
let ALL_PRODUCTS: Product[] = [];
try {
  // Con paths de Next: "@/public/products.json" suele funcionar si el tsconfig tiene "paths": {"@/*":["./*"]}
  // Si no, usa: require("../public/products.json") según tu estructura.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = require("@/public/products.json");
  ALL_PRODUCTS = Array.isArray(data) ? data : (data?.products || []);
} catch {
  // Si falla la importación, mantenemos lista vacía para no romper build.
  ALL_PRODUCTS = [];
}

// Normaliza string → slug
export const ensureSlug = (s: string | undefined | null): string => {
  if (!s) return "";
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // sin tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Devuelve todos los productos (si ya tienes una función similar, reutilízala)
export const getAllProducts = (): Product[] => {
  // Si en tu proyecto ya existe otra fuente (DB, fetch, etc.), úsala aquí.
  return ALL_PRODUCTS.map((p) => ({
    ...p,
    slug: p.slug || ensureSlug(p.name || p.model || ""),
  }));
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
    const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
    const normalized = cats.map((x) => ensureSlug(String(x)));
    return normalized.includes(cSlug);
  });
}
