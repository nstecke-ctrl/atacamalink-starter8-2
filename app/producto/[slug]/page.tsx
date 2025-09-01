import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import BuyBox from "./BuyBox";

// Lee el catálogo desde /public/products.json
async function getProducts() {
  try {
    const file = await fs.readFile(path.join(process.cwd(), "public", "products.json"), "utf-8");
    return JSON.parse(file) as Array<any>;
  } catch {
    return [] as any[];
  }
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function getProductBySlug(slug: string) {
  const list = await getProducts();
  const found = list.find((p) => (p.slug ?? toSlug(`${p.brand}-${p.model}`)) === slug);
  if (!found) return undefined as any;
  // Enriquecer datos para la PNM-C34404RQPZ si faltan
  const model = (found.model || "").toUpperCase();
  if (model === "PNM-C34404RQPZ") {
    return {
      ...found,
      price: typeof found.price === "number" ? found.price : 4940,
      image: found.image || "https://hvsgmpprdstorage.blob.core.windows.net/pim/PNM-C34404RQPZ/thumbnails/large_08/PNM-C34404RQPZ_KO_white_01_M-1.png",
      datasheet: found.datasheet || "https://www.hanwhavision.com/en/products/camera/network/multi-sensor/pnm-c34404rqpz/#",
    };
  }
  return found;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  const title = `${product.brand} ${product.model} – AtacamaLink`;
  return {
    title,
    description: product.blurb,
    openGraph: { title, description: product.blurb, images: product.image ? [product.image] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();

  const slug = product.slug ?? toSlug(`${product.brand}-${product.model}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl overflow-hidden border bg-white grid place-items-center h-80 sm:h-96">
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.brand} ${product.model}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-sm opacity-60 p-6 text-center">Sin imagen</div>
          )}
        </div>
        <div>
          {/* Back arrow near the top of the details column */}
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="text-xs opacity-60">{product.category}</div>
          <h1 className="mt-1 text-3xl font-bold">{product.brand} {product.model}</h1>
          {typeof product.price !== "undefined" && (
            <div className="mt-2 font-semibold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(product.price)} USD</div>
          )}
          <p className="mt-3 opacity-80">{product.blurb}</p>
          {product.description && (
            <div className="mt-4 text-sm leading-6 opacity-90 whitespace-pre-wrap">{product.description}</div>
          )}

          {/* Buy box interactiva (cantidad, carrito, cotización, datasheet) */}
          <BuyBox
            brand={product.brand}
            model={product.model}
            price={product.price}
            datasheet={product.datasheet}
            slug={slug}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/#catalogo" className="rounded-xl border px-4 py-2 text-sm">Volver al catálogo</a>
          </div>
        </div>
      </div>
    </div>
  );
}
