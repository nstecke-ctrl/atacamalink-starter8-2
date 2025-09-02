'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadCatalog } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';

type AnyProduct = Product & {
  blurb?: string;
  image?: string;
  category?: string;
  categories?: string[]; // por si tu data lo trae así
};

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
function isCamera(p: AnyProduct) {
  const b = norm(p.brand);
  if (b.includes('hanwha')) return true;
  const cats = categoriesOf(p);
  return cats.some((c) => ['camera', 'camaras', 'cctv', 'lpr', 'ptz', 'bullet', 'dome'].includes(c));
}

export default function Page() {
  const [items, setItems] = useState<AnyProduct[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    setItems(loadCatalog() as AnyProduct[]);
  }, []);

  const list = useMemo(() => {
    const all = items.filter((p) => isCamera(p) && norm(p.brand).includes('hanwha'));
    const query = norm(q);
    if (!query) return all;
    return all.filter((p) => {
      const hay = `${p.brand} ${p.model} ${p.description ?? ''}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Cámaras Hanwha — Todo</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="border rounded-lg px-3 py-2 mb-4 w-full"
      />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const slug = p.slug || slugify(`${p.brand}-${p.model}`);
          return (
            <div key={`${p.brand}-${p.model}`} className="rounded-xl border p-4 bg-white">
              <div className="text-xs opacity-60">{p.category}</div>
              <h3 className="font-semibold">
                {p.brand} {p.model}
              </h3>
              <p className="text-sm opacity-80 line-clamp-3">{p.blurb || p.description}</p>
              <div className="mt-3">
                <Link href={`/producto/${slug}`} className="text-sm underline text-teal-700">
                  Ver detalle
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-6">Sin resultados.</p>}
    </div>
  );
}
