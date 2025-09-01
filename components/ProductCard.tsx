'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { ensureSlug } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';

const FALLBACK_PLACEHOLDER = '/brands/hanwha-placeholder.png';

function formatMoney(value?: number | null, currency?: string) {
  if (typeof value !== 'number') return null;
  try {
    const cur = (currency || 'USD').toUpperCase();
    const locale = cur === 'CLP' ? 'es-CL' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: cur === 'CLP' ? 0 : 0 }).format(value);
  } catch {
    return `${currency === 'CLP' ? '$' : '$'}${value}`;
  }
}
const norm = (s: any) => String(s || '').toLowerCase();
const normCompact = (s: any) => norm(s).replace(/[^a-z0-9]+/g, '');

export default function ProductCard({ p }: { p: any }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const brandSlug = normCompact(p.brand);
  const brandPlaceholders: Record<string, string> = {
    'hanwhavision': '/brands/hanwhavision.webp',
    'hanwha': '/brands/hanwhavision.webp',
    'axis': '/brands/axis.png',
    'bosch': '/brands/bosch.png',
    'motorola': '/brands/motorola.png',
    'hytera': '/brands/hytera.png',
  };
  const placeholder = brandPlaceholders[brandSlug] || FALLBACK_PLACEHOLDER;

  const id = p.id || ensureSlug(p);
  const slug = p.slug || ensureSlug(p);

  function handleAdd() {
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
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const priceStr = formatMoney(p.price, p.currency);

  const isHanwha = norm(p.brand).includes('hanwha');
  const isMotorola = normCompact(p.brand).includes('motorola');
  const isHytera = normCompact(p.brand).includes('hytera');
  const looksLikeRadio = norm(p.category).includes('radio') || /radio|mtm|mtp|pt\d|dmr|tetra/i.test(String(p.model));
  const hideDatasheet = isHanwha || ((isMotorola || isHytera) && looksLikeRadio);

  return (
    <div className="rounded-2xl border overflow-hidden hover:shadow-sm transition-all bg-white">
      <div className="relative" style={{ height: 208, padding: 12, overflow: 'hidden', background: '#fff', display: 'grid', placeItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        {p.highlight && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <Star size={12} /> <span className="whitespace-nowrap">{p.highlight}</span>
          </div>
        )}
        <img
          src={p.image || placeholder}
          alt={`${p.brand} ${p.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
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
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white bg-teal-700 hover:bg-teal-800"
          >
            Añadir al carrito
          </button>
          <Link href={`/producto/${slug}`} className="text-sm underline underline-offset-4 hover:no-underline text-teal-700">
            Ver detalle
          </Link>
          {!hideDatasheet && p.datasheet && (
            <a href={p.datasheet} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 hover:no-underline text-teal-700">
              Ficha técnica
            </a>
          )}
        </div>

        {added && <div className="mt-2 text-xs text-green-600">Producto añadido</div>}
      </div>
    </div>
  );
}
