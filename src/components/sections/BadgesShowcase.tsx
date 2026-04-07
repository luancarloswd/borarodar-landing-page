"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/ui/AnimatedSection";

const badges = [
  { name: "Serra da Mantiqueira", emoji: "\u{26F0}\uFE0F", tier: "Gold" },
  { name: "Chapada Diamantina", emoji: "\u{1F48E}", tier: "Gold" },
  { name: "Serra Gaucha", emoji: "\u{1F3D4}\uFE0F", tier: "Silver" },
  { name: "Estrada Real", emoji: "\u{1F451}", tier: "Gold" },
  { name: "Rota Romantica", emoji: "\u{1F339}", tier: "Silver" },
  { name: "Transpantaneira", emoji: "\u{1F40A}", tier: "Bronze" },
  { name: "Serra do Rio do Rastro", emoji: "\u{1F30A}", tier: "Gold" },
  { name: "Aparados da Serra", emoji: "\u{1F33F}", tier: "Silver" },
  { name: "Lencois Maranhenses", emoji: "\u{1F3DC}\uFE0F", tier: "Gold" },
  { name: "Bonito MS", emoji: "\u{1F420}", tier: "Silver" },
  { name: "Monte Verde", emoji: "\u{1F332}", tier: "Bronze" },
  { name: "Campos do Jordao", emoji: "\u{1F3D8}\uFE0F", tier: "Bronze" },
  { name: "Gramado", emoji: "\u{2744}\uFE0F", tier: "Bronze" },
  { name: "Ouro Preto", emoji: "\u{1F3DB}\uFE0F", tier: "Silver" },
  { name: "Jericoacoara", emoji: "\u{1F3D6}\uFE0F", tier: "Gold" },
  { name: "Alter do Chao", emoji: "\u{1F334}", tier: "Gold" },
];

const tierColors: Record<string, string> = {
  Gold: "from-yellow-400 to-amber-500",
  Silver: "from-gray-300 to-gray-400",
  Bronze: "from-orange-400 to-orange-600",
};

const tierBorder: Record<string, string> = {
  Gold: "border-amber-300",
  Silver: "border-gray-300",
  Bronze: "border-orange-400",
};

export default function BadgesShowcase() {
  const t = useTranslations("badges_showcase");

  // Double the badges for infinite scroll effect
  const duplicatedBadges = [...badges, ...badges];

  return (
    <section className="py-24 bg-surface-alt overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <AnimatedSection className="text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h2>
          <p className="text-text-secondary text-lg">{t("subtitle")}</p>
        </AnimatedSection>
      </div>

      {/* Scrolling badges */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-alt to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-alt to-transparent z-10" />

        <div className="flex animate-scroll-badges" style={{ width: "fit-content" }}>
          {duplicatedBadges.map((badge, index) => (
            <div
              key={`${badge.name}-${index}`}
              className={`flex-shrink-0 w-40 mx-3 bg-white rounded-2xl p-5 shadow-sm border ${tierBorder[badge.tier]} hover:shadow-md transition-shadow duration-300`}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tierColors[badge.tier]} rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm`}
              >
                {badge.emoji}
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight mb-1">
                {badge.name}
              </p>
              <p className="text-xs text-text-secondary">{badge.tier}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
