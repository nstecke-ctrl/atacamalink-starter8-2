'use client';
import Image from 'next/image';
import React from 'react';

export default function BrandGrid() {
  const brands = [
    { name: 'Motorola', logo: '/brands/motorola.png', anchor: 'motorola' },
    { name: 'Hytera', logo: '/brands/hytera.png', anchor: 'hytera' },
    { name: 'Hanwha Vision', logo: '/brands/hanwhavision.webp', anchor: 'hanwha' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {brands.map((b) => (
        <a key={b.name} href={`#${b.anchor}`} className="rounded-xl border p-3 bg-white h-24 flex items-center justify-center hover:shadow-sm transition">
          <Image src={b.logo} alt={b.name} width={140} height={40} style={{ height: 40, width: 'auto' }} />
        </a>
      ))}
    </div>
  );
}
