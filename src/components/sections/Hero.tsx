"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h1
              className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-tight text-sand-light mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("headline")}
            </h1>
            <p className="text-lg sm:text-xl text-sand/80 mb-10 max-w-lg leading-relaxed">
              {t("subheadline")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#waitlist">
                <Button size="lg">{t("cta")}</Button>
              </a>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  {t("ctaSecondary")}
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[580px] bg-gradient-to-b from-forest-light/40 to-forest-dark/40 rounded-[3rem] border-2 border-white/20 backdrop-blur-sm p-3 shadow-2xl shadow-black/20">
                <div className="w-full h-full bg-gradient-to-b from-forest to-forest-dark rounded-[2.25rem] overflow-hidden flex flex-col items-center justify-center text-center p-6">
                  {/* Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/30 rounded-full" />

                  {/* App content placeholder */}
                  <span className="text-5xl mb-4">&#x1F3CD;&#xFE0F;</span>
                  <h3 className="text-sand-light font-bold text-lg mb-2">Bora Rodar</h3>
                  <p className="text-sand/60 text-sm mb-8">v1.0 coming soon</p>

                  {/* Fake UI elements */}
                  <div className="w-full space-y-3">
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                    <div className="h-3 bg-white/10 rounded-full w-3/4" />
                    <div className="h-3 bg-white/10 rounded-full w-5/6" />
                    <div className="h-10 bg-gradient-to-r from-khaki/40 to-khaki-light/40 rounded-xl mt-4 flex items-center justify-center">
                      <div className="h-2 bg-white/30 rounded-full w-20" />
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div className="absolute bottom-8 left-6 right-6 flex justify-around">
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                    <div className="w-8 h-8 bg-khaki/30 rounded-lg" />
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 top-20 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-khaki to-khaki-light rounded-xl flex items-center justify-center text-white text-lg">
                  &#x1F3C6;
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Badge!</p>
                  <p className="text-[10px] text-text-secondary">Serra da Mantiqueira</p>
                </div>
              </motion.div>

              {/* Floating stats */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -left-12 bottom-32 bg-white rounded-2xl shadow-xl p-3"
              >
                <p className="text-[10px] text-text-secondary">Hoje</p>
                <p className="text-lg font-bold text-forest">247 km</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-4 h-6 bg-forest/20 rounded-sm" style={{ height: `${8 + i * 4}px` }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-sand-light/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-sand-light/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
