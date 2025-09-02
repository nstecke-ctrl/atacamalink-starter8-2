'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { loadCatalog } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';

type AnyProduct = Product & { blurb?: string; image?: string; category?: string };

function slugify(s: string) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
function norm(s: unknown) {
  return String(s ?? '').toLowerCase();
}
function categoriesOf(p: AnyProduct) {
  if (Array.isArray(p.categories)) return p.categories.map(slugify);
  if (p.category) return [slugify(p.category)];
  return [];
}
function isRadio(p: AnyProduct) {
  const b = norm(p.brand);
  if (b.includes('motorola') || b.includes('hytera')) return true;
  const cats = categoriesOf(p);
  return cats.some((c) => ['radio', 'vhf', 'uhf', 'dmr', 'tetra'].includes(c));
}

export default function Page() {
  const params = useParams<{ brand: string; cat: string }>();
  const brandParam = norm(params?.brand);
  const catSlug = slugify(params?.cat);
  const [items, setItems] = useState<AnyProduct[]>([]);

  useEffect(() => {
    setItems(loadCatalog() as AnyProduct[]);
  }, []);

  const list = useMemo(() => {
    return (items || [])
      .filter((p) => isRadio(p) && norm(p.brand).includes(brandParam))
      .filter((p) => categoriesOf(p).includes(catSlug));
  }, [items, brandParam, catSlug]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Radios — {params?.brand} / {params?.cat}</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const slug = p.slug || slugify(`${p.brand}-${p.model}`);
          return (
            <div key={`${p.brand}-${p.model}`} className="rounded-xl border p-4 bg-white">
              <div className="text-xs opacity-60">{p.category}</div>
              <h3 className="font-semibold">{p.brand} {p.model}</h3>
              <p className="text-sm opacity-80 line-clamp-3">{p.blurb || p.description}</p>
              <div className="mt-3">
                <Link href={`/producto/${slug}`} className="text-sm underline text-teal-700">Ver detalle</Link>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-6">Sin resultados.</p>}
    </div>
  );
}
