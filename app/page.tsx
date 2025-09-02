'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { loadCatalog } from '@/lib/catalog';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/catalog';

const ACCENT = '#E76F51';

type AnyProduct = Product & {
  currency?: string;
  blurb?: string;
  datasheet?: string;
  highlight?: string;
  image?: string;
  category?: string;
};

/** ACEPTA id y cualquier otro atributo HTML */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};
function Section({ children, className = '', ...rest }: SectionProps) {
  return (
    <section {...rest} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
function norm(s: unknown) {
  return String(s ?? '').toLowerCase();
}
function normCompact(s: unknown) {
  return norm(s).replace(/[^a-z0-9]+/g, '');
}
function formatMoney(value?: number | null, currency?: string) {
  if (typeof value !== 'number') return null;
  try {
    const cur = (currency || 'USD').toUpperCase();
    const locale = cur === 'CLP' ? 'es-CL' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: cur === 'CLP' ? 0 : 0 }).format(value);
  } catch {
    return `$${value}`;
  }
}

const FEATURED_MODELS = new Set<string>(['pnmc34404rqpz', 'xnpc6403r', 'spah100w', 'aibox']);
function isFeatured(p: AnyProduct) {
  const brandCompact = normCompact(p.brand);
  const category = norm(p.category);
  const modelCompact = normCompact(p.model);
  const isMotorola = brandCompact.includes('motorola');
  const isHytera = brandCompact.includes('hytera');
  const looksLikeRadio = category.includes('radio') || /radio|mtm|mtp|pt\d|dmr|tetra/i.test(String(p.model));
  const isRadioOfMotorolaOrHytera = (isMotorola || isHytera) && looksLikeRadio;
  const isSpecificModel = FEATURED_MODELS.has(modelCompact);
  return isRadioOfMotorolaOrHytera || isSpecificModel;
}

function LocalProductCard({ p }: { p: AnyProduct }) {
  const { addItem } = useCart();
  const slug = p.slug || slugify(`${p.brand ?? 'producto'}-${p.model ?? ''}`);
  const id = p.id || slug;
  const isHanwha = norm(p.brand).includes('hanwha');
  const priceStr = formatMoney(p.price, p.currency);

  const handleAdd = () => {
    addItem(
      {
        id,
        brand: p.brand,
        model: p.model,
        price: p.price,
        slug,
        category: p.category,
        image: p.image,
        blurb: p.blurb,
      },
      1
    );
  };

  return (
    <div className="rounded-2xl border overflow-hidden hover:shadow-sm transition-all bg-white">
      <div
        className="relative"
        style={{ height: 208, padding: 12, overflow: 'hidden', background: '#fff', display: 'grid', placeItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        {p.highlight && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <Star size={12} /> <span className="whitespace-nowrap">{p.highlight}</span>
          </div>
        )}
        <img
          src={p.image || '/brands/hanwha-placeholder.png'}
          alt={`${p.brand ?? ''} ${p.model ?? ''}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/brands/hanwha-placeholder.png';
          }}
        />
      </div>
      <div className="p-4">
        <div className="text-xs opacity-60">{p.category}</div>
        <h3 className="mt-1 text-lg font-semibold">
          {p.brand} {p.model}
        </h3>
        {priceStr && <div className="mt-2 font-semibold">{priceStr}</div>}
        <p className="mt-1 text-sm opacity-80 line-clamp-3">{p.blurb || p.description}</p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white bg-teal-700 hover:bg-teal-800">
            Añadir al carrito <ShoppingCart size={16} />
          </button>
          <Link href={`/producto/${slug}`} className="text-sm underline underline-offset-4 hover:no-underline text-teal-700">
            Ver detalle
          </Link>
          {!isHanwha && p.datasheet && (
            <a href={p.datasheet} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 hover:no-underline text-teal-700">
              Ficha técnica
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [items, setItems] = useState<AnyProduct[]>([]);

  useEffect(() => {
    setItems(loadCatalog() as AnyProduct[]); // loadCatalog es síncrono
  }, []);

  const featured = useMemo(() => items.filter(isFeatured), [items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Nav />

      <Section className="py-10">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm">
              Proveedor de soluciones y equipamiento de alto nivel para minería
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">Tecnología confiable para entornos mineros exigentes</h1>
            <p className="mt-3 text-gray-700">
              Radios, cámaras, antenas, control de acceso y networking industrial. Integración, asesoría y soporte local.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="/productos/camaras" className="rounded-2xl border px-4 py-2 text-sm">
                Ver cámaras
              </Link>
              <Link href="/productos/radios" className="rounded-2xl border px-4 py-2 text-sm">
                Ver radios
              </Link>
              <Link href="/productos" className="rounded-2xl px-4 py-2 text-sm text-white" style={{ backgroundColor: ACCENT }}>
                Ver catálogo
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border h-64 lg:h-80">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-mineria-tec-2400x1000.jpg)' }} />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </Section>

      <Section id="destacados" className="py-12">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Productos destacados</h2>
            <p className="text-sm opacity-70">Radios Motorola/Hytera y modelos clave</p>
          </div>
          <Link href="/productos" className="text-sm underline underline-offset-4 hover:no-underline" style={{ color: ACCENT }}>
            Ver catálogo
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <LocalProductCard key={`${p.brand ?? 'marca'}-${p.model ?? 'modelo'}`} p={p} />
          ))}
        </div>
      </Section>
    </div>
  );
}
