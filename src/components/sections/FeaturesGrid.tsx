"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

const featureIcons: Record<string, string> = {
  plan: "\u{1F5FA}\uFE0F",
  track: "\u{1F4CD}",
  badges: "\u{1F3C5}",
  maintain: "\u{1F527}",
  events: "\u{1F3AA}",
  sos: "\u{1F6D1}",
};

const featureKeys = ["plan", "track", "badges", "maintain", "events", "sos"] as const;

export default function FeaturesGrid() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featureKeys.map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-surface-alt hover:border-forest/10"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {featureIcons[key]}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {t(`${key}.title`)}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t(`${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
