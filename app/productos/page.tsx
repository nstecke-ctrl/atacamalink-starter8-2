'use client';

import React from 'react';
import BackButton from '@/components/BackButton';

function Section({ children, className = '' }: any) {
  return <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>;
}

export default function ProductosLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Section className="py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold">Productos</h1>
          {/* Back arrow to return to the previous page */}
          <BackButton />
        </div>
        <p className="text-sm opacity-80 mt-2">Explora por categoría</p>

        <div className="grid gap-4 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/productos/camaras" className="rounded-2xl border p-6 bg-white hover:shadow-sm transition">
            <div className="text-lg font-semibold">Cámaras de seguridad</div>
            <p className="text-sm opacity-70 mt-1">Hanwha Vision, Axis, Bosch</p>
          </a>
          <a href="/productos/radios" className="rounded-2xl border p-6 bg-white hover:shadow-sm transition">
            <div className="text-lg font-semibold">Radios</div>
            <p className="text-sm opacity-70 mt-1">Hytera, Motorola Solutions</p>
          </a>
          <div className="rounded-2xl border p-6 bg-white opacity-60">
            <div className="text-lg font-semibold">Networking industrial (próximamente)</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
