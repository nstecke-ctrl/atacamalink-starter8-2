'use client';
import React from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductGrid({ items }: { items: any[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={`${p.brand}-${p.model}`} p={p} />
      ))}
    </div>
  );
}
