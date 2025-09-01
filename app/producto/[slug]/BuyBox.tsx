'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Star } from 'lucide-react';

const ACCENT = '#E76F51';
const norm = (s: any) => String(s || '').toLowerCase();
const normCompact = (s: any) => norm(s).replace(/[^a-z0-9]+/g, '');

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

export default function BuyBox({
  brand,
  model,
  price,
  datasheet,
  slug,
  currency,
  highlight,
  category,
}: {
  brand: string;
  model: string;
  price?: number;
  datasheet?: string;
  slug: string;
  currency?: string;
  highlight?: string;
  category?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const meta = useMemo(() => {
    const key = normCompact(model);
    const map: Record<string, { currency: string; highlight?: string }> = {
      'mt680plus': { currency: 'CLP', highlight: 'Homologada en Minera Candelaria' },
      'mtm5400':   { currency: 'CLP', highlight: 'Homologada en Minera El Abra' },
      'mtp3550':   { currency: 'CLP', highlight: 'Homologada en Minera El Abra' },
      'pt580hplus':{ currency: 'CLP', highlight: 'Homologada en Minera Candelaria' },
    };
    return map[key];
  }, [model]);

  const finalCurrency = currency || meta?.currency || 'USD';
  const finalHighlight = highlight || meta?.highlight;

  const handleAdd = () => {
    addItem({ id: slug, brand, model, price, datasheet, slug }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };
  const handleQuote = () => {
    addItem({ id: slug, brand, model, price, datasheet, slug }, qty);
    router.push('/contacto');
  };

  const isHanwha = norm(brand).includes('hanwha');
  const isMotorola = normCompact(brand).includes('motorola');
  const isHytera = normCompact(brand).includes('hytera');
  const looksLikeRadio = norm(category).includes('radio') || /radio|mtm|mtp|pt\d|dmr|tetra/i.test(String(model));
  const hideDatasheet = isHanwha || ((isMotorola || isHytera) && looksLikeRadio);

  const priceStr = formatMoney(price, finalCurrency);

  return (
    <div className="mt-4 space-y-3">
      {finalHighlight && (
        <div className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[11px] font-bold px-2 py-1 rounded-full shadow">
          <Star size={12} /> <span className="whitespace-nowrap">{finalHighlight}</span>
        </div>
      )}
      {typeof price !== 'undefined' && priceStr && (
        <div className="text-2xl font-semibold">{priceStr}</div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center border rounded-lg overflow-hidden">
          <button className="px-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
          <input className="w-12 text-center outline-none" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.currentTarget.value) || 1))} />
          <button className="px-3" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <button onClick={handleAdd} className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: ACCENT, color: ACCENT }}>
          Agregar al carrito
        </button>
        <button onClick={handleQuote} className="rounded-2xl px-4 py-2 text-sm text-white" style={{ backgroundColor: ACCENT }}>
          Solicitar cotización
        </button>
      </div>
      {!hideDatasheet && datasheet && (
        <div className="pt-1">
          <a href={datasheet} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: ACCENT }}>
            Ficha técnica (PDF / web)
          </a>
        </div>
      )}
      {added && <div className="text-xs text-green-600">Producto añadido al carrito</div>}
    </div>
  );
}
