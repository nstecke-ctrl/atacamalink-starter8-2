'use client';
import React from 'react';
import Link from 'next/link';
import BrandGridRadios from '@/components/BrandGridRadios';

export default function RadiosIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Radios</h1>
          <Link href="/productos" className="text-sm underline underline-offset-4">Volver al catálogo</Link>
        </div>
        <p className="text-sm opacity-70 mb-3">Elige la marca:</p>
        <BrandGridRadios />
      </div>
    </div>
  );
}
