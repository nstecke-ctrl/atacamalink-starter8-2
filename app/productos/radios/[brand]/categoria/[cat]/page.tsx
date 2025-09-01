"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { byBrand, loadCatalog } from "@/lib/catalog";

function Section({ children, className = "" }: any) {
  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </section>
  );
}

/** Utility to title-case a string for display. */
function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function RadiosCategoryPage({
  params,
}: {
  params: { brand: string; cat: string };
}) {
  const { brand, cat } = params;
  const [items, setItems] = useState<any[]>([]);

  const categorySlug = decodeURIComponent(cat).toLowerCase();

  useEffect(() => {
    loadCatalog().then((all) => {
      const list = byBrand(all, brand).filter((p) => {
        const c = (p.category || "").toLowerCase();
        return c === categorySlug;
      });
      setItems(list);
    });
  }, [brand, categorySlug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Section className="py-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          {titleCase(categorySlug)}
        </h1>
        {/* Back link */}
        <div className="mt-4">
          <Link
            href={`/productos/radios/${brand}`}
            className="text-blue-600 text-sm hover:underline inline-flex items-center"
          >
            ← Volver a {brand}
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={`${p.brand}-${p.model}`} p={p} />
            ))}
          </div>
        ) : (
          <div className="mt-6 opacity-70">No hay productos en esta categoría.</div>
        )}
      </Section>
    </div>
  );
}