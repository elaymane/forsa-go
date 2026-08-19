"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT_SCRIPT = `
  try {
    const saved = localStorage.getItem("forsa-go-theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
`;

/**
 * Sets the dark/light class on <html> before paint, avoiding a flash of the
 * wrong theme. Uses useServerInsertedHTML instead of next/script's <Script>
 * component — React 19 warns about ANY script tag rendered as part of the
 * normal component tree (a known, widespread false-positive across Next.js
 * 16.2 projects), but useServerInsertedHTML injects outside that tree
 * entirely, so the warning never fires. The script's own behavior is
 * unchanged — this only changes how it gets onto the page.
 */
export default function ThemeInitScript() {
  useServerInsertedHTML(() => (
    <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
  ));
  return null;
}
