'use client';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default function BrandGridCamaras() {
  const brands = [
    { name: 'Hanwha Vision', logo: '/brands/hanwhavision.webp', href: '/productos/camaras/hanwha' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {brands.map((b) => (
        <Link key={b.name} href={b.href} className="rounded-xl border p-3 bg-white h-24 flex items-center justify-center hover:shadow-sm transition">
          <Image src={b.logo} alt={b.name} width={160} height={40} style={{ height: 40, width: 'auto' }} />
        </Link>
      ))}
    </div>
  );
}
