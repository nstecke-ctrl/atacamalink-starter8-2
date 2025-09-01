'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';

export default function ContactoPage() {
  const { cartItems, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      message: String(formData.get('message') || ''),
      items: cartItems,
    };
    try {
      const res = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : { ok: false, error: await res.text() };
      if (!res.ok || !data.ok) throw new Error(data?.error || `Fallo de envío (${res.status})`);
      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">¡Gracias por tu solicitud!</h1>
          <p className="mb-4">Te contactaremos a la brevedad. Revisa tu correo por la confirmación.</p>
          <Link href="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-3">
          <BackButton />
          <h1 className="text-3xl sm:text-4xl font-bold">Solicita tu cotización</h1>
        </div>
        <div className="mt-1">
          <Link href="/carro" className="text-blue-600 text-sm hover:underline inline-flex items-center">← Volver al carro</Link>
        </div>

        {cartItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Productos seleccionados</h3>
            <ul className="space-y-2">
              {cartItems.map((item) => (
                <li key={item.id} className="border rounded-xl p-3 bg-white flex justify-between items-center">
                  <span>{item.model} × {item.quantity}</span>
                  <span className="text-xs opacity-60">{item.brand}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input name="name" type="text" required className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo electrónico</label>
            <input name="email" type="email" required className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input name="phone" type="tel" className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" />
          </div>
          <div>
            <label className="block text-sm font-medium">Mensaje</label>
            <textarea name="message" rows={4} className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" placeholder="Escribe tu consulta o requerimientos específicos"></textarea>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={sending} type="submit" className="rounded-2xl px-4 py-2 text-sm text-white disabled:opacity-60" style={{ backgroundColor: '#E76F51' }}>
            {sending ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </div>
  );
}
