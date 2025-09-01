'use client';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default function BrandGridRadios() {
  const brands = [
    { name: 'Motorola', logo: '/brands/motorola.png', href: '/productos/radios/motorola' },
    { name: 'Hytera', logo: '/brands/hytera.png', href: '/productos/radios/hytera' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {brands.map((b) => (
        <Link key={b.name} href={b.href} className="rounded-xl border p-3 bg-white h-24 flex items-center justify-center hover:shadow-sm transition">
          <Image src={b.logo} alt={b.name} width={140} height={40} style={{ height: 40, width: 'auto' }} />
        </Link>
      ))}
    </div>
  );
}
