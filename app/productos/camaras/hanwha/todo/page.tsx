'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import BackButton from '@/components/BackButton';
import { byBrand, loadCatalog, searchProducts } from '@/lib/catalog';

function Section({ children, className = '' }: any) {
  return <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>;
}

export default function HanwhaAll() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { loadCatalog().then((all) => setItems(byBrand(all, 'hanwha-vision'))); }, []);
  const filtered = useMemo(() => searchProducts(items, q), [items, q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Section className="py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold">Hanwha Vision — Todo el catálogo</h1>
          <BackButton />
        </div>
        <SearchBar q={q} setQ={setQ} />
        <ProductGrid items={filtered} />
      </Section>
    </div>
  );
}
