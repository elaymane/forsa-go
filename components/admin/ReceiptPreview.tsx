"use client";

import { useState } from "react";
import { FileText, X, ExternalLink, ImageOff } from "lucide-react";
import Portal from "@/components/ui/Portal";

export default function ReceiptPreview({ url }: { url: string }) {
  const [expanded, setExpanded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const isPdf = url.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-purple-600 underline hover:text-purple-700 dark:text-purple-400"
      >
        <FileText size={12} /> View receipt (PDF)
      </a>
    );
  }

  if (loadFailed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      >
        <ImageOff size={13} /> Couldn't load preview — open link instead
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="group flex items-center gap-2 rounded-lg border border-black/10 bg-white/60 py-1 pl-1 pr-2.5 transition hover:border-purple-300 dark:border-white/10 dark:bg-white/5"
      >
        <img
          src={url}
          alt="Payment receipt"
          className="h-8 w-8 rounded object-cover"
          loading="lazy"
          onError={() => setLoadFailed(true)}
        />
        <span className="text-xs font-medium text-purple-600 group-hover:underline dark:text-purple-400">
          View receipt
        </span>
      </button>

      {expanded && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setExpanded(false)} />
            <div className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0B1220]">
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
                <p className="text-sm font-semibold">Payment receipt</p>
                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 transition hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <ExternalLink size={13} /> Open full size
                  </a>
                  <button
                    onClick={() => setExpanded(false)}
                    aria-label="Close"
                    className="rounded-lg p-2.5 text-gray-400 transition hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto p-2">
                <img src={url} alt="Payment receipt" className="w-full rounded-lg object-contain" />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
