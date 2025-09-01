'use client';

import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';

export default function CarroPage() {
  const { cartItems, removeItem, updateItemQuantity, clearCart } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-3">
          <BackButton />
          <h1 className="text-3xl sm:text-4xl font-bold">Carro de compras</h1>
        </div>
        <div className="mt-1">
          <Link href="/productos" className="text-blue-600 text-sm hover:underline inline-flex items-center">
            ← Seguir explorando productos
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <p className="mt-6 opacity-70">Aún no has añadido productos al carrito.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-xl p-4 bg-white">
                <div className="flex-1">
                  <div className="font-semibold">{item.model}</div>
                  <div className="text-xs opacity-60">{item.brand}</div>
                  {item.blurb && <div className="text-xs mt-1 opacity-80">{item.blurb}</div>}
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                  <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => updateItemQuantity(item.id!, item.quantity - 1)}>
                    −
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => updateItemQuantity(item.id!, item.quantity + 1)}>
                    +
                  </button>
                  <button type="button" className="ml-3 text-red-500 text-xs hover:underline" onClick={() => removeItem(item.id!)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm font-medium">Total de unidades: {totalItems}</div>
              <button type="button" onClick={clearCart} className="text-red-600 text-sm hover:underline">
                Vaciar carro
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/productos" className="rounded-2xl px-4 py-2 text-sm border bg-white hover:bg-gray-50">
                Seguir comprando
              </Link>
              <Link href="/contacto" className="rounded-2xl px-4 py-2 text-sm text-white" style={{ backgroundColor: '#E76F51' }}>
                Solicitar cotización
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
