"use client";

import { useEffect } from "react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Tailwind max-w class, default "max-w-lg" */
  width?: string;
}

/**
 * Right-sliding slide panel — dark-themed, backdrop blur, ESC key support.
 * Used across Employees, Tasks, and other pages for add/edit flows.
 */
export default function SlidePanel({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-lg",
}: SlidePanelProps) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed right-0 top-0 h-full w-full ${width} bg-[#0a0e1a] border-l border-[#1e2a45] z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#1e2a45] flex-shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-[#1e2a45] transition-all"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 bg-[#0a0e1a]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#1e2a45 transparent" }}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
