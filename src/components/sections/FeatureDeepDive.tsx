"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/ui/AnimatedSection";

const blocks = [
  {
    key: "tracking",
    emoji: "\u{1F4CD}",
    imageLeft: true,
    gradient: "from-forest to-forest-light",
    mockupItems: [
      { label: "GPS", icon: "\u{1F6F0}\uFE0F" },
      { label: "247 km", icon: "\u{1F4CF}" },
      { label: "5.2 L/100km", icon: "\u26FD" },
    ],
  },
  {
    key: "maintenance",
    emoji: "\u{1F527}",
    imageLeft: false,
    gradient: "from-khaki to-khaki-light",
    mockupItems: [
      { label: "Oil Change", icon: "\u{1F6E2}\uFE0F" },
      { label: "Tire Check", icon: "\u2705" },
      { label: "AI Diagnostic", icon: "\u{1F916}" },
    ],
  },
  {
    key: "community",
    emoji: "\u{1F465}",
    imageLeft: true,
    gradient: "from-forest-dark to-forest",
    mockupItems: [
      { label: "Events", icon: "\u{1F389}" },
      { label: "Groups", icon: "\u{1F46B}" },
      { label: "Rescue", icon: "\u{1F198}" },
    ],
  },
] as const;

export default function FeatureDeepDive() {
  const t = useTranslations("deep_dive");

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        {blocks.map((block, idx) => (
          <div
            key={block.key}
            className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
              !block.imageLeft ? "lg:direction-rtl" : ""
            }`}
          >
            {/* Image/Mockup */}
            <AnimatedSection
              direction={block.imageLeft ? "left" : "right"}
              delay={0.1}
              className={`${!block.imageLeft ? "lg:order-2" : ""}`}
            >
              <div
                className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${block.gradient} p-8 flex flex-col items-center justify-center relative overflow-hidden`}
              >
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

                <span className="text-6xl mb-6">{block.emoji}</span>

                <div className="flex gap-4 flex-wrap justify-center">
                  {block.mockupItems.map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sand-light text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Text */}
            <AnimatedSection
              direction={block.imageLeft ? "right" : "left"}
              delay={0.2}
              className={`${!block.imageLeft ? "lg:order-1" : ""}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-12 bg-gradient-to-b from-forest to-khaki rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-wider text-forest">
                  0{idx + 1}
                </span>
              </div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t(`${block.key}.title`)}
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                {t(`${block.key}.desc`)}
              </p>
            </AnimatedSection>
          </div>
        ))}
      </div>
    </section>
  );
}
