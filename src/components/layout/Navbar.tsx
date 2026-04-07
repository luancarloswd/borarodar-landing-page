"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
    { href: "#events", label: t("events") },
    { href: "#blog", label: t("blog") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">&#x1F3CD;&#xFE0F;</span>
              <span
                className={`text-xl font-bold font-[var(--font-display)] transition-colors ${
                  scrolled ? "text-forest" : "text-sand-light"
                }`}
              >
                Bora Rodar
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:opacity-80 ${
                    scrolled ? "text-text-secondary hover:text-forest" : "text-sand-light/80 hover:text-sand-light"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher />
              <a href="#waitlist">
                <Button size="sm">{t("cta")}</Button>
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 transition-all duration-300 ${
                    scrolled ? "bg-text-primary" : "bg-sand-light"
                  } ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`w-full h-0.5 transition-all duration-300 ${
                    scrolled ? "bg-text-primary" : "bg-sand-light"
                  } ${mobileOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`w-full h-0.5 transition-all duration-300 ${
                    scrolled ? "bg-text-primary" : "bg-sand-light"
                  } ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 pt-20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-text-primary hover:text-forest transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}

              <hr className="my-2 border-surface-alt" />

              <div className="py-2">
                <LanguageSwitcher />
              </div>

              <a href="#waitlist" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">{t("cta")}</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
