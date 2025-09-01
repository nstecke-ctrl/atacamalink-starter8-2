'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import React from 'react';

/**
 * Barra superior fija (sticky global)
 * - Altura: h-14 (56px)
 * - Fondo semitransparente con blur
 * - Z-index alto para quedar sobre el contenido
 * - Incluye un spacer <div className="h-14" /> para que el contenido no quede oculto
 */
export default function Nav() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio">
            <Image src="/logo/atacamalink-primary.svg" alt="AtacamaLink" width={160} height={40} priority />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/productos/camaras" className="hover:underline">Cámaras</Link>
            <Link href="/productos/radios" className="hover:underline">Radios</Link>
            <Link href="/productos" className="hover:underline">Catálogo</Link>
            <Link href="/carro" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 hover:bg-gray-50">
              <ShoppingCart size={16} /> Carro
            </Link>
          </nav>
        </div>
      </header>
      {/* Spacer para compensar la barra fija */}
      <div className="h-14" aria-hidden="true" />
    </>
  );
}
