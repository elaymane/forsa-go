"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children directly into document.body instead of wherever this
 * component sits in the React tree. This matters for anything using
 * `position: fixed` (modals, drawers): if a parent anywhere up the tree has
 * `transform`, `filter`, or `backdrop-filter` (e.g. our glass `backdrop-blur`
 * cards), that parent becomes the fixed element's containing block instead
 * of the real viewport — so the modal ends up positioned/sized relative to
 * that card instead of the screen. Escaping to document.body sidesteps the
 * issue entirely.
 */
export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
