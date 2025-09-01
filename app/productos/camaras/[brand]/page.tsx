'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { loadCatalog, isCamera } from '@/lib/catalog';

const allowed = new Set(['hanwha', 'hanwha vision', 'hanwha-vision']);

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CamarasBrandPage() {
  const params = useParams<{ brand: string }>();
  const brandParam = String(params?.brand || '').toLowerCase();
  const valid = allowed.has(brandParam);

  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { loadCatalog().then(setItems); }, []);

  const cameras = useMemo(() => items.filter(isCamera), [items]);
  const byBrand = (p: any) => String(p.brand || '').toLowerCase().includes('hanwha');
  const listAll = useMemo(() => cameras.filter(byBrand), [cameras]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return listAll;
    return listAll.filter((p) =>
      String(p.model || '').toLowerCase().includes(s) ||
      String(p.blurb || '').toLowerCase().includes(s) ||
      String(p.description || '').toLowerCase().includes(s) ||
      String(p.category || '').toLowerCase().includes(s)
    );
  }, [listAll, q]);

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Marca no disponible</h1>
          <p className="mt-2 text-sm opacity-70">Actualmente sólo mostramos cámaras Hanwha Vision.</p>
          <div className="mt-4">
            <Link href="/productos/camaras" className="text-sm underline underline-offset-4">Volver a Cámaras</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Cámaras Hanwha</h1>
          <Link href="/productos/camaras" className="text-sm underline underline-offset-4">Cambiar de marca</Link>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Buscar en Hanwha</label>
          <input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Modelo, descripción o categoría (ej: XNP, PNM, bullet, domo...)"
            className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm opacity-70">No se encontraron resultados. Prueba con otro término.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={`${p.brand}-${p.model}`} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
