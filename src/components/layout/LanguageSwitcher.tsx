"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, Locale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";

const flags: Record<string, string> = {
  "pt-BR": "\u{1F1E7}\u{1F1F7}",
  en: "\u{1F1FA}\u{1F1F8}",
  es: "\u{1F1EA}\u{1F1F8}",
};

const labels: Record<string, string> = {
  "pt-BR": "Portugues",
  en: "English",
  es: "Espanol",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-black/5 transition-colors text-sm cursor-pointer"
        aria-label="Change language"
      >
        <span className="text-lg">{flags[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-alt transition-colors cursor-pointer ${
                loc === locale ? "font-semibold text-forest" : "text-text-secondary"
              }`}
            >
              <span className="text-lg">{flags[loc]}</span>
              <span>{labels[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
