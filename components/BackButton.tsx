"use client";

import React from "react";
import { useRouter } from "next/navigation";

/**
 * Simple back button component.  Displays a left arrow with a label
 * and uses the Next.js navigation API to return to the previous
 * page in history.  This component should be placed near the top
 * of any page where you want to provide an easy way for users to
 * navigate back.  If there is no previous page in the history
 * stack, the router will default to navigating to the root.
 */
export default function BackButton({ label = "Volver" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
    >
      {/* Using the Unicode left arrow keeps dependencies light and
          avoids bundling an icon library just for this one glyph. */}
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}