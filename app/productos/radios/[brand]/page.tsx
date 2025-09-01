'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { loadCatalog, isRadio } from '@/lib/catalog';

const allowed = new Set(['motorola', 'hytera']);

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function RadiosBrandPage() {
  const params = useParams<{ brand: string }>();
  const brandParam = String(params?.brand || '').toLowerCase();
  const valid = allowed.has(brandParam);

  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { loadCatalog().then(setItems); }, []);

  const radios = useMemo(() => items.filter(isRadio), [items]);
  const list = useMemo(
    () => radios.filter((p) => String(p.brand || '').toLowerCase().includes(brandParam)),
    [radios, brandParam]
  );

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Marca no disponible</h1>
          <p className="mt-2 text-sm opacity-70">Solo trabajamos con Motorola y Hytera en esta sección.</p>
          <div className="mt-4">
            <Link href="/productos/radios" className="text-sm underline underline-offset-4">Volver a radios</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Radios {titleCase(brandParam)}</h1>
          <Link href="/productos/radios" className="text-sm underline underline-offset-4">Cambiar de marca</Link>
        </div>
        {list.length === 0 ? (
          <div className="text-sm opacity-70">No se encontraron productos de {titleCase(brandParam)}. Revisa que el catálogo esté correcto.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => <ProductCard key={`${p.brand}-${p.model}`} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
