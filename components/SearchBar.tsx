'use client';
import React from 'react';

export default function SearchBar({ q, setQ, placeholder = 'Buscar por modelo, categoría, descripción...' }:
  { q: string; setQ: (s: string) => void; placeholder?: string; }) {
  return (
    <div className="w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
      />
    </div>
  );
}
