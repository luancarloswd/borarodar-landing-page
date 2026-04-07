"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";

export default function Pricing() {
  const t = useTranslations("pricing");

  const freeFeatures = t.raw("free.features") as string[];
  const proFeatures = t.raw("pro.features") as string[];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h2>
          <p className="text-text-secondary text-lg">{t("subtitle")}</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-surface rounded-3xl p-8 lg:p-10 border border-surface-alt"
          >
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {t("free.name")}
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-text-primary">
                {t("free.price")}
              </span>
            </div>
            <p className="text-text-secondary text-sm mb-8">
              {t("free.period")}
            </p>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#waitlist">
              <Button variant="outline" className="w-full">
                {t("free.cta")}
              </Button>
            </a>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-forest to-forest-dark rounded-3xl p-8 lg:p-10 text-sand-light relative overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-6 right-6 bg-gradient-to-r from-khaki to-khaki-light text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>

            {/* Decorative */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full" />

            <h3 className="text-2xl font-bold mb-2">{t("pro.name")}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold">{t("pro.price")}</span>
              <span className="text-sand/70">{t("pro.period")}</span>
            </div>
            <p className="text-sand/60 text-sm mb-8">{t("pro.lifetime")}</p>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-khaki-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#waitlist">
              <Button size="lg" className="w-full">
                {t("pro.cta")}
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
